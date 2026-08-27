import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import LoginPage from './pages/LoginPage'
import AppPage from './pages/AppPage'
import PipelinePage from './pages/PipelinePage'
import AgendaPage from './pages/AgendaPage'
import GoalsPage from './pages/GoalsPage'
import IntegrationPage from './pages/IntegrationPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ui/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      {/* Toaster (sonner) já era dependência instalada e tinha um wrapper
          pronto em components/ui/sonner.tsx, mas nunca tinha sido montado
          em lugar nenhum da árvore — ativado aqui para o feedback de
          movimentação de estágio/retry de sincronização do módulo de
          Pedidos (ver PipelinePage/OrderDetailPanel). */}
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Pedidos como rota própria (não um "sidebarView" interno de
            AppPage): é um módulo com seu próprio layout de página (funil +
            lista), não uma sub-view da inbox de clientes. Adicionada antes
            do catch-all `/*` — precisão de rota do react-router v6 garante
            que `/pedidos` vence `/*` independente da ordem de declaração,
            mas mantida aqui em ordem lógica de leitura. */}
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute>
              <PipelinePage />
            </ProtectedRoute>
          }
        />

        {/* Agenda (Bloco 5), mesmo padrão de rota própria de /pedidos —
            módulo com layout de página dedicado (alertas + lista agrupada
            por dia), não uma sub-view interna de AppPage. */}
        <Route
          path="/agenda"
          element={
            <ProtectedRoute>
              <AgendaPage />
            </ProtectedRoute>
          }
        />

        {/* Metas (Bloco 6), mesmo padrão de rota própria de /pedidos e
            /agenda — módulo com layout de página dedicado (resumo do time +
            lista/criação de metas), não uma sub-view interna de AppPage. */}
        <Route
          path="/metas"
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          }
        />

        {/* Integração/Configurações (Bloco 7, spec seção 3), mesma rota
            própria de /pedidos, /agenda e /metas. Exclusivo de gestor (spec
            seção 2) — `roles={['gestor']}` cobre acesso direto por URL,
            redirecionando pra / se um `comercial` tentar navegar até aqui;
            a barreira real continua no backend (403 nos 4 endpoints de
            routes/integration.ts). */}
        <Route
          path="/integracao"
          element={
            <ProtectedRoute roles={['gestor']}>
              <IntegrationPage />
            </ProtectedRoute>
          }
        />

        {/* Dashboard (Bloco 8, último módulo do plano), mesma rota própria
            de /pedidos, /agenda e /metas — NÃO substitui `/` (ver decisão
            comentada em pages/DashboardPage.tsx e no diário do projeto).
            Visto por Comercial e Gestor, cada um com sua visão (spec seção
            2) — sem restrição de `roles`, diferente de /integracao. É o
            destino pós-login (ver LoginPage) e o item de destaque em
            AppSidebar. */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
