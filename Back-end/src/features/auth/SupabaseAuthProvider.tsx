import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { SignUpInput } from './mockAuth';
import { AuthContext, type AuthContextValue, type AuthResult, type AuthSession } from './authContext';
import { requireSupabase } from '../../../../src/services/supabaseClient';

const PENDING_CLINIC_KEY = 'prontuvet.pending-clinic';

function mapSession(session: Session, clinicId: string): AuthSession {
  const email = session.user.email ?? '';
  const fullName = session.user.user_metadata.full_name;
  return {
    access_token: session.access_token,
    token_type: 'bearer',
    expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
    user_id: session.user.id,
    clinic_id: clinicId,
    user: {
      id: session.user.id,
      email,
      user_metadata: {
        full_name: typeof fullName === 'string' && fullName.trim() ? fullName : email,
        clinic_id: clinicId,
      },
    },
  };
}

function mapUser(user: SupabaseUser): AuthResult['user'] {
  const email = user.email ?? '';
  const fullName = user.user_metadata.full_name;
  return {
    id: user.id,
    email,
    user_metadata: {
      full_name: typeof fullName === 'string' && fullName.trim() ? fullName : email,
      clinic_id: '',
    },
  };
}

async function getClinicId(userId: string): Promise<string | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('clinic_memberships')
    .select('clinic_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.clinic_id ?? null;
}

async function createPendingClinic(user: SupabaseUser): Promise<string> {
  const client = requireSupabase();
  const pending = window.localStorage.getItem(PENDING_CLINIC_KEY);
  let clinicName = user.user_metadata.clinic_name;

  if (pending) {
    try {
      const parsed: unknown = JSON.parse(pending);
      if (
        typeof parsed === 'object'
        && parsed !== null
        && 'clinicName' in parsed
        && typeof parsed.clinicName === 'string'
      ) {
        clinicName = parsed.clinicName;
      }
    } catch {
      window.localStorage.removeItem(PENDING_CLINIC_KEY);
    }
  }

  if (typeof clinicName !== 'string' || clinicName.trim().length < 2) {
    throw new Error('Esta conta ainda não está vinculada a uma clínica. Cadastre a clínica novamente.');
  }

  const { data: clinicId, error } = await client.rpc('create_clinic_with_owner', {
    clinic_name: clinicName.trim(),
  });
  if (error) throw error;
  window.localStorage.removeItem(PENDING_CLINIC_KEY);
  return clinicId;
}

async function hydrateSession(session: Session): Promise<AuthSession> {
  let clinicId = await getClinicId(session.user.id);
  if (!clinicId) clinicId = await createPendingClinic(session.user);
  return mapSession(session, clinicId);
}

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = requireSupabase();
    let active = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, authSession) => {
      if (!authSession) {
        setSession(null);
        setLoading(false);
        return;
      }

      window.setTimeout(() => {
        void hydrateSession(authSession)
          .then(nextSession => {
            if (active) setSession(nextSession);
          })
          .catch(error => {
            console.error('Unable to restore the Supabase clinic session', error);
            if (active) setSession(null);
          })
          .finally(() => {
            if (active) setLoading(false);
          });
      }, 0);
    });

    void client.auth.getSession()
      .then(async ({ data, error }) => {
        if (error) throw error;
        if (!data.session) return;
        const nextSession = await hydrateSession(data.session);
        if (active) setSession(nextSession);
      })
      .catch(error => {
        console.error('Unable to restore the Supabase session', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.session) throw new Error('O Supabase não retornou uma sessão autenticada.');

    const nextSession = await hydrateSession(data.session);
    setSession(nextSession);
    return { user: nextSession.user, session: nextSession };
  }, []);

  const signUp = useCallback(async (input: SignUpInput): Promise<AuthResult> => {
    const client = requireSupabase();
    window.localStorage.setItem(PENDING_CLINIC_KEY, JSON.stringify({
      clinicName: input.clinicName.trim(),
    }));

    const { data, error } = await client.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: {
          full_name: input.fullName.trim(),
          clinic_name: input.clinicName.trim(),
        },
      },
    });

    if (error) {
      window.localStorage.removeItem(PENDING_CLINIC_KEY);
      throw error;
    }
    if (!data.user) throw new Error('O Supabase não retornou o usuário cadastrado.');

    if (!data.session) {
      return { user: mapUser(data.user), session: null };
    }

    const nextSession = await hydrateSession(data.session);
    setSession(nextSession);
    return { user: nextSession.user, session: nextSession };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw error;
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
