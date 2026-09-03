const fs = require('fs');

// 1. Restore SidebarView type in AppSidebar.tsx
let sidebar = fs.readFileSync('src/components/layout/AppSidebar.tsx', 'utf8');
if (!sidebar.includes('export type SidebarView')) {
  sidebar = sidebar.replace("import { logout } from '@/lib/auth'", "import { logout } from '@/lib/auth'\n\nexport type SidebarView = 'company' | 'all-clients' | 'reminders'");
  fs.writeFileSync('src/components/layout/AppSidebar.tsx', sidebar);
}

// 2. MainLayout passes old props to AppSidebar
let mainLayout = fs.readFileSync('src/components/layout/MainLayout.tsx', 'utf8');
mainLayout = mainLayout.replace(/<AppSidebar[\s\S]*?\/>/, '<AppSidebar />');
fs.writeFileSync('src/components/layout/MainLayout.tsx', mainLayout);

// 3. WhatsAppPage removes manual AppSidebar rendering
let wa = fs.readFileSync('src/pages/WhatsAppPage.tsx', 'utf8');
wa = wa.replace(/<AppSidebar[\s\S]*?onAddCompany=\{[^}]*\}\s*\/>/, '');
wa = wa.replace("import AppSidebar from '@/components/layout/AppSidebar'", "");
fs.writeFileSync('src/pages/WhatsAppPage.tsx', wa);

