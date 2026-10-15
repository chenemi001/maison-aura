import { test as base, expect } from "@playwright/test";

/**
 * `page.goto` that also waits for the network to go idle, so client
 * components have hydrated before a test interacts with them. Without this,
 * clicks can land on server-rendered markup before React attaches handlers
 * (most visible under parallel load in CI).
 */
export const test = base.extend({
  page: async ({ page }, provide) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      // Bounded: link prefetching can keep the network busy on heavily linked pages.
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
      return response;
    };
    await provide(page);
  },
});

export { expect };
