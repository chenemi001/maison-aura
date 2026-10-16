import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  SESSION_TTL_SECONDS,
  clearFailedLogins,
  createSessionToken,
  createUser,
  findUserById,
  hashPassword,
  isLockedOut,
  recordFailedLogin,
  verifyCredentials,
  verifyPassword,
  verifySessionToken,
} from "@/app/lib/local-auth";

const SECRET = "test-secret-that-is-long-enough-for-hmac-signing";
let dir: string;

beforeAll(() => {
  dir = mkdtempSync(path.join(tmpdir(), "maison-auth-"));
  process.env.AUTH_DATA_DIR = dir;
});

afterAll(() => {
  delete process.env.AUTH_DATA_DIR;
  rmSync(dir, { recursive: true, force: true });
});

describe("password hashing", () => {
  it("verifies the right password and rejects the wrong one", async () => {
    const hash = await hashPassword("s3curepass");
    expect(hash).toMatch(/^scrypt\$16384\$8\$1\$/);
    expect(hash).not.toContain("s3curepass");
    await expect(verifyPassword("s3curepass", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrongpass1", hash)).resolves.toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("same-password1")).not.toBe(await hashPassword("same-password1"));
  });

  it("rejects malformed stored hashes", async () => {
    await expect(verifyPassword("anything", "md5$abc")).resolves.toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips a valid token", () => {
    const token = createSessionToken("user-1", SECRET);
    expect(verifySessionToken(token, SECRET)?.sub).toBe("user-1");
  });

  it("rejects tampered payloads and wrong secrets", () => {
    const token = createSessionToken("user-1", SECRET);
    const [, signature] = token.split(".");
    const forged = `${Buffer.from(JSON.stringify({ sub: "admin", exp: 9e9 })).toString("base64url")}.${signature}`;
    expect(verifySessionToken(forged, SECRET)).toBeNull();
    expect(verifySessionToken(token, "a-different-secret-of-sufficient-length")).toBeNull();
    expect(verifySessionToken("garbage", SECRET)).toBeNull();
  });

  it("expires after the session lifetime", () => {
    const issued = Date.UTC(2026, 0, 1);
    const token = createSessionToken("user-1", SECRET, issued);
    expect(verifySessionToken(token, SECRET, issued + 1000)).not.toBeNull();
    expect(verifySessionToken(token, SECRET, issued + (SESSION_TTL_SECONDS + 1) * 1000)).toBeNull();
  });
});

describe("user store", () => {
  it("creates users, normalises email and never stores the password", async () => {
    const result = await createUser({ email: " Ada@Example.com ", fullName: "Ada Obi", password: "s3curepass" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.email).toBe("ada@example.com");
    expect(await findUserById(result.user.id)).toEqual(result.user);
    expect(readFileSync(path.join(dir, "users.json"), "utf8")).not.toContain("s3curepass");
  });

  it("rejects duplicate emails case-insensitively", async () => {
    const result = await createUser({ email: "ADA@example.com", fullName: "Another", password: "s3curepass" });
    expect(result).toEqual({ ok: false, reason: "email_taken" });
  });

  it("verifies credentials", async () => {
    expect((await verifyCredentials("ada@example.com", "s3curepass"))?.fullName).toBe("Ada Obi");
    expect(await verifyCredentials("ada@example.com", "wrongpass1")).toBeNull();
    expect(await verifyCredentials("nobody@example.com", "s3curepass")).toBeNull();
  });

  it("handles concurrent sign-ups without losing any", async () => {
    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        createUser({ email: `user${i}@example.com`, fullName: `User ${i}`, password: "s3curepass" }),
      ),
    );
    expect(results.every((r) => r.ok)).toBe(true);
    const stored = JSON.parse(readFileSync(path.join(dir, "users.json"), "utf8")) as unknown[];
    expect(stored).toHaveLength(6);
  });
});

describe("brute-force protection", () => {
  it("locks an email out after 5 failures and resets on success", () => {
    const email = "target@example.com";
    for (let i = 0; i < 4; i++) recordFailedLogin(email);
    expect(isLockedOut(email)).toBe(false);
    recordFailedLogin(email);
    expect(isLockedOut(email)).toBe(true);
    expect(isLockedOut(email, Date.now() + 16 * 60 * 1000)).toBe(false);
    clearFailedLogins(email);
    expect(isLockedOut(email)).toBe(false);
  });
});
