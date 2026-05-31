import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("MatchDay - Acessibilidade", () => {
  test("login page passes accessibility scan", async ({ page }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  });

  test("register page passes accessibility scan", async ({ page }) => {
    await page.goto("/register");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  });

  test("forgot password page passes accessibility scan", async ({ page }) => {
    await page.goto("/forgot-password");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  });
});
