import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, LayoutGrid, List as ListIcon, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useSSE } from '@/hooks/useSSE'
import type { Board, BoardStage, Order, PipelineStage } from '@/types'
import { ORDER_PRIORITY_COLORS, ORDER_PRIORITY_LABELS } from '@/lib/domainLabels'
import { formatCurrency, formatDate, formatMillions } from '@/lib/format'
import BoardColumn from '@/components/board/BoardColumn'
import StageModal from '@/components/board/StageModal'
import NewOrderModal from '@/components/orders/NewOrderModal'
import OrderDetailPanel from '@/components/orders/OrderDetailPanel'
import { useAuthStore } from '@/store/auth'

type ViewMode = 'board' | 'list'
const BOARD_SSE_EVENTS = [
  'order_created', 'order_updated', 'order_stage_changed',
  'stage_created', 'stage_updated', 'stage_deleted', 'stage_reordered',
]

// Módulo de Pedidos (Bloco 3) reconstruído como board CRM (spec
// 2026-08-28-crm-board-realtime-design): colunas vêm de GET /api/v1/board,
// cards tratam de orders com pipelineStageId, move otimista com rollback e
// eventos SSE de board/stage reaplicam estado local (fallback: refetch do
// board quando evento referencia id desconhecido).
export default function PipelinePage() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const isGestor = role === 'gestor'

  const [board, setBoard]         = useState<Board | null>(null)
  const [loading, setLoading]     = useState(true)
  const [view, setView]           = useState<ViewMode>('board')
  const [showNewModal, setShowNewModal] = useState(false)
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const [advancingId, setAdvancingId]   = useState<string | null>(null)
  const [dragOrderId, setDragOrderId]   = useState<string | null>(null)
  const [stageModal, setStageModal]     = useState<{ stage: PipelineStage | null } | null>(null)

  const fetchBoard = useCallback(() => {
    setLoading(true)
    api.get<Board>('/api/v1/board')
      .then((data) => setBoard(data))
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Erro ao carregar board'))
      .finally(() => setLoading(false))
  }, [])

  // Fallback SSE: guarda em ref pra callback de evento chamar sem precisar
  // importar dependência no hook (callback via callbackRef do useSSE é
  // sempre o mais recente, mas o ref é exigido pra fetchBoard não entrar
  // como dep de useCallback dentro do callback).
  const refetchRef = useRef(fetchBoard)
  refetchRef.current = fetchBoard

  useEffect(() => {
    const timer = setTimeout(fetchBoard, 0)
    return () => clearTimeout(timer)
  }, [fetchBoard])

  // ---------- Mutadores locais do board (otimismo + SSE) ----------

  const mutateOrders = useCallback((fn: (orders: Order[]) => Order[]) => {
    setBoard((prev) => (prev ? { ...prev, orders: fn(prev.orders) } : prev))
  }, [])

  const upsertOrder = useCallback((order: Order) => {
    mutateOrders((orders) => {
      const idx = orders.findIndex((o) => o.id === order.id)
      if (idx === -1) return [order, ...orders]
      return orders.map((o) => (o.id === order.id ? { ...o, ...order } : o))
    })
  }, [mutateOrders])

  const upsertStage = useCallback((stage: PipelineStage) => {
    setBoard((prev) => {
      if (!prev) return prev
      if (!stage.isActive) {
        // stage_updated com isActive=false = arquivamento: coluna sai da
        // lista local (board GET só devolve ativos). Sua remoção não apega
        // cards — backend bloqueia arquivamento com cards.
        return { ...prev, stages: prev.stages.filter((s) => s.id !== stage.id) }
      }
      const exists = prev.stages.some((s) => s.id === stage.id)
      const stages = (exists
        ? prev.stages.map((s) => (s.id === stage.id ? { ...s, ...stage } as BoardStage : s))
        : [...prev.stages, { ...stage, orderCount: 0 } as BoardStage]
      ).sort((a, b) => a.position - b.position)
      return { ...prev, stages }
    })
  }, [])

  const removeStage = useCallback((stageId: string) => {
    setBoard((prev) => (prev ? { ...prev, stages: prev.stages.filter((s) => s.id !== stageId) } : prev))
  }, [])

  // ---------- SSE — spec Bloco 3: usuários conectados aplicam patch local;
  // fallback refetch se payload inconsistente/divergente ----------

  useSSE((event, data) => {
    const d = data as Record<string, unknown>
    switch (event) {
      case 'order_created':
      case 'order_updated':
      case 'order_stage_changed': {
        const order = d.order as Order
        upsertOrder(order)
        return
      }
      case 'stage_created':
      case 'stage_updated': {
        upsertStage(d.stage as PipelineStage)
        return
      }
      case 'stage_deleted': {
        if (d.stageId) removeStage(d.stageId as string)
        return
      }
      case 'stage_reordered': {
        const ids = (d.stageIds ?? (d as { stages?: string[] }).stages) as string[] | undefined
        // Reordena localmente se TODOS os ids conhecidos; se algo diverge → refetch
        setBoard((prev) => {
          if (!prev || !ids) return prev
          const byId = new Map(prev.stages.map((s) => [s.id, s]))
          const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as BoardStage[]
          if (ordered.length !== prev.stages.length) return prev
          return { ...prev, stages: ordered }
        })
        return
      }
      default:
        refetchRef.current()
    }
  }, BOARD_SSE_EVENTS)

  // ---------- Helpers ----------

  const sortedStages = useMemo(
    () => [...(board?.stages ?? [])].sort((a, b) => a.position - b.position),
    [board?.stages],
  )

  const ordersByStage = useMemo(() => {
    const map = new Map<string, Order[]>()
    for (const o of board?.orders ?? []) {
      if (!o.pipelineStageId) continue
      map.set(o.pipelineStageId, [...(map.get(o.pipelineStageId) ?? []), o])
    }
    return map
  }, [board?.orders])

  function handleCreated(order: Order) { upsertOrder(order) }
  function handleUpdated(order: Order) { upsertOrder(order) }

  function nextStageOf(order: Order): BoardStage | null {
    const idx = sortedStages.findIndex((s) => s.id === order.pipelineStageId)
    if (idx === -1 || idx === sortedStages.length - 1) return null
    return sortedStages[idx + 1]
  }

  // Move otimista com rollback completo (spec Frontend: mover card atualiza
  // UI otimista com rollback se backend falhar). Snapshot guarda referência
  // do board antes do move — se o PATCH falhar, state volta inteiro.
  async function moveOrderToStage(orderId: string, stageId: string) {
    const snapshot = board
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            orders: prev.orders.map((o) => (o.id === orderId ? { ...o, pipelineStageId: stageId } : o)),
          }
        : prev,
    )
    setAdvancingId(orderId)
    try {
      const result = await api.patch<Order>(`/api/v1/orders/${orderId}/pipeline-stage`, {
        pipelineStageId: stageId,
      })
      upsertOrder(result)
      const target = sortedStages.find((s) => s.id === stageId)
      toast.success(`Pedido movido para "${target?.name ?? 'nova coluna'}".`)
    } catch (err) {
      setBoard(snapshot)
      toast.error(err instanceof Error ? err.message : 'Erro ao mover pedido')
    } finally {
      setAdvancingId(null)
    }
  }

  async function handleAdvance(order: Order) {
    const next = nextStageOf(order)
    if (!next) return
    moveOrderToStage(order.id, next.id)
  }

  function handleDragStart(order: Order, e: React.DragEvent) {
    setDragOrderId(order.id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', order.id)
  }

  function handleDrop(e: React.DragEvent, stageId: string) {
    const id = e.dataTransfer.getData('text/plain')
    setDragOrderId(null)
    if (id) moveOrderToStage(id, stageId)
  }

  // Estrutura de colunas (gestor): reorder via PATCH com nova sequência
  // inteira das ativas (contrato controller-by-state do backend).
  async function handleMoveStage(stage: BoardStage, dir: -1 | 1) {
    if (!board) return
    const idx = sortedStages.findIndex((s) => s.id === stage.id)
    const targetIdx = idx + dir
    if (idx === -1 || targetIdx < 0 || targetIdx >= sortedStages.length) return
    const next = [...sortedStages]
    const [moved] = next.splice(idx, 1)
    next.splice(targetIdx, 0, moved)
    const snapshot = board
    setBoard({ ...board, stages: next })
    try {
      await api.patch('/api/v1/pipeline-stages/reorder', { stageIds: next.map((s) => s.id) })
    } catch (err) {
      setBoard(snapshot)
      toast.error(err instanceof Error ? err.message : 'Erro ao reordenar')
    }
  }

  const iconBtnStyle = (active: boolean): React.CSSProperties => ({
    width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer', backgroundColor: active ? '#111' : '#f3f4f6', color: active ? '#F2E600' : '#666',
  })

  // Helper: coluna no índice i tem "próxima" (card pode avançar).
  function idxHasNext(i: number): boolean {
    return i < sortedStages.length - 1
  }

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
          {board && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#888', backgroundColor: '#f3f4f6',
              borderRadius: 10, padding: '3px 9px',
            }}>
              {board.pipeline.name}
            </span>
          )}
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
        {loading && !board && (
          <p style={{ padding: 20, color: '#bbb', fontSize: 13 }}>Carregando board...</p>
        )}

        {board && sortedStages.length === 0 && view === 'board' && (
          <div style={{ padding: 40, textAlign: 'center', color: '#bbb', fontSize: 13 }}>
            Sem colunas no pipeline. {isGestor ? 'Crie a primeira coluna no botão "+" ao lado.' : 'Peça ao gestor pra criar.'}
          </div>
        )}

        {board && view === 'board' && (
          <div style={{ display: 'flex', gap: 12, height: '100%', overflowX: 'auto', padding: 16, boxSizing: 'border-box' }}>
            {sortedStages.map((stage, i) => (
              <BoardColumn
                key={stage.id}
                stage={stage}
                orders={ordersByStage.get(stage.id) ?? []}
                hasNextStage={idxHasNext(i)}
                hasPermissions={stage.hasPermissions}
                advancingId={advancingId}
                dragOrderId={dragOrderId}
                isGestor={isGestor}
                canMoveLeft={i > 0}
                canMoveRight={i < sortedStages.length - 1}
                onOpenOrder={(o) => setDetailOrderId(o.id)}
                onAdvanceOrder={handleAdvance}
                onDragStartOrder={handleDragStart}
                onDropOrder={handleDrop}
                onEditStage={(s) => setStageModal({ stage: s })}
                onMoveStage={handleMoveStage}
              />
            ))}
            {isGestor && (
              <button
                onClick={() => setStageModal({ stage: null })}
                title="Nova coluna"
                style={{
                  width: 30, height: 30, flexShrink: 0, marginTop: 30,
                  borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px dashed #ddd', backgroundColor: '#fff', cursor: 'pointer',
                }}
              >
                <Plus size={14} color="#888" />
              </button>
            )}
          </div>
        )}

        {board && view === 'list' && (
          <div style={{ overflowY: 'auto', height: '100%', padding: 16, boxSizing: 'border-box' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  {['Cliente', 'Produto', 'Quantidade', 'Valor', 'Prioridade', 'Coluna', 'Estágio operacional', 'Entrega desejada', ''].map((h) => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.03em', padding: '9px 12px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(board?.orders ?? []).map((order) => {
                  const next = nextStageOf(order)
                  const stageName = sortedStages.find((s) => s.id === order.pipelineStageId)?.name ?? '—'
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
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#555' }}>{stageName}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#555' }}>{order.operationalStage}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#555' }}>{formatDate(order.desiredDeliveryDate)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {next && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAdvance(order) }}
                            disabled={advancingId === order.id}
                            title={`Avançar para ${next.name}`}
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

      {stageModal && (
        <StageModal
          stage={stageModal.stage}
          onClose={() => setStageModal(null)}
          onSaved={(stage) => { upsertStage(stage); setStageModal(null) }}
          onArchived={(stage) => { upsertStage(stage); setStageModal(null) }}
          onDeleted={(id) => { removeStage(id); setStageModal(null) }}
        />
      )}
    </div>
  )
}
