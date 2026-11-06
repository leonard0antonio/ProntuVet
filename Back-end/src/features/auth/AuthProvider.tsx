import type { ReactNode } from 'react';
import { LocalAuthProvider } from './LocalAuthProvider';
import { SupabaseAuthProvider } from './SupabaseAuthProvider';
import { isSupabaseMode } from '../../../../src/services/supabaseClient';

export function AuthProvider({ children }: { children: ReactNode }) {
  if (isSupabaseMode) {
    return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
  }
  return <LocalAuthProvider>{children}</LocalAuthProvider>;
}
