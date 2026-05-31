@AGENTS.md

# MatchDay - Contexto do Projeto

## Stack
Next.js 16.2 + TypeScript 5 + Tailwind CSS v4 + Prisma 7 + PostgreSQL (Neon)
Auth: NextAuth.js v5 (JWT) | Pagamento: MercadoPago PIX | Storage: Supabase
Deploy: Vercel (auto-deploy no push para master)

## Comandos
- `npm run dev` - servidor local (localhost:3000)
- `npm run build` - build de producao
- `npm run lint` - ESLint
- `npm test` - Jest (13 testes em tests/validations.test.ts)
- `npm run test:e2e` - Playwright (15 cenarios em e2e/)
- `npm run seed` - popular banco com dados de teste

## Estrutura principal
- `src/app/(auth)/` - login, register, forgot-password, reset-password
- `src/app/(main)/` - home, search, bookings, menu, owner, admin
- `src/app/api/` - 27 rotas REST
- `src/app/campo/[id]/` - pagina publica do campo
- `src/app/reservar/[shareLinkId]/` - pagina de pagamento compartilhada
- `src/components/` - header, bottom-nav, confirm-dialog, error-message, offline-banner, skeleton
- `src/lib/` - auth, prisma, rate-limit, use-async, validations, csrf, csrf-client, supabase, mercadopago

## Contas de teste (senha: 123456)
- dono@email.com (FIELD_OWNER)
- jogador@email.com (CLIENT)

## Banco de dados
- Neon (serverless PostgreSQL)
- `npx prisma db execute --stdin` para SQL direto
- `npx prisma db push` para sincronizar schema

## Pendentes conhecidos (2026-05-31)
- middleware.ts tem warning de deprecation (migrar para proxy.ts)
- npm audit: 7 moderadas (transitivas, sem breaking change disponivel)
- CSRF: infra pronta, faltam algumas paginas migrarem para csrfFetch
