import { ArrowRight } from 'lucide-react'
import type { Order } from '@/types'
import { ORDER_PRIORITY_COLORS, ORDER_PRIORITY_LABELS } from '@/lib/domainLabels'
import { formatCurrency, formatDate, formatMillions } from '@/lib/format'

interface Props {
  order:        Order
  nextStage:    string | null
  advancing:    boolean
  onOpen:       (order: Order) => void
  onAdvance:    (order: Order) => void
}

// Card do funil (kanban). Sem lógica de negócio própria — só exibição e
// disparo dos callbacks (fetch/PATCH ficam em PipelinePage). "→" avança
// commercial_stage para o próximo valor de ORDER_STAGE_ORDER (sequência
// visual do frontend, não imposta pelo backend); abrir o card mostra o
// detalhe completo, incluindo Planejamento.
export default function OrderCard({ order, nextStage, advancing, onOpen, onAdvance }: Props) {
  const clientLabel = order.client?.name ?? 'Cliente removido'

  return (
    <div
      onClick={() => onOpen(order)}
      style={{
        backgroundColor: '#fff', borderRadius: 9, padding: '11px 12px',
        border: '1px solid rgba(0,0,0,0.07)', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 6,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
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

      {nextStage && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdvance(order) }}
          disabled={advancing}
          title="Avançar para o próximo estágio"
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
