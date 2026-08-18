import { test, expect } from "@playwright/test";

test("landing page loads with Melak headline", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /Melak helps students understand/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/Common questions/i)).toBeVisible();
});
