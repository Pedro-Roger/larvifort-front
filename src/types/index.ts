// RBAC (Bloco 4) — espelha o CHECK constraint de `users.role` em
// backend/src/db/schema.sql / auth.config.ts. `session.user.role` sempre vem
// populado (não é mais opcional desde o Bloco 4 — authorize() sempre retorna
// um dos dois valores, nunca null/undefined).
export const USER_ROLES = ['comercial', 'gestor'] as const
export type UserRole = (typeof USER_ROLES)[number]

export interface User {
  id: string
  name: string | null
  email: string
  organizationId: string
  role: UserRole
}

// GET /api/v1/users (backend/src/routes/users.ts) — lista enxuta de usuários
// da organização, usada só para popular o select de "responsável comercial"
// em Cliente/Pedido. Não é o mesmo shape de `User` (sem organizationId, esse
// endpoint nunca retorna dado de outra organização pra começo de conversa).
export interface OrgUser {
  id: string
  name: string | null
  email: string
  role: UserRole
}

// Vocabulário de domínio (Cliente/Empresa/Atividade) — espelha
// backend/src/constants/domain.ts. Mantido aqui (não gerado a partir do
// backend, o projeto não tem tipos compartilhados entre pacotes) para as
// duas pontas não divergirem quando um valor novo for adicionado; se
// divergir, é aqui que se conserta.
export const CLIENT_POTENTIALS = ['baixo', 'medio', 'alto'] as const
export type ClientPotential = (typeof CLIENT_POTENTIALS)[number]

export const CLIENT_STATUSES = ['ativo', 'em_negociacao', 'atencao', 'inativo'] as const
export type ClientStatus = (typeof CLIENT_STATUSES)[number]

export const COMPANY_FARM_SIZES = ['pequeno', 'medio', 'grande'] as const
export type CompanyFarmSize = (typeof COMPANY_FARM_SIZES)[number]

export const ACTIVITY_TYPES = ['ligacao', 'reuniao', 'visita', 'tarefa'] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export const ACTIVITY_STATES = ['pendente', 'concluida'] as const
export type ActivityState = (typeof ACTIVITY_STATES)[number]

export interface Client {
  id: string
  organizationId: string
  companyId: string | null
  company: Pick<Company, 'id' | 'name'> | null
  ownerUserId: string | null
  name: string | null
  email: string | null
  whatsapp: string | null
  notes: string | null
  region: string | null
  potential: ClientPotential | null
  status: ClientStatus
  createdAt: string
}

export interface Company {
  id: string
  organizationId: string
  name: string
  cnpj: string | null
  email: string | null
  phone: string | null
  notes: string | null
  farmLocation: string | null
  farmSize: CompanyFarmSize | null
  createdAt: string
}

export interface CompanyContact {
  id: string
  companyId: string
  organizationId: string
  name: string
  role: string | null
  email: string | null
  whatsapp: string | null
  createdAt: string
}

export interface Conversation {
  id: string
  organizationId: string
  clientId: string | null
  whatsappChatId: string
  lastMessageAt: string | null
  unreadCount: number
  createdAt: string
  client: (Pick<Client, 'id' | 'name' | 'whatsapp'> & {
    company: Pick<Company, 'id' | 'name'> | null
  }) | null
}

export interface Message {
  id: string
  conversationId: string
  organizationId: string
  whatsappMessageId: string | null
  content: string
  direction: 'in' | 'out'
  createdAt: string
}

export interface ClientConversation {
  id: string
  whatsappChatId: string
  lastMessageAt: string | null
  unreadCount: number
  messages: Message[]
}

export interface ClientDetail extends Client {
  conversation: ClientConversation | null
}

// Vocabulário de domínio de Pedidos/Planejamento (Bloco 3) — espelha
// backend/src/constants/domain.ts, confirmado direto no código do backend
// (não só pelo diário) antes de codar aqui.
export const ORDER_STAGES = [
  'orcamento',
  'negociacao',
  'aprovado',
  'disponibilidade',
  'reservado',
  'producao',
  'pronto',
  'entregue',
] as const
export type OrderStage = (typeof ORDER_STAGES)[number]

export const ORDER_PRIORITIES = ['baixa', 'media', 'alta'] as const
export type OrderPriority = (typeof ORDER_PRIORITIES)[number]

export const AQUAFORT_AVAILABILITY_STATUSES = ['confirmada_integral', 'parcial', 'indisponivel'] as const
export type AquaFortAvailabilityStatus = (typeof AQUAFORT_AVAILABILITY_STATUSES)[number]

export const AQUAFORT_SYNC_STATES = ['sincronizado', 'sincronizacao_pendente'] as const
export type AquaFortSyncState = (typeof AQUAFORT_SYNC_STATES)[number]

// Hook de teste/demo aceito por PATCH /orders/:id/stage e
// POST /orders/:id/planning/retry (campo `simulate`) — força um dos 4
// cenários do adaptador simulado em vez do resultado determinístico por
// hash. Nunca é exigido pelo fluxo real (ver backend/src/routes/orders.ts).
export const AQUAFORT_SIMULATED_SCENARIOS = ['confirmada_integral', 'parcial', 'indisponivel', 'falha'] as const
export type AquaFortSimulatedScenario = (typeof AQUAFORT_SIMULATED_SCENARIOS)[number]

export interface Planning {
  id: string
  organizationId: string
  orderId: string
  externalPlanningId: string | null
  aquafortState: AquaFortSyncState
  availabilityStatus: AquaFortAvailabilityStatus | null
  confirmedQuantity: number | null
  expectedDate: string | null
  productionUnit: string | null
  batch: string | null
  geneticCode: string | null
  constraintsNotes: string | null
  retryCount: number
  lastSyncedAt: string | null
  createdAt: string
}

export interface ActivityLog {
  id: string
  orderId: string
  organizationId: string
  userId: string | null
  activityType: string
  description: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  user: { id: string; name: string | null } | null
}

export interface CardComment {
  id: string
  orderId: string
  organizationId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  user: { id: string; name: string | null }
}

export interface Order {
  id: string
  organizationId: string
  clientId: string
  ownerUserId: string | null
  quantityMillions: number
  value: number | null
  product: string
  desiredStage: string | null
  genetics: string | null
  desiredDeliveryDate: string | null
  priority: OrderPriority
  notes: string | null
  commercialStage: OrderStage
  operationalStage: OrderStage
  // Fonte de verdade do board (CRM realtime, spec 2026-08-28): aponta pra
  // colunas reais de pipeline_stages. Nullable só durante migração — o
  // backend sempre popula na criação/backfill.
  pipelineStageId: string | null
  createdAt: string
  updatedAt: string
  client: Pick<Client, 'id' | 'name'> | null
  // Só vem preenchido em GET /orders/:id, PATCH /orders/:id(/stage) — a
  // listagem (GET /orders) não faz join com plannings, ver routes/orders.ts.
  planning?: Planning | null
}

// CRM realtime (spec 2026-08-28-crm-board-realtime-design): board
// configurável por org, colunas vêm do banco. GET /api/v1/board devolve o
// payload pronto pra render — ver backend/src/routes/board.ts.
export interface PipelineSummary {
  id: string
  organizationId: string
  name: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface PipelineStage {
  id: string
  pipelineId: string
  name: string
  color: string
  position: number
  semanticKey: OrderStage | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Board GET /api/v1/board: stages ativos em ordem + orderCount calculado no
// backend sobre o subconjunto de cards do usuário (gestor vê tudo, comercial
// a própria carteira — mesmo critério de GET /orders).
export interface BoardStage extends PipelineStage {
  orderCount: number
  hasPermissions: boolean
}

export interface Board {
   pipeline: PipelineSummary
   stages: BoardStage[]
   orders: Order[]
 }

export interface ColumnFormula {
   id: string
   pipelineStageId: string
   organizationId: string
   name: string
   expression: string
   resultType: "number" | "currency" | "percentage" | "text" | "date"
   isActive: boolean
   createdAt: string
   updatedAt: string
 }

export interface ColumnPermission {
  id: string
  pipelineStageId: string
  organizationId: string
  granteeType: 'role' | 'user'
  granteeId: string | null
  permissions: Record<string, boolean>
  createdAt: string
  updatedAt: string
}

export interface Reminder {
  id: string
  organizationId: string
  // Módulo de Agenda (Bloco 5) — GET /reminders passou a devolver esse campo
  // (backend/src/routes/reminders.ts, mapReminder). Usado pelo RBAC de
  // carteira na listagem "solta" (ver AgendaPage) e para exibir/editar o
  // responsável no formulário de criação.
  ownerUserId: string | null
  title: string
  description: string | null
  dueAt: string
  type: ActivityType
  state: ActivityState
  // Derivado de `state` (`state === 'concluida'`) só por compatibilidade
  // com telas que ainda não migraram — ver backend/src/constants/domain.ts
  // (stateToCompletedCompat). Prefira `state` em código novo.
  completed: boolean
  // 'order' incluído aqui (módulo de Agenda, Bloco 5): a coluna
  // `reminders.linked_type` no backend sempre foi VARCHAR(20) sem CHECK
  // (ver schema.sql — só `type`/`state` têm enum reforçado), o comentário
  // antigo da tabela ("vínculo é cliente OU empresa, pedido é módulo
  // futuro") ficou desatualizado desde que Pedido virou entidade real no
  // Bloco 3. Vincular uma Atividade a um pedido (`linked_type: 'order'`) já
  // é aceito pela rota sem qualquer mudança de schema/validação no backend.
  linkedType: 'client' | 'company' | 'order' | null
  linkedId: string | null
  createdAt: string
}

// GET /api/v1/orders/alerts (módulo de Agenda, Bloco 5, spec seção 3:
// "Alertas gerados pelo planejamento") — espelha o shape de
// backend/src/routes/orders.ts (rota /alerts), confirmado direto no código
// antes de codar. `order`/`planning` vêm sempre completos (não parciais).
export const ORDER_ALERT_TYPES = ['sincronizacao_pendente', 'indisponivel', 'disponibilidade_parcial'] as const
export type OrderAlertType = (typeof ORDER_ALERT_TYPES)[number]

export interface OrderAlert {
  alertType: OrderAlertType
  order: Order
  planning: Planning
}

// Módulo de Metas (Bloco 6, spec seção 3: "Objetivos mensais por vendedor.
// Receita prevista e realizada. Volume comercializado. Progresso individual
// e do time.") — espelha mapGoal/GET /goals de backend/src/routes/goals.ts,
// confirmado direto no código antes de codar. `realized*`/`*Progress` nunca
// são armazenados no backend, sempre recalculados em runtime — por isso
// vêm sempre presentes na resposta (não opcionais), nunca montados aqui no
// frontend.
export interface Goal {
  id: string
  organizationId: string
  userId: string
  // "YYYY-MM-DD", sempre o primeiro dia do mês (TO_CHAR(period, 'YYYY-MM-DD')
  // no backend) — nunca "YYYY-MM" puro, ver normalizePeriod em goals.ts.
  period: string
  revenueTarget: number
  volumeTargetMillions: number
  createdAt: string
  updatedAt: string
  user: Pick<OrgUser, 'id' | 'name'> | null
  realizedRevenue: number
  realizedVolumeMillions: number
  // Percentual (2 casas decimais), sem cap em 100 — pode passar de 100% se a
  // meta foi superada. null quando o alvo é inválido/zero (nunca Infinity).
  revenueProgress: number | null
  volumeProgress: number | null
}

// GET /api/v1/goals/team-summary?period=YYYY-MM — só gestor, agregado do
// time (só vendedores com meta cadastrada no período).
export interface GoalTeamSummary {
  period: string
  goalsCount: number
  revenueTarget: number
  volumeTargetMillions: number
  realizedRevenue: number
  realizedVolumeMillions: number
  revenueProgress: number | null
  volumeProgress: number | null
}

// Módulo de Configurações/Integração (spec seção 3), backend em
// backend/src/routes/integration.ts (dev-backend, ver diário do projeto) —
// nomes confirmados direto no código antes de codar, não só pelo diário.
// Exclusivo de gestor (spec seção 2), 4 endpoints, sem tabela nova (visão
// agregada sobre `plannings`/`orders` já existentes).

export const INTEGRATION_OVERALL_STATUSES = ['sem_dados', 'atencao', 'operacional'] as const
export type IntegrationOverallStatus = (typeof INTEGRATION_OVERALL_STATUSES)[number]

// `result`/`scenario` chegam como string solta do backend (syncResult() em
// integration.ts tem um fallback defensivo 'desconhecido' fora dos 4 valores
// de negócio) — tipado como string aqui, os 4 rótulos conhecidos ficam em
// lib/domainLabels.ts com fallback para qualquer valor não mapeado.
export const INTEGRATION_SYNC_RESULTS = ['sucesso', 'parcial', 'indisponivel', 'falha'] as const
export type IntegrationSyncResult = (typeof INTEGRATION_SYNC_RESULTS)[number]

// GET /api/v1/integration/status
export interface IntegrationStatus {
  overallStatus: IntegrationOverallStatus
  lastSync: {
    orderId: string
    externalPlanningId: string | null
    aquafortState: AquaFortSyncState
    availabilityStatus: AquaFortAvailabilityStatus | null
    result: string
    syncedAt: string
  } | null
  counts: {
    total: number
    confirmadaIntegral: number
    parcial: number
    indisponivel: number
    sincronizacaoPendente: number
  }
}

// GET /api/v1/integration/history?page=&limit= — item de uma linha do
// histórico. `order` é um subconjunto de Order (só os campos que o backend
// de fato faz JOIN, ver routes/integration.ts), não o Order completo.
export interface IntegrationHistoryItem {
  result: string
  planning: Planning
  order: {
    id: string
    product: string
    quantityMillions: number | null
    ownerUserId: string | null
    client: Pick<Client, 'id' | 'name'> | null
  }
}

export interface IntegrationHistoryResponse {
  page: number
  limit: number
  total: number
  items: IntegrationHistoryItem[]
}

// GET /api/v1/integration/field-mapping — dado estático, decisão do backend
// de não hardcodar isso no frontend (ver diário do projeto), pra não
// divergir silenciosamente de services/aquafortAdapter.ts.
export interface IntegrationFieldMapping {
  outbound: { field: string; label: string }[]
  inbound: { field: string | null; label: string; implemented: boolean }[]
  scenarios: { value: string; label: string }[]
}

// POST /api/v1/integration/test-connection — sem side-effect no backend
// (não grava planning nenhum, confirmado ao vivo pelo dev-backend).
export interface IntegrationTestConnectionResult {
  ok: boolean
  scenario: string
  message: string
  testedAt: string
}

// Módulo de Dashboard (Bloco 8, último do plano, spec seção 3), backend em
// backend/src/routes/dashboard.ts — nomes confirmados direto no código antes
// de codar, não só pelo diário do projeto. `GET /api/v1/dashboard?period=`
// combina indicadores de 3 módulos já existentes (Pedidos, Metas,
// Integração) num único payload, RBAC de carteira já aplicado no backend
// (nada composto/recalculado aqui).
export interface DashboardIndicators {
  ordersOpenCount: number
  ordersCreatedInPeriod: number
  goalsCount: number
  revenueTarget: number | null
  volumeTargetMillions: number | null
  realizedRevenue: number
  realizedVolumeMillions: number
  revenueProgress: number | null
  volumeProgress: number | null
}

// Item de `revenueEvolution` — `period` chega como "YYYY-MM" puro
// (TO_CHAR(m.month, 'YYYY-MM') no backend), diferente de `Goal.period`
// ("YYYY-MM-DD"). Ver formatPeriodMonthYear em lib/format.ts.
export interface DashboardRevenueEvolutionPoint {
  period: string
  revenue: number
  volumeMillions: number
  ordersDelivered: number
}

// Resumo MÍNIMO de integração (overallStatus + counts, sem lastSync — o
// detalhe completo continua em GET /integration/status / página /integracao).
// Mesmo shape de `IntegrationStatus['counts']`.
export interface DashboardIntegrationSummary {
  overallStatus: IntegrationOverallStatus
  counts: IntegrationStatus['counts']
}

// GET /api/v1/dashboard?period=YYYY-MM — `integrationSummary` é `null` para
// `comercial` (não um objeto com campos zerados), sempre objeto para
// `gestor`. Tratar esse `null` explicitamente antes de ler `overallStatus`/
// `counts` (achado documentado pelo dev-backend no diário do projeto).
export interface DashboardData {
  period: string
  indicators: DashboardIndicators
  // items = prévia (backend limita a 5), mesmo shape de GET /orders/alerts.
  riskyOrders: { total: number; items: OrderAlert[] }
  // items = prévia (backend limita a 10), horizonte de 14 dias.
  upcomingDeliveries: { horizonDays: number; total: number; items: Order[] }
  revenueEvolution: DashboardRevenueEvolutionPoint[]
  integrationSummary: DashboardIntegrationSummary | null
}
