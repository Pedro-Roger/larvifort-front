import { Pencil, Trash2 } from 'lucide-react'
import type { Goal } from '@/types'
import { formatCurrency, formatMillions, formatMonthYear } from '@/lib/format'
import ProgressBar from './ProgressBar'

interface Props {
  goal:     Goal
  // Edição/exclusão só disponíveis para quem tem RBAC de escrita (gestor) —
  // o botão simplesmente não é renderizado quando o callback não é passado,
  // mesmo critério visual já usado em outros módulos (a barreira real
  // continua sendo o backend, isto é só UX).
  onEdit?:   (goal: Goal) => void
  onDelete?: (goal: Goal) => void
}

// Card de uma meta individual — reaproveitado tanto na visão do comercial
// (a própria meta) quanto na lista de metas do time do gestor (uma por
// vendedor). Nenhuma regra de negócio aqui: só formata o que GET /goals já
// devolve calculado (realized*/*/Progress nunca são recomputados no
// frontend).
export default function GoalCard({ goal, onEdit, onDelete }: Props) {
  return (
    <div style={{
      backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10,
      padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>
            {goal.user?.name ?? goal.user?.id ?? 'Vendedor removido'}
          </p>
          <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>{formatMonthYear(goal.period)}</p>
        </div>
        {(onEdit || onDelete) && (
          <div style={{ display: 'flex', gap: 4 }}>
            {onEdit && (
              <button
                onClick={() => onEdit(goal)}
                title="Editar meta"
                style={{ width: 26, height: 26, borderRadius: 6, border: 'none', backgroundColor: '#f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Pencil size={12} color="#555" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(goal)}
                title="Excluir meta"
                style={{ width: 26, height: 26, borderRadius: 6, border: 'none', backgroundColor: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trash2 size={12} color="#dc2626" />
              </button>
            )}
          </div>
        )}
      </div>

      <ProgressBar
        label="Receita"
        valueLabel={`${formatCurrency(goal.realizedRevenue)} / ${formatCurrency(goal.revenueTarget)}`}
        progress={goal.revenueProgress}
      />
      <ProgressBar
        label="Volume"
        valueLabel={`${formatMillions(goal.realizedVolumeMillions)} / ${formatMillions(goal.volumeTargetMillions)}`}
        progress={goal.volumeProgress}
      />
    </div>
  )
}
