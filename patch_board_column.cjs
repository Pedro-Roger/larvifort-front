const fs = require('fs');
const path = 'src/components/board/BoardColumn.tsx';
let code = fs.readFileSync(path, 'utf8');

const headerReplacement = `
      {/* Header matching screenshot */}
      <div style={{
        padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', gap: 6,
        marginBottom: 8
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 12,
            backgroundColor: stage.color || '#F2E600', color: '#111'
          }}>
            {stage.name}
          </span>
          {isGestor && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => onEditStage(stage)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Pencil size={12} color="#888" /></button>
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>
          {orders.length} OPPORTUNITIES
        </div>
        <div style={{ fontSize: 10, color: '#9ca3af', display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span>ANNUALIZED VALUE:</span>
          <span style={{ fontWeight: 600, color: '#374151' }}>
            R$ {orders.reduce((acc, o) => acc + o.value, 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>
`;

code = code.replace(
  /{[\s\S]*?{stage\.name}[\s\S]*?OPPORTUNITIES[\s\S]*?}/,
  // we don't have exactly this. let's find the original block
  ""
);

// We need to precisely replace the Header div
code = code.replace(
  /<div style={{\s*padding: '10px 12px', display: 'flex', justifyContent: 'space-between'[\s\S]*?(?=<\/div>\s*<\/div>\s*<div style={{ flex: 1, padding: '0 8px 8px', overflowY: 'auto',)/,
  headerReplacement.trim() + '\n      </div>\n'
);

fs.writeFileSync(path, code);
