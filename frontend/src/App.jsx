import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import LandingPage   from './pages/LandingPage';
import LoginPage     from './pages/LoginPage';
import SignupPage    from './pages/SignupPage';
import Dashboard     from './pages/Dashboard';
import Transactions  from './pages/Transactions';
import BudgetPage    from './pages/BudgetPage';
import Reports       from './pages/Reports';
import ProfilePage   from './pages/ProfilePage';
import AppLayout     from './components/layout/AppLayout';

// Protected route wrapper
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />;
};

// Redirect logged-in users away from auth pages
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/"        element={<LandingPage />} />
            <Route path="/login"   element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup"  element={<PublicRoute><SignupPage /></PublicRoute>} />

            {/* Protected */}
            <Route path="/dashboard"   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
            <Route path="/budget"      element={<PrivateRoute><BudgetPage /></PrivateRoute>} />
            <Route path="/reports"     element={<PrivateRoute><Reports /></PrivateRoute>} />
            <Route path="/profile"     element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
