import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/UserContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { OwnerAnalytics } from './pages/OwnerAnalytics';
import { UserManagement } from './pages/UserManagement';

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Authenticating...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute roles={['admin', 'owner', 'user']}><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/bookings"
        element={<ProtectedRoute roles={['admin', 'owner', 'user']}><Bookings /></ProtectedRoute>}
      />
      <Route
        path="/owner"
        element={<ProtectedRoute roles={['admin', 'owner']}><OwnerAnalytics /></ProtectedRoute>}
      />
      <Route
        path="/users"
        element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>}
      />
    </Routes>
  );
}
