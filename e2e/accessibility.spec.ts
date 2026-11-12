import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Every page of the site, checked by axe against WCAG 2.1 A and AA. A new route
// is added to this list in the pull request that creates it.
const pages = ["/"];

for (const path of pages) {
  test(`${path} has no accessibility violation`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const summary = results.violations.map(
      (v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
    );
    expect(summary, summary.join("\n")).toEqual([]);
  });
}
