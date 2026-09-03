const fs = require('fs');
let wa = fs.readFileSync('src/pages/WhatsAppPage.tsx', 'utf8');

// It spans multiple lines, we can use a more robust replacement
wa = wa.replace(/<AppSidebar[\s\S]*?\/>/, '');

fs.writeFileSync('src/pages/WhatsAppPage.tsx', wa);
