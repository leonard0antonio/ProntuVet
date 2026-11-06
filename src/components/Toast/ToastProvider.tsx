import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastComponent, { type Toast as ToastTypeDef } from './Toast';

interface ToastContextType {
  showToast: (toast: Omit<ToastTypeDef, 'id'>) => string;
  hideToast: (id: string) => void;
  showSuccess: (title: string, message?: string, options?: { duration?: number; action?: ToastTypeDef['action'] }) => string;
  showError: (title: string, message?: string, options?: { duration?: number; action?: ToastTypeDef['action'] }) => string;
  showWarning: (title: string, message?: string, options?: { duration?: number; action?: ToastTypeDef['action'] }) => string;
  showInfo: (title: string, message?: string, options?: { duration?: number; action?: ToastTypeDef['action'] }) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastTypeDef[]>([]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const showToast = useCallback((toast: Omit<ToastTypeDef, 'id'>) => {
    const id = generateId();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message?: string, options?: { duration?: number; action?: ToastTypeDef['action'] }) => {
    return showToast({ type: 'success', title, message, ...options });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, options?: { duration?: number; action?: ToastTypeDef['action'] }) => {
    return showToast({ type: 'error', title, message, ...options });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string, options?: { duration?: number; action?: ToastTypeDef['action'] }) => {
    return showToast({ type: 'warning', title, message, ...options });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string, options?: { duration?: number; action?: ToastTypeDef['action'] }) => {
    return showToast({ type: 'info', title, message, ...options });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          pointerEvents: 'none',
          maxWidth: '500px',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                    <ToastComponent toast={toast} onClose={hideToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};