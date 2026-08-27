interface Props {
  label: string
  value: string
  color?: string
}

// Card "número + label" — mesmo padrão visual já usado no projeto para
// indicadores (ver StatusOverview.tsx, módulo de Integração: fundo branco,
// borda sutil, número grande + rótulo pequeno em maiúsculas). Extraído aqui
// porque o Dashboard reaproveita este mesmo cartão várias vezes (backlog,
// criados no período, volume, receita) — componente de apresentação puro,
// sem cálculo nenhum (recebe o valor já formatado pela página).
export default function IndicatorCard({ label, value, color = '#111' }: Props) {
  return (
    <div style={{
      backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10,
      padding: 14, display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontSize: 22, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 11, color: '#999' }}>{label}</span>
    </div>
  )
}
