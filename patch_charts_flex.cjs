const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// Change the charts container to a 2-column grid layout by default
code = code.replace(
  "gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 16, marginBottom: 24, minHeight: 360",
  "gridTemplateColumns: 'repeat(auto-fit, minmax(48%, 1fr))', gap: 24, marginBottom: 24"
);

// Add explicit minHeights to the blocks to ensure they render big
code = code.replace(
  /<div style=\{blockStyle\}>\s*<h3 style=\{blockTitle\}>Evolução Comercial<\/h3>/,
  "<div style={{ ...blockStyle, minHeight: 380, display: 'flex', flexDirection: 'column' }}>\n          <h3 style={blockTitle}>Evolução Comercial</h3>"
);

code = code.replace(
  /<div style=\{blockStyle\}>\s*<h3 style=\{blockTitle\}>Volume por Período<\/h3>/,
  "<div style={{ ...blockStyle, minHeight: 380, display: 'flex', flexDirection: 'column' }}>\n          <h3 style={blockTitle}>Volume por Período</h3>"
);

code = code.replace(
  /<div style=\{blockStyle\}>\s*<h3 style=\{blockTitle\}>Funil de Pedidos<\/h3>/,
  "<div style={{ ...blockStyle, minHeight: 380, display: 'flex', flexDirection: 'column' }}>\n          <h3 style={blockTitle}>Funil de Pedidos</h3>"
);

code = code.replace(
  /<div style=\{blockStyle\}>\s*<h3 style=\{blockTitle\}>Metas Comerciais<\/h3>/,
  "<div style={{ ...blockStyle, minHeight: 380, display: 'flex', flexDirection: 'column' }}>\n          <h3 style={blockTitle}>Metas Comerciais</h3>"
);

// For ResponsiveContainer to work nicely inside a flex column, it needs flex: 1
code = code.replace(
  /<ResponsiveContainer width="100%" height="100%">/g,
  "<div style={{ flex: 1, minHeight: 0 }}><ResponsiveContainer width=\"100%\" height=\"100%\">"
);
code = code.replace(
  /<\/ResponsiveContainer>/g,
  "</ResponsiveContainer></div>"
);

// Specifically for Metas which had a fixed height:
code = code.replace(
  /<div style=\{\{ flex: 1, minHeight: 0 \}\}><ResponsiveContainer width="100%" height=\{200\}>/g,
  "<div style={{ flex: 1, minHeight: 0, position: 'relative' }}><ResponsiveContainer width=\"100%\" height=\"100%\">"
);
// And the absolute centering for the Donut text:
code = code.replace(
  /<div style=\{\{ textAlign: 'center', fontSize: 24, fontWeight: 700, color: '#111', marginTop: -115 \}\}>78%<\/div>/,
  "<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>\n            <div style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>78%</div>\n            <div style={{ fontSize: 13, color: '#6b7280' }}>da meta</div>\n          </div>"
);
code = code.replace(
  /<div style=\{\{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginBottom: 60 \}\}>da meta<\/div>/,
  ""
);


fs.writeFileSync('src/pages/DashboardPage.tsx', code);
