import React, { useState, useCallback } from 'react';
import { ConfirmationModal } from '../components/Modal/ConfirmationModal';

interface UseConfirmationModalReturn {
  isOpen: boolean;
  open: (title: string, message: string, onConfirm: () => void, options?: { confirmText?: string; cancelText?: string; variant?: 'danger' | 'warning' | 'info' }) => void;
  close: () => void;
}

export const useConfirmationModal = (): UseConfirmationModalReturn => {
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

  const close = useCallback(() => {
    setIsOpen(false);
    setModalConfig(null);
  }, []);

  const handleConfirm = useCallback(() => {
    modalConfig?.onConfirm();
    close();
  }, [modalConfig, close]);

  return {
    isOpen,
    open,
    close,
    modalConfig,
    handleConfirm,
  };
};