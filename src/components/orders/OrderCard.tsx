import { ArrowRight } from 'lucide-react'
import type { Order } from '@/types'
import { ORDER_PRIORITY_COLORS, ORDER_PRIORITY_LABELS } from '@/lib/domainLabels'
import { formatCurrency, formatDate, formatMillions } from '@/lib/format'

interface Props {
  order:        Order
  hasNextStage: boolean
  advancing:    boolean
  dragging:     boolean
  onOpen:       (order: Order) => void
  onAdvance:    (order: Order) => void
  onDragStart?: (order: Order, e: React.DragEvent) => void
}

// Card do board CRM. Reescrito no CRM realtime (spec 2026-08-28): propriedades
// como "advance to next" são do board (hasNextStage), drag nativo HTML5
// ativado via onDragStart (PipelinePage seta dataTransfer + dragOrderId).
// Click simples abre o drawer de detalhe. Efeito fallback: sem onDragStart,
// renderiza sem o atributo draggable (case do List view antigo).
export default function OrderCard({ order, hasNextStage, advancing, dragging, onOpen, onAdvance, onDragStart }: Props) {
  const clientLabel = order.client?.name ?? 'Cliente removido'

  return (
    <div
      onClick={() => onOpen(order)}
      draggable={!!onDragStart}
      onDragStart={onDragStart ? (e) => onDragStart(order, e) : undefined}
      style={{
        backgroundColor: '#fff', borderRadius: 9, padding: '11px 12px',
        border: '1px solid rgba(0,0,0,0.07)', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 6,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        opacity: dragging ? 0.45 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {clientLabel}
        </p>
        <span style={{
          fontSize: 9, fontWeight: 600, color: '#fff', borderRadius: 8,
          padding: '2px 6px', flexShrink: 0, backgroundColor: ORDER_PRIORITY_COLORS[order.priority],
        }}>
          {ORDER_PRIORITY_LABELS[order.priority]}
        </span>
      </div>

      <p style={{ fontSize: 12, color: '#666', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {order.product}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#999' }}>
        <span>{formatMillions(order.quantityMillions)}</span>
        <span>{formatCurrency(order.value)}</span>
      </div>

      {order.desiredDeliveryDate && (
        <p style={{ fontSize: 10, color: '#bbb', margin: 0 }}>Entrega desejada: {formatDate(order.desiredDeliveryDate)}</p>
      )}

      {hasNextStage && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdvance(order) }}
          disabled={advancing}
          title="Avançar para a próxima coluna"
          style={{
            marginTop: 2, alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600, color: '#111', backgroundColor: '#F2E600',
            border: 'none', borderRadius: 6, padding: '4px 8px',
            cursor: advancing ? 'not-allowed' : 'pointer', opacity: advancing ? 0.6 : 1,
          }}
        >
          {advancing ? '...' : <>Avançar <ArrowRight size={10} /></>}
        </button>
      )}
    </div>
  )
}
