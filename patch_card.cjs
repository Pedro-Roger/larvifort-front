const fs = require('fs');
const path = 'src/components/orders/OrderCard.tsx';
let code = fs.readFileSync(path, 'utf8');

const newRender = `
  return (
    <div
      onClick={() => onOpen(order)}
      draggable={!!onDragStart}
      onDragStart={onDragStart ? (e) => onDragStart(order, e) : undefined}
      style={{
        backgroundColor: '#fff', borderRadius: 9, padding: '11px 12px',
        border: '1px solid rgba(0,0,0,0.07)', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        opacity: dragging ? 0.45 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#3b82f6', display: 'flex' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </span>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {clientLabel}
          </p>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, color: '#fff', borderRadius: 8,
          padding: '2px 6px', flexShrink: 0, backgroundColor: ORDER_PRIORITY_COLORS[order.priority],
        }}>
          {ORDER_PRIORITY_LABELS[order.priority]}
        </span>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
        {formatCurrency(order.value)}
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, fontSize: 11, color: '#6b7280', fontWeight: 500 }}>
        <span style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{formatMillions(order.quantityMillions)} PLs</span>
        <span style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{order.product}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fcd34d',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#92400e', flexShrink: 0
          }}>
            V
          </div>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>{formatDate(order.desiredDeliveryDate) || 'S/ Data'}</span>
        </div>
        {hasNextStage && (
          <button
            onClick={(e) => { e.stopPropagation(); onAdvance(order) }}
            disabled={advancing}
            title="Avançar para a próxima coluna"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 600, color: '#111', backgroundColor: '#F2E600',
              border: 'none', borderRadius: 6, padding: '4px 8px',
              cursor: advancing ? 'not-allowed' : 'pointer', opacity: advancing ? 0.6 : 1,
            }}
          >
            {advancing ? '...' : <ArrowRight size={12} />}
          </button>
        )}
      </div>
    </div>
  )
}
`;

code = code.replace(/return \([\s\S]*\}\n/, newRender);
fs.writeFileSync(path, code);
