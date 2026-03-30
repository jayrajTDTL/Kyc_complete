import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, ComplianceRoute } from './utils/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import MemberLoginPage from './pages/MemberLoginPage';
import { ModuleSelectionPage } from './pages/ModuleSelectionPage';
import { DashboardHome } from './pages/DashboardHome';
import { KycDashPage } from './pages/KycDashPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { KycVerificationPage } from './pages/KycVerificationPage';
import { ReKycPage } from './pages/ReKycPage';
import { ResultPage } from './pages/ResultPage';

// Styles
import './styles/globals.css';
import './App.css';

function AdminRedirect({ children }) {
  const { isAdmin, isComplianceOfficer } = useAuth();
  if (isAdmin) return <Navigate to="/admin-dashboard" replace />;
  if (isComplianceOfficer) return <Navigate to="/compliance-dashboard" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/member-login" element={<MemberLoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<AdminRedirect><Navigate to="/dashboard" replace /></AdminRedirect>} />
                    <Route path="/modules" element={<ModuleSelectionPage />} />
                    <Route path="/dashboard" element={<AdminRedirect><DashboardHome /></AdminRedirect>} />
                    <Route path="/compliance-dashboard" element={<KycDashPage />} />
                    <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                    <Route path="/kyc" element={<AdminRedirect><KycVerificationPage /></AdminRedirect>} />
                    <Route path="/rekyc" element={<AdminRedirect><ReKycPage /></AdminRedirect>} />
                    <Route path="/results" element={<AdminRedirect><ResultPage /></AdminRedirect>} />
                    <Route path="*" element={<AdminRedirect><Navigate to="/dashboard" replace /></AdminRedirect>} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
