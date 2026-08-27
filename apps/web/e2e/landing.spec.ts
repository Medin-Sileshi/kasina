import { test, expect } from "@playwright/test";

test("landing page loads with learning-focused headline", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /Better learning and teaching/i,
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Partner With Us/i })).toBeVisible();
});
