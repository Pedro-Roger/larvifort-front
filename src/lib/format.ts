// Helpers de formatação pura (sem lógica de negócio), mesmo padrão de
// responsabilidade única já usado em lib/utils.ts.

export function formatCurrency(value: number | null): string {
  if (value === null) return '—'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatMillions(value: number): string {
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} mi`
}

export function formatDate(value: string | null): string {
  if (!value) return '—'
  // Achado confirmado ao vivo contra o backend real (não só lido no
  // código): colunas DATE (desired_delivery_date/expected_date) voltam da
  // API como ISO completo em UTC meia-noite (ex: "2026-09-15T00:00:00.000Z"),
  // não "YYYY-MM-DD" puro. Formatar sem fixar timeZone: 'UTC' aplica o fuso
  // local do navegador e "volta um dia" em qualquer fuso negativo (ex:
  // America/Fortaleza, -03) — reproduzido e confirmado antes deste fix.
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  })
}

export function formatDateTime(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

// Módulo de Metas (Bloco 6) — `goal.period` chega como "YYYY-MM-DD" (sempre
// primeiro dia do mês, TO_CHAR no backend). Mesmo cuidado de fuso já
// documentado em formatDate: fixa timeZone: 'UTC' para não "voltar um dia"
// em fusos negativos (ex: America/Fortaleza).
export function formatMonthYear(period: string): string {
  const label = new Date(`${period.slice(0, 10)}T00:00:00Z`).toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// Módulo de Dashboard (Bloco 8) — `revenueEvolution[].period` chega como
// "YYYY-MM" puro (TO_CHAR(m.month, 'YYYY-MM') no backend, ver
// routes/dashboard.ts), diferente de `Goal.period` ("YYYY-MM-DD") já tratado
// por formatMonthYear acima. Helper dedicado em vez de reaproveitar
// formatMonthYear com um "-01" costurado por fora (o `.slice(0, 10)` dele
// devolveria a própria string "YYYY-MM" sem alteração, gerando um ISO
// inválido "YYYY-MMT00:00:00Z"). Rótulo compacto (mês abreviado) — usado em
// barras de série temporal, não precisa do nome completo do mês.
export function formatPeriodMonthYear(period: string): string {
  const label = new Date(`${period}-01T00:00:00Z`).toLocaleDateString('pt-BR', {
    month: 'short', year: 'numeric', timeZone: 'UTC',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}
