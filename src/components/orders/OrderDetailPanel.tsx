import { useEffect, useState } from 'react'
import { X, RotateCcw, Send, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useSSE } from '@/hooks/useSSE'
import {
  AQUAFORT_SIMULATED_SCENARIOS,
  ORDER_STAGES,
  type Order,
  type Planning,
  type ActivityLog,
  type CardComment,
} from '@/types'
import {
  AQUAFORT_AVAILABILITY_STATUS_COLORS,
  AQUAFORT_AVAILABILITY_STATUS_LABELS,
  AQUAFORT_SIMULATED_SCENARIO_LABELS,
  AQUAFORT_SYNC_STATE_COLORS,
  AQUAFORT_SYNC_STATE_LABELS,
  ORDER_PRIORITY_COLORS,
  ORDER_PRIORITY_LABELS,
  ORDER_STAGE_LABELS,
} from '@/lib/domainLabels'
import { formatCurrency, formatDate, formatDateTime, formatMillions } from '@/lib/format'

interface Props {
  orderId:  string
  onClose:  () => void
  // Propaga a versão atualizada do pedido pro board (PipelinePage), sem o
  // painel precisar saber como o board está estruturado.
  onUpdate: (order: Order) => void
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, color: '#aaa',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
}

const selectStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '7px 10px', fontSize: 13, color: '#111',
  border: '1px solid rgba(0,0,0,0.12)', borderRadius: 6,
  outline: 'none', backgroundColor: '#f9fafb', fontFamily: 'inherit', appearance: 'auto',
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, color: '#fff', borderRadius: 10,
      padding: '3px 9px', backgroundColor: color, display: 'inline-block',
    }}>
      {children}
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12 }}>
      <span style={{ color: '#999' }}>{label}</span>
      <span style={{ color: '#333', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

// Painel de detalhe do Pedido (drawer lateral): dados comerciais, mudança de
// estágio (dispara AquaFort quando commercial_stage vira 'aprovado', ver
// routes/orders.ts) e visualização do Planejamento com os 4 cenários
// simulados distinguíveis por badge de cor (spec seção 5/8/9). Retry nunca
// perde dado comercial já preenchido — o backend garante isso, aqui só
// exibimos o que ele retorna.
export default function OrderDetailPanel({ orderId, onClose, onUpdate }: Props) {
  const [order, setOrder]                     = useState<Order | null>(null)
  const [loading, setLoading]                 = useState(true)
  const [commercialStage, setCommercialStage] = useState('')
  const [operationalStage, setOperationalStage] = useState('')
  const [simulate, setSimulate]               = useState('')
  const [savingStage, setSavingStage]         = useState(false)
  const [retrying, setRetrying]               = useState(false)
  const [comments, setComments]               = useState<CardComment[]>([])
  const [activityLogs, setActivityLogs]       = useState<ActivityLog[]>([])
  const [commentText, setCommentText]         = useState('')
  const [commentsLoading, setCommentsLoading] = useState(false)

  useSSE((event, data) => {
    if (event === 'comment_added') {
      const comment = data as CardComment
      setComments((prev) => [comment, ...prev])
    } else if (event === 'comment_edited') {
      const comment = data as CardComment
      setComments((prev) => prev.map((c) => (c.id === comment.id ? comment : c)))
    } else if (event === 'comment_deleted') {
      const { commentId } = data as { commentId: string }
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    }
  }, ['comment_added', 'comment_edited', 'comment_deleted'])

  useEffect(() => {
    const ignoreRef = { current: false }
    const timer = setTimeout(() => {
      setLoading(true)
      api.get<Order>(`/api/v1/orders/${orderId}`)
        .then((data) => {
          if (ignoreRef.current) return
          setOrder(data)
          setCommercialStage(data.commercialStage)
          setOperationalStage(data.operationalStage)
        })
        .catch((err) => { if (!ignoreRef.current) toast.error(err instanceof Error ? err.message : 'Erro ao carregar pedido') })
        .finally(() => { if (!ignoreRef.current) setLoading(false) })
    }, 0)
    return () => { clearTimeout(timer); ignoreRef.current = true }
  }, [orderId])

  useEffect(() => {
    if (!order) return
    setCommentsLoading(true)
    api.get<CardComment[]>(`/api/v1/orders/${orderId}/comments`)
      .then((data) => setComments(data))
      .catch(() => {})
      .finally(() => setCommentsLoading(false))
    api.get<ActivityLog[]>(`/api/v1/orders/${orderId}/activity-logs`)
      .then((data) => setActivityLogs(data))
      .catch(() => {})
  }, [order?.id])

  const stageChanged = order && (commercialStage !== order.commercialStage || operationalStage !== order.operationalStage)

  async function handleSaveStage() {
    if (!order) return
    setSavingStage(true)
    try {
      const result = await api.patch<Order & { syncError: string | null }>(`/api/v1/orders/${orderId}/stage`, {
        commercial_stage:  commercialStage,
        operational_stage: operationalStage,
        ...(simulate ? { simulate } : {}),
      })
      const updated: Order = { ...order, ...result }
      setOrder(updated)
      onUpdate(updated)
      if (result.syncError) {
        toast.error(`Estágio atualizado, mas a sincronização com o AquaFort falhou: ${result.syncError}`)
      } else {
        toast.success('Estágio do pedido atualizado.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar estágio')
    } finally {
      setSavingStage(false)
    }
  }

  async function handleRetry() {
    if (!order) return
    setRetrying(true)
    try {
      const result = await api.post<{ planning: Planning; syncError: string | null }>(
        `/api/v1/orders/${orderId}/planning/retry`,
        simulate ? { simulate } : {}
      )
      const updated: Order = { ...order, planning: result.planning }
      setOrder(updated)
      onUpdate(updated)
      if (result.syncError) {
        toast.error(`Nova tentativa ainda falhou: ${result.syncError}`)
      } else {
        toast.success('Sincronização concluída com sucesso.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao repetir sincronização')
    } finally {
      setRetrying(false)
    }
  }

  async function handleAddComment() {
    if (!order || !commentText.trim()) return
    try {
      const comment = await api.post<CardComment>(`/api/v1/orders/${orderId}/comments`, { content: commentText })
      setComments((prev) => [comment, ...prev])
      setCommentText('')
      toast.success('Comentário adicionado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar comentário')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)' }} onClick={onClose} />
      <div style={{
        position: 'relative', width: 380, maxWidth: 'calc(100vw - 32px)', height: '100%',
        backgroundColor: '#fff', boxShadow: '-8px 0 30px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>Detalhe do pedido</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        {loading && (
          <p style={{ padding: 20, color: '#bbb', fontSize: 12 }}>Carregando...</p>
        )}

        {!loading && order && (
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Cabeçalho comercial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>
                {order.client?.name ?? 'Cliente removido'}
              </p>
              <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{order.product}</p>
              <Badge color={ORDER_PRIORITY_COLORS[order.priority]}>
                Prioridade {ORDER_PRIORITY_LABELS[order.priority]}
              </Badge>
            </div>

            {/* Dados do pedido */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, backgroundColor: '#fafafa', borderRadius: 8 }}>
              <InfoRow label="Quantidade" value={formatMillions(order.quantityMillions)} />
              <InfoRow label="Valor" value={formatCurrency(order.value)} />
              <InfoRow label="Estágio da larva desejado" value={order.desiredStage ?? '—'} />
              <InfoRow label="Genética preferencial" value={order.genetics ?? '—'} />
              <InfoRow label="Data desejada" value={formatDate(order.desiredDeliveryDate)} />
              {order.notes && (
                <div style={{ fontSize: 12, color: '#666', paddingTop: 4, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  {order.notes}
                </div>
              )}
            </div>

            {/* Funil */}
            <div>
              <p style={{ ...labelStyle, marginBottom: 8 }}>Funil</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Estágio comercial</label>
                  <select style={selectStyle} value={commercialStage} onChange={(e) => setCommercialStage(e.target.value)}>
                    {ORDER_STAGES.map((s) => (
                      <option key={s} value={s}>{ORDER_STAGE_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Estágio operacional</label>
                  <select style={selectStyle} value={operationalStage} onChange={(e) => setOperationalStage(e.target.value)}>
                    {ORDER_STAGES.map((s) => (
                      <option key={s} value={s}>{ORDER_STAGE_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Cenário de simulação (opcional)</label>
                  <select style={selectStyle} value={simulate} onChange={(e) => setSimulate(e.target.value)}>
                    <option value="">Automático</option>
                    {AQUAFORT_SIMULATED_SCENARIOS.map((s) => (
                      <option key={s} value={s}>{AQUAFORT_SIMULATED_SCENARIO_LABELS[s]}</option>
                    ))}
                  </select>
                  <p style={{ fontSize: 10, color: '#bbb', margin: '4px 0 0' }}>
                    Usado apenas se esta mudança aprovar o pedido, ou numa nova tentativa de sincronização abaixo.
                  </p>
                </div>
                <button
                  onClick={handleSaveStage}
                  disabled={!stageChanged || savingStage}
                  style={{
                    padding: '9px 14px', fontSize: 13, fontWeight: 500, color: '#111',
                    backgroundColor: stageChanged ? '#F2E600' : '#f3f4f6',
                    border: 'none', borderRadius: 7,
                    cursor: !stageChanged || savingStage ? 'not-allowed' : 'pointer',
                    opacity: savingStage ? 0.6 : 1,
                  }}
                >
                  {savingStage ? 'Salvando...' : 'Salvar estágio'}
                </button>
              </div>
            </div>

            {/* Planejamento */}
            <div>
              <p style={{ ...labelStyle, marginBottom: 8 }}>Planejamento (AquaFort)</p>

              {!order.planning && (
                <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>
                  Planejamento ainda não gerado — disponível após o pedido ser aprovado.
                </p>
              )}

              {order.planning && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge color={AQUAFORT_SYNC_STATE_COLORS[order.planning.aquafortState]}>
                      {AQUAFORT_SYNC_STATE_LABELS[order.planning.aquafortState]}
                    </Badge>
                    {order.planning.availabilityStatus && (
                      <Badge color={AQUAFORT_AVAILABILITY_STATUS_COLORS[order.planning.availabilityStatus]}>
                        {AQUAFORT_AVAILABILITY_STATUS_LABELS[order.planning.availabilityStatus]}
                      </Badge>
                    )}
                  </div>

                  {order.planning.aquafortState === 'sincronizacao_pendente' && (
                    <div style={{ padding: 10, backgroundColor: '#fafafa', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
                        A última tentativa de sincronização falhou. Os dados comerciais deste pedido não foram
                        perdidos — tente novamente quando quiser.
                      </p>
                      <button
                        onClick={handleRetry}
                        disabled={retrying}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                          padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#111',
                          backgroundColor: '#F2E600', border: 'none', borderRadius: 7,
                          cursor: retrying ? 'not-allowed' : 'pointer', opacity: retrying ? 0.6 : 1,
                        }}
                      >
                        <RotateCcw size={12} /> {retrying ? 'Tentando novamente...' : 'Tentar novamente'}
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, backgroundColor: '#fafafa', borderRadius: 8 }}>
                    <InfoRow label="ID no AquaFort" value={order.planning.externalPlanningId ?? '—'} />
                    <InfoRow label="Quantidade confirmada" value={order.planning.confirmedQuantity !== null ? formatMillions(order.planning.confirmedQuantity) : '—'} />
                    <InfoRow label="Data prevista" value={formatDate(order.planning.expectedDate)} />
                    <InfoRow label="Unidade produtiva" value={order.planning.productionUnit ?? '—'} />
                    <InfoRow label="Lote" value={order.planning.batch ?? '—'} />
                    <InfoRow label="Código genético" value={order.planning.geneticCode ?? '—'} />
                    <InfoRow label="Tentativas" value={String(order.planning.retryCount)} />
                    <InfoRow label="Última sincronização" value={formatDateTime(order.planning.lastSyncedAt)} />
                    {order.planning.constraintsNotes && (
                      <div style={{ fontSize: 12, color: '#666', paddingTop: 4, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        {order.planning.constraintsNotes}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Feed de Atividade e Comentários */}
              <div>
                <p style={{ ...labelStyle, marginBottom: 8 }}>
                  <MessageSquare size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Atividade e Comentários
                </p>

                {activityLogs.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                    {activityLogs.map((log) => (
                      <div key={log.id} style={{ fontSize: 11, color: '#888', padding: '4px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <span style={{ color: '#999', marginRight: 6 }}>{formatDateTime(log.createdAt)}</span>
                        {log.description}
                      </div>
                    ))}
                  </div>
                )}

                {commentsLoading ? (
                  <p style={{ fontSize: 11, color: '#bbb', margin: '4px 0' }}>Carregando comentários...</p>
                ) : (
                  <>
                    {comments.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                        {comments.map((comment) => (
                          <div key={comment.id} style={{ fontSize: 12, padding: '6px 8px', backgroundColor: '#fafafa', borderRadius: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                              <span style={{ fontWeight: 600, color: '#333' }}>{comment.user?.name ?? 'Desconhecido'}</span>
                              <span style={{ color: '#bbb', fontSize: 10 }}>{formatDateTime(comment.createdAt)}</span>
                            </div>
                            <p style={{ margin: 0, color: '#555', fontSize: 11 }}>{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Adicionar comentário..."
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment() }}
                        style={{
                          flex: 1, padding: '6px 10px', fontSize: 12,
                          border: '1px solid rgba(0,0,0,0.12)', borderRadius: 6,
                          outline: 'none', fontFamily: 'inherit',
                        }}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!commentText.trim()}
                        style={{
                          padding: '6px 10px', fontSize: 12, fontWeight: 500,
                          backgroundColor: commentText.trim() ? '#F2E600' : '#f3f4f6',
                          border: 'none', borderRadius: 6, cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
