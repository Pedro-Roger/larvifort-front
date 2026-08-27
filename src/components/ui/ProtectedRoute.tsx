import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import type { UserRole } from '@/types'

interface Props {
  children: React.ReactNode
  // RBAC de rota (ex: /integracao, exclusivo de gestor — spec seção 2). Só
  // trata o acesso direto por URL (UX): a barreira real continua sendo o
  // backend, que responde 403 nos endpoints do módulo mesmo se alguém
  // burlar esta checagem no cliente.
  roles?: UserRole[]
}

// Rota protegida: redireciona para /login se não houver token, e para / se
// o papel do usuário não estiver na lista de `roles` permitidos.
export default function ProtectedRoute({ children, roles }: Props) {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
