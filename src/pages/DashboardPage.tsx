import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, ArrowLeft, Cable, CalendarClock, Plus, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { DashboardData } from '@/types'
import { formatCurrency, formatDate, formatMillions } from '@/lib/format'
import {
  INTEGRATION_OVERALL_STATUS_COLORS,
  INTEGRATION_OVERALL_STATUS_LABELS,
  ORDER_ALERT_TYPE_COLORS,
  ORDER_ALERT_TYPE_LABELS,
} from '@/lib/domainLabels'
import { useAuthStore } from '@/store/auth'
import IndicatorCard from '@/components/dashboard/IndicatorCard'
import RevenueEvolutionBars from '@/components/dashboard/RevenueEvolutionBars'
import ProgressBar from '@/components/goals/ProgressBar'
import OrderDetailPanel from '@/components/orders/OrderDetailPanel'
import NewOrderModal from '@/components/orders/NewOrderModal'
import NewReminderModal from '@/components/agenda/NewReminderModal'

// Módulo de Dashboard (Bloco 8, ÚLTIMO módulo do plano do PM — spec seção 3:
// "Indicadores de vendas, pedidos, volume de pós-larvas e metas. Pedidos em
// risco e entregas próximas. Evolução comercial por período. Status
// resumido da integração AquaFort. Atalhos para criar pedido e registrar
// atividade."), consumindo GET /api/v1/dashboard já validado ao vivo pelo
// dev-backend. Nomes confirmados direto no código (routes/dashboard.ts)
// antes de codar, não só pelo diário do projeto.
//
// DECISÃO DE NAVEGAÇÃO (registrada também no diário do projeto): o Dashboard
// NÃO substitui a rota `/` (AppPage, a caixa de entrada herdada do
// melao-gestor) — ganhou rota própria `/dashboard`, mesmo padrão de
// Pedidos/Agenda/Metas/Integração (página-folha com seta "voltar ao CRM"),
// e virou o destino do login (ver LoginPage) e o item de destaque no topo
// do AppSidebar. Cogitei fazer `/` apontar direto para cá (é, de fato, a
// tela que mais faz sentido como "primeira tela ao logar" num CRM de
// vendas), mas AppSidebar hoje só existe DENTRO de AppPage e está
// fortemente acoplado ao estado dela (lista de empresas, sidebarView,
// abas de conversa) — virar a home exigiria desacoplar esse sidebar num
// shell de navegação genérico, um refator estrutural maior do que o escopo
// desta tarefa (última tela do plano) e com risco real de regressão na
// caixa de entrada já validada ponta a ponta. Trocar o destino pós-login
// entrega o resultado de produto pedido (Dashboard é a primeira tela que o
// usuário vê ao entrar) sem mexer no shell existente — se `Pedro`/PM
// decidir depois que vale a pena fazer o Dashboard virar `/` de fato, o
// refator do AppSidebar fica isolado como próximo passo.

function currentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const sectionLabelStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
}

const sectionLabelTextStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0,
}

const previewCardStyle: React.CSSProperties = {
  flexShrink: 0, width: 240, textAlign: 'left', cursor: 'pointer',
  backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10,
  padding: 12, display: 'flex', flexDirection: 'column', gap: 6,
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const isGestor = role === 'gestor'

  const [period, setPeriod] = useState(currentPeriod())
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)

  const fetchDashboard = useCallback((p: string, ignoreRef: { current: boolean }) => {
    setLoading(true)
    api.get<DashboardData>(`/api/v1/dashboard?period=${p}`)
      .then((result) => { if (!ignoreRef.current) setData(result) })
      .catch((err) => { if (!ignoreRef.current) toast.error(err instanceof Error ? err.message : 'Erro ao carregar o dashboard') })
      .finally(() => { if (!ignoreRef.current) setLoading(false) })
  }, [])

  useEffect(() => {
    const ignoreRef = { current: false }
    // Mesmo padrão setTimeout(...,0) + ignoreRef já usado em Goals/Agenda/
    // PipelinePage/Integration para não disparar setState síncrono dentro
    // do corpo do effect.
    const timer = setTimeout(() => fetchDashboard(period, ignoreRef), 0)
    return () => { clearTimeout(timer); ignoreRef.current = true }
  }, [period, fetchDashboard])

  function refetch() {
    const ignoreRef = { current: false }
    fetchDashboard(period, ignoreRef)
  }

  function handleCloseDetail() {
    setDetailOrderId(null)
    // Estado de risco/entrega pode ter mudado (ex: retry de sincronização,
    // mudança de estágio) — refaz a busca em vez de tentar recalcular
    // risco/horizonte no cliente a partir de um Order parcialmente
    // atualizado (mesmo critério já usado em AgendaPage:handleCloseDetail).
    refetch()
  }

  const indicators = data?.indicators ?? null
  const hasGoal = indicators !== null && indicators.goalsCount > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#fafafa' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.07)',
        backgroundColor: '#fff', flexShrink: 0, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} title="Voltar ao CRM" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
            <ArrowLeft size={18} color="#666" />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>Dashboard</h1>
          {!isGestor && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#888', backgroundColor: '#f3f4f6',
              borderRadius: 10, padding: '3px 9px',
            }}>
              Minha carteira
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '7px 10px', fontSize: 13, color: '#111827',
              border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7,
              outline: 'none', backgroundColor: '#f9fafb', fontFamily: 'inherit',
            }}
          />
          {/* Atalhos (spec: "Atalhos para criar pedido e registrar
              atividade") — reaproveitam os modais já existentes desde os
              Blocos 3/5, nenhum formulário novo criado aqui. */}
          <button
            onClick={() => setShowReminderModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#111',
              backgroundColor: '#f3f4f6', border: 'none', borderRadius: 7, cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Atividade
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#111',
              backgroundColor: '#F2E600', border: 'none', borderRadius: 7, cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Pedido
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {loading && !data && <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Carregando dashboard...</p>}

        {data && indicators && (
          <>
            {/* Indicadores */}
            <section>
              <div style={sectionLabelStyle}>
                <p style={sectionLabelTextStyle}>Indicadores</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 14 }}>
                <IndicatorCard label="Pedidos em aberto" value={String(indicators.ordersOpenCount)} />
                <IndicatorCard label="Pedidos criados no período" value={String(indicators.ordersCreatedInPeriod)} />
                <IndicatorCard label="Volume realizado" value={formatMillions(indicators.realizedVolumeMillions)} />
                <IndicatorCard label="Receita realizada" value={formatCurrency(indicators.realizedRevenue)} />
              </div>

              {!hasGoal && (
                <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>
                  {isGestor ? 'Nenhuma meta cadastrada neste período.' : 'Você ainda não tem meta cadastrada neste período.'}
                </p>
              )}

              {hasGoal && (
                <div style={{
                  backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10,
                  padding: 16, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480,
                }}>
                  <p style={{ fontSize: 11, color: '#999', margin: 0 }}>
                    {isGestor ? `Meta do time (${indicators.goalsCount} vendedor${indicators.goalsCount === 1 ? '' : 'es'})` : 'Minha meta'}
                  </p>
                  <ProgressBar
                    label="Receita"
                    valueLabel={`${formatCurrency(indicators.realizedRevenue)} / ${formatCurrency(indicators.revenueTarget)}`}
                    progress={indicators.revenueProgress}
                  />
                  <ProgressBar
                    label="Volume"
                    valueLabel={`${formatMillions(indicators.realizedVolumeMillions)} / ${formatMillions(indicators.volumeTargetMillions ?? 0)}`}
                    progress={indicators.volumeProgress}
                  />
                </div>
              )}
            </section>

            {/* Pedidos em risco */}
            <section>
              <div style={{ ...sectionLabelStyle, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={14} color="#d97706" />
                  <p style={sectionLabelTextStyle}>Pedidos em risco {data.riskyOrders.total > 0 && `(${data.riskyOrders.total})`}</p>
                </div>
                {data.riskyOrders.total > 0 && (
                  <button onClick={() => navigate('/agenda')} style={{ fontSize: 11, fontWeight: 600, color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Ver todos na Agenda
                  </button>
                )}
              </div>

              {data.riskyOrders.items.length === 0 && (
                <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Nenhum pedido em risco no momento.</p>
              )}

              {data.riskyOrders.items.length > 0 && (
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {data.riskyOrders.items.map(({ alertType, order, planning }) => (
                    <button key={order.id} onClick={() => setDetailOrderId(order.id)} style={previewCardStyle}>
                      <span style={{
                        alignSelf: 'flex-start', fontSize: 10, fontWeight: 600, color: '#fff',
                        borderRadius: 10, padding: '2px 8px', backgroundColor: ORDER_ALERT_TYPE_COLORS[alertType],
                      }}>
                        {ORDER_ALERT_TYPE_LABELS[alertType]}
                      </span>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>
                        {order.client?.name ?? 'Cliente removido'}
                      </p>
                      <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{order.product} · {formatMillions(order.quantityMillions)}</p>
                      {planning.expectedDate && (
                        <p style={{ fontSize: 11, color: '#999', margin: 0 }}>Previsão: {formatDate(planning.expectedDate)}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Entregas próximas */}
            <section>
              <div style={{ ...sectionLabelStyle, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarClock size={14} color="#555" />
                  <p style={sectionLabelTextStyle}>
                    Entregas próximas (próximos {data.upcomingDeliveries.horizonDays} dias)
                    {data.upcomingDeliveries.total > 0 && ` · ${data.upcomingDeliveries.total}`}
                  </p>
                </div>
                {data.upcomingDeliveries.total > 0 && (
                  <button onClick={() => navigate('/pedidos')} style={{ fontSize: 11, fontWeight: 600, color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Ver pedidos
                  </button>
                )}
              </div>

              {data.upcomingDeliveries.items.length === 0 && (
                <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Nenhuma entrega prevista neste horizonte.</p>
              )}

              {data.upcomingDeliveries.items.length > 0 && (
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {data.upcomingDeliveries.items.map((order) => (
                    <button key={order.id} onClick={() => setDetailOrderId(order.id)} style={previewCardStyle}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>
                        {order.client?.name ?? 'Cliente removido'}
                      </p>
                      <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{order.product} · {formatMillions(order.quantityMillions)}</p>
                      <p style={{ fontSize: 11, color: '#999', margin: 0 }}>Entrega desejada: {formatDate(order.desiredDeliveryDate)}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Evolução comercial por período */}
            <section>
              <div style={sectionLabelStyle}>
                <TrendingUp size={14} color="#555" />
                <p style={sectionLabelTextStyle}>Evolução comercial (últimos {data.revenueEvolution.length} meses)</p>
              </div>
              <div style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: 16, maxWidth: 640 }}>
                <RevenueEvolutionBars points={data.revenueEvolution} />
              </div>
            </section>

            {/* Resumo de integração — só aparece quando não-null (gestor) */}
            {data.integrationSummary && (
              <section>
                <div style={{ ...sectionLabelStyle, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Cable size={14} color="#555" />
                    <p style={sectionLabelTextStyle}>Integração AquaFort</p>
                  </div>
                  <button onClick={() => navigate('/integracao')} style={{ fontSize: 11, fontWeight: 600, color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Ver detalhes
                  </button>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480,
                  backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: 16,
                }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: INTEGRATION_OVERALL_STATUS_COLORS[data.integrationSummary.overallStatus],
                  }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>
                      {INTEGRATION_OVERALL_STATUS_LABELS[data.integrationSummary.overallStatus]}
                    </p>
                    <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>
                      {data.integrationSummary.counts.total} planejamento{data.integrationSummary.counts.total === 1 ? '' : 's'} ·{' '}
                      {data.integrationSummary.counts.sincronizacaoPendente} pendente{data.integrationSummary.counts.sincronizacaoPendente === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {detailOrderId && (
        <OrderDetailPanel
          orderId={detailOrderId}
          onClose={handleCloseDetail}
          // `onUpdate` propositalmente no-op aqui: diferente de PipelinePage
          // (mescla o Order atualizado num board local) ou AgendaPage
          // (atualiza só o item local, mas ainda refaz a busca completa no
          // fechamento), um pedido editado no Dashboard pode ENTRAR ou SAIR
          // de riskyOrders/upcomingDeliveries inteiramente — isso depende de
          // regra de negócio calculada no backend (routes/dashboard.ts), não
          // dá pra recalcular com segurança no cliente a partir de um Order
          // parcial. `handleCloseDetail` já refaz GET /dashboard por completo
          // ao fechar o painel, cobrindo indicadores/risco/entregas/evolução
          // de uma vez — mais simples e sempre correto do que tentar mesclar.
          onUpdate={() => {}}
        />
      )}

      {showOrderModal && (
        <NewOrderModal
          onClose={() => setShowOrderModal(false)}
          onCreate={() => { setShowOrderModal(false); toast.success('Pedido criado'); refetch() }}
        />
      )}

      {showReminderModal && (
        <NewReminderModal
          onClose={() => setShowReminderModal(false)}
          onCreate={() => { setShowReminderModal(false); toast.success('Atividade criada'); refetch() }}
        />
      )}
    </div>
  )
}
