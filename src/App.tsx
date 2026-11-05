import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ConfirmationModalProvider } from './components/Modal/ConfirmationModalProvider';
import { GlobalLoading } from './components/GlobalLoading';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { useInactivityWarning } from './hooks/useInactivityWarning';
import { Login } from './components/Login/Login';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TutorForm } from './components/Tutor/TutorForm';
import { ProntuarioForm } from './components/Prontuario/ProntuarioForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import { InactivityWarningModal } from './components/Modal/InactivityWarningModal';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    setIsAuthenticated(!!token && !!user);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const { showWarning, hideWarning, isWarningOpen, timeRemaining, InactivityWarningModal } = useInactivityWarning();

  useInactivityTimeout({
    timeout: 10 * 60 * 1000,
    warningTime: 60 * 1000,
    onWarning: () => {
      showWarning(
        () => {
          hideWarning();
        },
        () => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
      );
    },
    onTimeout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    },
  });

  return (
    <>
      <GlobalLoading isLoading={isGlobalLoading} />
      <InactivityWarningModal
        isOpen={isWarningOpen}
        onExtend={() => hideWarning()}
        onLogout={() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }}
        timeRemaining={timeRemaining}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <header className="app-header">
                  <h1>ProntuVet</h1>
                  <nav>
                    <ul>
                      <li><a href="/">Dashboard</a></li>
                      <li><a href="/tutores">Tutores</a></li>
                      <li><a href="/prontuarios">Prontuários</a></li>
                      <li>
                        <button
                          onClick={() => {
                            localStorage.removeItem('auth_token');
                            localStorage.removeItem('auth_user');
                            window.location.href = '/login';
                          }}
                          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}
                        >
                          Sair
                        </button>
                      </li>
                    </ul>
                  </nav>
                </header>
                <main className="app-main">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tutores" element={<TutorForm />} />
                    <Route path="/prontuarios" element={<ProntuarioForm />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ConfirmationModalProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </ConfirmationModalProvider>
    </BrowserRouter>
  );
};

export default App;