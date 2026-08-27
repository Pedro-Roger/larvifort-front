import type { UserRole } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL as string

export interface LoginResult {
  user: {
    id: string
    name: string | null
    email: string
    // Bloco 4: `role` era 'owner' | 'member' aqui — resquício de herança do
    // melao-gestor, nunca corresponderam a nenhum valor real retornado por
    // este backend (auth.config.ts sempre retorna 'comercial' | 'gestor',
    // ver schema.sql). Corrigido para o enum de verdade.
    role: UserRole
    organizationId: string
  }
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`, { credentials: 'include' })
  if (!csrfRes.ok) throw new Error('Falha ao iniciar autenticação')
  const { csrfToken } = await csrfRes.json() as { csrfToken: string }

  const body = new URLSearchParams({ csrfToken, email, password, redirect: 'false' })
  await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    credentials: 'include',
  })

  const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, { credentials: 'include' })
  const session = await sessionRes.json() as { user?: LoginResult['user'] }

  if (!session?.user?.id) throw new Error('Email ou senha inválidos')

  return { user: session.user }
}

export async function logout(): Promise<void> {
  // A action "signout" do Auth.js v5 valida CSRF antes de invalidar a sessão —
  // sem csrfToken no body, lança MissingCSRF e o cookie de sessão nunca é limpo
  // no servidor. Mesmo passo usado no login: buscar o token antes do POST.
  //
  // Envolvido em try/catch (espelhando authClient.ts do mobile): falha de rede
  // aqui não pode travar o logout local — os call sites em AppSidebar/AppLayout
  // limpam o estado local e navegam para /login logo em seguida.
  try {
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`, { credentials: 'include' })
    if (!csrfRes.ok) return
    const { csrfToken } = await csrfRes.json() as { csrfToken: string }

    await fetch(`${BASE_URL}/api/auth/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ csrfToken }).toString(),
      credentials: 'include',
    })
  } catch {
    // Falha de rede no logout não deve travar o usuário na tela autenticada.
  }
}
