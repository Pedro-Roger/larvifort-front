const fs = require('fs');
const path = 'src/components/orders/OrderCard.tsx';

const code = `
import { ArrowRight, Building2, Calendar, Target, DollarSign, Sprout } from 'lucide-react'
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

export default function OrderCard({ order, hasNextStage, advancing, dragging, onOpen, onAdvance, onDragStart }: Props) {
  const clientLabel = order.client?.name ?? 'Cliente removido'
  const isNew = Date.now() - new Date(order.createdAt || Date.now()).getTime() < 86400000 // 24h

  // Corzinha lateral ou bolinha de prioridade no estilo upsprints
  const priorityColor = ORDER_PRIORITY_COLORS[order.priority] || '#9ca3af'

  return (
    <div
      onClick={() => onOpen(order)}
      draggable={!!onDragStart}
      onDragStart={onDragStart ? (e) => onDragStart(order, e) : undefined}
      style={{
        backgroundColor: '#fff', borderRadius: 8, padding: 12,
        border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        opacity: dragging ? 0.45 : 1,
        transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column', gap: 8
      }}
      onMouseOver={(e) => e.currentTarget.style.borderColor = '#0d9488'}
      onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'}
    >
      {/* Top Row: Priority, Title, ID, Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: priorityColor, flexShrink: 0 }} />
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0, maxWidth: '50%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {clientLabel}
        </h3>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>
          #{order.id.slice(0, 6)}
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {isNew && (
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 12, fontSize: 10, fontWeight: 600 }}>
              New
            </span>
          )}
          <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 6px', borderRadius: 12, fontSize: 10, fontWeight: 500 }}>
            {ORDER_PRIORITY_LABELS[order.priority] || order.priority}
          </span>
        </div>
      </div>

      {/* Bottom Row: User, Dates, Tags, Values */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 11, color: '#6b7280' }}>
        {/* User Avatar */}
        <div style={{
          width: 20, height: 20, borderRadius: '50%', backgroundColor: '#fcd34d',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: '#92400e', flexShrink: 0
        }}>
          V
        </div>

        {/* Product/Genetics Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 6px', borderRadius: 12 }}>
          <Sprout size={10} color="#059669" />
          <span style={{ color: '#374151' }}>{order.product}</span>
        </div>

        {/* Delivery Date Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.8 }}>
          <Calendar size={12} />
          <span style={{ fontWeight: 500, color: '#dc2626' }}>{formatDate(order.desiredDeliveryDate) || 'S/ Data'}</span>
        </div>

        {/* Amount & PLs aligned right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#f9fafb', border: '1px solid #e0e7ff', color: '#4f46e5', padding: '2px 6px', borderRadius: 12, fontWeight: 500 }}>
            <Target size={10} /> {formatMillions(order.quantityMillions)} PLs
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 2, backgroundColor: '#f9fafb', border: '1px solid #dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 12, fontWeight: 500 }}>
            <DollarSign size={10} /> {formatCurrency(order.value)}
          </span>
        </div>
      </div>

      {/* Advance button (CRM Specific) */}
      {hasNextStage && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdvance(order) }}
          disabled={advancing}
          title="Avançar coluna"
          style={{
            position: 'absolute', bottom: -10, right: 12, opacity: 0,
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600, color: '#111', backgroundColor: '#F2E600',
            border: 'none', borderRadius: 12, padding: '4px 12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            cursor: advancing ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          }}
          className="advance-btn"
        >
          {advancing ? '...' : <ArrowRight size={12} />}
        </button>
      )}
      <style>{\`
        div:hover > .advance-btn { opacity: \${advancing ? '0.6' : '1'} !important; bottom: 8px !important; }
      \`}</style>
    </div>
  )
}
`;
fs.writeFileSync(path, code);
