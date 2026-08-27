import type { DashboardRevenueEvolutionPoint } from '@/types'
import { formatCurrency, formatPeriodMonthYear } from '@/lib/format'

interface Props {
  points: DashboardRevenueEvolutionPoint[]
}

// "Evolução comercial por período" (spec seção 3) — lista de barras simples,
// não uma biblioteca de gráfico (critério de esforço x valor registrado na
// tarefa: 6 pontos mensais não justificam uma dependência nova). Único
// cálculo aqui é a escala visual (percentual da barra em relação ao maior
// valor da série) — apresentação pura, os números em si (revenue/volume/
// ordersDelivered) já vêm prontos do backend (routes/dashboard.ts).
export default function RevenueEvolutionBars({ points }: Props) {
  const maxRevenue = Math.max(1, ...points.map((p) => p.revenue))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {points.map((p) => {
        const widthPct = Math.min(100, (p.revenue / maxRevenue) * 100)
        return (
          <div key={p.period} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#999', width: 64, flexShrink: 0 }}>
              {formatPeriodMonthYear(p.period)}
            </span>
            <div style={{ flex: 1, height: 18, borderRadius: 4, backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
              <div style={{
                width: `${widthPct}%`, height: '100%', borderRadius: 4,
                backgroundColor: '#F2E600', transition: 'width 0.3s ease',
                minWidth: p.revenue > 0 ? 3 : 0,
              }} />
            </div>
            <span style={{ fontSize: 11, color: '#666', width: 130, flexShrink: 0, textAlign: 'right' }}>
              {formatCurrency(p.revenue)} · {p.ordersDelivered} {p.ordersDelivered === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
