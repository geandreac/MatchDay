# ⚽ MatchDay

**Marque seu futebol, divida o pagamento e jogue sem preocupação.**

MatchDay é uma plataforma web que conecta jogadores aos melhores campos de futebol, resolvendo os problemas de atraso, inadimplência e desorganização na divisão de pagamentos.

---

## 📋 O Problema

Em muitas cidades, os campos de futebol pagos enfrentam os mesmos problemas:

- **Atrasos** — jogadores marcados não aparecem no horário
- **Inadimplência** — falta de pagamento de alguns participantes
- **Divisão desorganizada** — um participante precisa bancar o valor total e depois cobrar os outros
- **Desconforto** — o dono do campo fica no meio das cobranças
- **Comunicação falha** — sem confirmação de presença ou pagamento

## ✅ A Solução

O **MatchDay** automatiza todo o processo:

1. **Dono do campo** cadastra seu espaço, define horários e preços
2. **Gera um link de reserva** e compartilha com os jogadores
3. **Cada jogador** entra na reserva pelo link e paga sua parte
4. **Regra dos 50%** — se o mínimo não for atingido 2 dias antes, todos são reembolsados automaticamente
5. **Se o mínimo for atingido**, a reserva é confirmada automaticamente

---

## 🚀 Funcionalidades

### 👤 Para Jogadores
- Cadastro com validação de CPF e maioridade
- Login por email ou CPF
- Busca de campos por nome, cidade ou proximidade (geolocalização)
- Reservas com status em tempo real
- Pagamento individual via PIX
- Histórico completo de partidas
- Favoritar campos para acesso rápido

### 🏟️ Para Donos de Campo
- Cadastro completo do campo (nome, endereço, fotos, capacidade)
- Configuração de faixa horária e preço por hora
- Geração de links de reserva compartilháveis
- Dashboard com reservas e status
- Ativação/desativação do campo
- Regra automática de 50% com reembolso

### 🎨 Experiência
- Tema escuro premium com design sport
- Interface mobile-first
- PWA (instalável na tela inicial)
- Navegação com 4 abas principais
- Modo offline com fallback
- Animações e micro-interações

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 |
| **Backend** | Next.js API Routes (Server Components) |
| **Banco** | PostgreSQL (Supabase) |
| **ORM** | Prisma 7 |
| **Auth** | NextAuth.js (Credentials + JWT) |
| **Pagamento** | PIX (simulado) |
| **PWA** | Service Worker + Manifest |
| **Deploy** | Vercel (frontend) + Supabase (banco) |

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/          # Login e Cadastro
│   ├── (main)/          # Home, Busca, Agendamentos, Menu, Owner
│   ├── api/             # API Routes (auth, fields, bookings, payments)
│   ├── reservar/        # Página pública de reserva
│   ├── offline/         # Página offline
│   ├── manifest.ts      # PWA manifest
│   └── icon.tsx         # Favicon
├── components/
│   ├── header.tsx       # Header com data e back button
│   ├── bottom-nav.tsx   # Navegação inferior
│   ├── providers.tsx    # SessionProvider
│   └── sw-register.tsx  # Service Worker
└── lib/
    ├── auth.ts          # Config NextAuth
    ├── prisma.ts        # Prisma Client
    ├── regra50.ts       # Lógica da regra 50%
    └── validations.ts   # CPF, idade, datas
```

---

## 🧪 Começando

```bash
# Clone
git clone https://github.com/geandreac/MatchDay.git
cd MatchDay

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com sua DATABASE_URL do Supabase

# Sincronizar banco e popular dados
npx prisma db push
curl -X POST http://localhost:3000/api/seed

# Iniciar dev server
npm run dev
```

Acesse **http://localhost:3000**

### Contas de Teste

| Login | Senha | Tipo |
|-------|-------|------|
| `dono@email.com` | `123456` | Dono de campo |
| `joao@email.com` | `123456` | Dono de campo |
| `jogador@email.com` | `123456` | Jogador |

---

## 📊 Rotas da Aplicação

### Páginas
| Rota | Descrição |
|------|-----------|
| `/` | Redireciona conforme autenticação |
| `/login` | Login (email ou CPF + senha) |
| `/register` | Cadastro com validação de CPF |
| `/home` | Início com busca, último agendamento, favorito |
| `/search` | Busca com filtros (nome, cidade, proximidade) |
| `/bookings` | Lista de agendamentos |
| `/menu` | Menu com perfil e configurações |
| `/owner` | Dashboard do dono de campo |
| `/owner/cadastro` | Cadastro de novo campo |
| `/owner/campos/[id]` | Detalhes e gerenciamento do campo |
| `/reservar/[link]` | Página pública de reserva |

### API
| Rota | Descrição |
|------|-----------|
| `POST /api/auth/[...nextauth]` | Autenticação |
| `POST /api/register` | Cadastro de usuário |
| `GET/POST /api/fields` | Listar/criar campos |
| `GET/PUT /api/fields/[id]` | Detalhes/atualizar campo |
| `POST /api/fields/[id]/share-link` | Gerar link de reserva |
| `GET /api/fields/search` | Buscar campos (com geolocalização) |
| `GET /api/bookings` | Listar reservas do usuário |
| `GET/POST /api/favorites` | Favoritar/desfavoritar campos |
| `PUT/POST /api/user` | Atualizar perfil / alterar senha |
| `GET /api/reservar/[linkId]` | Dados da reserva pública |
| `POST /api/reservar/[linkId]/participar` | Entrar na reserva |
| `POST /api/reservar/[linkId]/pagar` | Pagar via PIX |

---

## 📐 Modelo de Dados

```
User → Field (dono)
User → Booking (organizador)
User → Participant (jogador)
User → Payment (pagador)
User → Favorite (favoritou)
Field → Booking
Booking → Participant
Booking → Payment
```

---

## 🔮 Próximos Passos

- [ ] Pagamento PIX real (Mercado Pago)
- [ ] Upload de fotos dos campos
- [ ] Avaliações e notas dos campos
- [ ] Notificações push e email
- [ ] Modo claro
- [ ] Administrador global

---

## 📝 Licença

MIT
