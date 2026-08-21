import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import MLModelInfoPage from './pages/MLModelInfoPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import VerificationPage from './pages/VerificationPage';
import ComparativeDiffPage from './pages/ComparativeDiffPage';
import BatchUploadPage from './pages/BatchUploadPage';

// Protected Route Guard
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--accent-cyan)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Guard (Redirect logged-in user away from login/register)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              
              {/* Public Pages */}
              <Route index element={<LandingPage />} />
              <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
              <Route path="verify/:uuid" element={<VerificationPage />} />
              <Route path="verify" element={<VerificationPage />} />
              
              {/* Protected User Pages */}
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
              <Route path="batch" element={<ProtectedRoute><BatchUploadPage /></ProtectedRoute>} />
              <Route path="compare" element={<ProtectedRoute><ComparativeDiffPage /></ProtectedRoute>} />
              <Route path="result/:id" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
              <Route path="history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="reports" element={<Navigate to="/dashboard" replace />} />
              <Route path="model-info" element={<ProtectedRoute><MLModelInfoPage /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Protected Admin Pages */}
              <Route path="admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />

              {/* Catch-All Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
