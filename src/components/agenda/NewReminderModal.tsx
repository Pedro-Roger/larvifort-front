import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { api } from '@/lib/api'
import { ACTIVITY_STATES, ACTIVITY_TYPES, type Client, type Order, type OrgUser, type Reminder } from '@/types'
import { ACTIVITY_STATE_LABELS, ACTIVITY_TYPE_LABELS } from '@/lib/domainLabels'
import { useAuthStore } from '@/store/auth'

interface Props {
  onClose:  () => void
  onCreate: (reminder: Reminder) => void
}

type LinkedKind = 'none' | 'client' | 'order'

// Formulário de criação de Atividade/Lembrete (módulo de Agenda, Bloco 5,
// spec seção 3/6: "tipo, responsável, data, descrição e estado", "vínculo
// opcional com cliente ou pedido"). Mesmo padrão inline (inputStyle/
// labelStyle) já usado em NewClientModal/NewOrderModal — não existia
// nenhuma UI de criação de lembrete antes deste bloco (só o CRUD no
// backend), então este é o primeiro consumidor real de POST /api/v1/reminders.
//
// `owner_user_id` (responsável) — mesmo padrão RBAC de NewClientModal/
// NewOrderModal: campo só visível para `gestor` (comercial sempre vira o
// próprio dono no POST, o backend ignora silenciosamente qualquer valor
// enviado por ele — resolveOwnerUserIdForCreate, ver diário do Bloco 5).
export default function NewReminderModal({ onClose, onCreate }: Props) {
  const role = useAuthStore((s) => s.user?.role)
  const [clients, setClients]   = useState<Client[]>([])
  const [orders, setOrders]     = useState<Order[]>([])
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_at: '',
    type: 'tarefa' as string,
    state: 'pendente' as string,
    linked_kind: 'none' as LinkedKind,
    linked_id: '',
    owner_user_id: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    // Cliente/Pedido só são buscados quando o usuário efetivamente escolhe
    // vincular a um (evita 2 chamadas desnecessárias na abertura do modal
    // para quem nunca usa o vínculo) — carregados sob demanda em
    // handleLinkedKindChange.
    if (role === 'gestor') {
      api.get<OrgUser[]>('/api/v1/users').then(setOrgUsers).catch(console.error)
    }
  }, [role])

  function set<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  function handleLinkedKindChange(kind: LinkedKind) {
    set('linked_kind', kind)
    set('linked_id', '')
    if (kind === 'client' && clients.length === 0) {
      api.get<Client[]>('/api/v1/clients').then(setClients).catch(console.error)
    }
    if (kind === 'order' && orders.length === 0) {
      api.get<Order[]>('/api/v1/orders').then(setOrders).catch(console.error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Título é obrigatório'); return }
    if (!form.due_at) { setError('Data é obrigatória'); return }

    setSaving(true)
    try {
      const reminder = await api.post<Reminder>('/api/v1/reminders', {
        title:       form.title.trim(),
        description: form.description.trim() || null,
        // <input type="datetime-local"> devolve hora local sem timezone
        // (ex: "2026-08-25T14:30") — convertida para ISO em UTC antes de
        // enviar, já que due_at é TIMESTAMPTZ no backend.
        due_at:      new Date(form.due_at).toISOString(),
        type:        form.type,
        state:       form.state,
        linked_type: form.linked_kind === 'none' ? null : form.linked_kind,
        linked_id:   form.linked_kind === 'none' ? null : (form.linked_id || null),
        owner_user_id: form.owner_user_id || null,
      })
      onCreate(reminder)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar atividade')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', fontSize: 14, color: '#111827',
    border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7,
    outline: 'none', backgroundColor: '#f9fafb', fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5,
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 440,
        maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Nova atividade</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Título <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="text" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex: Ligar para negociar prazo" />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Tipo</label>
              <select value={form.type} onChange={(e) => set('type', e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>{ACTIVITY_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Estado</label>
              <select value={form.state} onChange={(e) => set('state', e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
                {ACTIVITY_STATES.map((s) => (
                  <option key={s} value={s}>{ACTIVITY_STATE_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Data e hora <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="datetime-local" value={form.due_at} onChange={(e) => set('due_at', e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Vínculo</label>
            <select
              value={form.linked_kind}
              onChange={(e) => handleLinkedKindChange(e.target.value as LinkedKind)}
              style={{ ...inputStyle, appearance: 'auto' }}
            >
              <option value="none">Nenhum</option>
              <option value="client">Cliente</option>
              <option value="order">Pedido</option>
            </select>
          </div>

          {form.linked_kind === 'client' && (
            <div>
              <label style={labelStyle}>Cliente</label>
              <select
                value={form.linked_id}
                onChange={(e) => set('linked_id', e.target.value)}
                style={{ ...inputStyle, appearance: 'auto' }}
              >
                <option value="">Selecione um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name ?? c.whatsapp ?? 'Sem nome'}</option>
                ))}
              </select>
            </div>
          )}

          {form.linked_kind === 'order' && (
            <div>
              <label style={labelStyle}>Pedido</label>
              <select
                value={form.linked_id}
                onChange={(e) => set('linked_id', e.target.value)}
                style={{ ...inputStyle, appearance: 'auto' }}
              >
                <option value="">Selecione um pedido</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>{o.client?.name ?? 'Cliente removido'} · {o.product}</option>
                ))}
              </select>
            </div>
          )}

          {role === 'gestor' && (
            <div>
              <label style={labelStyle}>Responsável</label>
              <select
                value={form.owner_user_id}
                onChange={(e) => set('owner_user_id', e.target.value)}
                style={{ ...inputStyle, appearance: 'auto' }}
              >
                <option value="">Sem responsável</option>
                {orgUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Detalhes da atividade..."
              rows={3}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
            />
          </div>

          {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 16px', fontSize: 14, fontWeight: 500, color: '#6b7280', backgroundColor: '#f3f4f6', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ padding: '9px 16px', fontSize: 14, fontWeight: 500, color: '#111827', backgroundColor: '#F2E600', border: 'none', borderRadius: 7, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Salvando...' : 'Criar atividade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
