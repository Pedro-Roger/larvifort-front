const fs = require('fs');
const path = 'src/pages/CompaniesPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// We need to fetch analytics alongside the company detail
code = code.replace(
  "const [detail, setDetail] = useState<CompanyDetail | null>(null)",
  "const [detail, setDetail] = useState<CompanyDetail | null>(null)\n  const [analytics, setAnalytics] = useState<any>(null)"
);

const fetchReplace = `
    setDetailLoading(true)
    Promise.all([
      api.get<CompanyDetail>(\`/api/v1/companies/\${activeId}\`),
      api.get<any>(\`/api/v1/companies/\${activeId}/analytics\`)
    ])
      .then(([companyRes, analyticsRes]) => {
        setDetail(companyRes)
        setAnalytics(analyticsRes)
      })
      .catch(console.error)
      .finally(() => setDetailLoading(false))
`;

code = code.replace(
  /api\.get<CompanyDetail>[\s\S]*?finally\(\(\) => setDetailLoading\(false\)\)/,
  fetchReplace.trim()
);

// Replace the hardcoded KPI header values
code = code.replace("R$ 0,00", "{analytics?.totalRevenue ? `R$ ${analytics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}");
code = code.replace("</div>\n                <div>\n                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Pedidos</div>\n                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>0</div>", "</div>\n                <div>\n                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Pedidos</div>\n                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{analytics?.totalOrders || 0}</div>");
code = code.replace("Ticket Médio</div>\n                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>R$ 0,00</div>", "Ticket Médio</div>\n                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{analytics?.ticketMedio ? `R$ ${analytics.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}</div>");
code = code.replace("Última Compra</div>\n                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>-</div>", "Última Compra</div>\n                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{analytics?.lastPurchase ? new Date(analytics.lastPurchase).toLocaleDateString('pt-BR') : '-'}</div>");
code = code.replace("Pipeline Aberto</div>\n                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>0 op.</div>", "Pipeline Aberto</div>\n                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{analytics?.openPipelineCount || 0} op.</div>");

fs.writeFileSync(path, code);
