import { test, expect } from "@playwright/test";

test("landing page loads with brand-led hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Better learning and teaching/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Join a class free/i })).toBeVisible();
  await expect(page.getByText(/Works after download|Designed for offline study/i).first()).toBeVisible();
});
