const fs = require('fs');
const path = 'src/components/orders/OrderCard.tsx';
let code = fs.readFileSync(path, 'utf8');

const cardReplace = `
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ color: '#3b82f6', display: 'flex' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </span>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {clientLabel}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
          {formatCurrency(order.value)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, fontSize: 11, color: '#6b7280' }}>
          <span style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{formatMillions(order.quantityMillions)} PLs</span>
          <span style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{order.product}</span>
          <span style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>Ent: {formatDate(order.desiredDeliveryDate) || 'TBD'}</span>
        </div>
      </div>
      <div style={{ marginTop: 8, display: 'none' }}>
`;

// we are replacing the previously injected block. Let's find it.
// The easiest way is to rewrite the whole render function.
