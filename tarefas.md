# 📋 Tareas - Campo Reserva App

> Aplicativo web para gerenciamento de reservas de campos de futebol pagos com divisão automática de pagamentos via PIX.

---

## 🎯 Visão Geral do Projeto

**Problema:** Donos de campos de futebol enfrentam atrasos, falta de pagamento e desconforto na divisão de valores entre grupos.

**Solução:** Plataforma web com dois perfis (Dono do Campo e Cliente) que automatiza reservas, pagamentos divididos e reembolsos.

---

## 🏗️ Épico 1: Infraestrutura e Configuração Inicial

| ID | Tarefa | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| INF-001 | Setup do repositório | Inicializar projeto Next.js + TypeScript + Tailwind | 🔴 Alta | ⬜ Pendente |
| INF-002 | Configuração do banco | PostgreSQL com Prisma ORM, schemas iniciais | 🔴 Alta | ⬜ Pendente |
| INF-003 | Autenticação base | NextAuth.js com JWT, sessions seguras | 🔴 Alta | ⬜ Pendente |
| INF-004 | Variáveis de ambiente | .env.local, .env.production, documentação | 🟡 Média | ⬜ Pendente |
| INF-005 | CI/CD pipeline | GitHub Actions para lint, test, build | 🟢 Baixa | ⬜ Pendente |

---

## 👤 Épico 2: Cadastro e Autenticação de Clientes

| ID | Tarefa | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| AUTH-001 | Tela de cadastro | Formulário: Nome Completo, CPF, Data de Nascimento | 🔴 Alta | ⬜ Pendente |
| AUTH-002 | Validação de CPF | Algoritmo de validação dos dígitos verificadores | 🔴 Alta | ⬜ Pendente |
| AUTH-003 | Validação de idade | Verificar maioridade (18+) ou campo responsável | 🔴 Alta | ⬜ Pendente |
| AUTH-004 | Tela de login | Email/CPF + senha, recuperação de senha | 🔴 Alta | ⬜ Pendente |
| AUTH-005 | Proteção de rotas | Middleware de autenticação para rotas protegidas | 🟡 Média | ⬜ Pendente |

---

## 🏟️ Épico 3: Painel do Dono do Campo

| ID | Tarefa | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| OWNER-001 | Cadastro do campo | Nome, endereço, fotos, descrição, capacidade | 🔴 Alta | ⬜ Pendente |
| OWNER-002 | Configuração de horários | Definir faixa horária disponível (ex: 17h-03h) | 🔴 Alta | ⬜ Pendente |
| OWNER-003 | Preço por hora | Definir valor/hora, dias com preços diferentes | 🔴 Alta | ⬜ Pendente |
| OWNER-004 | Dashboard | Visão geral: reservas hoje, faturamento, ocupação | 🟡 Média | ⬜ Pendente |
| OWNER-005 | Gestão de reservas | Listar, confirmar, cancelar reservas | 🟡 Média | ⬜ Pendente |
| OWNER-006 | Link de compartilhamento | Gerar link único para cada horário disponível | 🟡 Média | ⬜ Pendente |
| OWNER-007 | Regra 50% | Configurar regra: mínimo 50% pago 2 dias antes | 🔴 Alta | ⬜ Pendente |
| OWNER-008 | Reembolso automático | Se não atingir 50%, estornar pagamentos via PIX | 🔴 Alta | ⬜ Pendente |

---

## 📱 Épico 4: Interface do Cliente - Navegação

| ID | Tarefa | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| CLI-001 | Header personalizado | "Olá, [Usuário]" + "Dia da semana, DD/MM/AAAA" | 🔴 Alta | ⬜ Pendente |
| CLI-002 | Bottom navigation | 4 abas: Início, Buscar, Agendamentos, Menu | 🔴 Alta | ⬜ Pendente |
| CLI-003 | Tema claro/escuro | Toggle de aparência nas preferências | 🟡 Média | ⬜ Pendente |
| CLI-004 | Suporte a idiomas | Português (padrão), Inglês, Espanhol | 🟢 Baixa | ⬜ Pendente |

---

## 🏠 Épico 5: Tela Início

| ID | Tarefa | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| HOME-001 | Barra de pesquisa | Buscar campos por nome | 🔴 Alta | ⬜ Pendente |
| HOME-002 | Último agendamento | Card com resumo da última reserva | 🟡 Média | ⬜ Pendente |
| HOME-003 | Campo favorito | Exibir campo favoritado com acesso rápido | 🟡 Média | ⬜ Pendente |
| HOME-004 | Campos recomendados | Sugestões baseadas em localização/histórico | 🟢 Baixa | ⬜ Pendente |

---

## 🔍 Épico 6: Tela Buscar

| ID | Tarefa | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| SEARCH-001 | Barra de pesquisa | Campo de busca prominente ao entrar na tela | 🔴 Alta | ⬜ Pendente |
| SEARCH-002 | Filtro por nome | Buscar campos pelo nome | 🔴 Alta | ⬜ Pendente |
| SEARCH-003 | Filtro por cidade | Selecionar cidade para filtrar resultados | 🔴 Alta | ⬜ Pendente |
| SEARCH-004 | Filtro por proximidade | Geolocalização para campos próximos | 🟡 Média | ⬜ Pendente |
| SEARCH-005 | Lista de resultados | Cards com foto, nome, preço, avaliação | 🟡 Média | ⬜ Pendente |
| SEARCH-006 | Mapa integrado | Visualizar campos no mapa (opcional) | 🟢 Baixa | ⬜ Pendente |

---

## 📅 Épico 7: Tela Agendamentos

| ID | Tarefa | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| BOOK-001 | Lista de agendamentos | Todos os agendamentos do usuário | 🔴 Alta | ⬜ Pendente |
| BOOK-002 | Status do agendamento | Pendente, Confirmado, Cancelado, Concluído | 🔴 Alta | ⬜ Pendente |
| BOOK-003 | Detalhes do agendamento | Campo, horário, valor, participantes | 🔴 Alta | ⬜ Pendente |
| BOOK-004 | Pagamento parcial | Visualizar quanto já foi pago vs total | 🔴 Alta | ⬜ Pendente |
| BOOK-005 | Compartilhar link | Enviar link de reserva para amigos | 🟡 Média | ⬜ Pendente |
| BOOK-006 | Cancelamento | Cancelar reserva com política de reembolso | 🟡 Média | ⬜ Pendente |

---

## ⚙️ Épico 8: Tela Menu

| ID | Tarefa | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| MENU-001 | Meus Dados | Editar perfil: nome, email, telefone | 🔴 Alta | ⬜ Pendente |
| MENU-002 | Campos Favoritos | Lista de campos salvos como favoritos | 🟡 Média | ⬜ Pendente |
| MENU-003 | Meus Cartões | Salvar métodos de pagamento (cartões, PIX) | 🟡 Média | ⬜ Pendente |
| MENU-004 | Segurança | Alterar senha, autenticação 2FA | 🟡 Média | ⬜ Pendente |
| MENU-005 | Histórico | Todos os agendamentos passados | 🟡 Média | ⬜ Pendente |
| MENU-006 | Preferências | Tema claro/escuro, idioma | 🟡 Média | ⬜ Pendente |

---

## 💳 Épico 9: Sistema de Pagamentos (PIX)

| ID | Tarefa | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| PAY-001 | Integração PIX | Gateway de pagamento (Mercado Pago, Pagar.me) | 🔴 Alta | ⬜ Pendente |
| PAY-002 | Pagamento dividido | Múltiplos usuários pagam a mesma reserva | 🔴 Alta | ⬜ Pendente |
| PAY-003 | Regra 50% | Verificar se 50% foi pago 2 dias antes | 🔴 Alta | ⬜ Pendente |
| PAY-004 | Reembolso automático | Estornar via PIX se regra não atendida | 🔴 Alta | ⬜ Pendente |
| PAY-005 | Notificações de pagamento | Confirmar pagamento recebido | 🟡 Média | ⬜ Pendente |
| PAY-006 | QR Code PIX | Gerar QR Code para pagamento instantâneo | 🟡 Média | ⬜ Pendente |

---

## 🔔 Épico 10: Notificações e Comunicação

| ID | Tarefa | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| NOTIF-001 | Push notifications | Lembrete de jogo, pagamento pendente | 🟡 Média | ⬜ Pendente |
| NOTIF-002 | Email transacional | Confirmação de reserva, reembolso | 🟡 Média | ⬜ Pendente |
| NOTIF-003 | SMS (opcional | Alertas críticos via SMS | 🟢 Baixa | ⬜ Pendente |
| NOTIF-004 | Central de notificações | In-app notification center | 🟡 Média | ⬜ Pendente |

---

## 🧪 Épico 11: Testes e Qualidade

| ID | Tarefa | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| TEST-001 | Testes unitários | Jest/React Testing Library para componentes | 🟡 Média | ⬜ Pendente |
| TEST-002 | Testes de integração | API endpoints, fluxos de pagamento | 🟡 Média | ⬜ Pendente |
| TEST-003 | Testes E2E | Playwright para fluxos críticos | 🟡 Média | ⬜ Pendente |
| TEST-004 | Validação de CPF | Testes unitários do algoritmo de validação | 🔴 Alta | ⬜ Pendente |
| TEST-005 | Testes de pagamento | Simular fluxos PIX, reembolsos | 🔴 Alta | ⬜ Pendente |

---

## 🚀 Épico 12: Deploy e Produção

| ID | Tarefa | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| DEPLOY-001 | Deploy frontend | Vercel para Next.js | 🔴 Alta | ⬜ Pendente |
| DEPLOY-002 | Deploy backend | Railway/Supabase para API e banco | 🔴 Alta | ⬜ Pendente |
| DEPLOY-003 | Domínio personalizado | Configurar DNS, SSL | 🟡 Média | ⬜ Pendente |
| DEPLOY-004 | Monitoramento | Sentry para erros, analytics | 🟡 Média | ⬜ Pendente |
| DEPLOY-005 | Backup automático | Backup diário do banco de dados | 🟡 Média | ⬜ Pendente |

---

## 📊 Resumo de Prioridades

| Prioridade | Quantidade |
|------------|------------|
| 🔴 Alta | 32 tarefas |
| 🟡 Média | 23 tarefas |
| 🟢 Baixa | 5 tarefas |
| **Total** | **60 tarefas** |

---

## 🎯 Squad de Especialistas Sugerido

| Especialista | Responsabilidade |
|--------------|------------------|
| @frontend-developer | Interface React/Next.js, componentes, responsividade |
| @backend-architect | API, banco de dados, autenticação, webhooks |
| @payment-integration | Integração PIX, divisão de pagamentos, reembolsos |
| @ui-ux-designer | Design system, experiência mobile-first, acessibilidade |
| @security-auditor | Validação de CPF, proteção de dados, LGPD |

---

## 📝 Notas Importantes

1. **Validação de CPF**: Implementar algoritmo oficial dos dígitos verificadores
2. **LGPD**: Aplicação deve estar em conformidade com a Lei Geral de Proteção de Dados
3. **PIX**: Priorizar gateway que suporte pagamento dividido e reembolso automático
4. **Mobile-first**: Design responsivo focado em experiência mobile
5. **Regra 50%**: Lógica crítica que deve ser testada extensivamente
