const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
code = code.replace("entry, index", "_entry, index");
fs.writeFileSync('src/pages/DashboardPage.tsx', code);
