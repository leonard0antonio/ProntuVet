import { useState, useCallback, useEffect, useRef } from 'react';
import { InactivityWarningModal } from '../components/Modal/InactivityWarningModal';

interface UseInactivityWarningReturn {
  isWarningOpen: boolean;
  timeRemaining: number;
  showWarning: (onExtend: () => void, onLogout: () => void) => void;
  hideWarning: () => void;
  InactivityWarningModal: React.FC<{ isOpen: boolean; onExtend: () => void; onLogout: () => void; timeRemaining: number }>;
}

export const useInactivityWarning = (): UseInactivityWarningReturn => {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60000);
  const [callbacks, setCallbacks] = useState<{ onExtend: () => void; onLogout: () => void } | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showWarning = useCallback((onExtend: () => void, onLogout: () => void) => {
    setCallbacks({ onExtend, onLogout });
    setIsWarningOpen(true);
    setTimeRemaining(60000);

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          callbacks?.onLogout();
          setIsWarningOpen(false);
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }, []);

  const hideWarning = useCallback(() => {
    setIsWarningOpen(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return {
    isWarningOpen,
    timeRemaining,
    showWarning,
    hideWarning,
    InactivityWarningModal,
  };
};