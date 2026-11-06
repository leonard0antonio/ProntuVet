import React, { useState, useCallback, type ReactNode } from 'react';
import { ConfirmationModal } from './ConfirmationModal';
import { ConfirmationModalContext } from './confirmationModalContext';

export const ConfirmationModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  } | null>(null);

  const open = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; variant?: 'danger' | 'warning' | 'info' }
  ) => {
    setModalConfig({ title, message, onConfirm, ...options });
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    modalConfig?.onConfirm();
    setIsOpen(false);
    setModalConfig(null);
  }, [modalConfig]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setModalConfig(null);
  }, []);

  return (
    <ConfirmationModalContext.Provider value={{ open }}>
      {children}
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={modalConfig?.title || ''}
        message={modalConfig?.message || ''}
        confirmText={modalConfig?.confirmText}
        cancelText={modalConfig?.cancelText}
        variant={modalConfig?.variant}
      />
    </ConfirmationModalContext.Provider>
  );
};