import { createContext } from 'react';

export interface ConfirmationModalContextType {
  open: (title: string, message: string, onConfirm: () => void, options?: {
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }) => void;
}

export const ConfirmationModalContext = createContext<ConfirmationModalContextType | null>(null);
