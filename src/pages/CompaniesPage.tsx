import { useState, useEffect, useCallback } from 'react'
import { X, Building2, MapPin, Calendar, FileText, Activity, Users, ShoppingCart, Target, MessageCircle, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import type { Company } from '@/types'
import NewCompanyModal from '@/components/clients/NewCompanyModal'

interface CompanyDetail extends Company {
  contacts: any[]
  reminders: any[]
  // Will be populated by new endpoints later
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openTabs, setOpenTabs] = useState<{ id: string, label: string }[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [detail, setDetail] = useState<CompanyDetail | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('visao-geral')

  const fetchCompanies = useCallback((q: string) => {
    setLoading(true)
    api.get<Company[]>(`/api/v1/companies${q ? `?search=${encodeURIComponent(q)}` : ''}`)
      .then(setCompanies)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchCompanies(search), 300)
    return () => clearTimeout(timer)
  }, [search, fetchCompanies])

  useEffect(() => {
    if (!activeId) {
      setDetail(null)
      return
    }
    setDetailLoading(true)
    setDetailLoading(true)
    Promise.all([
      api.get<CompanyDetail>(`/api/v1/companies/${activeId}`),
      api.get<any>(`/api/v1/companies/${activeId}/analytics`)
    ])
      .then(([companyRes, analyticsRes]) => {
        setDetail(companyRes)
        setAnalytics(analyticsRes)
      })
      .catch(console.error)
      .finally(() => setDetailLoading(false))
  }, [activeId])

  function openTab(company: Company) {
    const label = company.tradeName || company.name || 'Empresa sem nome'
    if (!openTabs.find((t) => t.id === company.id)) {
      setOpenTabs((prev) => [...prev, { id: company.id, label }])
    }
    setActiveId(company.id)
  }

  function closeTab(id: string) {
    const remaining = openTabs.filter((t) => t.id !== id)
    setOpenTabs(remaining)
    setActiveId((prev) => {
      if (prev !== id) return prev
      return remaining.length > 0 ? remaining[remaining.length - 1].id : null
    })
  }

  function handleCreated(company: Company) {
    setCompanies((prev) => [company, ...prev])
    openTab(company)
  }

  const subTabs = [
    { id: 'visao-geral', label: 'Visão Geral', icon: Activity },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
    { id: 'oportunidades', label: 'Oportunidades', icon: Target },
    { id: 'contatos', label: 'Contatos', icon: Users },
    { id: 'conversas', label: 'Conversas', icon: MessageCircle },
    { id: 'atividades', label: 'Atividades', icon: Clock },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'dados', label: 'Dados Cadastrais', icon: Building2 },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#fff' }}>
      {/* Sidebar de Lista de Empresas */}
      <div style={{ width: 320, borderRight: '1px solid rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: 0 }}>Empresas B2B</h2>
          <button 
            onClick={() => setShowModal(true)}
            style={{ padding: '6px 12px', backgroundColor: '#F2E600', color: '#111', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            + Nova
          </button>
        </div>
        <div style={{ padding: '12px 16px' }}>
          <input
            type="text"
            placeholder="Buscar CNPJ, nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px', fontSize: 13,
              border: '1px solid rgba(0,0,0,0.12)', borderRadius: 6,
              outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <p style={{ padding: 16, fontSize: 13, color: '#888', textAlign: 'center' }}>Carregando...</p>
          ) : companies.length === 0 ? (
            <p style={{ padding: 16, fontSize: 13, color: '#888', textAlign: 'center' }}>Nenhuma empresa encontrada.</p>
          ) : (
            companies.map(c => (
              <div 
                key={c.id} 
                onClick={() => openTab(c)}
                style={{ 
                  padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer',
                  backgroundColor: activeId === c.id ? '#f3f4f6' : 'transparent', transition: 'background-color 0.1s'
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111', marginBottom: 4 }}>
                  {c.tradeName || c.name}
                </div>
                {c.cnpj && (
                  <div style={{ fontSize: 12, color: '#666' }}>CNPJ: {c.cnpj}</div>
                )}
                {c.farmLocation && (
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} /> {c.farmLocation}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Area: Abas + 360 View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Tabs */}
        <div style={{
          display: 'flex', alignItems: 'center',
          height: 42, flexShrink: 0,
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          backgroundColor: '#fafafa',
          paddingLeft: 8, overflowX: 'auto',
        }}>
          {openTabs.length === 0 && (
            <p style={{ fontSize: 13, color: '#ccc', margin: '0 16px' }}>Nenhuma empresa selecionada</p>
          )}
          {openTabs.map((tab) => {
            const isActive = tab.id === activeId
            return (
              <div
                key={tab.id}
                onClick={() => setActiveId(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0 12px 0 14px', height: '100%',
                  cursor: 'pointer', flexShrink: 0, userSelect: 'none',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#111' : '#888',
                  backgroundColor: isActive ? '#fff' : 'transparent',
                  borderTop: isActive ? '2px solid #F2E600' : '2px solid transparent',
                  borderRight: '1px solid rgba(0,0,0,0.05)',
                  borderLeft: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.1s',
                }}
              >
                <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tab.label}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 2, display: 'flex', borderRadius: 3, color: '#bbb',
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Company 360 Content */}
        {detailLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#888' }}>Carregando dados da empresa...</p>
          </div>
        ) : !detail ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
              <Building2 size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p style={{ fontSize: 14 }}>Selecione uma empresa para visualizar o Customer 360</p>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
            
            {/* Header 360 */}
            <div style={{ padding: '24px 32px', backgroundColor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>
                    {detail.tradeName || detail.name}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#6b7280', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={14} /> {detail.name} (Razão Social)</span>
                    {detail.cnpj && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={14} /> {detail.cnpj}</span>}
                    {detail.farmLocation && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {detail.farmLocation}</span>}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>Ativa</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', backgroundColor: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                  <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', backgroundColor: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Target size={14} /> + Oportunidade
                  </button>
                  <button style={{ padding: '8px 16px', border: 'none', backgroundColor: '#F2E600', color: '#111', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} /> Agendar
                  </button>
                </div>
              </div>

              {/* KPIs Header */}
              <div style={{ display: 'flex', gap: 32, marginTop: 24, padding: '16px 0 0', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Total Comprado (Histórico)</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{analytics?.totalRevenue ? `R$ ${analytics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Pedidos</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{analytics?.totalOrders || 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Ticket Médio</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{analytics?.ticketMedio ? `R$ ${analytics.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Última Compra</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{analytics?.lastPurchase ? new Date(analytics.lastPurchase).toLocaleDateString('pt-BR') : '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Pipeline Aberto</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{analytics?.openPipelineCount || 0} op.</div>
                </div>
              </div>
            </div>

            {/* Sub Tabs Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.07)', backgroundColor: '#fff', padding: '0 32px' }}>
              {subTabs.map(tab => (
                <div
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  style={{
                    padding: '12px 16px', fontSize: 13, fontWeight: activeSubTab === tab.id ? 600 : 500,
                    color: activeSubTab === tab.id ? '#111' : '#6b7280',
                    borderBottom: activeSubTab === tab.id ? '2px solid #111' : '2px solid transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
                  }}
                >
                  <tab.icon size={14} /> {tab.label}
                </div>
              ))}
            </div>

            {/* Sub Tab Content */}
            <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
              {activeSubTab === 'visao-geral' && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0 }}>Visão Geral em Construção</h3>
                  <p style={{ color: '#666', fontSize: 14 }}>Esta área concentrará os comparativos (Fase 2) e os alertas preditivos (Fase 3).</p>
                </div>
              )}
              {activeSubTab === 'dados' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 0, marginBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: 8 }}>Informações Legais</h3>
                    <div style={{ display: 'grid', gap: 12, fontSize: 13 }}>
                      <div><span style={{ color: '#666', display: 'block', marginBottom: 2 }}>Razão Social</span> <strong>{detail.name}</strong></div>
                      <div><span style={{ color: '#666', display: 'block', marginBottom: 2 }}>CNPJ</span> <strong>{detail.cnpj || '-'}</strong></div>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 0, marginBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: 8 }}>Contato e Localização</h3>
                    <div style={{ display: 'grid', gap: 12, fontSize: 13 }}>
                      <div><span style={{ color: '#666', display: 'block', marginBottom: 2 }}>Email</span> <strong>{detail.email || '-'}</strong></div>
                      <div><span style={{ color: '#666', display: 'block', marginBottom: 2 }}>Telefone</span> <strong>{detail.phone || '-'}</strong></div>
                      <div><span style={{ color: '#666', display: 'block', marginBottom: 2 }}>Fazenda</span> <strong>{detail.farmLocation || '-'}</strong></div>
                    </div>
                  </div>
                </div>
              )}
              {activeSubTab === 'contatos' && (
                <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'left', color: '#666' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 500 }}>Nome</th>
                        <th style={{ padding: '12px 16px', fontWeight: 500 }}>Cargo</th>
                        <th style={{ padding: '12px 16px', fontWeight: 500 }}>Telefone / WhatsApp</th>
                        <th style={{ padding: '12px 16px', fontWeight: 500 }}>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.contacts?.length > 0 ? detail.contacts.map((c: any) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.name}</td>
                          <td style={{ padding: '12px 16px' }}>{c.role || '-'}</td>
                          <td style={{ padding: '12px 16px' }}>{c.whatsapp || '-'}</td>
                          <td style={{ padding: '12px 16px' }}>{c.email || '-'}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#888' }}>Nenhum contato cadastrado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Outras abas usarão placeholders ou lógica similar no futuro */}
              {['pedidos', 'oportunidades', 'conversas', 'atividades', 'agenda', 'relatorios', 'timeline'].includes(activeSubTab) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#888', backgroundColor: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)' }}>
                  Módulo de {subTabs.find(t => t.id === activeSubTab)?.label} em fase de integração.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <NewCompanyModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreated}
        />
      )}
    </div>
  )
}
