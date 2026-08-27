import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Plus, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Goal, GoalTeamSummary } from '@/types'
import { formatCurrency, formatMillions } from '@/lib/format'
import { useAuthStore } from '@/store/auth'
import GoalCard from '@/components/goals/GoalCard'
import ProgressBar from '@/components/goals/ProgressBar'
import NewGoalModal from '@/components/goals/NewGoalModal'

// Módulo de Metas (Bloco 6, spec seção 3: "Objetivos mensais por vendedor.
// Receita prevista e realizada. Volume comercializado. Progresso individual
// e do time."), consumindo o contrato do backend (routes/goals.ts) já
// validado ao vivo pelo dev-backend. Confirmei os nomes exatos direto no
// código antes de codar, não só pelo diário.
//
// Visão por papel — mesmo critério RBAC visual já estabelecido em
// Cliente/Pedido/Agenda: `comercial` só vê a própria meta do período
// (GET /goals já força isso no backend, ignorando qualquer user_id na
// query — aqui só refletido, não reimplementado); `gestor` vê o resumo do
// time (GET /goals/team-summary) e a lista de metas de todo mundo, com
// criação/edição/exclusão (só ele tem RBAC de escrita em goals.ts).

function currentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function GoalsPage() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const isGestor = role === 'gestor'

  const [period, setPeriod] = useState(currentPeriod())
  const [goals, setGoals] = useState<Goal[]>([])
  const [goalsLoading, setGoalsLoading] = useState(true)
  const [summary, setSummary] = useState<GoalTeamSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(isGestor)
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const fetchGoals = useCallback((p: string, ignoreRef: { current: boolean }) => {
    setGoalsLoading(true)
    api.get<Goal[]>(`/api/v1/goals?period=${p}`)
      .then((data) => { if (!ignoreRef.current) setGoals(data) })
      .catch((err) => { if (!ignoreRef.current) toast.error(err instanceof Error ? err.message : 'Erro ao carregar metas') })
      .finally(() => { if (!ignoreRef.current) setGoalsLoading(false) })
  }, [])

  const fetchSummary = useCallback((p: string, ignoreRef: { current: boolean }) => {
    if (!isGestor) return
    setSummaryLoading(true)
    api.get<GoalTeamSummary>(`/api/v1/goals/team-summary?period=${p}`)
      .then((data) => { if (!ignoreRef.current) setSummary(data) })
      .catch((err) => { if (!ignoreRef.current) toast.error(err instanceof Error ? err.message : 'Erro ao carregar resumo do time') })
      .finally(() => { if (!ignoreRef.current) setSummaryLoading(false) })
  }, [isGestor])

  useEffect(() => {
    const ignoreRef = { current: false }
    // Mesmo padrão setTimeout(...,0) + ignoreRef já usado em AgendaPage/
    // PipelinePage para não disparar setState síncrono dentro do effect.
    const timer = setTimeout(() => {
      fetchGoals(period, ignoreRef)
      fetchSummary(period, ignoreRef)
    }, 0)
    return () => { clearTimeout(timer); ignoreRef.current = true }
  }, [period, fetchGoals, fetchSummary])

  function refetch() {
    const ignoreRef = { current: false }
    fetchGoals(period, ignoreRef)
    fetchSummary(period, ignoreRef)
  }

  function handleSaved() {
    // GET /goals?period=X já traz o realizado/progresso recalculado — mais
    // simples e sempre correto refazer a busca (também reflete o resumo do
    // time, que POST/PATCH individual não devolve) do que tentar mesclar o
    // registro salvo no estado local. Por isso o Goal retornado por
    // onSaved (NewGoalModal) nem precisa ser recebido aqui.
    setShowModal(false)
    setEditingGoal(null)
    toast.success(editingGoal ? 'Meta atualizada' : 'Meta criada')
    refetch()
  }

  async function handleDelete(goal: Goal) {
    const vendorLabel = goal.user?.name ?? 'este vendedor'
    if (!window.confirm(`Excluir a meta de ${vendorLabel} para este período?`)) return
    try {
      await api.delete(`/api/v1/goals/${goal.id}`)
      toast.success('Meta excluída')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir meta')
    }
  }

  const ownGoal = !isGestor ? goals[0] ?? null : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#fafafa' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.07)',
        backgroundColor: '#fff', flexShrink: 0, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} title="Voltar ao CRM" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
            <ArrowLeft size={18} color="#666" />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>Metas</h1>
          {!isGestor && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#888', backgroundColor: '#f3f4f6',
              borderRadius: 10, padding: '3px 9px',
            }}>
              Minha meta
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '7px 10px', fontSize: 13, color: '#111827',
              border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7,
              outline: 'none', backgroundColor: '#f9fafb', fontFamily: 'inherit',
            }}
          />
          {isGestor && (
            <button
              onClick={() => { setEditingGoal(null); setShowModal(true) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#111',
                backgroundColor: '#F2E600', border: 'none', borderRadius: 7, cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Nova meta
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {isGestor && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Target size={14} color="#555" />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                Progresso do time
              </p>
            </div>

            {summaryLoading && <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Carregando resumo...</p>}

            {!summaryLoading && summary && summary.goalsCount === 0 && (
              <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Nenhuma meta cadastrada neste período.</p>
            )}

            {!summaryLoading && summary && summary.goalsCount > 0 && (
              <div style={{
                backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10,
                padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <p style={{ fontSize: 11, color: '#999', margin: 0 }}>
                  {summary.goalsCount} {summary.goalsCount === 1 ? 'vendedor com meta' : 'vendedores com meta'} neste período
                </p>
                <ProgressBar
                  label="Receita do time"
                  valueLabel={`${formatCurrency(summary.realizedRevenue)} / ${formatCurrency(summary.revenueTarget)}`}
                  progress={summary.revenueProgress}
                />
                <ProgressBar
                  label="Volume do time"
                  valueLabel={`${formatMillions(summary.realizedVolumeMillions)} / ${formatMillions(summary.volumeTargetMillions)}`}
                  progress={summary.volumeProgress}
                />
              </div>
            )}
          </section>
        )}

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
              {isGestor ? 'Metas do time' : 'Minha meta'}
            </p>
          </div>

          {goalsLoading && <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Carregando metas...</p>}

          {!goalsLoading && goals.length === 0 && (
            <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>
              {isGestor ? 'Nenhuma meta cadastrada neste período.' : 'Você ainda não tem meta cadastrada neste período.'}
            </p>
          )}

          {!goalsLoading && isGestor && goals.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {goals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onEdit={(goal) => { setEditingGoal(goal); setShowModal(true) }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {!goalsLoading && !isGestor && ownGoal && (
            <div style={{ maxWidth: 360 }}>
              <GoalCard goal={ownGoal} />
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <NewGoalModal
          goal={editingGoal ?? undefined}
          onClose={() => { setShowModal(false); setEditingGoal(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
