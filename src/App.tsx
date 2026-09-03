import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from './components/theme-provider'
import LoginPage from './pages/LoginPage'
import AppPage from './pages/AppPage'
import PipelinePage from './pages/PipelinePage'
import AgendaPage from './pages/AgendaPage'
import GoalsPage from './pages/GoalsPage'
import IntegrationPage from './pages/IntegrationPage'
import DashboardPage from './pages/DashboardPage'
import CompaniesPage from './pages/CompaniesPage'
import WhatsAppPage from './pages/WhatsAppPage'
import ProjectsPage from './pages/ProjectsPage'
import KanbanPage from './pages/KanbanPage'
import ProtectedRoute from './components/ui/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<MainLayout />}>
            <Route path="/pedidos" element={<ProtectedRoute><PipelinePage /></ProtectedRoute>} />
            <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
            <Route path="/metas" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
            <Route path="/integracao" element={<ProtectedRoute roles={['gestor']}><IntegrationPage /></ProtectedRoute>} />
            <Route path="/whatsapp" element={<ProtectedRoute roles={['gestor']}><WhatsAppPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/empresas" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/kanban/:boardId" element={<ProtectedRoute><KanbanPage /></ProtectedRoute>} />
            <Route path="/*" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
