const fs = require('fs');
const path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('MainLayout')) {
  code = code.replace("import ProtectedRoute from './components/ui/ProtectedRoute'", "import ProtectedRoute from './components/ui/ProtectedRoute'\nimport MainLayout from './components/layout/MainLayout'");
  
  // Wrap all routes inside MainLayout, except login.
  const routesStart = '<Route path="/login" element={<LoginPage />} />';
  
  const wrapped = `
        <Route path="/login" element={<LoginPage />} />

        <Route element={<MainLayout />}>
          <Route path="/pedidos" element={<ProtectedRoute><PipelinePage /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
          <Route path="/metas" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
          <Route path="/integracao" element={<ProtectedRoute roles={['gestor']}><IntegrationPage /></ProtectedRoute>} />
          <Route path="/whatsapp" element={<ProtectedRoute roles={['gestor']}><WhatsAppPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/empresas" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} />
          <Route path="/*" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
  `;

  code = code.replace(/<Route path="\/login" element={<LoginPage \/>} \/>[\s\S]*<Route path="\*" element={<Navigate to="\/" replace \/>} \/>/, wrapped.trim());
  fs.writeFileSync(path, code);
}
