import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import type { IntegrationHistoryItem } from '@/types'
import { INTEGRATION_SYNC_RESULT_COLORS, INTEGRATION_SYNC_RESULT_LABELS } from '@/lib/domainLabels'
import { formatDateTime, formatMillions } from '@/lib/format'

interface Props {
  items:            IntegrationHistoryItem[]
  page:             number
  limit:            number
  total:            number
  loading:          boolean
  retryingOrderId:  string | null
  onPageChange:     (page: number) => void
  onRetry:          (orderId: string) => void
}

const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({
  width: 26, height: 26, borderRadius: 6, border: 'none', backgroundColor: '#f3f4f6',
  cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', opacity: disabled ? 0.5 : 1,
})

// Lista paginada de "eventos e falhas" (spec seção 3), reflexo direto de
// GET /api/v1/integration/history. "Repetir sincronização" por linha
// reaproveita POST /orders/:id/planning/retry (já existe desde o Bloco 3,
// mesmo endpoint usado em OrderDetailPanel) — este componente só dispara
// `onRetry`, nenhuma lógica de retry duplicada aqui (a chamada de fato mora
// em IntegrationPage).
export default function HistoryList({ items, page, limit, total, loading, retryingOrderId, onPageChange, onRetry }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, overflow: 'hidden' }}>
      {loading && <p style={{ fontSize: 12, color: '#bbb', margin: 0, padding: 16 }}>Carregando histórico...</p>}

      {!loading && items.length === 0 && (
        <p style={{ fontSize: 12, color: '#bbb', margin: 0, padding: 16 }}>Nenhuma sincronização registrada ainda.</p>
      )}

      {!loading && items.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map(({ result, planning, order }) => (
              <div
                key={planning.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                  borderBottom: '1px solid rgba(0,0,0,0.05)', flexWrap: 'wrap',
                }}
              >
                <span style={{
                  fontSize: 10, fontWeight: 600, color: '#fff', borderRadius: 10,
                  padding: '3px 9px', backgroundColor: INTEGRATION_SYNC_RESULT_COLORS[result] ?? '#9ca3af',
                }}>
                  {INTEGRATION_SYNC_RESULT_LABELS[result] ?? result}
                </span>

                <div style={{ flex: 1, minWidth: 160 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>
                    {order.client?.name ?? 'Cliente removido'}
                  </p>
                  <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>
                    {order.product} · {order.quantityMillions !== null ? formatMillions(order.quantityMillions) : '—'}
                  </p>
                </div>

                <span style={{ fontSize: 11, color: '#999', minWidth: 120, textAlign: 'right' }}>
                  {formatDateTime(planning.lastSyncedAt ?? planning.createdAt)}
                </span>

                {result === 'falha' && (
                  <button
                    onClick={() => onRetry(order.id)}
                    disabled={retryingOrderId === order.id}
                    title="Repetir sincronização"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                      padding: '6px 10px', fontSize: 11, fontWeight: 600, color: '#111',
                      backgroundColor: '#F2E600', border: 'none', borderRadius: 6,
                      cursor: retryingOrderId === order.id ? 'not-allowed' : 'pointer',
                      opacity: retryingOrderId === order.id ? 0.6 : 1,
                    }}
                  >
                    <RotateCcw size={11} /> {retryingOrderId === order.id ? 'Tentando...' : 'Repetir'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 12 }}>
              <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} style={pageBtnStyle(page <= 1)}>
                <ChevronLeft size={14} color="#555" />
              </button>
              <span style={{ fontSize: 12, color: '#666' }}>Página {page} de {totalPages}</span>
              <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} style={pageBtnStyle(page >= totalPages)}>
                <ChevronRight size={14} color="#555" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
