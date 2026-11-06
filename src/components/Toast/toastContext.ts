import { createContext } from 'react';
import type { Toast as ToastTypeDef } from './Toast';

export interface ToastContextType {
  showToast: (toast: Omit<ToastTypeDef, 'id'>) => string;
  hideToast: (id: string) => void;
  showSuccess: (title: string, message?: string, options?: { duration?: number; action?: ToastTypeDef['action'] }) => string;
  showError: (title: string, message?: string, options?: { duration?: number; action?: ToastTypeDef['action'] }) => string;
  showWarning: (title: string, message?: string, options?: { duration?: number; action?: ToastTypeDef['action'] }) => string;
  showInfo: (title: string, message?: string, options?: { duration?: number; action?: ToastTypeDef['action'] }) => string;
}

export const ToastContext = createContext<ToastContextType | null>(null);
