const fs = require('fs');
const path = 'src/pages/PipelinePage.tsx';
let code = fs.readFileSync(path, 'utf8');

const headerReplace = `
      {/* Topbar matching screenshot */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          Sales Pipeline <span style={{ cursor: 'pointer', color: '#9ca3af', display: 'flex' }}><ArrowRight size={16} /></span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 16, fontSize: 13, fontWeight: 500, backgroundColor: '#fff', color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>Sales</span>
            <span style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 16, fontSize: 13, fontWeight: 500, backgroundColor: '#fff', color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>Close date: All Time</span>
            <span style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 16, fontSize: 13, fontWeight: 500, backgroundColor: '#fff', color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>All Leads</span>
            <span style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 16, fontSize: 13, fontWeight: 500, backgroundColor: '#fff', color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>All Users</span>
          </div>
          <div style={{ width: 1, height: 20, backgroundColor: '#e5e7eb', margin: '0 8px' }} />
          <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 16, fontSize: 13, fontWeight: 500, backgroundColor: '#fff', color: '#374151' }}>Actual Value <span style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: 4, marginLeft: 4, fontSize: 11 }}>ANNUALIZED</span></button>
          <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 16, fontSize: 13, fontWeight: 500, backgroundColor: '#fff', color: '#374151' }}>Options</button>
          <button
            onClick={() => setShowNewModal(true)}
            style={{
              padding: '6px 12px', fontSize: 13, fontWeight: 600, color: '#fff',
              backgroundColor: '#10b981', border: 'none', borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            <Plus size={14} /> Novo
          </button>
        </div>
      </div>
`;

code = code.replace(
  /<div style={{[^}]*}}>\s*<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>\s*<button[\s\S]*?<\/div>\s*<\/div>/, 
  headerReplace
);

fs.writeFileSync(path, code);
