import { useState, useCallback } from 'react';

interface UseConfirmationModalReturn {
  isOpen: boolean;
  open: (title: string, message: string, onConfirm: () => void, options?: { confirmText?: string; cancelText?: string; variant?: 'danger' | 'warning' | 'info' }) => void;
  close: () => void;
  modalConfig: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  } | null;
  handleConfirm: () => void;
}

type ModalConfig = NonNullable<UseConfirmationModalReturn['modalConfig']>;

export const useConfirmationModal = (): UseConfirmationModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

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