import React, { useEffect, useRef } from 'react';

interface InactivityWarningModalProps {
  isOpen: boolean;
  onExtend: () => void;
  onLogout: () => void;
  timeRemaining: number;
}

export const InactivityWarningModal: React.FC<InactivityWarningModalProps> = ({
  isOpen,
  onExtend,
  onLogout,
  timeRemaining,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onExtend();
      }

      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onExtend]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  return (
    <div className="modal-overlay" onClick={onExtend} role="dialog" aria-modal="true" aria-labelledby="inactivity-modal-title">
      <div
        ref={modalRef}
        tabIndex={-1}
        className="modal-content"
        style={{ borderTop: '4px solid var(--color-warning)' }}
        onClick={e => e.stopPropagation()}
      >
        <header className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--color-warning)15', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-warning)',
              flexShrink: 0
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 id="inactivity-modal-title" className="modal-title">Sessão prestes a expirar</h2>
          </div>
        </header>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            Você está inativo há algum tempo. Sua sessão expirará em
            <strong style={{ color: 'var(--text-primary)', fontSize: '1.125rem' }}> {minutes}:{seconds.toString().padStart(2, '0')}</strong>
            por segurança.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Deseja continuar logado?
          </p>
        </div>
        <footer className="modal-footer">
          <button
            onClick={onLogout}
            className="btn btn-danger"
          >
            Sair agora
          </button>
          <button
            onClick={onExtend}
            className="btn btn-warning"
                      style={{ background: 'var(--color-warning)', color: 'var(--text-primary)' }}
          >
            Continuar logado
          </button>
        </footer>
      </div>
    </div>
  );
};