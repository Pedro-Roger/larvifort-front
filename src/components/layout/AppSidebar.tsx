import { useState } from 'react'
import { LayoutDashboard, Users, MessageCircle, Target, BarChart, ChevronLeft, ChevronRight, LogOut, GitBranch, Sun, Moon } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { logout } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'

export default function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, clearAuth } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    await logout()
    clearAuth()
    navigate('/login')
  }

  const initial = (user?.name ?? user?.email ?? 'M').charAt(0).toUpperCase()

  const navItems = [
    { path: '/empresas', match: ['/empresas', '/'], icon: Users, label: 'Clientes' },
    { path: '/projects', match: ['/projects', '/kanban'], icon: GitBranch, label: 'Projetos' },
    { path: '/dashboard', match: ['/dashboard'], icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/whatsapp', match: ['/whatsapp'], icon: MessageCircle, label: 'WhatsApp' },
    { path: '/pedidos', match: ['/pedidos'], icon: Target, label: 'Pedidos' },
    { path: '/metas', match: ['/metas'], icon: BarChart, label: 'Metas' },
  ]

  return (
    <aside
      className={cn(
        'flex flex-col h-screen z-50 transition-all duration-200 ease-in-out flex-shrink-0',
        'bg-[hsl(222,47%,11%)] backdrop-blur-xl',
        collapsed ? 'w-16' : 'w-[260px]'
      )}
    >
      {/* Logo / User Header */}
      <div className={cn(
        'flex items-center gap-3 border-b border-white/10',
        collapsed ? 'justify-center px-2 py-4' : 'px-4 py-5'
      )}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">{initial}</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {user?.name || user?.email || 'Usuário'}
            </div>
            <div className="text-xs text-slate-400">CRM AquaFort</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 overflow-y-auto py-3', collapsed ? 'px-2' : 'px-3')}>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.match.some(m => location.pathname === m || location.pathname.startsWith(m + '/'))
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
                  collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon size={18} className={cn(isActive ? 'text-white' : 'text-slate-500')} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn('border-t border-white/10 py-3', collapsed ? 'px-2' : 'px-3')}>
        <button
          onClick={toggleTheme}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
            'text-slate-400 hover:bg-white/5 hover:text-white',
            collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
          )}
        >
          {theme === 'light' ? <Moon size={18} className="text-slate-500" /> : <Sun size={18} className="text-slate-500" />}
          {!collapsed && <span>{theme === 'light' ? 'Modo escuro' : 'Modo claro'}</span>}
        </button>

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
            'text-slate-400 hover:bg-white/5 hover:text-white',
            collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
          )}
        >
          <LogOut size={18} className="text-slate-500" />
          {!collapsed && <span>Sair</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
            'text-slate-500 hover:bg-white/5 hover:text-slate-300',
            collapsed ? 'justify-center px-2 py-2.5 mt-1' : 'px-3 py-2.5 mt-1 justify-between'
          )}
        >
          {!collapsed && <span>Recolher</span>}
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}
