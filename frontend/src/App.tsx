import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import OperationsDashboard from './pages/OperationsDashboard';
import AccountsPage from './pages/AccountsPage';
import AccountDetailsPage from './pages/AccountDetailsPage';
import TransferPage from './pages/TransferPage';
import BeneficiaryPage from './pages/BeneficiaryPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import KycReviewPage from './pages/KycReviewPage';
import FraudReviewPage from './pages/FraudReviewPage';
import AuditLogPage from './pages/AuditLogPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !user?.roles.some(r => allowedRoles.includes(r))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Router mapping base roles to dashboards
const DashboardRouter = () => {
  const { hasRole } = useAuth();

  if (hasRole('ROLE_CUSTOMER')) {
    return <CustomerDashboard />;
  }
  return <OperationsDashboard />;
};

// Wrapper to extract route params
const AccountDetailsWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const accountId = parseInt(id || '0', 10);
  return <AccountDetailsPage accountId={accountId} />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Core Dashboard Protected Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* Customer specific pages */}
          <Route
            path="/accounts"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                <AccountsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/:id"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                <AccountDetailsWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfer"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                <TransferPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beneficiaries"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                <BeneficiaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Compliance Portal pages */}
          <Route
            path="/compliance/kyc"
            element={
              <ProtectedRoute allowedRoles={['ROLE_BANK_EMPLOYEE', 'ROLE_COMPLIANCE_OFFICER']}>
                <KycReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compliance/alerts"
            element={
              <ProtectedRoute allowedRoles={['ROLE_BANK_EMPLOYEE', 'ROLE_COMPLIANCE_OFFICER']}>
                <FraudReviewPage />
              </ProtectedRoute>
            }
          />

          {/* Admin specific pages */}
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_COMPLIANCE_OFFICER']}>
                <AuditLogPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
