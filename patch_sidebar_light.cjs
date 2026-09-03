const fs = require('fs');
let code = fs.readFileSync('src/components/layout/AppSidebar.tsx', 'utf8');

// Change background from #1a1a1a to #fff
code = code.replace("backgroundColor: '#1a1a1a', color: '#fff',", "backgroundColor: '#fff', color: '#111',");
// Change right border from #2e2e2e to #e5e7eb
code = code.replace("borderRight: '1px solid #2e2e2e',", "borderRight: '1px solid #e5e7eb',");

// Change active state to teal background with white text
// color: active ? '#fff' : '#9ca3af' -> '#6b7280' for inactive
code = code.replace(
  "backgroundColor: active ? '#2c2c2f' : 'transparent',",
  "backgroundColor: active ? '#0d9488' : 'transparent',"
);
code = code.replace(
  "color: '#e5e7eb', fontSize: 13, fontWeight: active ? 600 : 400,",
  "color: active ? '#fff' : '#4b5563', fontSize: 13, fontWeight: active ? 600 : 500,"
);
code = code.replace(
  "<span style={{ color: active ? '#fff' : '#9ca3af', display: 'flex' }}>",
  "<span style={{ color: active ? '#fff' : '#6b7280', display: 'flex' }}>"
);

// User header border
code = code.replace("borderBottom: '1px solid #2e2e2e'", "borderBottom: '1px solid #e5e7eb'");
// Footer border
code = code.replace("borderTop: '1px solid #2e2e2e'", "borderTop: '1px solid #e5e7eb'");

// User name text color
code = code.replace("color: '#fff', whiteSpace: 'nowrap' }}>", "color: '#111', whiteSpace: 'nowrap' }}>");

fs.writeFileSync('src/components/layout/AppSidebar.tsx', code);
