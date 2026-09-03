const fs = require('fs');
const path = 'src/pages/CompaniesPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace the KPI header in CompaniesPage with the DashboardStatCard style from upsprints
const newKpis = `
            {/* Upsprints-style KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Total Comprado</p>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>{analytics?.totalRevenue ? \`R$ \${analytics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\` : 'R$ 0,00'}</h3>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={18} />
                </div>
              </div>
              <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Pedidos Ganhos</p>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>{analytics?.wonOrders || 0}</h3>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={18} />
                </div>
              </div>
              <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Ticket Médio</p>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>{analytics?.ticketMedio ? \`R$ \${analytics.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\` : 'R$ 0,00'}</h3>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#f3f4f6', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Pipeline Aberto</p>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>{analytics?.openPipelineCount || 0}</h3>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={18} />
                </div>
              </div>
            </div>
`;

// Replace old KPI header
code = code.replace(/<div style=\{\{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: '24px 32px'[\s\S]*?<\/div>\s*<\/div>/, newKpis);

// Add missing lucide-react imports if any
if (!code.includes('DollarSign')) {
  code = code.replace("import { Building2, MapPin, Search, Plus, Map, Briefcase, Calendar, Phone, Activity }", "import { Building2, MapPin, Search, Plus, Map, Briefcase, Calendar, Phone, Activity, DollarSign, ShoppingCart, TrendingUp }");
}

fs.writeFileSync(path, code);
