import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, GitCompare, History as HistoryIcon, Wifi, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type {
  IntegrationFieldMapping,
  IntegrationHistoryResponse,
  IntegrationStatus,
  Planning,
} from '@/types'
import StatusOverview from '@/components/integration/StatusOverview'
import TestConnectionPanel from '@/components/integration/TestConnectionPanel'
import HistoryList from '@/components/integration/HistoryList'
import FieldMappingTable from '@/components/integration/FieldMappingTable'

const HISTORY_LIMIT = 10

const sectionLabelStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
}

const sectionLabelTextStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0,
}

// Módulo de Configurações/Integração (spec seção 3: "Estado da conexão com
// o AquaFort. Data e resultado da última sincronização. Mapeamento dos
// campos entre sistemas. Histórico de eventos e falhas. Ação para testar
// conexão e repetir sincronização."), consumindo o contrato do backend
// (routes/integration.ts) já validado ao vivo pelo dev-backend. Nomes
// confirmados direto no código antes de codar, não só pelo diário do
// projeto.
//
// Exclusivo de gestor (spec seção 2: só o Gestor "consulta o estado e o
// histórico da integração", sem nenhuma menção de acesso do Comercial). O
// item de navegação some do AppSidebar para `comercial` e a rota em App.tsx
// usa `<ProtectedRoute roles={['gestor']}>` para cobrir acesso direto por
// URL — mesmo assim a barreira real é o 403 dos 4 endpoints no backend
// (requireGestor em routes/integration.ts), isto aqui é só UX.
export default function IntegrationPage() {
  const navigate = useNavigate()

  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)

  const [history, setHistory] = useState<IntegrationHistoryResponse | null>(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyPage, setHistoryPage] = useState(1)
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null)

  const [mapping, setMapping] = useState<IntegrationFieldMapping | null>(null)
  const [mappingLoading, setMappingLoading] = useState(true)

  const fetchStatus = useCallback((ignoreRef: { current: boolean }) => {
    setStatusLoading(true)
    api.get<IntegrationStatus>('/api/v1/integration/status')
      .then((data) => { if (!ignoreRef.current) setStatus(data) })
      .catch((err) => { if (!ignoreRef.current) toast.error(err instanceof Error ? err.message : 'Erro ao carregar estado da integração') })
      .finally(() => { if (!ignoreRef.current) setStatusLoading(false) })
  }, [])

  const fetchHistory = useCallback((page: number, ignoreRef: { current: boolean }) => {
    setHistoryLoading(true)
    api.get<IntegrationHistoryResponse>(`/api/v1/integration/history?page=${page}&limit=${HISTORY_LIMIT}`)
      .then((data) => { if (!ignoreRef.current) setHistory(data) })
      .catch((err) => { if (!ignoreRef.current) toast.error(err instanceof Error ? err.message : 'Erro ao carregar histórico da integração') })
      .finally(() => { if (!ignoreRef.current) setHistoryLoading(false) })
  }, [])

  const fetchMapping = useCallback((ignoreRef: { current: boolean }) => {
    setMappingLoading(true)
    api.get<IntegrationFieldMapping>('/api/v1/integration/field-mapping')
      .then((data) => { if (!ignoreRef.current) setMapping(data) })
      .catch((err) => { if (!ignoreRef.current) toast.error(err instanceof Error ? err.message : 'Erro ao carregar mapeamento de campos') })
      .finally(() => { if (!ignoreRef.current) setMappingLoading(false) })
  }, [])

  useEffect(() => {
    // Mesmo padrão setTimeout(...,0) + ignoreRef já usado em Goals/Agenda/
    // PipelinePage para não disparar setState síncrono dentro do effect.
    const ignoreRef = { current: false }
    const timer = setTimeout(() => fetchStatus(ignoreRef), 0)
    return () => { clearTimeout(timer); ignoreRef.current = true }
  }, [fetchStatus])

  useEffect(() => {
    const ignoreRef = { current: false }
    const timer = setTimeout(() => fetchHistory(historyPage, ignoreRef), 0)
    return () => { clearTimeout(timer); ignoreRef.current = true }
  }, [historyPage, fetchHistory])

  useEffect(() => {
    const ignoreRef = { current: false }
    const timer = setTimeout(() => fetchMapping(ignoreRef), 0)
    return () => { clearTimeout(timer); ignoreRef.current = true }
  }, [fetchMapping])

  async function handleRetry(orderId: string) {
    setRetryingOrderId(orderId)
    try {
      // Reaproveita POST /orders/:id/planning/retry (já existe desde o
      // Bloco 3, mesmo endpoint usado em OrderDetailPanel) — nenhum
      // endpoint de retry em lote existe neste módulo, conforme decisão
      // registrada no diário do projeto.
      const result = await api.post<{ planning: Planning; syncError: string | null }>(
        `/api/v1/orders/${orderId}/planning/retry`,
        {}
      )
      if (result.syncError) {
        toast.error(`Nova tentativa ainda falhou: ${result.syncError}`)
      } else {
        toast.success('Sincronização concluída com sucesso.')
      }
      const ignoreRef = { current: false }
      fetchStatus(ignoreRef)
      fetchHistory(historyPage, ignoreRef)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao repetir sincronização')
    } finally {
      setRetryingOrderId(null)
    }
  }

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
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>Integração AquaFort</h1>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section>
          <div style={sectionLabelStyle}>
            <Wifi size={14} color="#555" />
            <p style={sectionLabelTextStyle}>Estado da conexão</p>
          </div>
          {statusLoading && <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Carregando estado da integração...</p>}
          {!statusLoading && status && <StatusOverview status={status} />}
        </section>

        <section>
          <div style={sectionLabelStyle}>
            <Zap size={14} color="#555" />
            <p style={sectionLabelTextStyle}>Testar conexão</p>
          </div>
          <TestConnectionPanel />
        </section>

        <section>
          <div style={sectionLabelStyle}>
            <HistoryIcon size={14} color="#555" />
            <p style={sectionLabelTextStyle}>Histórico de eventos e falhas</p>
          </div>
          <HistoryList
            items={history?.items ?? []}
            page={historyPage}
            limit={HISTORY_LIMIT}
            total={history?.total ?? 0}
            loading={historyLoading}
            retryingOrderId={retryingOrderId}
            onPageChange={setHistoryPage}
            onRetry={handleRetry}
          />
        </section>

        <section>
          <div style={sectionLabelStyle}>
            <GitCompare size={14} color="#555" />
            <p style={sectionLabelTextStyle}>Mapeamento de campos</p>
          </div>
          {mappingLoading && <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Carregando mapeamento...</p>}
          {!mappingLoading && mapping && <FieldMappingTable mapping={mapping} />}
        </section>
      </div>
    </div>
  )
}
