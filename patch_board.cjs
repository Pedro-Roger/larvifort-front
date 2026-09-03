const fs = require('fs');
const path = 'src/components/board/BoardColumn.tsx';
let code = fs.readFileSync(path, 'utf8');

const lines = code.split('\n');
const before = lines.slice(0, 75).join('\n');
const after = lines.slice(147).join('\n');

const headerReplace = `
      {/* Header matching screenshot */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', gap: 6,
        marginBottom: 8, backgroundColor: '#f9fafb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 12,
              backgroundColor: stage.color || '#F2E600', color: '#111', letterSpacing: '0.04em'
            }}>
              {stage.name}
            </span>
            {hasPermissions && (
              <span title="Permissões restritas" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <Lock size={9} color="#9ca3af" />
              </span>
            )}
          </div>
          {isGestor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
                onClick={() => onMoveStage(stage, -1)} disabled={!canMoveLeft}
              ><ChevronLeft size={14} color={canMoveLeft ? "#888" : "#ccc"} /></button>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
                onClick={() => onMoveStage(stage, 1)} disabled={!canMoveRight}
              ><ChevronRight size={14} color={canMoveRight ? "#888" : "#ccc"} /></button>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', marginLeft: 4 }}
                onClick={() => onEditStage(stage)}
              ><Pencil size={12} color="#888" /></button>
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, letterSpacing: '0.02em', marginTop: 2 }}>
          {orders.length} OPPORTUNITIES
        </div>
        <div style={{ fontSize: 10, color: '#9ca3af', display: 'flex', justifyContent: 'space-between', marginTop: 4, fontWeight: 500 }}>
          <span>ANNUALIZED VALUE:</span>
          <span style={{ fontWeight: 600, color: '#374151' }}>
            $ {orders.reduce((acc, o) => acc + (Number(o.value) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>
`;

fs.writeFileSync(path, before + '\n' + headerReplace + '\n' + after);
