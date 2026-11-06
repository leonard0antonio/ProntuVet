import type {
  AuthAccountRow,
  ClinicMembershipRow,
  ClinicRow,
  ProfileRow,
} from '../../types/database';
import { createLocalId, networkDelay, readTable, writeTable } from '../../services/localDb';

export const DEMO_USER_ID = '11111111-1111-4111-8111-111111111111';
export const DEMO_CLINIC_ID = '22222222-2222-4222-8222-222222222222';
export const DEMO_EMAIL = 'vet@prontuvet.local';
export const DEMO_PASSWORD = 'ProntuVet123!';
const SESSION_STORAGE_KEY = 'prontuvet.mock.session';
export const MOCK_SESSION_EVENT = 'prontuvet:mock-session';

export interface MockUser {
  id: string;
  email: string;
  user_metadata: { full_name: string; clinic_id: string };
}

export interface MockSession {
  access_token: string;
  token_type: 'bearer';
  expires_at: number;
  user_id: string;
  clinic_id: string;
  user: MockUser;
}

export interface MockAuthResult {
  user: MockUser;
  session: MockSession;
}

export interface SignUpInput {
  fullName: string;
  clinicName: string;
  email: string;
  password: string;
  crmv?: string;
}

let activeSession: MockSession | null = null;

async function hashPassword(password: string, salt: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure password hashing is unavailable in this browser');
  }
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${salt}:${password}`),
  );
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function ensureTenant(userId: string, email: string, fullName: string, clinicId: string, clinicName: string, crmv?: string): void {
  const now = new Date().toISOString();
  const clinics = readTable('clinics');
  if (!clinics.some(clinic => clinic.id === clinicId)) {
    const demoClinic: ClinicRow = {
      id: clinicId,
      name: clinicName,
      created_at: now,
    };
    writeTable('clinics', [...clinics, demoClinic]);
  }

  const profiles = readTable('profiles');
  if (!profiles.some(profile => profile.id === userId)) {
    const demoProfile: ProfileRow = {
      id: userId,
      full_name: fullName,
      email,
      created_at: now,
    };
    writeTable('profiles', [...profiles, demoProfile]);
  }

  const memberships = readTable('clinic_memberships');
  if (!memberships.some(
    membership => membership.clinic_id === clinicId && membership.user_id === userId,
  )) {
    const demoMembership: ClinicMembershipRow = {
      clinic_id: clinicId,
      user_id: userId,
      role: 'owner',
      status: 'active',
      crmv: crmv || null,
      crmv_state: null,
      created_at: now,
    };
    writeTable('clinic_memberships', [...memberships, demoMembership]);
  }
}

function makeSession(userId: string, email: string, fullName: string, clinicId: string): MockSession {
  const user: MockUser = {
    id: userId,
    email,
    user_metadata: { full_name: fullName, clinic_id: clinicId },
  };
  return {
    access_token: `mock-${createLocalId()}`,
    token_type: 'bearer',
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    user_id: userId,
    clinic_id: clinicId,
    user,
  };
}

function persistSession(session: MockSession | null): void {
  if (typeof window === 'undefined') {
    throw new Error('Mock authentication requires browser localStorage');
  }

  if (session) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
  activeSession = session;
  window.dispatchEvent(new CustomEvent<MockSession | null>(MOCK_SESSION_EVENT, {
    detail: session,
  }));
}

export async function signInMock(email: string, password: string): Promise<MockAuthResult> {
  await networkDelay();
  const normalizedEmail = email.trim().toLowerCase();
  let userId: string;
  let clinicId: string;
  let fullName: string;
  let userEmail: string;

  if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
    userId = DEMO_USER_ID;
    clinicId = DEMO_CLINIC_ID;
    fullName = 'Veterinário de Demonstração';
    userEmail = DEMO_EMAIL;
    ensureTenant(userId, userEmail, fullName, clinicId, 'Clínica de Demonstração ProntuVet');
  } else {
    const account = readTable('auth_accounts').find(row => row.email === normalizedEmail);
    if (
      !account
      || account.password_hash !== await hashPassword(password, account.password_salt)
    ) {
      throw new Error('Invalid login credentials');
    }

    const membership = readTable('clinic_memberships').find(
      row => row.user_id === account.id && row.status === 'active',
    );
    const profile = readTable('profiles').find(row => row.id === account.id);
    if (!membership || !profile) throw new Error('Account is missing an active clinic');
    userId = account.id;
    clinicId = membership.clinic_id;
    fullName = profile.full_name;
    userEmail = account.email;
  }

  const session = makeSession(userId, userEmail, fullName, clinicId);
  const user = session.user;

  persistSession(session);
  return { user, session };
}

export async function signUpMock(input: SignUpInput): Promise<MockAuthResult> {
  await networkDelay();
  if (
    !input?.fullName?.trim()
    || !input.clinicName?.trim()
    || !input.email?.trim()
    || !input.password
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
  ) {
    throw new Error('Missing required fields');
  }
  if (input.password.length < 8) throw new Error('Password must contain at least 8 characters');

  const email = input.email.trim().toLowerCase();
  if (readTable('auth_accounts').some(account => account.email === email)) {
    throw new Error('An account with this email already exists');
  }

  const userId = createLocalId();
  const clinicId = createLocalId();
  const now = new Date().toISOString();
  const passwordSalt = createLocalId();
  const account: AuthAccountRow = {
    id: userId,
    email,
    password_salt: passwordSalt,
    password_hash: await hashPassword(input.password, passwordSalt),
    created_at: now,
  };
  const session = makeSession(userId, email, input.fullName.trim(), clinicId);
  const previousAccounts = readTable('auth_accounts');
  const previousClinics = readTable('clinics');
  const previousProfiles = readTable('profiles');
  const previousMemberships = readTable('clinic_memberships');
  try {
    writeTable('auth_accounts', [...previousAccounts, account]);
    ensureTenant(userId, email, input.fullName.trim(), clinicId, input.clinicName.trim(), input.crmv);
    persistSession(session);
  } catch (error) {
    writeTable('auth_accounts', previousAccounts);
    writeTable('clinics', previousClinics);
    writeTable('profiles', previousProfiles);
    writeTable('clinic_memberships', previousMemberships);
    throw error;
  }
  return { user: session.user, session };
}
export async function signOutMock(): Promise<void> {
  await networkDelay();
  persistSession(null);
}

export function restoreMockSession(): MockSession | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    activeSession = null;
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object'
      || parsed === null
      || !('user_id' in parsed)
      || !('clinic_id' in parsed)
      || !('expires_at' in parsed)
      || typeof parsed.user_id !== 'string'
      || typeof parsed.clinic_id !== 'string'
      || typeof parsed.expires_at !== 'number'
      || parsed.expires_at <= Math.floor(Date.now() / 1000)
    ) {
      persistSession(null);
      return null;
    }

    activeSession = parsed as MockSession;
    return activeSession;
  } catch {
    persistSession(null);
    return null;
  }
}

export function getActiveMockSession(): MockSession | null {
  return activeSession;
}

export function assertActiveClinic(clinicId: string): MockSession {
  const session = getActiveMockSession();
  if (!session) throw new Error('Not authenticated');
  if (session.clinic_id !== clinicId) throw new Error('Row-level security policy violation');
  const isActiveMember = readTable('clinic_memberships').some(
    membership =>
      membership.clinic_id === clinicId
      && membership.user_id === session.user_id
      && membership.status === 'active',
  );
  if (!isActiveMember) throw new Error('Row-level security policy violation');
  return session;
}
