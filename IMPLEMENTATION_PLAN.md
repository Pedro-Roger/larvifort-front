# Plano de Implementação e Arquitetura - LarviFort CRM 360

## 1. Decisões Arquiteturais (/grill-me conclusões)
- **Modelagem de Clientes e CNPJ:** A tabela `Company` será a entidade central B2B. A relação matriz/filial será feita via `parentCompanyId` em `Company`. A entidade `CommercialGroup` agrupará múltiplas `Company`s (mesmo com CNPJs raiz diferentes). A entidade legado `Client` será gradativamente fundida ou mantida apenas para B2C/contatos avulsos, mas pedidos futuros focarão em apontar para `Company` ou `CompanyContact`.
- **Deduplicação de CNPJ:** O campo `normalizedCnpj` será adicionado a `Company` e terá restrição UNIQUE junto com `organizationId`. 
- **Histórico de Pedidos:** Para não quebrar o histórico, introduziremos `companyId` em `Order` e faremos um backfill (update) baseado na cadeia `Order -> Client -> Company`.
- **Grandes Volumes (1M+ pedidos):** Relatórios e Analytics não farão fetch massivo para o frontend. Implementaremos agregações no backend (GROUP BY, SUM) e usaremos índices em `(organizationId, createdAt)`, `(organizationId, companyId)`, etc. 
- **Agendamento (Appointments):** A tabela `Reminder` já existe com relacionamentos polimórficos (`linkedType`/`linkedId`). Vamos adicionar colunas diretas (ex: `companyId`) para manter integridade referencial, e continuar usando-a para a agenda, sem criar uma nova tabela.
- **Relatórios via WhatsApp:** Adicionaremos tabelas de estágio `ReportIntake` para armazenar o parsing temporário de relatórios antes de convertê-los em `Order` ou `Activity`, exigindo intervenção humana (revisão) para baixa confiança.
- **Cache e Performance:** Listagens terão server-side pagination (limit/offset ou cursores no Prisma). Filtros "Smart Views" serão JSONB ou tabelas dedicadas.
- **Forecast / Modelos Preditivos:** Na Fase 1 (Nível 1), usaremos algoritmos determinísticos no backend (média de recompra, ticket médio histórico) via SQL/Prisma, sem dependência de IA externa, focado em precisão matemática e backtesting auditável.

## 2. Riscos e Alternativas Rejeitadas
- **Risco:** Mudar `Order.clientId` para `Order.companyId` pode quebrar integrações legadas. **Mitigação:** Manter `clientId` e adicionar `companyId`, sincronizando os dois no backend durante o período de transição.
- **Alternativa Rejeitada:** Criar a entidade `Appointment` do zero. **Motivo:** Já existe a tabela `Reminder` e o ecossistema associado (ActivityLog, etc). É mais seguro migrar e estender `Reminder`.
- **Alternativa Rejeitada:** Tabela de CNPJ separada de Company. **Motivo:** Aumentaria a complexidade dos joins para consultas básicas. CNPJ será atributo da `Company`.
- **Risco Multi-tenancy:** Vazamento de dados em agregações. **Mitigação:** Todo Prisma query DEVE incluir `organizationId`.

---

## 3. Lista de Tasks (Ordenada por Dependência)

### FASE 1: Estrutura Base e Clientes 360
- **TASK 01 — Auditoria e mapa de impacto:** Concluído.
- **TASK 02 — Modelo Company:** Adicionar `normalizedCnpj`, `customerStatus`, endereço e dados da Receita em `Company`. (Prisma migration).
- **TASK 03 — CommercialGroup:** Criar tabela `CommercialGroup` e ligar 1:N com `Company`.
- **TASK 04 — Matriz/filial:** Adicionar `parentCompanyId` em `Company`.
- **TASK 05 — Cadastro via CNPJ:** Criar abstração e integração (ex: BrasilAPI/ReceitaWS via Adapter) para busca de CNPJ. Preview no frontend.
- **TASK 06 — Deduplicação:** Lógica de bloqueio por `normalizedCnpj` único por tenant e avisos para semelhanças em nomes/emails.
- **TASK 09 — Contatos:** Estender `CompanyContact` com roles/tags e status `isPrimary`.
- **TASK 08 — Customer 360 (UI):** Criação das abas, layout denso, integração inicial de dados na tela de Empresa.

### FASE 2: Transição de Pedidos e Histórico
- **TASK 07 — Integração Company ↔ pedidos existentes:** Adicionar `companyId` em `Order`, criar job de backfill migrando dados de `Client` para `Company`.
- **TASK 10 — Analytics histórico:** Criar endpoints de agregação no backend para faturamento, volume, ticket médio.
- **TASK 11 — Comparações temporais:** Endpoints para YoY, MoM, WoW.
- **TASK 12 — Gráficos:** Implementar bibliotecas (ex: Recharts) no frontend e plotar dados dos endpoints.
- **TASK 13 — Analytics de grupo comercial:** Agregação de `Order` agrupada por `CommercialGroup`.

### FASE 3: Funil, Metas e Forecast
- **TASK 35 — Pipeline:** Adaptar `Pipeline` e `PipelineStage` para suportar novas funcionalidades de UI do Kanban.
- **TASK 36 — Drag-and-drop:** Optimistic UI para movimentação de cards.
- **TASK 37 — Histórico de estágios:** Criar `OpportunityStageHistory` (ou equivalente `OrderStageHistory` usando `ActivityLog`).
- **TASK 38 — Opportunity ↔ Order:** Decidir modelo (atualmente Order *é* a oportunidade no funil). Refatorar se necessário separar Lead/Oportunidade de Pedido Fechado.
- **TASK 14 — Metas de valor:** Atualizar modelo `Goal`.
- **TASK 15 — Metas de volume:** Incluir campos de meta de volume (já existe `volumeTargetMillions`, ajustar para unificação).
- **TASK 16 — Dashboard de metas:** Tela de acompanhamento.
- **TASK 17 — Forecast determinístico:** Algoritmo no backend.
- **TASK 18 — Forecast por cliente:** Cálculo por `companyId`.
- **TASK 19 — Recompra:** Identificação de ciclo baseado na média de intervalo de pedidos anteriores.
- **TASK 20 — Anomalias:** Regras de desvio padrão para queda de receita/volume.
- **TASK 21 — Modelos preditivos & TASK 22 — Backtesting:** Setup do modelo estatístico.

### FASE 4: Importação e WhatsApp
- **TASK 23 — Importação CSV & TASK 24 — Excel:** Infra de upload e parsing.
- **TASK 25 — Templates & TASK 26 — Validação/Preview:** UI de mapeamento de colunas.
- **TASK 27 — Idempotência & TASK 28 — Jobs:** Processamento em background.
- **TASK 29 — Relatórios WhatsApp & TASK 30 — Inbox:** Tabela `ReportIntake`.
- **TASK 31 — Parser e revisão:** UI para aprovar/descartar leitura.

### FASE 5: Engajamento e CRM Diário
- **TASK 32 — Integração com agendamento:** Usar `Reminder` associado a `Company`.
- **TASK 33 — Agenda comercial:** UI de calendário.
- **TASK 34 — Sugestão de follow-up:** Regra automatizada a partir do forecast.
- **TASK 39 — Needs Attention:** Motor de regras (CRON job).
- **TASK 40 — Smart Views:** Filtros salvos no BD.
- **TASK 41 — Timeline:** Feed unificado via `ActivityLog`.
- **TASK 42 — WhatsApp ↔ Customer 360:** Exibir mensagens da `Conversation` na tela da Empresa.

### FASE 6: Dashboards e Refinamentos
- **TASK 43 a 45 — Dashboards:** Comercial, Vendedor, Executivo.
- **TASK 46 — Busca global:** Pesquisa cross-tables.
- **TASK 47 — Custom Fields & TASK 48 — Tags:** Estrutura EAV ou JSONB.
- **TASK 49 — Automações & TASK 50 — Notificações:** Webhooks/Triggers.
- **TASK 51 a 58:** RBAC, Tenants, Performance, Testes, Responsividade.
- **TASK 59 — Documentação final.**
