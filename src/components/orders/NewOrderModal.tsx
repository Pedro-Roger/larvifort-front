import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { api } from '@/lib/api'
import { ORDER_PRIORITIES, ORDER_STAGES, type Client, type Order, type OrgUser } from '@/types'
import { ORDER_PRIORITY_LABELS, ORDER_STAGE_LABELS } from '@/lib/domainLabels'
import { useAuthStore } from '@/store/auth'

interface Props {
  onClose:  () => void
  onCreate: (order: Order) => void
}

// Formulário de criação de Pedido, mesmo padrão inline (inputStyle/
// labelStyle) já usado em NewClientModal/NewCompanyModal. "Fluxo guiado"
// (spec seção 8) interpretado aqui como um formulário único, mas organizado
// em blocos claros (cliente/demanda/prioridade) — não um wizard multi-etapa,
// para não introduzir um padrão de UI novo que os outros dois modais não
// têm; decisão registrada no diário do projeto.
//
// `owner_user_id` (responsável comercial) — Bloco 4: mesmo padrão de
// NewClientModal, campo só visível para `gestor` (comercial sempre vira o
// próprio dono no POST, backend ignora silenciosamente qualquer valor
// enviado por ele — resolveOwnerUserIdForCreate).
export default function NewOrderModal({ onClose, onCreate }: Props) {
  const role = useAuthStore((s) => s.user?.role)
  const [clients, setClients]   = useState<Client[]>([])
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([])
  const [form, setForm] = useState({
    client_id: '',
    quantity_millions: '',
    value: '',
    product: '',
    desired_stage: '',
    genetics: '',
    desired_delivery_date: '',
    priority: 'media' as string,
    commercial_stage: 'orcamento' as string,
    notes: '',
    owner_user_id: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    api.get<Client[]>('/api/v1/clients').then(setClients).catch(console.error)
    if (role === 'gestor') {
      api.get<OrgUser[]>('/api/v1/users').then(setOrgUsers).catch(console.error)
    }
  }, [role])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.client_id) { setError('Cliente é obrigatório'); return }
    if (!form.product.trim()) { setError('Produto/espécie é obrigatório'); return }
    const qty = Number(form.quantity_millions)
    if (!form.quantity_millions || !Number.isFinite(qty) || qty <= 0) {
      setError('Quantidade deve ser um número maior que zero')
      return
    }

    setSaving(true)
    try {
      const order = await api.post<Order>('/api/v1/orders', {
        client_id:              form.client_id,
        quantity_millions:      qty,
        value:                  form.value ? Number(form.value) : null,
        product:                form.product.trim(),
        desired_stage:          form.desired_stage.trim() || null,
        genetics:               form.genetics.trim() || null,
        desired_delivery_date:  form.desired_delivery_date || null,
        priority:               form.priority,
        commercial_stage:       form.commercial_stage,
        notes:                  form.notes.trim() || null,
        owner_user_id:          form.owner_user_id || null,
      })
      onCreate(order)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pedido')
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

  const sectionTitle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase',
    letterSpacing: '0.05em', margin: '4px 0 2px',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 480,
        maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Novo pedido</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={sectionTitle}>Cliente</p>
          <div>
            <label style={labelStyle}>Cliente <span style={{ color: '#ef4444' }}>*</span></label>
            <select
              value={form.client_id}
              onChange={(e) => set('client_id', e.target.value)}
              style={{ ...inputStyle, appearance: 'auto' }}
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name ?? c.whatsapp ?? 'Sem nome'}</option>
              ))}
            </select>
            {clients.length === 0 && (
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>
                Nenhum cliente cadastrado ainda. Cadastre um cliente primeiro.
              </p>
            )}
          </div>

          <p style={sectionTitle}>Demanda</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Quantidade (milhões) <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={inputStyle} type="number" min="0" step="0.01" value={form.quantity_millions} onChange={(e) => set('quantity_millions', e.target.value)} placeholder="Ex: 5" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Valor (R$)</label>
              <input style={inputStyle} type="number" min="0" step="0.01" value={form.value} onChange={(e) => set('value', e.target.value)} placeholder="Opcional" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Produto / espécie <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="text" value={form.product} onChange={(e) => set('product', e.target.value)} placeholder="Ex: Litopenaeus vannamei" />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Estágio da larva desejado</label>
              <input style={inputStyle} type="text" value={form.desired_stage} onChange={(e) => set('desired_stage', e.target.value)} placeholder="Ex: PL12" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Genética preferencial</label>
              <input style={inputStyle} type="text" value={form.genetics} onChange={(e) => set('genetics', e.target.value)} placeholder="Ex: linhagem SPF" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Data desejada de entrega</label>
            <input style={inputStyle} type="date" value={form.desired_delivery_date} onChange={(e) => set('desired_delivery_date', e.target.value)} />
          </div>

          <p style={sectionTitle}>Funil</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Prioridade</label>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
                {ORDER_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{ORDER_PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Estágio inicial</label>
              <select value={form.commercial_stage} onChange={(e) => set('commercial_stage', e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
                {ORDER_STAGES.map((s) => (
                  <option key={s} value={s}>{ORDER_STAGE_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          {role === 'gestor' && (
            <div>
              <label style={labelStyle}>Responsável comercial</label>
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
            <label style={labelStyle}>Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Observações operacionais sobre o pedido..."
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
              {saving ? 'Salvando...' : 'Criar pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
