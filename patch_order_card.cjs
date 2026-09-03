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

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 8 }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%', backgroundColor: '#fcd34d',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, color: '#92400e', flexShrink: 0
        }}>
          U
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>
            {formatCurrency(order.value)}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
            {order.probability ? \`\${order.probability}% on \` : '50% on '}{formatDate(order.desiredDeliveryDate) || 'TBD'}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, display: 'none' }}>
`;

// we'll just replace the inner contents of the card and hide the old elements.
code = code.replace(
  /<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>/,
  cardReplace + "\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>"
);

// close the hidden div at the very end of the card, right before {hasNextStage
code = code.replace(
  /      {hasNextStage && \(/,
  "      </div>\n      {hasNextStage && ("
);

fs.writeFileSync(path, code);
