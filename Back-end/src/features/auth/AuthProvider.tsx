import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  restoreMockSession,
  MOCK_SESSION_EVENT,
  signUpMock,
  signInMock,
  signOutMock,
  type MockSession,
  type MockAuthResult,
  type MockUser,
  type SignUpInput,
} from './mockAuth';
import { initializeLocalDb } from '../../services/localDb';

interface AuthContextValue {
  session: MockSession | null;
  user: MockUser | null;
  clinicId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<MockAuthResult>;
  signUp: (input: SignUpInput) => Promise<MockAuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
