import { expect, test } from "@playwright/test";

test("the home page renders in French", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Modèle Next.js");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Modèle Next.js");
});
