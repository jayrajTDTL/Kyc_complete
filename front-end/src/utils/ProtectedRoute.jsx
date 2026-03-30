import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/member-login" replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/member-login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export const ComplianceRoute = ({ children }) => {
  const { isAuthenticated, isComplianceOfficer } = useAuth();
  if (!isAuthenticated) return <Navigate to="/member-login" replace />;
  if (!isComplianceOfficer) return <Navigate to="/dashboard" replace />;
  return children;
};
