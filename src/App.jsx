import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Component } from 'react';
import Login from './components/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import EvaluatorDashboard from './pages/evaluator/Dashboard';
import StaffDashboard from './pages/staff/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/error/unauthorized';
import { AuthProvider } from './context/authContext';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ChangePassword from './components/auth/ChangePassword';

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen text-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Something went wrong.</h2>
            <button className="mt-4 text-green-600 underline" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Toaster position="top-right" />
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/admin/*" element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/evaluator/*" element={
              <ProtectedRoute allowedRole="evaluator">
                <EvaluatorDashboard />
              </ProtectedRoute>
            } />

            <Route path="/staff/*" element={
              <ProtectedRoute allowedRole="staff">
                <StaffDashboard />
              </ProtectedRoute>
            } />

            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
