const fs = require('fs');
const path = 'src/pages/AppPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/<AppSidebar[\s\S]*?onAddCompany=\{[^}]*\}\s*\/>/, '');

fs.writeFileSync(path, code);
