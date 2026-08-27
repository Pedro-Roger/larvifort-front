import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, LayoutGrid, List as ListIcon, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Order } from '@/types'
import { ORDER_PRIORITY_COLORS, ORDER_PRIORITY_LABELS, ORDER_STAGE_LABELS, ORDER_STAGE_ORDER } from '@/lib/domainLabels'
import { formatCurrency, formatDate, formatMillions } from '@/lib/format'
import OrderCard from '@/components/orders/OrderCard'
import NewOrderModal from '@/components/orders/NewOrderModal'
import OrderDetailPanel from '@/components/orders/OrderDetailPanel'
import { useAuthStore } from '@/store/auth'

type ViewMode = 'board' | 'list'

// Módulo de Pedidos (Bloco 3, spec seção 3/4/8): funil visual (kanban, uma
// coluna por commercial_stage) + lista operacional, criação de pedido,
// movimentação pelo funil e visualização de Planejamento (no drawer de
// detalhe, ver OrderDetailPanel).
//
// Decisão de estrutura: este arquivo já existia como página órfã do upstream
// do melao-gestor (`pages/PipelinePage.tsx`, sem nenhuma lógica, não
// roteada em App.tsx). Reaproveitei o nome/local em vez de criar um arquivo
// novo do zero — é exatamente o módulo que o nome já sugeria, só nunca tinha
// sido implementado nem ligado a uma rota. Conteúdo antigo (placeholder "em
// breve") substituído por completo.
export default function PipelinePage() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const [orders, setOrders]       = useState<Order[]>([])
  const [loading, setLoading]     = useState(true)
  const [view, setView]           = useState<ViewMode>('board')
  const [showNewModal, setShowNewModal] = useState(false)
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const [advancingId, setAdvancingId] = useState<string | null>(null)

  const fetchOrders = useCallback((ignoreRef: { current: boolean }) => {
    setLoading(true)
    api.get<Order[]>('/api/v1/orders')
      .then((data) => { if (!ignoreRef.current) setOrders(data) })
      .catch((err) => { if (!ignoreRef.current) toast.error(err instanceof Error ? err.message : 'Erro ao carregar pedidos') })
      .finally(() => { if (!ignoreRef.current) setLoading(false) })
  }, [])

  useEffect(() => {
    // Mesmo padrão já usado em AppPage.tsx (fetchClients/fetchDetail):
    // setTimeout(...,0) + ignoreRef, para não disparar setState de forma
    // síncrona dentro do corpo do effect (react-hooks/set-state-in-effect).
    const ignoreRef = { current: false }
    const timer = setTimeout(() => fetchOrders(ignoreRef), 0)
    return () => { clearTimeout(timer); ignoreRef.current = true }
  }, [fetchOrders])

  function handleCreated(order: Order) {
    setOrders((prev) => [order, ...prev])
  }

  function handleUpdated(order: Order) {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...order } : o)))
  }

  function nextStageOf(order: Order): string | null {
    const idx = ORDER_STAGE_ORDER.indexOf(order.commercialStage)
    if (idx === -1 || idx === ORDER_STAGE_ORDER.length - 1) return null
    return ORDER_STAGE_ORDER[idx + 1]
  }

  async function handleAdvance(order: Order) {
    const next = nextStageOf(order)
    if (!next) return
    setAdvancingId(order.id)
    try {
      const result = await api.patch<Order & { syncError: string | null }>(`/api/v1/orders/${order.id}/stage`, {
        commercial_stage: next,
      })
      handleUpdated(result)
      if (result.syncError) {
        toast.error(`Pedido movido para "${ORDER_STAGE_LABELS[next as keyof typeof ORDER_STAGE_LABELS]}", mas a sincronização com o AquaFort falhou: ${result.syncError}`)
      } else {
        toast.success(`Pedido movido para "${ORDER_STAGE_LABELS[next as keyof typeof ORDER_STAGE_LABELS]}".`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao mover pedido')
    } finally {
      setAdvancingId(null)
    }
  }

  const iconBtnStyle = (active: boolean): React.CSSProperties => ({
    width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer', backgroundColor: active ? '#111' : '#f3f4f6', color: active ? '#F2E600' : '#666',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#fafafa' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.07)',
        backgroundColor: '#fff', flexShrink: 0, gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} title="Voltar ao CRM" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
            <ArrowLeft size={18} color="#666" />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>Pedidos</h1>
          {role === 'comercial' && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#888', backgroundColor: '#f3f4f6',
              borderRadius: 10, padding: '3px 9px',
            }}>
              Minha carteira
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={iconBtnStyle(view === 'board')} title="Funil (kanban)" onClick={() => setView('board')}>
            <LayoutGrid size={15} />
          </button>
          <button style={iconBtnStyle(view === 'list')} title="Lista operacional" onClick={() => setView('list')}>
            <ListIcon size={15} />
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4,
              padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#111',
              backgroundColor: '#F2E600', border: 'none', borderRadius: 7, cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Novo pedido
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {loading && (
          <p style={{ padding: 20, color: '#bbb', fontSize: 13 }}>Carregando pedidos...</p>
        )}

        {!loading && orders.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#bbb', fontSize: 13 }}>
            Nenhum pedido ainda. Clique em "Novo pedido" para criar o primeiro.
          </div>
        )}

        {!loading && orders.length > 0 && view === 'board' && (
          <div style={{ display: 'flex', gap: 12, height: '100%', overflowX: 'auto', padding: 16, boxSizing: 'border-box' }}>
            {ORDER_STAGE_ORDER.map((stage) => {
              const stageOrders = orders.filter((o) => o.commercialStage === stage)
              return (
                <div key={stage} style={{
                  width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column',
                  backgroundColor: '#f2f2f2', borderRadius: 10, overflow: 'hidden',
                }}>
                  <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                      {ORDER_STAGE_LABELS[stage]}
                    </p>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#999', backgroundColor: '#fff', borderRadius: 8, padding: '1px 7px' }}>
                      {stageOrders.length}
                    </span>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {stageOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        nextStage={nextStageOf(order)}
                        advancing={advancingId === order.id}
                        onOpen={(o) => setDetailOrderId(o.id)}
                        onAdvance={handleAdvance}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && orders.length > 0 && view === 'list' && (
          <div style={{ overflowY: 'auto', height: '100%', padding: 16, boxSizing: 'border-box' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  {['Cliente', 'Produto', 'Quantidade', 'Valor', 'Prioridade', 'Estágio comercial', 'Estágio operacional', 'Entrega desejada', ''].map((h) => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.03em', padding: '9px 12px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const next = nextStageOf(order)
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setDetailOrderId(order.id)}
                      style={{ borderTop: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}
                    >
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#111' }}>{order.client?.name ?? 'Cliente removido'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#555' }}>{order.product}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#555' }}>{formatMillions(order.quantityMillions)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#555' }}>{formatCurrency(order.value)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', borderRadius: 8, padding: '2px 7px', backgroundColor: ORDER_PRIORITY_COLORS[order.priority] }}>
                          {ORDER_PRIORITY_LABELS[order.priority]}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#555' }}>{ORDER_STAGE_LABELS[order.commercialStage]}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#555' }}>{ORDER_STAGE_LABELS[order.operationalStage]}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#555' }}>{formatDate(order.desiredDeliveryDate)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {next && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAdvance(order) }}
                            disabled={advancingId === order.id}
                            title={`Avançar para ${ORDER_STAGE_LABELS[next as keyof typeof ORDER_STAGE_LABELS]}`}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600,
                              color: '#111', backgroundColor: '#F2E600', border: 'none', borderRadius: 6,
                              padding: '5px 9px', cursor: advancingId === order.id ? 'not-allowed' : 'pointer',
                              opacity: advancingId === order.id ? 0.6 : 1,
                            }}
                          >
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNewModal && (
        <NewOrderModal onClose={() => setShowNewModal(false)} onCreate={handleCreated} />
      )}

      {detailOrderId && (
        <OrderDetailPanel
          orderId={detailOrderId}
          onClose={() => setDetailOrderId(null)}
          onUpdate={handleUpdated}
        />
      )}
    </div>
  )
}
