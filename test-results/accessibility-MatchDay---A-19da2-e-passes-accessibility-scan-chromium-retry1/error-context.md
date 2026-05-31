# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> MatchDay - Acessibilidade >> forgot password page passes accessibility scan
- Location: e2e\accessibility.spec.ts:17:7

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 58

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
+               "contrastRatio": 4.01,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#617187",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 4.01 (foreground color: #617187, background color: #08080e, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
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
+   Element has insufficient color contrast of 4.01 (foreground color: #617187, background color: #08080e, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"mt-1 text-sm text-text-3\">Digite seu email para receber o link de recuperacao</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".mt-1",
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
        - heading "Esqueci a Senha" [level=1] [ref=e6]
        - paragraph [ref=e7]: Digite seu email para receber o link de recuperacao
      - generic [ref=e8]:
        - generic [ref=e9]:
          - text: Email
          - textbox "Email" [ref=e10]:
            - /placeholder: seu@email.com
        - button "Enviar Link de Recuperacao" [ref=e11] [cursor=pointer]
      - paragraph [ref=e12]:
        - link "Voltar ao Login" [ref=e13] [cursor=pointer]:
          - /url: /login
  - generic [ref=e18] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e19]:
      - img [ref=e20]
    - generic [ref=e23]:
      - button "Open issues overlay" [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e26]: "0"
          - generic [ref=e27]: "1"
        - generic [ref=e28]: Issue
      - button "Collapse issues badge" [ref=e29]:
        - img [ref=e30]
  - alert [ref=e32]
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
  14 |     expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  15 |   });
  16 | 
  17 |   test("forgot password page passes accessibility scan", async ({ page }) => {
  18 |     await page.goto("/forgot-password");
  19 |     const results = await new AxeBuilder({ page }).analyze();
> 20 |     expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
     |                                                                                                 ^ Error: expect(received).toEqual(expected) // deep equality
  21 |   });
  22 | });
  23 | 
```