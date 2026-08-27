import type { IntegrationFieldMapping } from '@/types'

interface Props {
  mapping: IntegrationFieldMapping
}

const headerCellStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#999',
  textTransform: 'uppercase', letterSpacing: '0.04em', padding: '8px 12px',
}

const cellStyle: React.CSSProperties = {
  fontSize: 12, color: '#333', padding: '8px 12px', borderTop: '1px solid rgba(0,0,0,0.05)',
}

const tableWrapStyle: React.CSSProperties = {
  backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, overflow: 'hidden',
}

const tableTitleStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: '#555', margin: 0,
  padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)',
}

// "Mapeamento dos campos entre sistemas" (spec seção 3). Dado estático vindo
// de GET /api/v1/integration/field-mapping — decisão do backend (ver diário
// do projeto) de não hardcodar esses nomes de campo aqui, para não divergir
// silenciosamente de services/aquafortAdapter.ts quando o contrato mudar.
// Componente de apresentação puro, sem lógica além do que já vem pronto.
export default function FieldMappingTable({ mapping }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={tableWrapStyle}>
        <p style={tableTitleStyle}>LarviFort envia ao AquaFort</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={headerCellStyle}>Campo</th><th style={headerCellStyle}>Descrição</th></tr>
          </thead>
          <tbody>
            {mapping.outbound.map((f) => (
              <tr key={f.field}>
                <td style={{ ...cellStyle, fontFamily: 'monospace', color: '#666' }}>{f.field}</td>
                <td style={cellStyle}>{f.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={tableWrapStyle}>
        <p style={tableTitleStyle}>AquaFort retorna ao LarviFort</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Campo</th>
              <th style={headerCellStyle}>Descrição</th>
              <th style={headerCellStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {mapping.inbound.map((f) => (
              <tr key={f.label}>
                <td style={{ ...cellStyle, fontFamily: 'monospace', color: '#666' }}>{f.field ?? '—'}</td>
                <td style={cellStyle}>{f.label}</td>
                <td style={cellStyle}>
                  {f.implemented
                    ? <span style={{ fontSize: 10, fontWeight: 600, color: '#059669' }}>Implementado</span>
                    : <span style={{ fontSize: 10, fontWeight: 600, color: '#d97706' }}>Não implementado</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ ...tableWrapStyle, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#555', margin: 0 }}>Cenários simulados</p>
        {mapping.scenarios.map((s) => (
          <div key={s.value} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#666' }}>
            <span style={{ fontFamily: 'monospace', color: '#999', minWidth: 140 }}>{s.value}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
