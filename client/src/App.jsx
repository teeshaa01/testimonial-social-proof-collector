import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Dashboard Pages
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { SpaceDashboard } from './pages/dashboard/SpaceDashboard';

// Public & Embed Pages
import { LandingPage } from './pages/LandingPage';
import { PublicCollect } from './pages/public/PublicCollect';
import { PublicWall } from './pages/public/PublicWall';
import { EmbedWidget } from './pages/public/EmbedWidget';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  // Don't show owner navigation on standalone public collect, wall, and embed views
  const isStandalonePublicView =
    path.startsWith('/collect/') ||
    path.startsWith('/wall/') ||
    path.startsWith('/embed/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isStandalonePublicView && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Public Collection & Social Proof Routes */}
              <Route path="/collect/:spaceSlug" element={<PublicCollect />} />
              <Route path="/wall/:spaceSlug" element={<PublicWall />} />
              <Route path="/embed/:spaceSlug" element={<EmbedWidget />} />

              {/* Protected Owner Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/dashboard/spaces/:id" element={<SpaceDashboard />} />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
