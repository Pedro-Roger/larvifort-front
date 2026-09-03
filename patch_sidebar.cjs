const fs = require('fs');
const path = 'src/components/layout/AppSidebar.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('Building2')) {
  code = code.replace("MessageCircle } from 'lucide-react'", "MessageCircle, Building2 } from 'lucide-react'");
  const injectionPoint = "{iconBtn(sidebarView === 'all-clients', onViewAllClients, 'Todos os clientes', <Users size={17} />)}";
  const companiesBtn = "{iconBtn(false, () => navigate('/empresas'), 'Empresas 360', <Building2 size={17} />)}";
  code = code.replace(injectionPoint, companiesBtn + '\n      ' + injectionPoint);
  fs.writeFileSync(path, code);
}
