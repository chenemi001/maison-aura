import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/** Set to "1" when the server under test has Stripe test keys configured. */
const STRIPE_ENABLED = process.env.E2E_STRIPE_ENABLED === "1";

async function addSerumToBag(page: Page, quantity = 1) {
  await page.goto("/products/aura-renewal-serum");
  for (let i = 1; i < quantity; i++) await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByTestId("add-to-cart")).toContainText("Added to bag");
}

test.describe("bag", () => {
  test("adds, updates and removes items with correct totals", async ({ page }) => {
    await addSerumToBag(page);
    await expect(page.getByTestId("cart-badge")).toHaveAccessibleName("Shopping bag, 1 item");

    await page.goto("/cart");
    await expect(page.getByTestId("cart-item")).toHaveCount(1);
    await expect(page.getByTestId("cart-total")).toHaveText("₦71,500"); // ₦68,000 + ₦3,500 delivery

    await page.getByRole("button", { name: "Increase quantity of Aura Renewal Serum" }).click();
    await expect(page.getByTestId("cart-total")).toHaveText("₦136,000"); // free delivery over ₦100,000

    await page.getByRole("button", { name: "Remove Aura Renewal Serum" }).click();
    await expect(page.getByRole("heading", { name: "Your bag is empty" })).toBeVisible();
  });

  test("charges delivery under the free-shipping threshold", async ({ page }) => {
    await page.goto("/products/velvet-hand-cream");
    await page.getByTestId("add-to-cart").click();
    await page.goto("/cart");
    await expect(page.getByTestId("cart-total")).toHaveText("₦25,500");
  });

  test("persists across reloads", async ({ page }) => {
    await addSerumToBag(page, 2);
    await page.reload();
    await expect(page.getByTestId("cart-badge")).toHaveAccessibleName("Shopping bag, 2 items");
  });
});

test.describe("checkout", () => {
  test("validates delivery details on the server", async ({ page }) => {
    test.skip(!STRIPE_ENABLED, "requires Stripe test keys");
    await addSerumToBag(page);
    await page.goto("/checkout");
    await page.getByTestId("pay-button").click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
  });

  test("redirects to Stripe's hosted payment page", async ({ page }) => {
    test.skip(!STRIPE_ENABLED, "requires Stripe test keys");
    await addSerumToBag(page);
    await page.goto("/checkout");
    await page.getByLabel("Email address").fill("e2e@example.com");
    await page.getByLabel("Full name").fill("Test Customer");
    await page.getByLabel("Phone number").fill("0803 123 4567");
    await page.getByLabel("Street address").fill("12 Admiralty Way");
    await page.getByLabel("Town or city").fill("Lekki");
    await page.getByLabel("State").selectOption("Lagos");
    await page.getByTestId("pay-button").click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });
  });

  test("never offers payment when no provider is configured", async ({ page }) => {
    test.skip(STRIPE_ENABLED, "only applies without Stripe keys");
    await addSerumToBag(page);
    await page.goto("/checkout");
    await expect(page.getByText("Payments are not enabled on this deployment")).toBeVisible();
    await expect(page.getByTestId("pay-button")).toBeDisabled();
  });

  test("checkout API refuses to fake a payment when unconfigured", async ({ request }) => {
    test.skip(STRIPE_ENABLED, "only applies without Stripe keys");
    const response = await request.post("/api/checkout", {
      data: { items: [{ productId: "ma-00001", variantId: "ma-00001-15ml", quantity: 1 }], shipping: {} },
    });
    expect(response.status()).toBe(503);
    expect((await response.json()).url).toBeUndefined();
  });

  test("checkout API rejects cross-origin requests", async ({ request }) => {
    const response = await request.post("/api/checkout", {
      headers: { Origin: "https://evil.example" },
      data: {},
    });
    expect(response.status()).toBe(403);
  });

  test("webhook rejects unsigned requests", async ({ request }) => {
    const response = await request.post("/api/webhooks/payment", { data: { type: "checkout.session.completed" } });
    expect([400, 503]).toContain(response.status());
  });

  test("success page cannot be spoofed with a fake session id", async ({ page }) => {
    await page.goto("/checkout/success?session_id=cs_test_fakefakefakefake");
    await expect(page.getByRole("heading", { name: "We couldn't find that checkout" })).toBeVisible();
    await expect(page.getByText("Thank you")).toHaveCount(0);
  });

  test("cancel page reassures the customer", async ({ page }) => {
    await page.goto("/checkout/cancel");
    await expect(page.getByRole("heading", { name: "Checkout cancelled" })).toBeVisible();
    await expect(page.getByText("No payment was taken")).toBeVisible();
  });
});

test.describe("accounts", () => {
  test("account pages degrade gracefully without Supabase", async ({ page }) => {
    test.skip(process.env.E2E_SUPABASE_ENABLED === "1", "only applies without Supabase");
    await page.goto("/account");
    await expect(page.getByRole("heading", { name: "Accounts are coming soon" })).toBeVisible();
  });
});
