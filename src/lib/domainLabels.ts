import type {
  ActivityState,
  ActivityType,
  AquaFortAvailabilityStatus,
  AquaFortSimulatedScenario,
  AquaFortSyncState,
  ClientPotential,
  ClientStatus,
  CompanyFarmSize,
  IntegrationOverallStatus,
  OrderAlertType,
  OrderPriority,
  OrderStage,
  UserRole,
} from '@/types'

// Rótulos/cores em pt-BR para o vocabulário de domínio (enums espelhados de
// backend/src/constants/domain.ts, ver types/index.ts). Centralizado aqui
// para NewClientModal/NewCompanyModal/ClientDetailPanel/ClientColumn não
// duplicarem o mesmo mapa de texto e cor.

export const CLIENT_POTENTIAL_LABELS: Record<ClientPotential, string> = {
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
}

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  ativo: 'Ativo',
  em_negociacao: 'Em negociação',
  atencao: 'Atenção',
  inativo: 'Inativo',
}

// Cor por severidade: verde (saudável) -> âmbar (em andamento) -> vermelho
// (precisa de atenção) -> cinza (fora da carteira ativa).
export const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
  ativo: '#059669',
  em_negociacao: '#d97706',
  atencao: '#dc2626',
  inativo: '#9ca3af',
}

export const COMPANY_FARM_SIZE_LABELS: Record<CompanyFarmSize, string> = {
  pequeno: 'Pequeno',
  medio: 'Médio',
  grande: 'Grande',
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  ligacao: 'Ligação',
  reuniao: 'Reunião',
  visita: 'Visita',
  tarefa: 'Tarefa',
}

export const ACTIVITY_STATE_LABELS: Record<ActivityState, string> = {
  pendente: 'Pendente',
  concluida: 'Concluída',
}

// Cor por estado — mesma semântica de severidade já usada em
// CLIENT_STATUS_COLORS/ORDER_PRIORITY_COLORS (verde = resolvido, âmbar =
// pendente). Usado no módulo de Agenda (AgendaPage).
export const ACTIVITY_STATE_COLORS: Record<ActivityState, string> = {
  pendente: '#d97706',
  concluida: '#059669',
}

// RBAC (Bloco 4) — rótulo de papel do usuário, usado no select de
// "responsável comercial" (Cliente/Pedido) e em indicadores textuais simples
// de carteira (ex: ClientColumn/PipelinePage).
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  comercial: 'Comercial',
  gestor: 'Gestor',
}

// =============================================
// PEDIDOS / PLANEJAMENTO (Bloco 3) — espelha ORDER_STAGES/ORDER_PRIORITIES/
// AQUAFORT_* de types/index.ts (por sua vez espelhado de
// backend/src/constants/domain.ts).
// =============================================

export const ORDER_STAGE_LABELS: Record<OrderStage, string> = {
  orcamento: 'Orçamento',
  negociacao: 'Negociação',
  aprovado: 'Aprovado',
  disponibilidade: 'Disponibilidade',
  reservado: 'Reservado',
  producao: 'Produção',
  pronto: 'Pronto',
  entregue: 'Entregue',
}

// Ordem visual do funil — o backend não força sequência (só valida
// vocabulário, ver routes/orders.ts), a ordem é responsabilidade do
// frontend, conforme decisão registrada no schema.sql/domain.ts.
export const ORDER_STAGE_ORDER: OrderStage[] = [
  'orcamento', 'negociacao', 'aprovado', 'disponibilidade',
  'reservado', 'producao', 'pronto', 'entregue',
]

export const ORDER_PRIORITY_LABELS: Record<OrderPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
}

export const ORDER_PRIORITY_COLORS: Record<OrderPriority, string> = {
  baixa: '#9ca3af',
  media: '#d97706',
  alta: '#dc2626',
}

// Resultado de negócio (sincronização com sucesso). Cor segue a mesma
// semântica de severidade já usada em CLIENT_STATUS_COLORS.
export const AQUAFORT_AVAILABILITY_STATUS_LABELS: Record<AquaFortAvailabilityStatus, string> = {
  confirmada_integral: 'Confirmada integralmente',
  parcial: 'Confirmada parcialmente',
  indisponivel: 'Indisponível',
}

export const AQUAFORT_AVAILABILITY_STATUS_COLORS: Record<AquaFortAvailabilityStatus, string> = {
  confirmada_integral: '#059669',
  parcial: '#d97706',
  indisponivel: '#dc2626',
}

// Estado da comunicação com o AquaFort — distinto do resultado de negócio
// acima (ver comentário em backend/src/db/schema.sql, tabela plannings).
export const AQUAFORT_SYNC_STATE_LABELS: Record<AquaFortSyncState, string> = {
  sincronizado: 'Sincronizado',
  sincronizacao_pendente: 'Sincronização pendente',
}

export const AQUAFORT_SYNC_STATE_COLORS: Record<AquaFortSyncState, string> = {
  sincronizado: '#059669',
  sincronizacao_pendente: '#6b7280',
}

// Hook de simulação (campo `simulate`) exposto na UI para a interação de v1
// "simulação dos estados de resposta do AquaFort" (spec seção 8).
export const AQUAFORT_SIMULATED_SCENARIO_LABELS: Record<AquaFortSimulatedScenario, string> = {
  confirmada_integral: 'Forçar: confirmada integral',
  parcial: 'Forçar: parcial',
  indisponivel: 'Forçar: indisponível',
  falha: 'Forçar: falha de sincronização',
}

// =============================================
// AGENDA (Bloco 5) — alertas de planejamento, GET /api/v1/orders/alerts
// (spec seção 3, "Alertas gerados pelo planejamento"). Vocabulário
// deliberadamente separado de AQUAFORT_AVAILABILITY_STATUS_LABELS/
// AQUAFORT_SYNC_STATE_LABELS: alertType combina os dois conceitos (estado
// da comunicação + resultado de negócio) numa única classificação de
// severidade para a Agenda, ver comentário em backend/src/routes/orders.ts.
// =============================================
export const ORDER_ALERT_TYPE_LABELS: Record<OrderAlertType, string> = {
  sincronizacao_pendente: 'Sincronização pendente',
  indisponivel: 'Indisponível',
  disponibilidade_parcial: 'Disponibilidade parcial',
}

export const ORDER_ALERT_TYPE_COLORS: Record<OrderAlertType, string> = {
  sincronizacao_pendente: '#6b7280',
  indisponivel: '#dc2626',
  disponibilidade_parcial: '#d97706',
}

// =============================================
// METAS (Bloco 6) — progresso é um percentual contínuo (GET /goals,
// realizado/target já calculados no backend), não um enum fechado, então não
// dá pra usar um Record<enum, cor> como o resto do arquivo. Critério de
// severidade (mesmo espírito de CLIENT_STATUS_COLORS/ORDER_PRIORITY_COLORS,
// verde = saudável / âmbar = em andamento / vermelho = precisa de atenção):
// >=100% meta batida ou superada; 60–99% em andamento; <60% atenção; null
// (alvo inválido/zero, nunca deveria acontecer dado o CHECK > 0 do backend,
// mas o tipo permite) cinza neutro.
// =============================================
export function goalProgressColor(progress: number | null): string {
  if (progress === null) return '#9ca3af'
  if (progress >= 100) return '#059669'
  if (progress >= 60) return '#d97706'
  return '#dc2626'
}

// =============================================
// INTEGRAÇÃO/CONFIGURAÇÕES — espelha overallStatus/syncResult de
// backend/src/routes/integration.ts. Cor por severidade, mesmo critério de
// CLIENT_STATUS_COLORS/ORDER_ALERT_TYPE_COLORS (verde = saudável, âmbar/
// vermelho = precisa de atenção, cinza = neutro/sem dado).
// =============================================
export const INTEGRATION_OVERALL_STATUS_LABELS: Record<IntegrationOverallStatus, string> = {
  sem_dados: 'Sem dados',
  atencao: 'Atenção',
  operacional: 'Operacional',
}

export const INTEGRATION_OVERALL_STATUS_COLORS: Record<IntegrationOverallStatus, string> = {
  sem_dados: '#9ca3af',
  atencao: '#d97706',
  operacional: '#059669',
}

// `result`/`scenario` chegam como string solta (ver comentário em
// types/index.ts) — Record<string, string> com fallback no ponto de uso,
// não Record<enum, string>, para nunca quebrar em runtime num valor
// inesperado (ex: o 'desconhecido' defensivo de syncResult()).
export const INTEGRATION_SYNC_RESULT_LABELS: Record<string, string> = {
  sucesso: 'Sucesso',
  parcial: 'Parcial',
  indisponivel: 'Indisponível',
  falha: 'Falha',
  desconhecido: 'Desconhecido',
}

export const INTEGRATION_SYNC_RESULT_COLORS: Record<string, string> = {
  sucesso: '#059669',
  parcial: '#d97706',
  indisponivel: '#dc2626',
  falha: '#dc2626',
  desconhecido: '#9ca3af',
}
