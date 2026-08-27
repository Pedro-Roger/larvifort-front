const BASE_URL = import.meta.env.VITE_API_URL as string

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    // Achado corrigido nesta sessão: todas as rotas do backend
    // (routes/*.ts) respondem erro como `{ error: "..." }`, nunca
    // `{ message: "..." }` — a mensagem real nunca chegava até aqui, sempre
    // caía no fallback genérico "HTTP <status>". Aceita os dois formatos.
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
