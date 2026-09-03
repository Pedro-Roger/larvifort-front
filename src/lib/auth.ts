import type { UserRole } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL as string

export interface LoginResult {
  user: {
    id: string
    name: string | null
    email: string
    role: UserRole
    organizationId: string
  }
  accessToken: string
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const parsed = err as { error?: string; message?: string }
    throw new Error(parsed.error ?? parsed.message ?? 'Credenciais inválidas')
  }

  const data = await res.json() as LoginResult

  localStorage.setItem('access_token', data.accessToken)

  return data
}

export async function logout(): Promise<void> {
  localStorage.removeItem('access_token')
}
