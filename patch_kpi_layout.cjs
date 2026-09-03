const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// Change the grid columns from repeat(6, 1fr) to an auto-fit or a scrollable flex row, 
// or simply repeat(auto-fit, minmax(260px, 1fr))
code = code.replace(
  "gridTemplateColumns: 'repeat(6, 1fr)'",
  "gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'"
);

// We should also make sure the text inside the KPI cards doesn't wrap awkwardly.
// The KPI title currently doesn't have whiteSpace: 'nowrap'
code = code.replace(
  /<div style=\{\{ fontSize: 12, color: '#6b7280', fontWeight: 500 \}\}>/g,
  "<div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>"
);

// The icon box can be slightly smaller if needed, but 42 is fine. 
// We'll just let the auto-fit grid handle the width so they don't get squished.

fs.writeFileSync('src/pages/DashboardPage.tsx', code);
