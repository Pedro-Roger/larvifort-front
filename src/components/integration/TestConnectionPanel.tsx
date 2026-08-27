import { useState } from 'react'
import { Zap } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { AQUAFORT_SIMULATED_SCENARIOS, type IntegrationTestConnectionResult } from '@/types'
import { AQUAFORT_SIMULATED_SCENARIO_LABELS } from '@/lib/domainLabels'

const selectStyle: React.CSSProperties = {
  padding: '7px 10px', fontSize: 12, color: '#111827',
  border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7,
  outline: 'none', backgroundColor: '#f9fafb', fontFamily: 'inherit',
}

// "Ação para testar conexão" (spec seção 3). Chama POST
// /api/v1/integration/test-connection (routes/integration.ts) — endpoint
// sem side-effect, não grava nenhum planning (confirmado ao vivo pelo
// dev-backend, ver diário do projeto) — só mostra o resultado via toast.
export default function TestConnectionPanel() {
  const [simulate, setSimulate] = useState('')
  const [testing, setTesting] = useState(false)

  async function handleTest() {
    setTesting(true)
    try {
      const result = await api.post<IntegrationTestConnectionResult>(
        '/api/v1/integration/test-connection',
        simulate ? { simulate } : {}
      )
      if (result.ok) {
        toast.success(`Conexão OK — ${result.message}`)
      } else {
        toast.error(`Falha na conexão — ${result.message}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao testar conexão')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: 16,
    }}>
      <select value={simulate} onChange={(e) => setSimulate(e.target.value)} style={selectStyle}>
        <option value="">Cenário automático</option>
        {AQUAFORT_SIMULATED_SCENARIOS.map((s) => (
          <option key={s} value={s}>{AQUAFORT_SIMULATED_SCENARIO_LABELS[s]}</option>
        ))}
      </select>
      <button
        onClick={handleTest}
        disabled={testing}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#111',
          backgroundColor: '#F2E600', border: 'none', borderRadius: 7,
          cursor: testing ? 'not-allowed' : 'pointer', opacity: testing ? 0.6 : 1,
        }}
      >
        <Zap size={14} /> {testing ? 'Testando...' : 'Testar conexão'}
      </button>
    </div>
  )
}
