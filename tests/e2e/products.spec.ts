import { expect, test } from "./fixtures";

const priceOf = (text: string | null) => Number((text ?? "").replace(/[^0-9.]/g, ""));

/**
 * With Partial Prerendering the static shell (and its 200 status) can be sent
 * before a streamed segment calls notFound(); Next.js then injects
 * `<meta name="robots" content="noindex">`, which is what crawlers act on.
 */
const expectNoIndex = async (html: string) => expect(html).toMatch(/<meta name="robots" content="noindex"/);

test.describe("storefront & catalogue", () => {
  test("homepage renders hero, bestsellers and structured data", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Maison Aura/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Maison Aura");
    await expect(page.getByRole("heading", { name: "Bestsellers" })).toBeVisible();
    await expect(page.getByTestId("product-card").first()).toBeVisible();

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.join()).toContain('"@type":"Organization"');
    expect(jsonLd.join()).toContain('"@type":"WebSite"');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
  });

  test("catalogue lists 50,000 products with crawlable pagination", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("status").filter({ hasText: "50,000 products" })).toBeVisible();
    await expect(page.getByTestId("product-card")).toHaveCount(24);

    await page.getByRole("navigation", { name: "Pagination" }).getByRole("link", { name: "Page 2", exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText("Page 2 of 2,084")).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/products\?page=2$/);
  });

  test("deep pages render and out-of-range pages are not indexable", async ({ page, request }) => {
    await page.goto("/products?page=2084");
    await expect(page.getByTestId("product-card").first()).toBeVisible();

    await page.goto("/products?page=2085");
    await expect(page.getByRole("heading", { name: /drifted away/ })).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    await expectNoIndex(await (await request.get("/products?page=2085")).text());
  });

  test("filters narrow results and are reflected in the URL", async ({ page, isMobile }) => {
    await page.goto("/categories/serums");
    await expect(page.getByRole("heading", { level: 1, name: "Serums" })).toBeVisible();
    if (isMobile) await page.getByRole("button", { name: /Filters/ }).click();

    await page.getByRole("checkbox", { name: "Sensitive" }).check();
    await expect(page).toHaveURL(/skin=sensitive/);
    await page.getByRole("radio", { name: "₦30,000 – ₦60,000" }).check();
    await expect(page).toHaveURL(/min=30000&max=60000/);

    const prices = await page.getByTestId("product-card").getByTestId("price").allTextContents();
    expect(prices.length).toBeGreaterThan(0);
    for (const price of prices) {
      const value = priceOf(price);
      expect(value).toBeGreaterThanOrEqual(30_000);
      expect(value).toBeLessThanOrEqual(60_000);
    }
  });

  test("sorting by price orders products ascending", async ({ page }) => {
    await page.goto("/products");
    await page.getByLabel("Sort by").selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);
    const prices = (await page.getByTestId("product-card").getByTestId("price").allTextContents()).map(priceOf);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test("search finds products and is excluded from the index", async ({ page }) => {
    await page.goto("/search");
    await page.getByRole("searchbox", { name: "Search products" }).fill("vitamin c");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page).toHaveURL(/q=vitamin\+c|q=vitamin%20c/);
    await expect(page.getByTestId("product-card").first()).toContainText(/Vitamin C/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("product page shows details, variant pricing and Product JSON-LD", async ({ page }) => {
    await page.goto("/products/aura-renewal-serum");
    await expect(page.getByRole("heading", { level: 1, name: "Aura Renewal Serum" })).toBeVisible();
    await expect(page.getByText("₦68,000").first()).toBeVisible();
    await page.getByText("30 ml", { exact: true }).click();
    await expect(page.getByText("₦109,000").first()).toBeVisible();

    const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join();
    expect(jsonLd).toContain('"@type":"Product"');
    expect(jsonLd).toContain('"@type":"BreadcrumbList"');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  });

  test("long-tail products are rendered on demand (ISR)", async ({ page }) => {
    await page.goto("/products?sort=price-desc&page=1500");
    const href = await page.getByTestId("product-card").first().getByRole("link").getAttribute("href");
    const response = await page.goto(href!);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("unknown products and categories render a noindexed not-found page", async ({ page, request }) => {
    await page.goto("/products/this-product-does-not-exist");
    await expect(page.getByRole("heading", { name: /no longer available/ })).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);

    for (const path of ["/products/this-product-does-not-exist", "/categories/nope"]) {
      const response = await request.get(path);
      expect(response.status()).not.toBe(500);
      await expectNoIndex(await response.text());
    }
  });

  test("robots.txt and sitemaps cover the whole catalogue", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /checkout");
    expect(robots).toContain("/products/sitemap/4.xml");

    const sitemap = await (await request.get("/products/sitemap/0.xml")).text();
    expect(sitemap.match(/<url>/g)).toHaveLength(10_000);
  });

  test("mobile menu opens as a dialog and closes on Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only navigation");
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
