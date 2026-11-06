import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  MOCK_SESSION_EVENT,
  restoreMockSession,
  signInMock,
  signOutMock,
  signUpMock,
  type SignUpInput,
} from './mockAuth';
import { initializeLocalDb } from '../../services/localDb';
import { AuthContext, type AuthContextValue } from './authContext';
import type { MockSession } from './mockAuth';

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeLocalDb();
    const handleSessionChange = (event: Event) => {
      setSession((event as CustomEvent<MockSession | null>).detail);
    };
    window.addEventListener(MOCK_SESSION_EVENT, handleSessionChange);
    setSession(restoreMockSession());
    setLoading(false);
    return () => window.removeEventListener(MOCK_SESSION_EVENT, handleSessionChange);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInMock(email, password);
    setSession(result.session);
    return result;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const result = await signUpMock(input);
    setSession(result.session);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await signOutMock();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    clinicId: session?.clinic_id ?? null,
    loading,
    signIn,
    signUp,
    signOut,
  }), [session, loading, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
