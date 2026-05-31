# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> MatchDay - Acessibilidade >> register page passes accessibility scan
- Location: e2e\accessibility.spec.ts:11:7

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 128

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#08080e",
+               "contrastRatio": 3.42,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#58667b",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.42 (foreground color: #58667b, background color: #08080e, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<body>",
+                 "target": Array [
+                   "body",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.42 (foreground color: #58667b, background color: #08080e, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"mt-1 text-sm text-text-3\">Preencha os dados para se cadastrar</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".mt-1",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#101017",
+               "contrastRatio": 3.24,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#58667b",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.24 (foreground color: #58667b, background color: #101017, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<label class=\"flex items-start gap-3 card p-3 mt-2 cursor-pointer\">",
+                 "target": Array [
+                   ".items-start",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.24 (foreground color: #58667b, background color: #101017, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"text-text-3 text-xs mt-0.5\">Quero cadastrar meus campos para receber reservas.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-xs",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#08080e",
+               "contrastRatio": 3.42,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#58667b",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.42 (foreground color: #58667b, background color: #08080e, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<body>",
+                 "target": Array [
+                   "body",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.42 (foreground color: #58667b, background color: #08080e, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"mt-6 text-center text-sm text-text-3\">Já tem conta?<!-- --> <a class=\"font-semibold text-primary hover:text-primary-dark transition-colors\" href=\"/login\">Entrar</a></p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".mt-6",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Pular para conteúdo principal" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - heading "Criar Conta" [level=1] [ref=e6]
        - paragraph [ref=e7]: Preencha os dados para se cadastrar
      - generic [ref=e8]:
        - generic [ref=e9]:
          - text: Nome Completo
          - textbox "Nome Completo" [ref=e10]:
            - /placeholder: Seu nome completo
        - generic [ref=e11]:
          - text: Email
          - textbox "Email" [ref=e12]:
            - /placeholder: seu@email.com
        - generic [ref=e13]:
          - text: CPF
          - textbox "CPF" [ref=e14]:
            - /placeholder: 000.000.000-00
        - generic [ref=e15]:
          - text: Data de Nascimento
          - textbox "Data de Nascimento" [ref=e16]
        - generic [ref=e17]:
          - text: Senha
          - textbox "Senha" [ref=e18]:
            - /placeholder: Mínimo 6 caracteres
        - generic [ref=e19]:
          - text: Confirmar Senha
          - textbox "Confirmar Senha" [ref=e20]:
            - /placeholder: Repita a senha
        - generic [ref=e21] [cursor=pointer]:
          - checkbox "Sou dono de campo Quero cadastrar meus campos para receber reservas." [ref=e22]
          - generic [ref=e23]:
            - text: Sou dono de campo
            - paragraph [ref=e24]: Quero cadastrar meus campos para receber reservas.
        - button "Criar Conta" [ref=e25] [cursor=pointer]
      - paragraph [ref=e26]:
        - text: Já tem conta?
        - link "Entrar" [ref=e27] [cursor=pointer]:
          - /url: /login
  - generic [ref=e32] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e33]:
      - img [ref=e34]
    - generic [ref=e37]:
      - button "Open issues overlay" [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]: "0"
          - generic [ref=e41]: "1"
        - generic [ref=e42]: Issue
      - button "Collapse issues badge" [ref=e43]:
        - img [ref=e44]
  - alert [ref=e46]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import AxeBuilder from "@axe-core/playwright";
  3  | 
  4  | test.describe("MatchDay - Acessibilidade", () => {
  5  |   test("login page passes accessibility scan", async ({ page }) => {
  6  |     await page.goto("/login");
  7  |     const results = await new AxeBuilder({ page }).analyze();
  8  |     expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  9  |   });
  10 | 
  11 |   test("register page passes accessibility scan", async ({ page }) => {
  12 |     await page.goto("/register");
  13 |     const results = await new AxeBuilder({ page }).analyze();
> 14 |     expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
     |                                                                                                 ^ Error: expect(received).toEqual(expected) // deep equality
  15 |   });
  16 | 
  17 |   test("forgot password page passes accessibility scan", async ({ page }) => {
  18 |     await page.goto("/forgot-password");
  19 |     const results = await new AxeBuilder({ page }).analyze();
  20 |     expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  21 |   });
  22 | });
  23 | 
```