import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { api } from '@/lib/api'
import { COMPANY_FARM_SIZES, type Company } from '@/types'
import { COMPANY_FARM_SIZE_LABELS } from '@/lib/domainLabels'

interface Props {
  onClose:  () => void
  onCreate: (company: Company) => void
}

export default function NewCompanyModal({ onClose, onCreate }: Props) {
  const [form, setForm] = useState({
    name: '', cnpj: '', email: '', phone: '', notes: '',
    farm_location: '', farm_size: '', commercial_group_id: '', parent_company_id: '',
  })
  const [saving, setSaving] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [isCnpjVerified, setIsCnpjVerified] = useState(false)

  const [groups, setGroups] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])

  
  useEffect(() => {
    api.get<any[]>('/api/v1/commercial-groups').then(res => setGroups(res)).catch(() => {})
    api.get<any[]>('/api/v1/companies').then(res => setCompanies(res)).catch(() => {})
  }, [])


  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  async function handleCnpjLookup() {
    if (!form.cnpj.trim()) { setError('Informe o CNPJ para buscar'); return }
    setLookingUp(true)
    setError(null)
    try {
      const data = await api.post<any>('/api/v1/companies/lookup-cnpj', { cnpj: form.cnpj.trim() })
      setForm(prev => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
      }))
      setIsCnpjVerified(true)
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Este CNPJ já está cadastrado.')
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao buscar CNPJ')
      }
    } finally {
      setLookingUp(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório'); return }
    setSaving(true)
    try {
      const company = await api.post<Company>('/api/v1/companies', {
        name:          form.name.trim(),
        cnpj:          form.cnpj.trim()  || null,
        email:         form.email.trim() || null,
        phone:         form.phone.trim() || null,
        notes:         form.notes.trim() || null,
        farm_location: form.farm_location.trim() || null,
        farm_size:     form.farm_size || null,
        commercialGroupId: form.commercial_group_id || null,
        parentCompanyId: form.parent_company_id || null,
      })
      onCreate(company)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar empresa')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', fontSize: 14, color: '#111',
    border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7,
    outline: 'none', backgroundColor: '#f9fafb', fontFamily: 'inherit',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 440, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: 0 }}>Nova empresa</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>CNPJ (Busca Automática)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={inputStyle} type="text" value={form.cnpj} onChange={(e) => { set('cnpj', e.target.value); setIsCnpjVerified(false); }} placeholder="00.000.000/0000-00" />
              <button 
                type="button" 
                onClick={handleCnpjLookup} 
                disabled={lookingUp}
                style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7, cursor: lookingUp ? 'not-allowed' : 'pointer' }}
              >
                {lookingUp ? '...' : <Search size={16} />}
              </button>
            </div>
            {isCnpjVerified && <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'block' }}>Dados consultados com sucesso.</span>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
              Nome / Razão Social <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input style={inputStyle} type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nome da empresa" />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Email</label>
            <input style={inputStyle} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="contato@empresa.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Telefone</label>
            <input style={inputStyle} type="text" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(85) 99999-9999" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Localização da fazenda</label>
            <input style={inputStyle} type="text" value={form.farm_location} onChange={(e) => set('farm_location', e.target.value)} placeholder="Ex: Aracati/CE" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Porte da fazenda</label>
            <select
              value={form.farm_size}
              onChange={(e) => set('farm_size', e.target.value)}
              style={{ ...inputStyle, appearance: 'auto' }}
            >
              <option value="">Não informado</option>
              {COMPANY_FARM_SIZES.map((s) => (
                <option key={s} value={s}>{COMPANY_FARM_SIZE_LABELS[s]}</option>
              ))}
            </select>
          </div>

          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Grupo Comercial (Opcional)</label>
            <select
              value={form.commercial_group_id}
              onChange={(e) => set('commercial_group_id', e.target.value)}
              style={{ ...inputStyle, appearance: 'auto' }}
            >
              <option value="">Nenhum grupo</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Empresa Matriz (Opcional)</label>
            <select
              value={form.parent_company_id}
              onChange={(e) => set('parent_company_id', e.target.value)}
              style={{ ...inputStyle, appearance: 'auto' }}
            >
              <option value="">Nenhuma (Esta é a matriz)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 16px', fontSize: 14, fontWeight: 500, color: '#6b7280', backgroundColor: '#f3f4f6', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ padding: '9px 16px', fontSize: 14, fontWeight: 500, color: '#111', backgroundColor: '#F2E600', border: 'none', borderRadius: 7, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Salvando...' : 'Criar empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
