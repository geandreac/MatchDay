# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-flows.spec.ts >> MatchDay - Fluxos Criticos >> bottom nav renderiza com 4 tabs
- Location: e2e\critical-flows.spec.ts:56:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('nav[aria-label="Navegacao principal"] a')
Expected: 4
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('nav[aria-label="Navegacao principal"] a')
    14 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Pular para conteúdo principal" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - img [ref=e7]
        - heading "MatchDay" [level=1] [ref=e10]
        - paragraph [ref=e11]: Entre para gerenciar suas reservas
      - generic [ref=e12]:
        - generic [ref=e13]:
          - text: Email ou CPF
          - textbox "Email ou CPF" [ref=e14]:
            - /placeholder: seu@email.com ou 000.000.000-00
        - generic [ref=e15]:
          - text: Senha
          - textbox "Senha" [ref=e16]:
            - /placeholder: ••••••••
        - button "Entrar" [ref=e17] [cursor=pointer]
      - paragraph [ref=e18]:
        - text: Nao tem conta?
        - link "Cadastre-se" [ref=e19] [cursor=pointer]:
          - /url: /register
      - paragraph [ref=e20]:
        - link "Esqueci minha senha" [ref=e21] [cursor=pointer]:
          - /url: /forgot-password
  - generic [ref=e26] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e27]:
      - img [ref=e28]
    - generic [ref=e31]:
      - button "Open issues overlay" [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]: "0"
          - generic [ref=e35]: "1"
        - generic [ref=e36]: Issue
      - button "Collapse issues badge" [ref=e37]:
        - img [ref=e38]
  - alert [ref=e40]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("MatchDay - Fluxos Criticos", () => {
  4  |   test("pagina de login renderiza", async ({ page }) => {
  5  |     await page.goto("/login");
  6  |     await expect(page.locator("h1")).toContainText("MatchDay");
  7  |     await expect(page.locator("#email")).toBeVisible();
  8  |     await expect(page.locator("#password")).toBeVisible();
  9  |     await expect(page.locator("button[type=submit]")).toContainText("Entrar");
  10 |   });
  11 | 
  12 |   test("link de cadastro existe no login", async ({ page }) => {
  13 |     await page.goto("/login");
  14 |     await page.locator("text=Cadastre-se").click();
  15 |     await expect(page).toHaveURL(/register/);
  16 |   });
  17 | 
  18 |   test("link esqueci senha existe no login", async ({ page }) => {
  19 |     await page.goto("/login");
  20 |     await page.locator("text=Esqueci minha senha").click();
  21 |     await expect(page).toHaveURL(/forgot-password/);
  22 |   });
  23 | 
  24 |   test("pagina de cadastro renderiza", async ({ page }) => {
  25 |     await page.goto("/register");
  26 |     await expect(page.locator("h1")).toContainText("Criar Conta");
  27 |     await expect(page.locator("#name")).toBeVisible();
  28 |     await expect(page.locator("#email")).toBeVisible();
  29 |     await expect(page.locator("#cpf")).toBeVisible();
  30 |     await expect(page.locator("button[type=submit]")).toContainText("Criar Conta");
  31 |   });
  32 | 
  33 |   test("pagina de recuperacao de senha renderiza", async ({ page }) => {
  34 |     await page.goto("/forgot-password");
  35 |     await expect(page.locator("h1")).toContainText("Esqueci a Senha");
  36 |     await expect(page.locator("#email")).toBeVisible();
  37 |   });
  38 | 
  39 |   test("redireciona para login quando nao autenticado", async ({ page }) => {
  40 |     await page.goto("/home");
  41 |     await expect(page).toHaveURL(/login/);
  42 |   });
  43 | 
  44 |   test("busca renderiza com campo e filtros", async ({ page }) => {
  45 |     await page.goto("/login");
  46 |     const hasFiltros = await page.locator("text=Nome").isVisible().catch(() => false);
  47 |     expect(hasFiltros).toBeDefined();
  48 |   });
  49 | 
  50 |   test("skip-to-content link existe", async ({ page }) => {
  51 |     await page.goto("/login");
  52 |     const skipLink = page.locator('a[href="#main-content"]');
  53 |     await expect(skipLink).toBeVisible();
  54 |   });
  55 | 
  56 |   test("bottom nav renderiza com 4 tabs", async ({ page }) => {
  57 |     await page.goto("/login");
  58 |     const navItems = page.locator('nav[aria-label="Navegacao principal"] a');
> 59 |     await expect(navItems).toHaveCount(4);
     |                            ^ Error: expect(locator).toHaveCount(expected) failed
  60 |   });
  61 | 
  62 |   test("pagina reset-password mostra erro sem token", async ({ page }) => {
  63 |     await page.goto("/reset-password");
  64 |     await expect(page.locator("h1")).toContainText("Link Invalido");
  65 |   });
  66 | 
  67 |   test("pagina offline renderiza", async ({ page }) => {
  68 |     await page.goto("/offline");
  69 |     await expect(page.locator("h2")).toContainText("Voce esta offline");
  70 |   });
  71 | 
  72 |   test("pagina de termos renderiza", async ({ page }) => {
  73 |     await page.goto("/termos");
  74 |     await expect(page.locator("h1")).toBeVisible();
  75 |   });
  76 | 
  77 |   test("pagina de privacidade renderiza", async ({ page }) => {
  78 |     await page.goto("/privacidade");
  79 |     await expect(page.locator("h1")).toBeVisible();
  80 |   });
  81 | 
  82 |   test("erro de login com credenciais vazias", async ({ page }) => {
  83 |     await page.goto("/login");
  84 |     await page.locator("button[type=submit]").click();
  85 |     await page.waitForTimeout(500);
  86 |     const errorVisible = await page.locator('[role="alert"]').isVisible().catch(() => false);
  87 |     expect(errorVisible).toBeDefined();
  88 |   });
  89 | 
  90 |   test("login page has SEO metadata", async ({ page }) => {
  91 |     await page.goto("/");
  92 |     const title = await page.title();
  93 |     expect(title).toContain("MatchDay");
  94 |   });
  95 | });
  96 | 
```