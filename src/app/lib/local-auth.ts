import "server-only";
import { createHmac, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Built-in authentication provider, used automatically when Supabase is not
 * configured, so sign-up and sign-in work with zero setup.
 *
 * - Passwords are hashed with scrypt (memory-hard) and a per-user salt.
 * - Users are persisted to a JSON file (`.data/users.json` by default).
 * - Sessions are stateless, HMAC-SHA256-signed tokens stored in an
 *   HttpOnly cookie — nothing secret is readable by client-side JavaScript.
 *
 * File storage suits local development and single-server hosting. Serverless
 * platforms (e.g. Vercel) have no persistent disk, so production deployments
 * should configure Supabase, which takes over transparently.
 */

export interface LocalUser {
  id: string;
  email: string;
  fullName: string;
}

interface StoredUser extends LocalUser {
  passwordHash: string;
  createdAt: string;
}

export interface SessionPayload {
  sub: string;
  exp: number;
}

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

// ---------------------------------------------------------------------------
// Password hashing (scrypt)
// ---------------------------------------------------------------------------

const SCRYPT = { N: 16384, r: 8, p: 1, keyLength: 64 } as const;

function scrypt(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

/** Returns `scrypt$N$r$p$<salt>$<hash>` (base64url), safe to store. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, SCRYPT.keyLength);
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64url"), hash.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, , , , saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64url"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Verified against when an email is unknown, so response time doesn't reveal
// whether an account exists.
const DUMMY_HASH_PROMISE = hashPassword(randomUUID());

// ---------------------------------------------------------------------------
// Signed session tokens
// ---------------------------------------------------------------------------

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(userId: string, secret: string, now = Date.now()): string {
  const payload: SessionPayload = { sub: userId, exp: Math.floor(now / 1000) + SESSION_TTL_SECONDS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

/** Returns the payload if the signature is valid and the token unexpired. */
export function verifySessionToken(token: string, secret: string, now = Date.now()): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(sign(body, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    return payload.exp * 1000 > now ? payload : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

function dataDir(): string {
  if (process.env.AUTH_DATA_DIR) return process.env.AUTH_DATA_DIR;
  // Serverless file systems are read-only except /tmp.
  return process.env.VERCEL ? "/tmp/maison-aura" : path.join(process.cwd(), ".data");
}

const usersFile = () => path.join(dataDir(), "users.json");

const TRANSIENT_FS_ERRORS = new Set(["EPERM", "EBUSY", "EACCES"]);

/**
 * Retries briefly on transient file-lock errors. On Windows, replacing a file
 * that another request is reading at that instant fails with EPERM/EBUSY.
 */
async function withFsRetry<T>(operation: () => Promise<T>, attempts = 6): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code ?? "";
      if (attempt >= attempts || !TRANSIENT_FS_ERRORS.has(code)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 15 * attempt));
    }
  }
}

async function readUsers(): Promise<StoredUser[]> {
  try {
    return JSON.parse(await withFsRetry(() => readFile(usersFile(), "utf8"))) as StoredUser[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

/** Atomic write (temp file + rename) so a crash can't corrupt the store. */
async function writeUsers(users: StoredUser[]): Promise<void> {
  await mkdir(dataDir(), { recursive: true });
  const temp = `${usersFile()}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temp, JSON.stringify(users, null, 2), { mode: 0o600 });
  await withFsRetry(() => rename(temp, usersFile()));
}

// Serialises writes within this process so concurrent sign-ups can't clobber
// each other's read-modify-write cycle.
let writeQueue: Promise<unknown> = Promise.resolve();
function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => undefined);
  return run;
}

const toPublic = ({ id, email, fullName }: StoredUser): LocalUser => ({ id, email, fullName });

export async function createUser(input: {
  email: string;
  fullName: string;
  password: string;
}): Promise<{ ok: true; user: LocalUser } | { ok: false; reason: "email_taken" }> {
  const passwordHash = await hashPassword(input.password);
  return exclusive(async () => {
    const users = await readUsers();
    const email = input.email.trim().toLowerCase();
    if (users.some((u) => u.email === email)) return { ok: false as const, reason: "email_taken" as const };
    const user: StoredUser = {
      id: randomUUID(),
      email,
      fullName: input.fullName.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    await writeUsers([...users, user]);
    return { ok: true as const, user: toPublic(user) };
  });
}

export async function verifyCredentials(email: string, password: string): Promise<LocalUser | null> {
  const users = await readUsers();
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  const valid = await verifyPassword(password, user?.passwordHash ?? (await DUMMY_HASH_PROMISE));
  return user && valid ? toPublic(user) : null;
}

export async function findUserById(id: string): Promise<LocalUser | null> {
  const user = (await readUsers()).find((u) => u.id === id);
  return user ? toPublic(user) : null;
}

/**
 * Signing secret. Uses AUTH_SECRET when set (required for multi-instance
 * production); otherwise generates one and persists it next to the user store.
 */
let secretPromise: Promise<string> | null = null;

export function getSessionSecret(): Promise<string> {
  const configured = process.env.AUTH_SECRET;
  if (configured && configured.length >= 32) return Promise.resolve(configured);
  // Resolved once per process, so concurrent first requests share one secret.
  secretPromise ??= loadOrCreateSecret().catch((error) => {
    secretPromise = null;
    throw error;
  });
  return secretPromise;
}

async function loadOrCreateSecret(): Promise<string> {
  const file = path.join(dataDir(), "session-secret");
  try {
    const existing = (await withFsRetry(() => readFile(file, "utf8"))).trim();
    if (existing.length >= 32) return existing;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  // Written atomically so another process can never read a half-written secret.
  await mkdir(dataDir(), { recursive: true });
  const temp = `${file}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temp, randomBytes(48).toString("base64url"), { mode: 0o600 });
  await withFsRetry(() => rename(temp, file));
  return (await withFsRetry(() => readFile(file, "utf8"))).trim();
}

// ---------------------------------------------------------------------------
// Brute-force protection (per email, per server instance)
// ---------------------------------------------------------------------------

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; resetAt: number }>();

export function isLockedOut(email: string, now = Date.now()): boolean {
  const entry = failures.get(email.toLowerCase());
  return Boolean(entry && entry.resetAt > now && entry.count >= MAX_FAILED_ATTEMPTS);
}

export function recordFailedLogin(email: string, now = Date.now()): void {
  const key = email.toLowerCase();
  const entry = failures.get(key);
  if (!entry || entry.resetAt <= now) failures.set(key, { count: 1, resetAt: now + LOCKOUT_MS });
  else entry.count += 1;
}

export function clearFailedLogins(email: string): void {
  failures.delete(email.toLowerCase());
}
