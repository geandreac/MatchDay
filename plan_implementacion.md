# 🚀 Plano de Implementação - Campo Reserva App
--

## 📐 Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMPO RESERVA APP                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Frontend      │    │   Frontend      │                │
│  │   (Cliente)     │    │   (Dono Campo)  │                │
│  │   Next.js 16.2    │    │   Next.js 16.2    │                │
│  │   Tailwind CSS  │    │   Tailwind CSS  │                │
│  └────────┬────────┘    └────────┬────────┘                │
│           │                      │                         │
│           └──────────┬───────────┘                         │
│                      │                                     │
│              ┌───────▼────────┐                           │
│              │   API Gateway  │                           │
│              │   Next.js API  │                           │
│              │   Routes       │                           │
│              └───────┬────────┘                           │
│                      │                                     │
│    ┌─────────────────┼─────────────────┐                  │
│    │                 │                 │                  │
│ ┌──▼──┐        ┌────▼────┐      ┌─────▼─────┐           │
│ │Auth │        │Pagamentos│      │Notificações│           │
│ │ JWT │        │  PIX     │      │ Push/Email│           │
│ └──┬──┘        └────┬────┘      └─────┬─────┘           │
│    │                │                 │                  │
│    └────────────────┼─────────────────┘                  │
│                     │                                     │
│              ┌──────▼──────┐                             │
│              │  PostgreSQL  │                             │
│              │   + Prisma   │                             │
│              └─────────────┘                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Frontend** | Next.js 16.2 (App Router) | SSR, SEO, performance, API routes integradas |
| **Estilização** | Tailwind CSS + shadcn/ui | Design system consistente, mobile-first |
| **Banco de Dados** | PostgreSQL + Prisma ORM | Relacional, transações seguras, type-safe |
| **Autenticação** | NextAuth.js (Auth.js) | JWT, sessions, OAuth ready |
| **Pagamentos** | Mercado Pago SDK | PIX nativo, split payment, reembolsos automáticos |
| **Hospedagem** | Vercel (frontend) + Supabase (banco) | Serverless, escalável, CI/CD integrado |
| **Notificações** | Firebase Cloud Messaging | Push notifications cross-platform |
| **Geolocalização** | Browser Geolocation API + Google Maps | Campos próximos, mapa integrado |
| **Monitoramento** | Sentry + Vercel Analytics | Erros em produção, métricas de uso |

---

## 📅 Fases de Implementação

### 🟢 Fase 1: Fundação (Semanas 1-2)

**Objetivo:** Infraestrutura base, autenticação e cadastros fundamentais.

| Semana | Entregáveis | Critério de Aceite |
|--------|-------------|-------------------|
| **1** | Setup Next.js, Tailwind, Prisma, PostgreSQL | Projeto roda localmente, migrations funcionam |
| **1** | Schema inicial do banco (User, Field, Booking) | Migrations aplicadas, seed data funcionando |
| **1** | Tela de cadastro com validação de CPF | CPF válido/inválido detectado corretamente |
| **2** | Autenticação com NextAuth.js | Login/logout funcional, sessions persistentes |
| **2** | Tela de login + recuperação de senha | Fluxo completo testado |
| **2** | Header personalizado ("Olá, [Usuário]") | Data e nome exibidos corretamente |

**🎯 Marco 1:** Usuário consegue se cadastrar, validar CPF e fazer login.

---

### 🟡 Fase 2: Painel do Dono do Campo (Semanas 3-4)

**Objetivo:** Donos podem cadastrar campos e configurar horários/preços.

| Semana | Entregáveis | Critério de Aceite |
|--------|-------------|-------------------|
| **3** | Cadastro de campo (nome, endereço, fotos) | Campo criado e persistido no banco |
| **3** | Configuração de faixa horária (ex: 17h-03h) | Horários salvos, conflitos detectados |
| **3** | Definição de preço por hora | Preço associado ao campo |
| **4** | Dashboard do dono (reservas, faturamento) | Métricas calculadas corretamente |
| **4** | Link de compartilhamento de horários | Link único gera página de reserva |
| **4** | Regra 50% configurável | Sistema verifica pagamento mínimo |

**🎯 Marco 2:** Dono consegue cadastrar campo, configurar horários e gerar link de reserva.

---

### 🟠 Fase 3: Interface do Cliente - Navegação (Semanas 5-6)

**Objetivo:** Cliente navega pelas 4 abas principais.

| Semana | Entregáveis | Critério de Aceite |
|--------|-------------|-------------------|
| **5** | Bottom navigation (4 abas) | Navegação funcional, ícones corretos |
| **5** | Tela Início com busca, último agendamento, favorito | Dados carregados dinamicamente |
| **5** | Tela Buscar com filtros (nome, cidade, proximidade) | Filtros funcionam, resultados ordenados |
| **6** | Geolocalização para campos próximos | Permissão de localização, cálculo de distância |
| **6** | Tela Agendamentos com lista e status | Status atualizados em tempo real |
| **6** | Tela Menu com todas as subseções | Navegação interna funcional |

**🎯 Marco 3:** Cliente consegue navegar por todas as telas principais.

---

### 🔴 Fase 4: Sistema de Pagamentos PIX (Semanas 7-8)

**Objetivo:** Pagamentos divididos via PIX com regra 50% e reembolsos.

| Semana | Entregáveis | Critério de Aceite |
|--------|-------------|-------------------|
| **7** | Integração Mercado Pago (PIX) | QR Code gerado, pagamento recebido |
| **7** | Pagamento dividido entre múltiplos usuários | Cada usuário paga sua parte |
| **7** | Regra 50%: verificação automática 2 dias antes | Sistema calcula % pago, notifica |
| **8** | Reembolso automático via PIX | Estorno processado se regra não atendida |
| **8** | Notificações de pagamento | Confirmação por push/email |
| **8** | Histórico de transações | Usuário vê todos os pagamentos |

**🎯 Marco 4:** Pagamentos PIX funcionais com divisão e reembolsos automáticos.

---

### 🟣 Fase 5: Refinamento e Testes (Semanas 9-10)

**Objetivo:** Polir experiência, testar fluxos críticos, preparar para produção.

| Semana | Entregáveis | Critério de Aceite |
|--------|-------------|-------------------|
| **9** | Testes unitários (CPF, pagamentos, regras) | Cobertura > 80% em lógica crítica |
| **9** | Testes E2E (Playwright) | Fluxos de reserva e pagamento testados |
| **9** | Tema claro/escuro | Toggle funcional, persiste preferência |
| **10** | Suporte a idiomas (PT, EN, ES) | Tradução completa, sem hardcoded strings |
| **10** | Performance optimization | Lighthouse > 90 em mobile |
| **10** | LGPD compliance | Consentimento, exclusão de dados, política |

**🎯 Marco 5:** Aplicativo testado, otimizado e pronto para produção.

---

### 🚀 Fase 6: Deploy e Lançamento (Semana 11)

**Objetivo:** Deploy em produção, monitoramento, backup.

| Semana | Entregáveis | Critério de Aceite |
|--------|-------------|-------------------|
| **11** | Deploy frontend (Vercel) | URL pública acessível, SSL ativo |
| **11** | Deploy banco (Supabase) | Conexão estável, backups automáticos |
| **11** | Domínio personalizado | DNS configurado, HTTPS funcionando |
| **11** | Monitoramento (Sentry) | Erros capturados, alertas configurados |
| **11** | Smoke tests em produção | Fluxos críticos funcionam em prod |

**🎯 Marco 6:** Aplicativo em produção, monitorado e estável.

---

## 📊 Cronograma Visual

```
Semana:  1    2    3    4    5    6    7    8    9    10   11
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
Fase 1  │████│████│    │    │    │    │    │    │    │    │    │
Fase 2  │    │    │████│████│    │    │    │    │    │    │    │
Fase 3  │    │    │    │    │████│████│    │    │    │    │    │
Fase 4  │    │    │    │    │    │    │████│████│    │    │    │
Fase 5  │    │    │    │    │    │    │    │    │████│████│    │
Fase 6  │    │    │    │    │    │    │    │    │    │    │████│
        └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
Marco:  M1   M1   M2   M2   M3   M3   M4   M4   M5   M5   M6
```

---

## 🔐 Modelo de Dados (Prisma Schema)

```prisma
model User {
  id            String    @id @default(uuid())
  name          String
  cpf           String    @unique
  email         String    @unique
  password      String
  birthDate     DateTime
  phone         String?
  role          Role      @default(CLIENT)
  favorites     Favorite[]
  bookings      Booking[]
  payments      Payment[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Field {
  id            String    @id @default(uuid())
  ownerId       String
  owner         User      @relation(fields: [ownerId], references: [id])
  name          String
  address       String
  city          String
  latitude      Float
  longitude     Float
  photos        String[]
  description   String?
  capacity      Int
  pricePerHour  Decimal
  startHour     Int       // 17 = 17:00
  endHour       Int       // 3 = 03:00
  minPaymentPct Float     @default(50) // 50%
  bookings      Booking[]
  favorites     Favorite[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Booking {
  id            String    @id @default(uuid())
  fieldId       String
  field         Field     @relation(fields: [fieldId], references: [id])
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  date          DateTime
  startHour     Int
  endHour       Int
  totalValue    Decimal
  paidValue     Decimal   @default(0)
  status        BookingStatus @default(PENDING)
  shareLink     String    @unique
  minPaymentPct Float
  paymentDeadline DateTime
  participants  Participant[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Participant {
  id            String    @id @default(uuid())
  bookingId     String
  booking       Booking   @relation(fields: [bookingId], references: [id])
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  shareValue    Decimal
  hasPaid       Boolean   @default(false)
  createdAt     DateTime  @default(now())
}

model Payment {
  id            String    @id @default(uuid())
  bookingId     String
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  amount        Decimal
  method        PaymentMethod @default(PIX)
  status        PaymentStatus @default(PENDING)
  pixCode       String?
  pixQrCode     String?
  refunded      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Favorite {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  fieldId       String
  field         Field     @relation(fields: [fieldId], references: [id])
  createdAt     DateTime  @default(now())

  @@unique([userId, fieldId])
}

enum Role {
  CLIENT
  FIELD_OWNER
  ADMIN
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  REFUNDED
}

enum PaymentMethod {
  PIX
  CREDIT_CARD
  DEBIT_CARD
}

enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
  FAILED
}
```

---

## 🧪 Critérios de Qualidade

| Métrica | Target | Ferramenta |
|---------|--------|------------|
| Validação de CPF | 100% precisão | Testes unitários |
| Pagamento PIX | < 3s para gerar QR Code | Monitoramento |
| Reembolso automático | 100% dos casos elegíveis | Logs + testes |
| Lighthouse Mobile | > 90 | Lighthouse CI |
| Cobertura de testes | > 80% (lógica crítica) | Jest |
| Tempo de resposta API | < 500ms (p95) | Vercel Analytics |
| Uptime | > 99.9% | UptimeRobot |

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Gateway PIX não suporta split payment | 🔴 Alto | Validar API antes de iniciar Fase 4 |
| Reembolso automático falha | 🔴 Alto | Implementar fila de retry + alerta manual |
| Validação de CPF burlada | 🟡 Médio | Validar no frontend E backend |
| Geolocalização negada pelo usuário | 🟡 Médio | Fallback para busca por cidade |
| LGPD não compliance | 🔴 Alto | Consultar jurídico, implementar consentimento |

---

## 📝 Próximos Passos

1. **Validar stack com o usuário** - Confirmar tecnologias escolhidas
2. **Definir gateway de pagamento** - Pesquisar Mercado Pago vs Pagar.me vs Stark Bank
3. **Criar design system** - Definir cores, tipografia, componentes base
4. **Iniciar Fase 1** - Setup do projeto e configurações iniciais

---

> **Nota:** Este plano segue o padrão de diamante - cada fase tem critérios de aceite claros, marcos definidos e dependências mapeadas. Ajustes podem ser feitos conforme feedback do usuário.
