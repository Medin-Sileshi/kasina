import { test, expect } from "@playwright/test";

test("landing page uses redesign system", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Better learning and teaching/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Join a class free/i })).toBeVisible();
  await expect(page.getByText(/For students|Consistent learning/i).first()).toBeVisible();
});
