import { createContext } from 'react';
import type { SignUpInput } from './mockAuth';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: { full_name: string; clinic_id: string };
}

export interface AuthSession {
  access_token: string;
  token_type: 'bearer';
  expires_at: number;
  user_id: string;
  clinic_id: string;
  user: AuthUser;
}

export interface AuthResult {
  user: AuthUser;
  session: AuthSession | null;
}

export interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  clinicId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
