import { createVisit } from '../../Back-end/src/features/medicalRecords/visit.api';
import { medicalRecordsApi } from '../../Back-end/src/features/medicalRecords/medicalRecords.api';
import {
  assertActiveClinic,
  getActiveMockSession,
  signInMock,
  signOutMock,
  signUpMock,
  type SignUpInput,
} from '../../Back-end/src/features/auth/mockAuth';
import { petsApi } from '../../Back-end/src/features/pets/pets.api';
import { tutorsApi } from '../../Back-end/src/features/tutors/tutors.api';
import { createLocalId, networkDelay, readTable, writeTable } from '../../Back-end/src/services/localDb';
import type { MedicalRecordRow, PetRow, TutorRow } from '../../Back-end/src/types/database';
import { sanitizeText, sanitizeUrl } from '../utils/sanitize';
import type {
  Alert,
  Appointment,
  HospitalizedPet,
  ListParams,
  PaginatedResponse,
  Pet,
  Prontuario,
  Tutor,
  User,
} from './apiTypes';

export type CreateProntuarioPayload = Omit<
  Prontuario,
  'id' | 'createdAt' | 'updatedAt' | 'petId'
> & { tutorId: string };

function activeClinicId(): string {
  const session = getActiveMockSession();
  if (!session) throw new Error('Not authenticated');
  return session.clinic_id;
}

function toUser(): User {
  const session = getActiveMockSession();
  if (!session) throw new Error('Not authenticated');
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata.full_name,
    role: 'veterinario',
  };
}

function toTutor(row: TutorRow): Tutor {
  return {
    id: row.id,
    name: row.full_name,
    cpf: row.cpf ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    address: row.address ?? '',
    city: row.city ?? '',
    zip: row.zip ?? '',
    tutorType: 'cliente',
  };
}

function calculateAge(birthDate: string | null): number {
  if (!birthDate) return 0;
  const today = new Date();
  const born = new Date(`${birthDate}T00:00:00`);
  let age = today.getFullYear() - born.getFullYear();
  const beforeBirthday = today.getMonth() < born.getMonth()
    || (today.getMonth() === born.getMonth() && today.getDate() < born.getDate());
  if (beforeBirthday) age--;
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

function toProntuario(row: MedicalRecordRow, pet: PetRow): Prontuario {
  const attachments = readTable('exam_files')
    .filter(file => file.clinic_id === row.clinic_id && file.medical_record_id === row.id)
    .map(file => file.object_path);
  return {
    id: row.id,
    petId: row.pet_id,
    petName: pet.name,
    species: pet.species,
    breed: pet.breed ?? '',
    age: calculateAge(pet.birth_date),
    weight: pet.weight_kg ?? 0,
    vaccinationDate: row.vaccination_date ?? '',
    prescription: row.prescription ?? '',
    examAttachments: attachments,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function paginate<T>(rows: T[], params: ListParams = {}): PaginatedResponse<T> {
  const pageSize = Math.max(1, params.pageSize ?? 10);
  const page = Math.max(1, params.page ?? 1);
  const start = (page - 1) * pageSize;
  return {
    data: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
    totalPages: Math.ceil(rows.length / pageSize),
  };
}

function sortRows<T extends object>(rows: T[], params: ListParams): T[] {
  if (!params.sortBy) return rows;
  const sortBy = params.sortBy;
  const direction = params.sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((left, right) => {
    const a = Reflect.get(left, sortBy);
    const b = Reflect.get(right, sortBy);
    return String(a ?? '').localeCompare(String(b ?? ''), 'pt-BR', { numeric: true }) * direction;
  });
}

function searchTutors(rows: Tutor[], search?: string): Tutor[] {
  const query = search?.trim().toLocaleLowerCase('pt-BR');
  if (!query) return rows;
  return rows.filter(tutor =>
    [tutor.name, tutor.email, tutor.phone, tutor.cpf]
      .some(value => value.toLocaleLowerCase('pt-BR').includes(query)),
  );
}

function asTutorRecord(data: Omit<Tutor, 'id'>) {
  return {
    clinicId: activeClinicId(),
    fullName: sanitizeText(data.name),
    cpf: sanitizeText(data.cpf),
    phone: sanitizeText(data.phone),
    email: sanitizeText(data.email),
    address: sanitizeText(data.address),
    city: sanitizeText(data.city),
    zip: sanitizeText(data.zip),
  };
}

function getMedicalRecord(clinicId: string, id: string): MedicalRecordRow {
  const record = readTable('medical_records').find(
    item => item.clinic_id === clinicId && item.id === id,
  );
  if (!record) throw new Error('Medical record not found');
  return record;
}

function getPet(clinicId: string, id: string): PetRow {
  const pet = readTable('pets').find(item => item.clinic_id === clinicId && item.id === id);
  if (!pet) throw new Error('Pet not found');
  return pet;
}

async function recordList(clinicId: string, petId?: string): Promise<Prontuario[]> {
  return (await medicalRecordsApi.list(clinicId, petId))
    .map(record => toProntuario(record, getPet(clinicId, record.pet_id)));
}

export const api = {
  auth: {
    async login(email: string, password: string): Promise<{ user: User; token: string }> {
      const { session } = await signInMock(email, password);
      return { user: toUser(), token: session.access_token };
    },

    async signUp(input: SignUpInput): Promise<{ user: User; token: string }> {
      const { session } = await signUpMock(input);
      return { user: toUser(), token: session.access_token };
    },

    async logout(): Promise<void> {
      await signOutMock();
    },

    async refreshToken(): Promise<string> {
      const session = getActiveMockSession();
      if (!session) throw new Error('Not authenticated');
      return session.access_token;
    },

    async getCurrentUser(): Promise<User> {
      await networkDelay();
      return toUser();
    },
  },

  tutors: {
    async list(params: ListParams = {}): Promise<PaginatedResponse<Tutor>> {
      const rows = await tutorsApi.list(activeClinicId());
      const matching = searchTutors(rows.map(toTutor), params.search);
      return paginate(sortRows(matching, params), params);
    },

    async get(id: string): Promise<Tutor> {
      const tutor = await tutorsApi.get(activeClinicId(), id);
      if (!tutor) throw new Error('Tutor not found');
      return toTutor(tutor);
    },

    async create(data: Omit<Tutor, 'id'>): Promise<Tutor> {
      return toTutor(await tutorsApi.create(asTutorRecord(data)));
    },

    async update(id: string, data: Partial<Tutor>): Promise<Tutor> {
      const update = {
        ...(data.name !== undefined ? { fullName: sanitizeText(data.name) } : {}),
        ...(data.cpf !== undefined ? { cpf: sanitizeText(data.cpf) } : {}),
        ...(data.phone !== undefined ? { phone: sanitizeText(data.phone) } : {}),
        ...(data.email !== undefined ? { email: sanitizeText(data.email) } : {}),
        ...(data.address !== undefined ? { address: sanitizeText(data.address) } : {}),
        ...(data.city !== undefined ? { city: sanitizeText(data.city) } : {}),
        ...(data.zip !== undefined ? { zip: sanitizeText(data.zip) } : {}),
      };
      return toTutor(await tutorsApi.update(activeClinicId(), id, update));
    },

    async delete(id: string): Promise<void> {
      await tutorsApi.delete(activeClinicId(), id);
    },
  },

  pets: {
    async list(tutorId?: string, params: ListParams = {}): Promise<PaginatedResponse<Pet>> {
      const rows = (await petsApi.list(activeClinicId(), tutorId)).map(toPet);
      return paginate(sortRows(rows, params), params);
    },

    async get(id: string): Promise<Pet> {
      const pet = await petsApi.get(activeClinicId(), id);
      if (!pet) throw new Error('Pet not found');
      return toPet(pet);
    },

    async create(data: Omit<Pet, 'id'>): Promise<Pet> {
      const pet = await petsApi.create({
        clinicId: activeClinicId(),
        tutorId: data.tutorId,
        name: sanitizeText(data.name),
        species: sanitizeText(data.species),
        breed: sanitizeText(data.breed),
        age: data.age,
        weight: data.weight,
      });
      return toPet(pet);
    },

    async update(id: string, data: Partial<Pet>): Promise<Pet> {
      const updated = await petsApi.update(activeClinicId(), id, {
        ...(data.tutorId !== undefined ? { tutorId: data.tutorId } : {}),
        ...(data.name !== undefined ? { name: sanitizeText(data.name) } : {}),
        ...(data.species !== undefined ? { species: sanitizeText(data.species) } : {}),
        ...(data.breed !== undefined ? { breed: sanitizeText(data.breed) } : {}),
        ...(data.age !== undefined ? { age: data.age } : {}),
        ...(data.weight !== undefined ? { weight: data.weight } : {}),
      });
      return toPet(updated);
    },

    async delete(id: string): Promise<void> {
      await petsApi.delete(activeClinicId(), id);
    },
  },

  prontuarios: {
    async list(petId?: string, params: ListParams = {}): Promise<PaginatedResponse<Prontuario>> {
      const records = await recordList(activeClinicId(), petId);
      return paginate(sortRows(records, params), params);
    },

    async get(id: string): Promise<Prontuario> {
      const clinicId = activeClinicId();
      const record = await medicalRecordsApi.get(clinicId, id);
      if (!record) throw new Error('Medical record not found');
      return toProntuario(record, getPet(clinicId, record.pet_id));
    },

    async create(data: CreateProntuarioPayload): Promise<Prontuario> {
      const clinicId = activeClinicId();
      const { medicalRecord } = await createVisit({
        clinicId,
        tutorId: data.tutorId,
        veterinarianId: getActiveMockSession()?.user_id ?? '',
        pet: {
          name: sanitizeText(data.petName),
          species: sanitizeText(data.species),
          breed: sanitizeText(data.breed),
          age: data.age,
          weight: data.weight,
        },
        vaccinationDate: data.vaccinationDate,
        prescription: sanitizeText(data.prescription),
        examAttachments: data.examAttachments.map(sanitizeUrl).filter(Boolean),
      });
      return toProntuario(medicalRecord, getPet(clinicId, medicalRecord.pet_id));
    },

    async update(id: string, data: Partial<Prontuario>): Promise<Prontuario> {
      const clinicId = activeClinicId();
      const current = getMedicalRecord(clinicId, id);
      if (
        data.petName !== undefined
        || data.species !== undefined
        || data.breed !== undefined
        || data.age !== undefined
        || data.weight !== undefined
      ) {
        await petsApi.update(clinicId, current.pet_id, {
          ...(data.petName !== undefined ? { name: sanitizeText(data.petName) } : {}),
          ...(data.species !== undefined ? { species: sanitizeText(data.species) } : {}),
          ...(data.breed !== undefined ? { breed: sanitizeText(data.breed) } : {}),
          ...(data.age !== undefined ? { age: data.age } : {}),
          ...(data.weight !== undefined ? { weight: data.weight } : {}),
        });
      }

      const record = await medicalRecordsApi.update(clinicId, id, {
        ...(data.vaccinationDate !== undefined
          ? { vaccinationDate: data.vaccinationDate || null }
          : {}),
        ...(data.prescription !== undefined
          ? { prescription: sanitizeText(data.prescription) }
          : {}),
      });
      if (data.examAttachments !== undefined) {
        const files = readTable('exam_files').filter(
          file => file.clinic_id !== clinicId || file.medical_record_id !== id,
        );
        const now = new Date().toISOString();
        const newFiles = data.examAttachments.map(sanitizeUrl).filter(Boolean).map(url => ({
          id: createLocalId(),
          clinic_id: clinicId,
          medical_record_id: id,
          object_path: url,
          original_name: url.split('/').pop()?.split('?')[0] || 'exame.pdf',
          content_type: 'application/pdf',
          size_bytes: 1,
          created_at: now,
        }));
        writeTable('exam_files', [...files, ...newFiles]);
      }
      return toProntuario(record, getPet(clinicId, record.pet_id));
    },

    async delete(id: string): Promise<void> {
      await medicalRecordsApi.delete(activeClinicId(), id);
    },
  },

  dashboard: {
    async getAppointments(): Promise<Appointment[]> {
      await networkDelay();
      assertActiveClinic(activeClinicId());
      return [];
    },

    async getHospitalizedPets(): Promise<HospitalizedPet[]> {
      await networkDelay();
      assertActiveClinic(activeClinicId());
      return [];
    },

    async getAlerts(): Promise<Alert[]> {
      await networkDelay();
      assertActiveClinic(activeClinicId());
      return [];
    },

    async getStats(): Promise<{
      totalAppointments: number;
      todayAppointments: number;
      hospitalizedPets: number;
      pendingAlerts: number;
    }> {
      await networkDelay();
      assertActiveClinic(activeClinicId());
      return {
        totalAppointments: 0,
        todayAppointments: 0,
        hospitalizedPets: 0,
        pendingAlerts: 0,
      };
    },
  },
};

export { readTable, writeTable };
