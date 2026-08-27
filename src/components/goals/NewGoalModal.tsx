import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { api } from '@/lib/api'
import type { Goal, OrgUser } from '@/types'

interface Props {
  onClose: () => void
  onSaved: (goal: Goal) => void
  // Presente = edição (PATCH /goals/:id); ausente = criação (POST /goals).
  goal?: Goal
}

// Formulário de criação/edição de Meta (módulo de Metas, Bloco 6). Mesmo
// padrão inline (inputStyle/labelStyle) já usado em NewClientModal/
// NewOrderModal/NewReminderModal. Diferente desses três: aqui NÃO existe
// variação de campos por papel — o backend só permite `gestor` chamar
// POST/PATCH/DELETE /goals (requireGestor em routes/goals.ts, ver diário do
// Bloco 6), então este modal só é aberto pelo gestor (GoalsPage nem
// renderiza o botão "Nova meta"/ícone de editar para comercial) e sempre
// mostra o select de vendedor — não há "comercial cria a própria meta" como
// existe em Cliente/Pedido/Atividade.
export default function NewGoalModal({ onClose, onSaved, goal }: Props) {
  const isEditing = !!goal
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([])
  const [form, setForm] = useState({
    user_id: goal?.userId ?? '',
    // <input type="month"> trabalha com "YYYY-MM" — goal.period chega como
    // "YYYY-MM-DD" (sempre dia 1), truncado aqui.
    period: goal ? goal.period.slice(0, 7) : '',
    revenue_target: goal ? String(goal.revenueTarget) : '',
    volume_target_millions: goal ? String(goal.volumeTargetMillions) : '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    api.get<OrgUser[]>('/api/v1/users').then(setOrgUsers).catch(console.error)
  }, [])

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.user_id) { setError('Vendedor é obrigatório'); return }
    if (!form.period) { setError('Período é obrigatório'); return }
    const revenue = Number(form.revenue_target)
    if (!form.revenue_target || !Number.isFinite(revenue) || revenue <= 0) {
      setError('Objetivo de receita deve ser um número maior que zero')
      return
    }
    const volume = Number(form.volume_target_millions)
    if (!form.volume_target_millions || !Number.isFinite(volume) || volume <= 0) {
      setError('Objetivo de volume deve ser um número maior que zero')
      return
    }

    setSaving(true)
    try {
      const body = {
        user_id: form.user_id,
        period: form.period,
        revenue_target: revenue,
        volume_target_millions: volume,
      }
      const saved = isEditing
        ? await api.patch<Goal>(`/api/v1/goals/${goal!.id}`, body)
        : await api.post<Goal>('/api/v1/goals', body)
      onSaved(saved)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar meta')
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
        backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 420,
        maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
            {isEditing ? 'Editar meta' : 'Nova meta'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Vendedor <span style={{ color: '#ef4444' }}>*</span></label>
            <select value={form.user_id} onChange={(e) => set('user_id', e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
              <option value="">Selecione um vendedor</option>
              {orgUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Período <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="month" value={form.period} onChange={(e) => set('period', e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Objetivo de receita (R$) <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="number" min="0" step="0.01" value={form.revenue_target} onChange={(e) => set('revenue_target', e.target.value)} placeholder="Ex: 200000" />
          </div>

          <div>
            <label style={labelStyle}>Objetivo de volume (milhões) <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="number" min="0" step="0.01" value={form.volume_target_millions} onChange={(e) => set('volume_target_millions', e.target.value)} placeholder="Ex: 10" />
          </div>

          {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 16px', fontSize: 14, fontWeight: 500, color: '#6b7280', backgroundColor: '#f3f4f6', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ padding: '9px 16px', fontSize: 14, fontWeight: 500, color: '#111827', backgroundColor: '#F2E600', border: 'none', borderRadius: 7, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
