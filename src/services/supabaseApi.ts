import type {
  Alert,
  Appointment,
  CreateProntuarioPayload,
  HospitalizedPet,
  ListParams,
  PaginatedResponse,
  Pet,
  Prontuario,
  Tutor,
  User,
} from './apiTypes';
import type {
  ExamFileRow,
  MedicalRecordRow,
  PetRow,
  TutorRow,
} from '../../Back-end/src/types/database';
import { requireSupabase } from './supabaseClient';
import { sanitizeText } from '../utils/sanitize';

function throwIfError<T>(
  result: { data: T | null; error: { message: string } | null },
): T {
  if (result.error) throw result.error;
  if (result.data === null) throw new Error('Supabase returned no data');
  return result.data;
}

function paginate<T>(data: T[], total: number, params: ListParams): PaginatedResponse<T> {
  const pageSize = Math.max(1, params.pageSize ?? 10);
  const page = Math.max(1, params.page ?? 1);
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

async function activeClinicId(): Promise<string> {
  const client = requireSupabase();
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await client
    .from('clinic_memberships')
    .select('clinic_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Authenticated user has no active clinic membership');
  return data.clinic_id;
}

function toTutor(row: TutorRow): Tutor {
  const cpf = row.cpf ?? '';
  return {
    id: row.id,
    name: row.full_name,
    cpf: cpf.length === 11
      ? `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
      : cpf,
    phone: row.phone ?? '',
    email: row.email ?? '',
    address: row.address ?? '',
    city: row.city ?? '',
    zip: row.zip ?? '',
    tutorType: 'cliente',
  };
}

function cpfDigits(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits && digits.length !== 11) throw new Error('CPF inválido');
  return digits;
}

function calculateAge(birthDate: string | null): number {
  if (!birthDate) return 0;
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth()
    || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--;
  return Math.max(age, 0);
}

function toPet(row: PetRow): Pet {
  return {
    id: row.id,
    tutorId: row.tutor_id,
    name: row.name,
    species: row.species,
    breed: row.breed ?? '',
    age: calculateAge(row.birth_date),
    weight: row.weight_kg ?? 0,
  };
}

function birthDateFromAge(age: number): string {
  if (!Number.isInteger(age) || age < 0 || age > 30) throw new Error('Invalid pet age');
  const date = new Date();
  date.setFullYear(date.getFullYear() - age);
  return date.toISOString().slice(0, 10);
}

async function mapMedicalRecords(
  clinicId: string,
  records: MedicalRecordRow[],
): Promise<Prontuario[]> {
  if (!records.length) return [];
  const client = requireSupabase();
  const recordIds = records.map(record => record.id);
  const petIds = [...new Set(records.map(record => record.pet_id))];
  const [petsResult, filesResult] = await Promise.all([
    client.from('pets').select('*').eq('clinic_id', clinicId).in('id', petIds),
    client.from('exam_files').select('*').eq('clinic_id', clinicId).in('medical_record_id', recordIds),
  ]);
  const pets = throwIfError(petsResult);
  const files = throwIfError(filesResult);
  const petById = new Map(pets.map(pet => [pet.id, pet]));
  const filesByRecord = new Map<string, ExamFileRow[]>();
  for (const file of files) {
    const related = filesByRecord.get(file.medical_record_id) ?? [];
    related.push(file);
    filesByRecord.set(file.medical_record_id, related);
  }

  return Promise.all(records.map(async record => {
    const pet = petById.get(record.pet_id);
    if (!pet) throw new Error(`Pet ${record.pet_id} was not returned by Supabase`);
    const attachments = await Promise.all((filesByRecord.get(record.id) ?? []).map(async file => {
      const { data, error } = await client.storage
        .from('exam-files')
        .createSignedUrl(file.object_path, 3600);
      if (error) throw error;
      return data.signedUrl;
    }));

    return {
      id: record.id,
      petId: record.pet_id,
      petName: pet.name,
      species: pet.species,
      breed: pet.breed ?? '',
      age: calculateAge(pet.birth_date),
      weight: pet.weight_kg ?? 0,
      vaccinationDate: record.vaccination_date ?? '',
      prescription: record.prescription ?? '',
      examAttachments: attachments,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }));
}

function pageRange(params: ListParams): [number, number] {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, params.pageSize ?? 10));
  const first = (page - 1) * pageSize;
  return [first, first + pageSize - 1];
}

function searchTerm(search?: string): string {
  return (search ?? '').trim().replace(/[,%()_*]/g, '').slice(0, 100);
}

async function uploadExamFiles(
  clinicId: string,
  medicalRecordId: string,
  files: File[],
): Promise<void> {
  if (!files.length) return;
  const client = requireSupabase();
  const uploadedPaths: string[] = [];
  try {
    for (const file of files) {
      if (file.type !== 'application/pdf' || file.size <= 0 || file.size > 10 * 1024 * 1024) {
        throw new Error('Anexo inválido: envie PDFs de até 10 MB.');
      }

      const objectPath = `${clinicId}/${medicalRecordId}/${crypto.randomUUID()}.pdf`;
      const uploadResult = await client.storage
        .from('exam-files')
        .upload(objectPath, file, { contentType: 'application/pdf', upsert: false });
      if (uploadResult.error) throw uploadResult.error;
      uploadedPaths.push(objectPath);

      const fileRow = {
        clinic_id: clinicId,
        medical_record_id: medicalRecordId,
        object_path: objectPath,
        original_name: file.name.slice(0, 255),
        content_type: 'application/pdf',
        size_bytes: file.size,
      };
      const insertResult = await client.from('exam_files').insert(fileRow);
      if (insertResult.error) throw insertResult.error;
    }
  } catch (error) {
    const cleanupErrors: string[] = [];
    if (uploadedPaths.length) {
      const removeResult = await client.storage.from('exam-files').remove(uploadedPaths);
      if (removeResult.error) cleanupErrors.push(removeResult.error.message);
      const metadataResult = await client
        .from('exam_files')
        .delete()
        .eq('clinic_id', clinicId)
        .eq('medical_record_id', medicalRecordId)
        .in('object_path', uploadedPaths);
      if (metadataResult.error) cleanupErrors.push(metadataResult.error.message);
    }
    if (cleanupErrors.length) {
      throw new Error(
        `Anexo não salvo (${error instanceof Error ? error.message : 'erro desconhecido'}). `
        + `A limpeza também falhou: ${cleanupErrors.join('; ')}`,
      );
    }
    throw error;
  }
}

export const supabaseApi = {
  auth: {
    async login(email: string, password: string): Promise<{ user: User; token: string }> {
      const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error('No authenticated session returned by Supabase');
      return {
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
          name: String(data.user.user_metadata.full_name ?? data.user.email ?? ''),
          role: 'veterinario',
        },
        token: data.session.access_token,
      };
    },

    async signUp(input: { fullName: string; clinicName: string; email: string; password: string }) {
      const { data, error } = await requireSupabase().auth.signUp({
        email: input.email,
        password: input.password,
        options: { data: { full_name: input.fullName, clinic_name: input.clinicName } },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Supabase did not return the created user');
      if (!data.session) {
        throw new Error('Confirme seu email e entre novamente para concluir o cadastro da clínica.');
      }
      const { data: clinicId, error: clinicError } = await requireSupabase().rpc(
        'create_clinic_with_owner',
        { clinic_name: input.clinicName },
      );
      if (clinicError) throw clinicError;
      return {
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
          name: input.fullName,
          role: 'veterinario' as const,
        },
        token: data.session.access_token,
        clinicId,
      };
    },

    async logout(): Promise<void> {
      const { error } = await requireSupabase().auth.signOut();
      if (error) throw error;
    },

    async refreshToken(): Promise<string> {
      const { data, error } = await requireSupabase().auth.refreshSession();
      if (error) throw error;
      if (!data.session) throw new Error('No authenticated session returned by Supabase');
      return data.session.access_token;
    },

    async getCurrentUser(): Promise<User> {
      const client = requireSupabase();
      const { data: { user }, error } = await client.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('Not authenticated');
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();
      if (profileError) throw profileError;
      return {
        id: user.id,
        email: user.email ?? '',
        name: profile?.full_name ?? user.email ?? '',
        role: 'veterinario',
      };
    },
  },

  tutors: {
    async list(params: ListParams = {}): Promise<PaginatedResponse<Tutor>> {
      const client = requireSupabase();
      const clinicId = await activeClinicId();
      const [from, to] = pageRange(params);
      const sortColumns: Record<string, string> = {
        name: 'full_name', full_name: 'full_name', email: 'email',
        phone: 'phone', city: 'city', createdAt: 'created_at',
      };
      const sortColumn = sortColumns[params.sortBy ?? ''] ?? 'full_name';
      let query = client.from('tutors').select('*', { count: 'exact' }).eq('clinic_id', clinicId);
      const term = searchTerm(params.search);
      if (term) {
        query = query.or(
          `full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,cpf.ilike.%${term}%`,
        );
      }
      const result = await query
        .order(sortColumn, { ascending: params.sortOrder !== 'desc' })
        .range(from, to);
      const rows = throwIfError(result);
      return paginate(rows.map(toTutor), result.count ?? 0, params);
    },

    async get(id: string): Promise<Tutor> {
      const client = requireSupabase();
      const clinicId = await activeClinicId();
      const result = await client.from('tutors')
        .select('*').eq('clinic_id', clinicId).eq('id', id).maybeSingle();
      const row = throwIfError(result);
      if (!row) throw new Error('Tutor not found');
      return toTutor(row);
    },

    async create(input: Omit<Tutor, 'id'>): Promise<Tutor> {
      const clinicId = await activeClinicId();
      const result = await requireSupabase().from('tutors').insert({
        clinic_id: clinicId,
        full_name: sanitizeText(input.name).trim(),
        cpf: cpfDigits(input.cpf),
        phone: sanitizeText(input.phone),
        email: sanitizeText(input.email).trim().toLowerCase(),
        address: sanitizeText(input.address),
        city: sanitizeText(input.city),
        zip: sanitizeText(input.zip),
      }).select('*').single();
      return toTutor(throwIfError(result));
    },

    async update(id: string, input: Partial<Tutor>): Promise<Tutor> {
      const clinicId = await activeClinicId();
      const update = {
        ...(input.name !== undefined ? { full_name: sanitizeText(input.name).trim() } : {}),
        ...(input.cpf !== undefined ? { cpf: cpfDigits(input.cpf) } : {}),
        ...(input.phone !== undefined ? { phone: sanitizeText(input.phone) } : {}),
        ...(input.email !== undefined ? { email: sanitizeText(input.email).trim().toLowerCase() } : {}),
        ...(input.address !== undefined ? { address: sanitizeText(input.address) } : {}),
        ...(input.city !== undefined ? { city: sanitizeText(input.city) } : {}),
        ...(input.zip !== undefined ? { zip: sanitizeText(input.zip) } : {}),
      };
      const result = await requireSupabase().from('tutors')
        .update(update).eq('clinic_id', clinicId).eq('id', id).select('*').maybeSingle();
      const row = throwIfError(result);
      if (!row) throw new Error('Tutor not found');
      return toTutor(row);
    },

    async delete(id: string): Promise<void> {
      const clinicId = await activeClinicId();
      const result = await requireSupabase().from('tutors')
        .delete().eq('clinic_id', clinicId).eq('id', id).select('id').maybeSingle();
      const row = throwIfError(result);
      if (!row) throw new Error('Tutor not found');
    },
  },

  pets: {
    async list(tutorId?: string, params: ListParams = {}): Promise<PaginatedResponse<Pet>> {
      const client = requireSupabase();
      const clinicId = await activeClinicId();
      const [from, to] = pageRange(params);
      const sortColumn = params.sortBy === 'species' ? 'species' : 'name';
      let query = client.from('pets').select('*', { count: 'exact' }).eq('clinic_id', clinicId);
      if (tutorId) query = query.eq('tutor_id', tutorId);
      const result = await query
        .order(sortColumn, { ascending: params.sortOrder !== 'desc' })
        .range(from, to);
      const rows = throwIfError(result);
      return paginate(rows.map(toPet), result.count ?? 0, params);
    },

    async get(id: string): Promise<Pet> {
      const clinicId = await activeClinicId();
      const result = await requireSupabase().from('pets')
        .select('*').eq('clinic_id', clinicId).eq('id', id).maybeSingle();
      const row = throwIfError(result);
      if (!row) throw new Error('Pet not found');
      return toPet(row);
    },

    async create(input: Omit<Pet, 'id'>): Promise<Pet> {
      const clinicId = await activeClinicId();
      const result = await requireSupabase().from('pets').insert({
        clinic_id: clinicId,
        tutor_id: input.tutorId,
        name: sanitizeText(input.name).trim(),
        species: sanitizeText(input.species).trim(),
        breed: sanitizeText(input.breed).trim() || null,
        birth_date: birthDateFromAge(input.age),
        weight_kg: input.weight,
      }).select('*').single();
      return toPet(throwIfError(result));
    },

    async update(id: string, input: Partial<Pet>): Promise<Pet> {
      const clinicId = await activeClinicId();
      const update = {
        ...(input.tutorId !== undefined ? { tutor_id: input.tutorId } : {}),
        ...(input.name !== undefined ? { name: sanitizeText(input.name).trim() } : {}),
        ...(input.species !== undefined ? { species: sanitizeText(input.species).trim() } : {}),
        ...(input.breed !== undefined ? { breed: sanitizeText(input.breed).trim() || null } : {}),
        ...(input.age !== undefined ? { birth_date: birthDateFromAge(input.age) } : {}),
        ...(input.weight !== undefined ? { weight_kg: input.weight } : {}),
      };
      const result = await requireSupabase().from('pets')
        .update(update).eq('clinic_id', clinicId).eq('id', id).select('*').maybeSingle();
      const row = throwIfError(result);
      if (!row) throw new Error('Pet not found');
      return toPet(row);
    },

    async delete(id: string): Promise<void> {
      const clinicId = await activeClinicId();
      const result = await requireSupabase().from('pets')
        .delete().eq('clinic_id', clinicId).eq('id', id).select('id').maybeSingle();
      const row = throwIfError(result);
      if (!row) throw new Error('Pet not found');
    },
  },

  prontuarios: {
    async list(petId?: string, params: ListParams = {}): Promise<PaginatedResponse<Prontuario>> {
      const client = requireSupabase();
      const clinicId = await activeClinicId();
      const [from, to] = pageRange(params);
      let query = client.from('medical_records')
        .select('*', { count: 'exact' })
        .eq('clinic_id', clinicId);
      if (petId) query = query.eq('pet_id', petId);
      const result = await query
        .order('visit_at', { ascending: params.sortOrder !== 'desc' })
        .range(from, to);
      const rows = throwIfError(result);
      return paginate(await mapMedicalRecords(clinicId, rows), result.count ?? 0, params);
    },

    async get(id: string): Promise<Prontuario> {
      const clinicId = await activeClinicId();
      const result = await requireSupabase().from('medical_records')
        .select('*').eq('clinic_id', clinicId).eq('id', id).maybeSingle();
      const row = throwIfError(result);
      if (!row) throw new Error('Medical record not found');
      const [record] = await mapMedicalRecords(clinicId, [row]);
      return record;
    },

    async create(input: CreateProntuarioPayload): Promise<Prontuario> {
      const client = requireSupabase();
      const clinicId = await activeClinicId();
      const visitResult = await client.rpc('create_visit', {
        clinic_id_input: clinicId,
        tutor_id_input: input.tutorId,
        pet_name_input: sanitizeText(input.petName).trim(),
        species_input: sanitizeText(input.species).trim(),
        breed_input: sanitizeText(input.breed).trim() || null,
        age_input: input.age,
        weight_input: input.weight,
        vaccination_date_input: input.vaccinationDate || null,
        prescription_input: sanitizeText(input.prescription).trim(),
      });
      const [created] = throwIfError(visitResult);
      if (!created) throw new Error('Supabase did not return the created visit');
      try {
        await uploadExamFiles(clinicId, created.medical_record_id, input.examFiles);
      } catch (error) {
        const recordCleanup = await client.from('medical_records').delete()
          .eq('clinic_id', clinicId).eq('id', created.medical_record_id);
        const petCleanup = await client.from('pets').delete()
          .eq('clinic_id', clinicId).eq('id', created.pet_id);
        const cleanupErrors = [recordCleanup.error, petCleanup.error]
          .filter((cleanupError): cleanupError is NonNullable<typeof cleanupError> => cleanupError !== null)
          .map(cleanupError => cleanupError.message);
        if (cleanupErrors.length) {
          throw new Error(
            `O prontuário não foi salvo (${error instanceof Error ? error.message : 'erro desconhecido'}). `
            + `A limpeza dos dados também falhou: ${cleanupErrors.join('; ')}`,
          );
        }
        throw error;
      }
      return this.get(created.medical_record_id);
    },

    async update(id: string, input: Partial<Prontuario>): Promise<Prontuario> {
      const clinicId = await activeClinicId();
      const client = requireSupabase();
      const currentResult = await client.from('medical_records')
        .select('pet_id').eq('clinic_id', clinicId).eq('id', id).maybeSingle();
      const current = throwIfError(currentResult);
      if (!current) throw new Error('Medical record not found');

      const petUpdate = {
        ...(input.petName !== undefined ? { name: sanitizeText(input.petName).trim() } : {}),
        ...(input.species !== undefined ? { species: sanitizeText(input.species).trim() } : {}),
        ...(input.breed !== undefined ? { breed: sanitizeText(input.breed).trim() || null } : {}),
        ...(input.age !== undefined ? { birth_date: birthDateFromAge(input.age) } : {}),
        ...(input.weight !== undefined ? { weight_kg: input.weight } : {}),
      };
      if (Object.keys(petUpdate).length) {
        const petResult = await client.from('pets').update(petUpdate)
          .eq('clinic_id', clinicId).eq('id', current.pet_id);
        if (petResult.error) throw petResult.error;
      }

      const recordUpdate = {
        ...(input.vaccinationDate !== undefined
          ? { vaccination_date: input.vaccinationDate || null }
          : {}),
        ...(input.prescription !== undefined
          ? { prescription: sanitizeText(input.prescription).trim() || null }
          : {}),
      };
      if (Object.keys(recordUpdate).length) {
        const updateResult = await client.from('medical_records').update(recordUpdate)
          .eq('clinic_id', clinicId).eq('id', id);
        if (updateResult.error) throw updateResult.error;
      }
      return this.get(id);
    },

    async delete(id: string): Promise<void> {
      const client = requireSupabase();
      const clinicId = await activeClinicId();
      const filesResult = await client.from('exam_files')
        .select('object_path').eq('clinic_id', clinicId).eq('medical_record_id', id);
      const files = throwIfError(filesResult);
      if (files.length) {
        const storageResult = await client.storage.from('exam-files')
          .remove(files.map(file => file.object_path));
        if (storageResult.error) throw storageResult.error;
        const metadataResult = await client.from('exam_files').delete()
          .eq('clinic_id', clinicId).eq('medical_record_id', id);
        if (metadataResult.error) throw metadataResult.error;
      }
      const deleteResult = await client.from('medical_records').delete()
        .eq('clinic_id', clinicId).eq('id', id).select('id').maybeSingle();
      const row = throwIfError(deleteResult);
      if (!row) throw new Error('Medical record not found');
    },
  },

  dashboard: {
    async getAppointments(): Promise<Appointment[]> {
      await activeClinicId();
      return [];
    },
    async getHospitalizedPets(): Promise<HospitalizedPet[]> {
      await activeClinicId();
      return [];
    },
    async getAlerts(): Promise<Alert[]> {
      await activeClinicId();
      return [];
    },
    async getStats() {
      await activeClinicId();
      return {
        totalAppointments: 0,
        todayAppointments: 0,
        hospitalizedPets: 0,
        pendingAlerts: 0,
      };
    },
  },
};
