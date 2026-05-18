# ⚽ MatchDay

**Agende campos de futebol, divida o pagamento e jogue sem preocupação.**

MatchDay é uma plataforma web que conecta jogadores aos melhores campos de futebol.  
Reserve horários, pague via PIX, compartilhe o link com os amigos e cada um contribui com o valor que quiser.

---

## 🚀 Funcionalidades

### 👤 Jogador
- Cadastro com validação de CPF e maioridade
- Busca de campos por nome, cidade ou proximidade (geolocalização)
- Reserva com seleção de data e horários consecutivos
- PIX real (Mercado Pago) com QR Code
- Lista compartilhada: cada um paga quanto quiser
- Cancelamento de reserva
- Avaliação dos campos pós-partida (⭐)
- Créditos na plataforma (reembolso instantâneo)
- Modo claro / escuro
- PWA — instalável na tela inicial

### 🏟️ Dono de Campo
- Cadastro completo do campo (nome, endereço, CEP, fotos, preço, horários)
- Dashboard com faturamento, partidas e taxa MatchDay (5%)
- Editar dados do campo
- Gerar link de reserva compartilhável
- Cancelar reservas com reembolso automático via PIX

### 🛠️ Admin
- Relatórios financeiros (receita total, taxas)
- Gestão de usuários e campos

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS v4 |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7 |
| Auth | NextAuth.js |
| Pagamento | Mercado Pago (PIX) |
| Storage | Supabase (fotos) |
| Deploy | Vercel |

---

## 📦 Como Rodar

```bash
# Clone
git clone https://github.com/geandreac/MatchDay.git
cd MatchDay

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Preencha DATABASE_URL com sua Neon connection string

# Sincronizar banco
npx prisma db push

# Iniciar dev server
npm run dev
```

Acesse **http://localhost:3000**

---

## 🔐 Contas de Teste

| Login | Senha | Tipo |
|-------|-------|------|
| `dono@email.com` | `123456` | Dono de campo |
| `jogador@email.com` | `123456` | Jogador |

---

## 📂 Estrutura

```
src/
├── app/
│   ├── (auth)/        # Login e Cadastro
│   ├── (main)/        # Home, Busca, Agenda, Menu, Owner
│   ├── api/           # API routes
│   ├── campo/         # Página pública do campo
│   ├── reservar/      # Página de pagamento
│   ├── admin/         # Painel administrativo
│   ├── termos/        # Termos de uso
│   └── privacidade/   # Política de privacidade
├── components/        # Componentes reutilizáveis
├── lib/               # Utilitários (auth, prisma, mercadopago, validações)
└── generated/         # Prisma Client
```

---

## 📊 Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/[...nextauth]` | Autenticação |
| GET/POST | `/api/fields` | Listar/criar campos |
| GET/PUT | `/api/fields/[id]` | Detalhes/atualizar |
| GET | `/api/fields/search` | Buscar com geolocalização |
| POST | `/api/pix/criar` | Gerar PIX |
| POST | `/api/pix/verificar` | Verificar pagamento |
| POST | `/api/pix/webhook` | Webhook Mercado Pago |
| POST | `/api/reservar/criar` | Criar reserva |
| POST | `/api/reservar/cancelar` | Cancelar + reembolso |
| POST | `/api/ratings` | Avaliar campo |
| POST | `/api/upload` | Upload de fotos |
| GET | `/api/credits` | Saldo de créditos |
| GET | `/api/admin/reports` | Relatórios admin |

---

## 📄 Licença

MIT
