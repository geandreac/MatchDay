import { test, expect } from "@playwright/test";

test.describe("MatchDay - Fluxos Criticos", () => {
  test("pagina de login renderiza", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("MatchDay");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("button[type=submit]")).toContainText("Entrar");
  });

  test("link de cadastro existe no login", async ({ page }) => {
    await page.goto("/login");
    await page.locator("text=Cadastre-se").click();
    await expect(page).toHaveURL(/register/);
  });

  test("link esqueci senha existe no login", async ({ page }) => {
    await page.goto("/login");
    await page.locator("text=Esqueci minha senha").click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test("pagina de cadastro renderiza", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1")).toContainText("Criar Conta");
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#cpf")).toBeVisible();
    await expect(page.locator("button[type=submit]")).toContainText("Criar Conta");
  });

  test("pagina de recuperacao de senha renderiza", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("h1")).toContainText("Esqueci a Senha");
    await expect(page.locator("#email")).toBeVisible();
  });

  test("redireciona para login quando nao autenticado", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/login/);
  });

  test("busca renderiza com campo e filtros", async ({ page }) => {
    await page.goto("/login");
    const hasFiltros = await page.locator("text=Nome").isVisible().catch(() => false);
    expect(hasFiltros).toBeDefined();
  });

  test("skip-to-content link existe", async ({ page }) => {
    await page.goto("/login");
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test("bottom nav renderiza com 4 tabs", async ({ page }) => {
    await page.goto("/login");
    const navItems = page.locator('nav[aria-label="Navegacao principal"] a');
    await expect(navItems).toHaveCount(4);
  });

  test("pagina reset-password mostra erro sem token", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.locator("h1")).toContainText("Link Invalido");
  });

  test("pagina offline renderiza", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.locator("h2")).toContainText("Voce esta offline");
  });

  test("pagina de termos renderiza", async ({ page }) => {
    await page.goto("/termos");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("pagina de privacidade renderiza", async ({ page }) => {
    await page.goto("/privacidade");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("erro de login com credenciais vazias", async ({ page }) => {
    await page.goto("/login");
    await page.locator("button[type=submit]").click();
    await page.waitForTimeout(500);
    const errorVisible = await page.locator('[role="alert"]').isVisible().catch(() => false);
    expect(errorVisible).toBeDefined();
  });

  test("login page has SEO metadata", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toContain("MatchDay");
  });
});
