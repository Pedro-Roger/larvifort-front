import type { IntegrationStatus } from '@/types'
import {
  INTEGRATION_OVERALL_STATUS_COLORS,
  INTEGRATION_OVERALL_STATUS_LABELS,
  INTEGRATION_SYNC_RESULT_COLORS,
  INTEGRATION_SYNC_RESULT_LABELS,
} from '@/lib/domainLabels'
import { formatDateTime } from '@/lib/format'

interface Props {
  status: IntegrationStatus
}

// Estado agregado da integração (spec seção 3: "Estado da conexão com o
// AquaFort. Data e resultado da última sincronização."). Componente de
// apresentação puro — todo o cálculo (overallStatus/counts/lastSync) já vem
// pronto de GET /api/v1/integration/status (routes/integration.ts), nada
// recalculado aqui.
export default function StatusOverview({ status }: Props) {
  const { overallStatus, lastSync, counts } = status
  const resultLabel = lastSync ? INTEGRATION_SYNC_RESULT_LABELS[lastSync.result] ?? lastSync.result : null
  const resultColor = lastSync ? INTEGRATION_SYNC_RESULT_COLORS[lastSync.result] ?? '#9ca3af' : '#9ca3af'

  const countItems: { label: string; value: number; color: string }[] = [
    { label: 'Total de planejamentos', value: counts.total, color: '#111' },
    { label: 'Confirmada integral', value: counts.confirmadaIntegral, color: '#059669' },
    { label: 'Parcial', value: counts.parcial, color: '#d97706' },
    { label: 'Indisponível', value: counts.indisponivel, color: '#dc2626' },
    { label: 'Sincronização pendente', value: counts.sincronizacaoPendente, color: '#6b7280' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: 16,
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
          backgroundColor: INTEGRATION_OVERALL_STATUS_COLORS[overallStatus],
        }} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>
            {INTEGRATION_OVERALL_STATUS_LABELS[overallStatus]}
          </p>
          <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>
            {lastSync
              ? <>Última sincronização {formatDateTime(lastSync.syncedAt)} · <span style={{ color: resultColor, fontWeight: 600 }}>{resultLabel}</span></>
              : 'Nenhuma sincronização registrada ainda.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {countItems.map((c) => (
          <div key={c.label} style={{
            backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10,
            padding: 12, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{c.value}</span>
            <span style={{ fontSize: 11, color: '#999' }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
