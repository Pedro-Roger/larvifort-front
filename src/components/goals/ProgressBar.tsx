import { goalProgressColor } from '@/lib/domainLabels'

interface Props {
  label:      string
  valueLabel: string
  progress:   number | null
}

// Indicador visual de progresso puro (sem lógica de negócio) — recebe o
// percentual já calculado pelo backend (GET /goals*, ver types/index.ts) e
// só desenha a barra + o texto. Reaproveitado tanto por GoalCard (meta
// individual) quanto pelo resumo de time (GoalsPage), evitando duplicar o
// mesmo markup nos dois lugares.
export default function ProgressBar({ label, valueLabel, progress }: Props) {
  const color = goalProgressColor(progress)
  // Barra visual limitada a 100% mesmo quando o progresso passa disso (ex:
  // 200%, meta superada) — o número exibido ao lado não tem cap, só a barra.
  const widthPct = progress === null ? 0 : Math.min(100, Math.max(0, progress))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#888' }}>
          {valueLabel} · <strong style={{ color }}>{progress === null ? '—' : `${progress}%`}</strong>
        </span>
      </div>
      <div style={{ height: 7, borderRadius: 4, backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
        <div style={{ width: `${widthPct}%`, height: '100%', backgroundColor: color, borderRadius: 4, transition: 'width 0.3s ease' }} />
      </div>
    </div>
  )
}
