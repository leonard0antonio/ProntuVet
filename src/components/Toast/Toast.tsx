import React, { useEffect, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const toastStyles: Record<ToastType, { bg: string; border: string; iconColor: string; textColor: string }> = {
  success: {
    bg: '#ecfdf5',
    border: '#a7f3d0',
    iconColor: '#059669',
    textColor: '#065f46',
  },
  error: {
    bg: '#fef2f2',
    border: '#fecaca',
    iconColor: '#dc2626',
    textColor: '#991b1b',
  },
  warning: {
    bg: '#fffbeb',
    border: '#fde68a',
    iconColor: '#d97706',
    textColor: '#92400e',
  },
  info: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    iconColor: '#2563eb',
    textColor: '#1e40af',
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const toastRef = useRef<HTMLDivElement>(null);
  const { type, title, message, duration = 5000, action } = toast;
  const styles = toastStyles[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose(toast.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, toast.id]);

  return (
    <div
      ref={toastRef}
      className="toast"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderLeft: `4px solid ${styles.iconColor}`,
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        display: 'flex',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-lg)',
        minWidth: '320px',
        maxWidth: '480px',
        animation: 'slideIn 0.3s ease-out',
        color: styles.textColor,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: styles.iconColor,
        }}
        aria-hidden="true"
      >
        {toastIcons[type]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 }}>
          {title}
        </h4>
        {message && (
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', lineHeight: 1.5, opacity: 0.9 }}>
            {message}
          </p>
        )}
      </div>
      {action && (
        <button
          onClick={() => {
            action.onClick();
            onClose(toast.id);
          }}
          style={{
            flexShrink: 0,
            padding: '0.375rem 0.75rem',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: styles.iconColor,
            background: 'transparent',
            border: `1px solid ${styles.iconColor}`,
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = styles.iconColor;
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = styles.iconColor;
          }}
        >
          {action.label}
        </button>
      )}
      <button
        onClick={() => onClose(toast.id)}
        aria-label="Fechar notificação"
        style={{
          flexShrink: 0,
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          color: styles.textColor,
          opacity: 0.6,
          transition: 'opacity var(--transition-fast), background var(--transition-fast)',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.opacity = '0.6';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }} aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;