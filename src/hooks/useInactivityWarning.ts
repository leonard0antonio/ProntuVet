import { useState, useCallback, useEffect, useRef } from 'react';

interface UseInactivityWarningReturn {
  isWarningOpen: boolean;
  timeRemaining: number;
  showWarning: (onLogout: () => void) => void;
  hideWarning: () => void;
}

export const useInactivityWarning = (): UseInactivityWarningReturn => {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60000);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onLogoutRef = useRef<(() => void) | null>(null);

  const showWarning = useCallback((onLogout: () => void) => {
    onLogoutRef.current = onLogout;
    setIsWarningOpen(true);
    setTimeRemaining(60000);

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          onLogoutRef.current?.();
          onLogoutRef.current = null;
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
    countdownRef.current = null;
    onLogoutRef.current = null;
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
  };
};