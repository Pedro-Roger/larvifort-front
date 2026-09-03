const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// The charts row container:
code = code.replace(
  "gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 16, marginBottom: 24, minHeight: 360",
  "gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24"
);

// Now apply spans to the blocks. 
// 1st block: Evolução
code = code.replace(
  /<div style=\{blockStyle\}>\s*<h3 style=\{blockTitle\}>Evolução Comercial<\/h3>/,
  "<div style={{ ...blockStyle, gridColumn: 'span 2', minHeight: 360 }}>\n          <h3 style={blockTitle}>Evolução Comercial</h3>"
);

// 2nd block: Volume
code = code.replace(
  /<div style=\{blockStyle\}>\s*<h3 style=\{blockTitle\}>Volume por Período<\/h3>/,
  "<div style={{ ...blockStyle, gridColumn: 'span 2', minHeight: 360 }}>\n          <h3 style={blockTitle}>Volume por Período</h3>"
);

// 3rd block: Funil (make it span 2 as well so they fall on next row, or span 1?)
// Actually, if we want a 6 column grid: Line=3, Bar=3, Funnel=2, Metas=2 (wait, 3+3=6, 2+2+... doesn't fill)
// Let's just make it a 4 column grid: 
// Evolução: span 2
// Volume: span 2
// Funil: span 2
// Metas: span 2
// This means 2 charts per row.

code = code.replace(
  /<div style=\{blockStyle\}>\s*<h3 style=\{blockTitle\}>Funil de Pedidos<\/h3>/,
  "<div style={{ ...blockStyle, gridColumn: 'span 2', minHeight: 320 }}>\n          <h3 style={blockTitle}>Funil de Pedidos</h3>"
);

code = code.replace(
  /<div style=\{blockStyle\}>\s*<h3 style=\{blockTitle\}>Metas Comerciais<\/h3>/,
  "<div style={{ ...blockStyle, gridColumn: 'span 2', minHeight: 320 }}>\n          <h3 style={blockTitle}>Metas Comerciais</h3>"
);

// Wait, doing this will break responsiveness on mobile unless we use media queries, 
// but React inline styles don't support media queries. 
// A robust flexbox approach is better:
// parent: display: 'flex', flexWrap: 'wrap'
// Line: flex: '1 1 45%'
// Bar: flex: '1 1 45%'
// Funnel: flex: '1 1 45%'
// Metas: flex: '1 1 45%'
