import { useEffect, useLayoutEffect, useRef } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL as string

// Lista default cobre inbox/conversas; o board (PipelinePage) passa a
// própria lista (order_created/order_updated/order_stage_changed/stage_*)
// sem precisar dar subscribe em tudo. SSE heartbeat vem do backend a cada
// 30s (routes/events.ts), então EventSource reconecta sozinho.
export function useSSE(
  onEvent: (event: string, data: unknown) => void,
  events: string[] = ['new_message', 'conversation_updated'],
) {
  const callbackRef = useRef(onEvent)

  // Mantém a ref sincronizada sem mutar durante a renderização (evita
  // comportamento indefinido sob concurrent rendering).
  useLayoutEffect(() => {
    callbackRef.current = onEvent
  })

  // Stable-join por string pra não reabrir a conexão a cada render quando
  // o chamador passa array literal (PipelinePage usa lista literal de
  // eventos do board).
  const eventsKey = events.join(',')

  useEffect(() => {
    const es = new EventSource(`${BASE_URL}/api/events`, { withCredentials: true })

    const handle = (eventName: string) => (e: MessageEvent) => {
      try {
        callbackRef.current(eventName, JSON.parse(e.data as string))
      } catch {
        // ignora erros de parse
      }
    }

    for (const name of eventsKey.split(',')) {
      es.addEventListener(name, handle(name))
    }

    return () => es.close()
  }, [eventsKey])
}
