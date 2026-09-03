
import { useEffect, useState } from 'react'
import { ArrowLeft, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, ChevronRight, Activity, DollarSign, Package, AlertCircle, TrendingDown, RefreshCw, BarChart2, Briefcase, FileText, PieChart, Users, Phone, LayoutDashboard, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import type { DashboardData } from '@/types'
import { formatCurrency, formatDate, formatMillions } from '@/lib/format'
import { useAuthStore } from '@/store/auth'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<DashboardData>('/api/v1/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const indicators = data?.indicators
  const evData = data?.revenueEvolution?.map(d => ({ name: d.period, value: d.revenue })) || []
  
  const funnelData = [
    { name: 'Orçamento', value: 58 },
    { name: 'Negociação', value: 42 },
    { name: 'Aprovado', value: 33 },
    { name: 'Reservado', value: 24 },
    { name: 'Produção', value: 18 },
    { name: 'Pronto', value: 12 },
    { name: 'Entregue', value: 9 },
  ]

  const pieData = [
    { name: 'João Silva', value: 400 },
    { name: 'Maria Costa', value: 300 },
    { name: 'Rafael Lima', value: 300 },
  ]
  const COLORS = ['#059669', '#3b82f6', '#10b981', '#8b5cf6']

  const kpiStyle = {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, border: '1px solid rgba(0,0,0,0.06)',
    display: 'flex', alignItems: 'flex-start', gap: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  }
  const iconBoxStyle = (color: string, bg: string) => ({
    width: 42, height: 42, borderRadius: '50%', backgroundColor: bg, color: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  })

  const blockStyle = {
    backgroundColor: '#fff', borderRadius: 12, padding: 20, border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  }
  const blockTitle = { fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }

  if (loading) return <div style={{ padding: 40, color: '#888' }}>Carregando dashboard...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', backgroundColor: '#f3f4f6', padding: '24px 32px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>Dashboard Comercial</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Visão geral do desempenho comercial e operacional de pós-larvas.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ backgroundColor: '#0d9488', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
            <Users size={16} /> Novo Cliente
          </button>
          <button onClick={() => navigate('/pedidos')} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
            <Package size={16} /> Novo Pedido
          </button>
          <button style={{ backgroundColor: '#fff', color: '#2563eb', border: '1px solid #2563eb', borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
            <Calendar size={16} /> Registrar Atividade
          </button>
        </div>
      </div>

      {/* KPIs Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={kpiStyle}>
          <div style={iconBoxStyle('#10b981', '#d1fae5')}><DollarSign size={20} /></div>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>Vendas do Mês</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '2px 0 4px' }}>{formatCurrency(indicators?.realizedRevenue || 0)}</div>
            <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>↗ 18,6% vs Ant.</div>
          </div>
        </div>
        <div style={kpiStyle}>
          <div style={iconBoxStyle('#0d9488', '#ccfbf1')}><Activity size={20} /></div>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>Volume (PLs)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '2px 0 4px' }}>{formatMillions(indicators?.realizedVolumeMillions || 0)}</div>
            <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>↗ 12,4% vs Ant.</div>
          </div>
        </div>
        <div style={kpiStyle}>
          <div style={iconBoxStyle('#2563eb', '#dbeafe')}><Briefcase size={20} /></div>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>Pedidos (Aberto)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '2px 0 4px' }}>{indicators?.ordersOpenCount || 0}</div>
            <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>↗ 8 vs Ant.</div>
          </div>
        </div>
        <div style={kpiStyle}>
          <div style={iconBoxStyle('#ea580c', '#ffedd5')}><AlertTriangle size={20} /></div>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>Pedidos em Risco</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '2px 0 4px' }}>{data?.riskyOrders?.total || 0}</div>
            <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>↗ 2 vs Ant.</div>
          </div>
        </div>
        <div style={kpiStyle}>
          <div style={iconBoxStyle('#8b5cf6', '#ede9fe')}><BarChart2 size={20} /></div>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>Receita Prevista</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '2px 0 4px' }}>{formatCurrency(indicators?.revenueTarget || 3150000)}</div>
            <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>↗ {indicators?.revenueProgress || 0}% da meta</div>
          </div>
        </div>
        <div style={kpiStyle}>
          <div style={iconBoxStyle('#0284c7', '#e0f2fe')}><RefreshCw size={20} /></div>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>Integração AquaFort</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#059669', margin: '4px 0', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: 12, display: 'inline-block' }}>Sincronizado</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Última: Há 3 min</div>
          </div>
        </div>
      </div>

      {/* Middle Row: Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(48%, 1fr))', gap: 24, marginBottom: 24 }}>
        <div style={{ ...blockStyle, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
          <h3 style={blockTitle}>Evolução Comercial</h3>
          <div style={{ flex: 1, minHeight: 0 }}><ResponsiveContainer width="100%" height="100%">
            <LineChart data={evData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 10, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer></div>
        </div>
        <div style={{ ...blockStyle, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
          <h3 style={blockTitle}>Volume por Período</h3>
          <div style={{ flex: 1, minHeight: 0 }}><ResponsiveContainer width="100%" height="100%">
            <BarChart data={evData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 10, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </div>
        <div style={{ ...blockStyle, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
          <h3 style={blockTitle}>Funil de Pedidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
             {funnelData.map((d, i) => (
               <div key={d.name} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                 <div style={{ width: 100, fontWeight: 500, color: '#555' }}>{d.name}</div>
                 <div style={{ flex: 1, backgroundColor: '#f3f4f6', height: 16, borderRadius: 8, overflow: 'hidden' }}>
                   <div style={{ width: `${(d.value / 60) * 100}%`, height: '100%', backgroundColor: COLORS[i % COLORS.length] }} />
                 </div>
                 <div style={{ width: 40, textAlign: 'right', fontWeight: 600 }}>{d.value}</div>
               </div>
             ))}
          </div>
        </div>
        <div style={{ ...blockStyle, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
          <h3 style={blockTitle}>Metas Comerciais</h3>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>78%</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>da meta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        
        {/* Entregas */}
        <div style={{ ...blockStyle, gridColumn: 'span 1' }}>
          <h3 style={blockTitle}>Próximas Entregas</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ color: '#6b7280', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ paddingBottom: 8, fontWeight: 500 }}>Cliente</th>
                <th style={{ paddingBottom: 8, fontWeight: 500 }}>Data</th>
                <th style={{ paddingBottom: 8, fontWeight: 500 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.upcomingDeliveries?.items.slice(0, 5).map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 0', fontWeight: 600, color: '#111' }}>{o.client?.name}</td>
                  <td style={{ padding: '12px 0', color: '#6b7280' }}>{formatDate(o.desiredDeliveryDate)}</td>
                  <td style={{ padding: '12px 0' }}>
                    <span style={{ backgroundColor: '#dbeafe', color: '#2563eb', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600 }}>Programado</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Risco */}
        <div style={{ ...blockStyle, gridColumn: 'span 1' }}>
          <h3 style={blockTitle}>Pedidos em Risco</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data?.riskyOrders?.items.slice(0, 4).map(alert => (
              <div key={alert.order.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
                <AlertTriangle size={16} color="#dc2626" style={{ marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{alert.order.client?.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Entrega Atrasada</div>
                </div>
                <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600 }}>Atraso</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agenda */}
        <div style={{ ...blockStyle, gridColumn: 'span 1' }}>
          <h3 style={blockTitle}>Agenda de Hoje</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
               <div style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', width: 40 }}>09:00</div>
               <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={14} color="#6b7280" /></div>
               <div>
                 <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Ligação</div>
                 <div style={{ fontSize: 11, color: '#6b7280' }}>Aquamar Camarões</div>
               </div>
             </div>
             <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
               <div style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', width: 40 }}>10:30</div>
               <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={14} color="#6b7280" /></div>
               <div>
                 <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Reunião</div>
                 <div style={{ fontSize: 11, color: '#6b7280' }}>Mar & Sol</div>
               </div>
             </div>
             <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
               <div style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', width: 40 }}>14:00</div>
               <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={14} color="#6b7280" /></div>
               <div>
                 <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Follow-up</div>
                 <div style={{ fontSize: 11, color: '#6b7280' }}>Costa Azul</div>
               </div>
             </div>
          </div>
        </div>

        {/* Integration */}
        <div style={{ ...blockStyle, gridColumn: 'span 1' }}>
          <h3 style={blockTitle}>Status da Integração</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, backgroundColor: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw size={20} color="#2563eb" /></div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>AquaFort</div>
            <div style={{ marginLeft: 'auto', backgroundColor: '#d1fae5', color: '#059669', padding: '4px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600 }}>Sincronizado</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Última sincronização</span><span style={{ fontWeight: 600 }}>Há 3 minutos</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Pedidos sincronizados</span><span style={{ fontWeight: 600 }}>35</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Lotes sincronizados</span><span style={{ fontWeight: 600 }}>42</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Falhas</span><span style={{ fontWeight: 600, color: '#059669' }}>0</span></div>
          </div>
        </div>

      </div>

    </div>
  )
}
