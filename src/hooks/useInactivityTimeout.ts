import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimeoutOptions {
  timeout?: number;
  onWarning?: () => void;
  onTimeout?: () => void;
  warningTime?: number;
}

export const useInactivityTimeout = ({
  timeout = 10 * 60 * 1000,
  onWarning,
  onTimeout,
  warningTime = 60 * 1000,
}: UseInactivityTimeoutOptions = {}) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWarningShown = useRef(false);

  const resetTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }
    isWarningShown.current = false;

    warningRef.current = setTimeout(() => {
      isWarningShown.current = true;
      onWarning?.();
    }, timeout - warningTime);

    timeoutRef.current = setTimeout(() => {
      onTimeout?.();
    }, timeout);
  }, [timeout, warningTime, onWarning, onTimeout]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimers();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimers();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimers]);

  return { resetTimers };
};