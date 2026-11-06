import type { LocalTableName, LocalTables } from '../types/database';

const STORAGE_PREFIX = 'prontuvet.mock.';

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

export function networkDelay(): Promise<void> {
  return delay(500 + Math.floor(Math.random() * 501));
}

function getStorage(): Storage {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('Local database requires browser localStorage');
  }
  return window.localStorage;
}

function storageKey(table: LocalTableName): string {
  return `${STORAGE_PREFIX}${table}`;
}

export function initializeLocalDb(): void {
  const storage = getStorage();
  const tables: LocalTableName[] = [
    'clinics',
    'profiles',
    'auth_accounts',
    'clinic_memberships',
    'tutors',
    'pets',
    'medical_records',
    'exam_files',
  ];

  for (const table of tables) {
    const key = storageKey(table);
    if (storage.getItem(key) === null) {
      storage.setItem(key, JSON.stringify([]));
    }
  }
}

export function readTable<T extends LocalTableName>(table: T): LocalTables[T] {
  initializeLocalDb();
  const raw = getStorage().getItem(storageKey(table));
  if (raw === null) {
    throw new Error(`Local database table "${table}" was not initialized`);
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(`Local database table "${table}" contains invalid JSON`);
  }

  if (!Array.isArray(value)) {
    throw new Error(`Local database table "${table}" must contain an array`);
  }

  return value as LocalTables[T];
}

export function writeTable<T extends LocalTableName>(
  table: T,
  rows: LocalTables[T],
): void {
  initializeLocalDb();
  getStorage().setItem(storageKey(table), JSON.stringify(rows));
}

export function createLocalId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
