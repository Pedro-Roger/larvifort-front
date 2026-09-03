const BASE_URL = import.meta.env.VITE_API_URL as string

function getToken(): string | null {
  try {
    return localStorage.getItem('access_token')
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const parsed = error as { error?: string; message?: string }
    throw new Error(parsed.error ?? parsed.message ?? `HTTP ${response.status}`)
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export type WhatsAppStatus = {
  configured: boolean
  instance: null | {
    id: string
    instanceName: string
    apiUrl: string
    phoneNumber: string | null
    status: string | null
    createdAt: string
  }
  connectionState: string | null
  error: string | null
}

export type WhatsAppQr = {
  base64: string | null
  code: string | null
}

export const whatsappApi = {
  status: () => api.get<WhatsAppStatus>('/api/v1/whatsapp/status'),
  createInstance: () => api.post<{ configured: true; instance: NonNullable<WhatsAppStatus['instance']> }>('/api/v1/whatsapp/instance', {}),
  qr: () => api.get<WhatsAppQr>('/api/v1/whatsapp/qr'),
  testMessage: (number: string, text: string) =>
    api.post<{ ok: true; sentAt: string }>('/api/v1/whatsapp/test-message', { number, text }),
  disconnect: () => api.delete<void>('/api/v1/whatsapp/disconnect'),
}
