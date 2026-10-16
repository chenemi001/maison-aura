import type { Page } from "@playwright/test";
import { expect as baseExpect, test } from "./fixtures";

// Password hashing (scrypt) is deliberately CPU-intensive; allow for slow CI runners.
const expect = baseExpect.configure({ timeout: 15_000 });

const PASSWORD = "Sk1ncare-ritual";
const uniqueEmail = () => `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

async function register(page: Page, email: string, fullName = "Amara Okafor") {
  await page.goto("/account/register");
  await page.getByLabel("Full name").fill(fullName);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel(/^Password/).fill(PASSWORD);
  await page.getByLabel("Confirm password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
}

async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel(/^Password/).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test.describe("authentication", () => {
  test("protected pages redirect signed-out visitors to sign in", async ({ page }) => {
    await page.goto("/account/orders");
    await expect(page).toHaveURL(/\/account\/login\?next=%2Faccount%2Forders/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("a customer can create an account, sign out and sign back in", async ({ page }) => {
    const email = uniqueEmail();

    await register(page, email);
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole("heading", { name: "Welcome, Amara" })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByTestId("account-link")).toHaveAccessibleName("My account");

    // The session survives a full reload (HttpOnly cookie).
    await page.reload();
    await expect(page.getByRole("heading", { name: "Welcome, Amara" })).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/account");
    await expect(page).toHaveURL(/\/account\/login/);

    await signIn(page, email);
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole("heading", { name: "Welcome, Amara" })).toBeVisible();
  });

  test("signing in returns the customer to the page they asked for", async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/account/orders");
    await signIn(page, email);
    await expect(page).toHaveURL(/\/account\/orders$/);
    await expect(page.getByRole("heading", { name: "Your orders" })).toBeVisible();
  });

  test("wrong passwords get a generic error", async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/account/login");
    await signIn(page, email, "Wrong-passw0rd");
    await expect(page.getByText("That email and password combination didn't match.")).toBeVisible();
    // The email is kept so the customer only retypes the password.
    await expect(page.getByLabel("Email address")).toHaveValue(email);
  });

  test("an email can only be registered once", async ({ page, context }) => {
    const email = uniqueEmail();
    await register(page, email);
    await expect(page).toHaveURL(/\/account$/);
    await context.clearCookies();

    await register(page, email, "Someone Else");
    await expect(page.getByText(/An account with this email already exists/)).toBeVisible();
  });

  test("registration validates input on the server", async ({ page }) => {
    await page.goto("/account/register");
    await page.getByLabel("Full name").fill("Amara Okafor");
    await page.getByLabel("Email address").fill("not-an-email");
    await page.getByLabel(/^Password/).fill("short");
    await page.getByLabel("Confirm password").fill("different");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Use at least 8 characters")).toBeVisible();
    await expect(page.getByLabel("Full name")).toHaveValue("Amara Okafor");
  });

  test("forged session cookies are rejected", async ({ page, context, baseURL }) => {
    await context.addCookies([
      { name: "ma_session", value: "eyJzdWIiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.forged", url: baseURL! },
    ]);
    await page.goto("/account");
    await expect(page).toHaveURL(/\/account\/login/);
  });
});
