import { api as localApi, readTable, writeTable } from './localApi';
import { isSupabaseMode } from './supabaseClient';
import { supabaseApi } from './supabaseApi';

export const api = isSupabaseMode ? supabaseApi : localApi;
export { readTable, writeTable };
export type { CreateProntuarioPayload } from './apiTypes';
