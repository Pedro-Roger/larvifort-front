import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Client, Order, OrderAlert, Reminder } from '@/types'
import {
  ACTIVITY_STATE_COLORS,
  ACTIVITY_TYPE_LABELS,
  ORDER_ALERT_TYPE_COLORS,
  ORDER_ALERT_TYPE_LABELS,
} from '@/lib/domainLabels'
import { formatDate, formatMillions } from '@/lib/format'
import NewReminderModal from '@/components/agenda/NewReminderModal'
import OrderDetailPanel from '@/components/orders/OrderDetailPanel'
import { useAuthStore } from '@/store/auth'

// Módulo de Agenda (Bloco 5, spec seção 3): "Compromissos comerciais.
// Ligações, reuniões, visitas e tarefas. Confirmações e previsões de
// entrega. Alertas gerados pelo planejamento." Interpretado como lista
// agrupada por dia (não um calendário visual completo, ver diário do
// projeto) — atende "visão de compromissos" sem introduzir um padrão de UI
// novo (grade de calendário) que nenhuma outra tela do projeto usa.

function startOfWeek(date: Date): Date {
  // Semana começando na segunda-feira (padrão comercial BR), zerado no
  // início do dia local.
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

function formatDayHeader(key: string): string {
  const d = new Date(`${key}T00:00:00`)
  const label = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function AgendaPage() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [reminders, setReminders]         = useState<Reminder[]>([])
  const [remindersLoading, setRemindersLoading] = useState(true)
  const [alerts, setAlerts]               = useState<OrderAlert[]>([])
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [clients, setClients]             = useState<Client[]>([])
  const [orders, setOrders]               = useState<Order[]>([])
  const [showDone, setShowDone]           = useState(false)
  const [showNewModal, setShowNewModal]   = useState(false)
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const [togglingId, setTogglingId]       = useState<string | null>(null)

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])

  const fetchReminders = useCallback((from: Date, to: Date, ignoreRef: { current: boolean }) => {
    setRemindersLoading(true)
    const params = new URLSearchParams({ from: from.toISOString(), to: addDays(to, 1).toISOString() })
    api.get<Reminder[]>(`/api/v1/reminders?${params.toString()}`)
      .then((data) => { if (!ignoreRef.current) setReminders(data) })
      .catch((err) => { if (!ignoreRef.current) toast.error(err instanceof Error ? err.message : 'Erro ao carregar a agenda') })
      .finally(() => { if (!ignoreRef.current) setRemindersLoading(false) })
  }, [])

  useEffect(() => {
    const ignoreRef = { current: false }
    // Mesmo padrão de PipelinePage/AppPage (setTimeout(...,0) + ignoreRef)
    // para não disparar setState de forma síncrona dentro do corpo do effect.
    const timer = setTimeout(() => fetchReminders(weekStart, weekEnd, ignoreRef), 0)
    return () => { clearTimeout(timer); ignoreRef.current = true }
  }, [weekStart, weekEnd, fetchReminders])

  const fetchAlerts = useCallback((ignoreRef: { current: boolean }) => {
    setAlertsLoading(true)
    api.get<OrderAlert[]>('/api/v1/orders/alerts')
      .then((data) => { if (!ignoreRef.current) setAlerts(data) })
      .catch((err) => { if (!ignoreRef.current) toast.error(err instanceof Error ? err.message : 'Erro ao carregar alertas de planejamento') })
      .finally(() => { if (!ignoreRef.current) setAlertsLoading(false) })
  }, [])

  useEffect(() => {
    const ignoreRef = { current: false }
    const timer = setTimeout(() => fetchAlerts(ignoreRef), 0)
    return () => { clearTimeout(timer); ignoreRef.current = true }
  }, [fetchAlerts])

  // Cliente/Pedido vinculados são buscados uma vez (não por item da lista)
  // só para resolver o rótulo exibido ao lado de cada atividade vinculada —
  // mesmas listas que NewReminderModal já busca sob demanda, aqui carregadas
  // de saída porque a Agenda sempre pode ter itens vinculados para exibir.
  useEffect(() => {
    api.get<Client[]>('/api/v1/clients').then(setClients).catch(console.error)
    api.get<Order[]>('/api/v1/orders').then(setOrders).catch(console.error)
  }, [])

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])
  const orderById   = useMemo(() => new Map(orders.map((o) => [o.id, o])), [orders])

  function handleCreated(reminder: Reminder) {
    const inRange = reminder.dueAt >= weekStart.toISOString() && reminder.dueAt <= addDays(weekEnd, 1).toISOString()
    if (inRange) {
      setReminders((prev) => [...prev, reminder].sort((a, b) => a.dueAt.localeCompare(b.dueAt)))
    } else {
      toast.success('Atividade criada — fora da semana em exibição, navegue até a data para vê-la.')
    }
  }

  async function handleToggleState(reminder: Reminder) {
    const nextState = reminder.state === 'concluida' ? 'pendente' : 'concluida'
    setTogglingId(reminder.id)
    try {
      const updated = await api.patch<Reminder>(`/api/v1/reminders/${reminder.id}`, { state: nextState })
      setReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar atividade')
    } finally {
      setTogglingId(null)
    }
  }

  function handleOrderUpdated(order: Order) {
    setAlerts((prev) => prev.map((a) => (a.order.id === order.id ? { ...a, order } : a)))
  }

  function handleCloseDetail() {
    setDetailOrderId(null)
    // Estado de planejamento pode ter mudado (ex: retry de sincronização) —
    // refaz a busca de alertas pra não deixar um alerta já resolvido preso
    // na tela (mais simples e correto do que recalcular alertType no
    // cliente a partir de um Order parcialmente atualizado).
    const ignoreRef = { current: false }
    fetchAlerts(ignoreRef)
  }

  const visibleReminders = showDone ? reminders : reminders.filter((r) => r.state !== 'concluida')

  const groups = useMemo(() => {
    const map = new Map<string, Reminder[]>()
    for (const r of visibleReminders) {
      const key = dayKey(r.dueAt)
      const list = map.get(key) ?? []
      list.push(r)
      map.set(key, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [visibleReminders])

  const weekLabel = `${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`

  const linkedLabel = (r: Reminder): string | null => {
    if (r.linkedType === 'client' && r.linkedId) {
      const c = clientById.get(r.linkedId)
      return c ? `Cliente: ${c.name ?? c.whatsapp ?? 'Sem nome'}` : null
    }
    if (r.linkedType === 'order' && r.linkedId) {
      const o = orderById.get(r.linkedId)
      return o ? `Pedido: ${o.client?.name ?? 'Cliente removido'} · ${o.product}` : null
    }
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#fafafa' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.07)',
        backgroundColor: '#fff', flexShrink: 0, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} title="Voltar ao CRM" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
            <ArrowLeft size={18} color="#666" />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>Agenda</h1>
          {role === 'comercial' && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#888', backgroundColor: '#f3f4f6',
              borderRadius: 10, padding: '3px 9px',
            }}>
              Minha carteira
            </span>
          )}
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#111',
            backgroundColor: '#F2E600', border: 'none', borderRadius: 7, cursor: 'pointer',
          }}
        >
          <Plus size={14} /> Nova atividade
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Alertas de planejamento */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={14} color="#d97706" />
            <p style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
              Alertas de planejamento
            </p>
          </div>

          {alertsLoading && <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Carregando alertas...</p>}

          {!alertsLoading && alerts.length === 0 && (
            <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Nenhum alerta de planejamento no momento.</p>
          )}

          {!alertsLoading && alerts.length > 0 && (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {alerts.map(({ alertType, order, planning }) => (
                <button
                  key={order.id}
                  onClick={() => setDetailOrderId(order.id)}
                  style={{
                    flexShrink: 0, width: 240, textAlign: 'left', cursor: 'pointer',
                    backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10,
                    padding: 12, display: 'flex', flexDirection: 'column', gap: 6,
                  }}
                >
                  <span style={{
                    alignSelf: 'flex-start', fontSize: 10, fontWeight: 600, color: '#fff',
                    borderRadius: 10, padding: '2px 8px', backgroundColor: ORDER_ALERT_TYPE_COLORS[alertType],
                  }}>
                    {ORDER_ALERT_TYPE_LABELS[alertType]}
                  </span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>
                    {order.client?.name ?? 'Cliente removido'}
                  </p>
                  <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{order.product} · {formatMillions(order.quantityMillions)}</p>
                  {planning.expectedDate && (
                    <p style={{ fontSize: 11, color: '#999', margin: 0 }}>Previsão: {formatDate(planning.expectedDate)}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Navegação de período */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setWeekStart((prev) => addDays(prev, -7))}
                title="Semana anterior"
                style={{ width: 28, height: 28, borderRadius: 6, border: 'none', backgroundColor: '#f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={14} color="#555" />
              </button>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111', minWidth: 130, textAlign: 'center' }}>{weekLabel}</span>
              <button
                onClick={() => setWeekStart((prev) => addDays(prev, 7))}
                title="Próxima semana"
                style={{ width: 28, height: 28, borderRadius: 6, border: 'none', backgroundColor: '#f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={14} color="#555" />
              </button>
              <button
                onClick={() => setWeekStart(startOfWeek(new Date()))}
                style={{ fontSize: 11, fontWeight: 600, color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
              >
                Hoje
              </button>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666', cursor: 'pointer' }}>
              <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
              Mostrar concluídas
            </label>
          </div>

          {remindersLoading && <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Carregando compromissos...</p>}

          {!remindersLoading && groups.length === 0 && (
            <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Nenhum compromisso nesta semana.</p>
          )}

          {!remindersLoading && groups.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {groups.map(([key, items]) => (
                <div key={key}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 6px' }}>
                    {formatDayHeader(key)}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {items.map((r) => {
                      const link = linkedLabel(r)
                      const isDone = r.state === 'concluida'
                      return (
                        <div
                          key={r.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 8,
                            padding: '10px 12px',
                          }}
                        >
                          <button
                            onClick={() => handleToggleState(r)}
                            disabled={togglingId === r.id}
                            title={isDone ? 'Marcar como pendente' : 'Marcar como concluída'}
                            style={{
                              width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                              border: `2px solid ${ACTIVITY_STATE_COLORS[r.state]}`,
                              backgroundColor: isDone ? ACTIVITY_STATE_COLORS[r.state] : 'transparent',
                              cursor: togglingId === r.id ? 'not-allowed' : 'pointer',
                            }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 60, flexShrink: 0 }}>
                            <Clock size={11} color="#bbb" />
                            <span style={{ fontSize: 11, color: '#999' }}>
                              {new Date(r.dueAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: 13, fontWeight: 500, color: isDone ? '#aaa' : '#111', margin: 0,
                              textDecoration: isDone ? 'line-through' : 'none',
                            }}>
                              {r.title}
                            </p>
                            {link && (
                              <button
                                onClick={() => r.linkedType === 'order' && r.linkedId && setDetailOrderId(r.linkedId)}
                                style={{
                                  background: 'none', border: 'none', padding: 0, marginTop: 2,
                                  fontSize: 11, color: '#999', cursor: r.linkedType === 'order' ? 'pointer' : 'default',
                                  textDecoration: r.linkedType === 'order' ? 'underline' : 'none',
                                }}
                              >
                                {link}
                              </button>
                            )}
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 600, color: '#666', backgroundColor: '#f3f4f6',
                            borderRadius: 8, padding: '2px 8px', flexShrink: 0,
                          }}>
                            {ACTIVITY_TYPE_LABELS[r.type]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showNewModal && (
        <NewReminderModal onClose={() => setShowNewModal(false)} onCreate={handleCreated} />
      )}

      {detailOrderId && (
        <OrderDetailPanel
          orderId={detailOrderId}
          onClose={handleCloseDetail}
          onUpdate={handleOrderUpdated}
        />
      )}
    </div>
  )
}
