import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Link, Outlet } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ConfirmationModalProvider } from './components/Modal/ConfirmationModalProvider';
import { ToastProvider } from './components/Toast';
import { GlobalLoading } from './components/GlobalLoading';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { useInactivityWarning } from './hooks/useInactivityWarning';
import { Login } from './components/Login/Login';
import { Landing } from './components/Landing/Landing';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TutorForm } from './components/Tutor/TutorForm';
import { ProntuarioForm } from './components/Prontuario/ProntuarioForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import './App.css';
import { InactivityWarningModal } from './components/Modal/InactivityWarningModal';
import { AuthProvider, useAuth } from '../Back-end/src/features/auth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { showWarning, hideWarning, isWarningOpen, timeRemaining } = useInactivityWarning();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  useInactivityTimeout({
    timeout: 10 * 60 * 1000,
    warningTime: 60 * 1000,
    onWarning: () => {
      showWarning(() => {
        void logout();
      });
    },
    onTimeout: () => {
      void logout();
    },
  });

  const userName = user?.user_metadata.full_name ?? 'Usuário';
  const userInitials = userName.split(' ').map(name => name[0]).join('').toUpperCase() || 'U';

  const navItems = [
    { path: '/app', label: 'Dashboard', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )},
    { path: '/app/tutores', label: 'Tutores', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )},
    { path: '/app/prontuarios', label: 'Prontuários', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )},
  ];

  return (
    <>
        <GlobalLoading isLoading={false} />
      <InactivityWarningModal
        isOpen={isWarningOpen}
        onExtend={() => hideWarning()}
        onLogout={() => {
          void logout();
        }}
        timeRemaining={timeRemaining}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <header className="app-header">
                  <div className="app-header-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <Link to="/app" className="app-logo" aria-label="ProntuVet - Dashboard">
                        <div className="app-logo-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div className="app-logo-text">
                          <span className="app-logo-title">ProntuVet</span>
                          <span className="app-logo-subtitle">Prontuário Eletrônico</span>
                        </div>
                      </Link>
                      <nav className="app-header-nav" aria-label="Navegação principal">
                        <ul className="app-nav-list" role="menubar">
                          {navItems.map(item => (
                            <li key={item.path} className="app-nav-item" role="none">
                              <Link
                                to={item.path}
                                className={`app-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                role="menuitem"
                                aria-current={location.pathname === item.path ? 'page' : undefined}
                              >
                                {item.icon}
                                <span>{item.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                    <div className="app-user-menu">
                      <div className="app-user-info">
                        <div className="app-user-avatar" aria-hidden="true">
                          {userInitials}
                        </div>
                        <div className="app-user-details">
                          <span className="app-user-name">{userName}</span>
                          <span className="app-user-role">Veterinário</span>
                        </div>
                      </div>
                      <button
                        className="app-btn-logout"
                        onClick={() => void logout()}
                        aria-label="Sair do sistema"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                </header>
                <main className="app-main">
                  <Outlet />
                </main>
              </div>
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tutores" element={<TutorForm />} />
          <Route path="prontuarios" element={<ProntuarioForm />} />
        </Route>
        <Route path="/tutores" element={<Navigate to="/app/tutores" replace />} />
        <Route path="/prontuarios" element={<Navigate to="/app/prontuarios" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <AuthProvider>
          <ConfirmationModalProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </ConfirmationModalProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;