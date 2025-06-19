import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import NotificationsPage from './pages/NotificationsPage';
import StatisticsPage from './pages/StatisticsPage';
import MainLayout from './layouts/MainLayout';
import { useAuth } from './hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

function App() {
  const { isAuthenticated, loading, login } = useAuth();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="*" element={<Navigate to="/tasks" />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
