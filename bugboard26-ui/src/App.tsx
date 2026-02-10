
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { USER_ROLE } from './constants';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext.shared';
import { IssueProvider } from './context/IssueContext';
import { ProjectProvider } from './context/ProjectContext';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { AnimatePresence } from 'framer-motion';
import { StackingToaster } from './components/common/StackingToaster';
import { SseManager } from './components/common/SseManager';

import { ProjectsPage } from './pages/ProjectsPage';
import { KanbanPage } from './pages/KanbanPage';
import { MyIssuesPage } from './pages/MyIssuesPage';
import { RejectedIssuesPage } from './pages/RejectedIssuesPage';
import { ArchivedIssuesPage } from './pages/ArchivedIssuesPage';
import { UserManagement } from './pages/UserManagement';
import { Reports } from './pages/Reports';
import { ProtectedRoute } from './components/layout/ProtectedRoute';


const AppRoutes = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {currentUser ? (
          <Route path="/" element={<MainLayout />}>
            <Route index element={<ProjectsPage />} />
            <Route path="project/:projectId/board" element={<KanbanPage />} />
            <Route path="project/:projectId/my-issues" element={<MyIssuesPage />} />
            <Route path="project/:projectId/rejected" element={<RejectedIssuesPage />} />
            <Route path="project/:projectId/archive" element={<ArchivedIssuesPage />} />

            <Route element={<ProtectedRoute allowedRoles={[USER_ROLE.ADMIN]} />}>
              <Route path="users" element={<UserManagement />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <IssueProvider>
            <StackingToaster />
            <SseManager />
            <AppRoutes />
          </IssueProvider>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;