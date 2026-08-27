import { Plus, Users, Bell, Settings, ShoppingCart, CalendarClock, Target, Cable, LayoutDashboard, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { logout } from '@/lib/auth'
import type { Company } from '@/types'
import { USER_ROLE_LABELS } from '@/lib/domainLabels'

const COMPANY_COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#ea580c']

export type SidebarView = 'company' | 'all-clients' | 'reminders'

interface Props {
  companies:          Company[]
  sidebarView:        SidebarView
  selectedCompanyId:  string | null
  onSelectCompany:    (id: string) => void
  onViewAllClients:   () => void
  onViewReminders:    () => void
  onAddCompany:       () => void
}

export default function AppSidebar({
  companies, sidebarView, selectedCompanyId,
  onSelectCompany, onViewAllClients, onViewReminders, onAddCompany,
}: Props) {
  const navigate   = useNavigate()
  const { user, clearAuth } = useAuthStore()

  async function handleLogout() {
    await logout()
    clearAuth()
    navigate('/login')
  }

  const initial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()
  const identityLabel = user
    ? `${user.name ?? user.email} · ${USER_ROLE_LABELS[user.role]}`
    : ''

  const iconBtn = (active: boolean, onClick: () => void, title: string, children: React.ReactNode) => (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 36, height: 36, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', cursor: 'pointer', flexShrink: 0,
        backgroundColor: active ? '#1f1f1f' : 'transparent',
        color: active ? '#F2E600' : '#666',
      }}
    >
      {children}
    </button>
  )

  return (
    <aside style={{
      width: 64, flexShrink: 0,
      backgroundColor: '#111',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 14, paddingBottom: 14, gap: 4,
    }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        backgroundColor: '#F2E600',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: '#111',
        flexShrink: 0, marginBottom: 6, cursor: 'default',
      }}
        title={identityLabel}
      >
        {initial}
      </div>

      <div style={{ width: 34, height: 1, backgroundColor: '#252525', margin: '2px 0 6px' }} />

      {/* Company icons */}
      {companies.map((co, i) => {
        const isActive = sidebarView === 'company' && selectedCompanyId === co.id
        const color    = COMPANY_COLORS[i % COMPANY_COLORS.length]
        return (
          <button
            key={co.id}
            title={co.name}
            onClick={() => onSelectCompany(co.id)}
            style={{
              width: 34, height: 34, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
              backgroundColor: color,
              border: isActive ? '2.5px solid #F2E600' : '2.5px solid transparent',
              cursor: 'pointer', flexShrink: 0, boxSizing: 'border-box',
            }}
          >
            {co.name.charAt(0).toUpperCase()}
          </button>
        )
      })}

      {/* Add company */}
      <button
        title="Adicionar empresa"
        onClick={onAddCompany}
        style={{
          width: 34, height: 34, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px dashed #333', backgroundColor: 'transparent',
          cursor: 'pointer', color: '#555', flexShrink: 0,
        }}
      >
        <Plus size={14} />
      </button>

      <div style={{ width: 34, height: 1, backgroundColor: '#252525', margin: '6px 0' }} />

      {/* Dashboard (Bloco 8) — item de destaque na navegação (decisão de
          produto registrada em pages/DashboardPage.tsx e no diário do
          projeto: não virou rota `/`, mas é o item mais visível do sidebar e
          o destino pós-login). Fundo em accent sempre ligado (não só quando
          ativo, diferente dos outros ícones abaixo via iconBtn) — é a única
          forma de "destaque" sem introduzir badge/texto novo neste sidebar
          só de ícones. */}
      <button
        title="Dashboard"
        onClick={() => navigate('/dashboard')}
        style={{
          width: 34, height: 34, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer', flexShrink: 0,
          backgroundColor: '#F2E600', color: '#111',
        }}
      >
        <LayoutDashboard size={17} />
      </button>

      <div style={{ width: 34, height: 1, backgroundColor: '#252525', margin: '6px 0' }} />

      {iconBtn(sidebarView === 'all-clients', onViewAllClients, 'Todos os clientes', <Users size={17} />)}
      {iconBtn(sidebarView === 'reminders',   onViewReminders,  'Lembretes',         <Bell size={17} />)}
      {/* Pedidos e Agenda são rotas próprias (/pedidos, /agenda — ver
          App.tsx), não um sidebarView interno — navegam pra fora de AppPage
          em vez de mudar view local. "Lembretes" (Bell, acima) continua
          existindo como a lista solta simples já usada dentro da inbox de
          clientes (ClientColumn) — não duplicado nem removido; Agenda
          (Bloco 5) é o módulo novo e mais completo (alertas de planejamento
          + navegação por semana + criação), rota separada por ter layout de
          página próprio, mesmo critério de estrutura já usado para Pedidos. */}
      {iconBtn(false, () => navigate('/pedidos'), 'Pedidos', <ShoppingCart size={17} />)}
      {iconBtn(false, () => navigate('/agenda'), 'Agenda', <CalendarClock size={17} />)}
      {/* Metas (Bloco 6), mesma rota própria de Pedidos/Agenda. */}
      {iconBtn(false, () => navigate('/metas'), 'Metas', <Target size={17} />)}
      {/* Integração (Bloco 7) — exclusivo de gestor (spec seção 2: só ele
          "consulta o estado e o histórico da integração"), item escondido
          para `comercial` (mesmo critério RBAC visual já usado nos módulos
          anteriores). A rota em App.tsx também bloqueia acesso direto por
          URL via ProtectedRoute roles={['gestor']}. */}
      {user?.role === 'gestor' &&
        iconBtn(false, () => navigate('/integracao'), 'Integração', <Cable size={17} />)}
      {user?.role === 'gestor' &&
        iconBtn(false, () => navigate('/whatsapp'), 'WhatsApp', <MessageCircle size={17} />)}

      <div style={{ flex: 1 }} />

      {iconBtn(false, handleLogout, 'Sair', <Settings size={17} />)}
    </aside>
  )
}
