const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// The charts row:
// <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24, height: 320 }}>
code = code.replace(
  "gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24, height: 320",
  "gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 16, marginBottom: 24, minHeight: 360"
);

// Format the X-Axis ticks
code = code.replace(
  /<XAxis dataKey="name" tick=\{\{fontSize: 10\}\} \/>/g,
  "<XAxis dataKey=\"name\" tick={{fontSize: 10, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />"
);

// Format Y-Axis ticks
code = code.replace(
  /<YAxis tick=\{\{fontSize: 10\}\} \/>/g,
  "<YAxis tick={{fontSize: 10, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />"
);

// Also the Funnel and Donut charts look bad if they get squished. Minmax 350px will help them.
// Let's also ensure the bottom lists row isn't squished:
code = code.replace(
  /<div style=\{\{ display: 'grid', gridTemplateColumns: 'repeat\(4, 1fr\)', gap: 16 \}\}>/,
  "<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>"
);

fs.writeFileSync('src/pages/DashboardPage.tsx', code);
