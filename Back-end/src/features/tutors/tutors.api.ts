import { assertActiveClinic } from '../auth/mockAuth';
import { createLocalId, networkDelay, readTable, writeTable } from '../../services/localDb';
import type { TutorInsert, TutorRow, TutorUpdate } from '../../types/database';

function normalizeOptional(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeCpf(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 11) throw new Error('Invalid CPF');
  return digits;
}

function assertUniqueCpf(
  tutors: TutorRow[],
  clinicId: string,
  cpf: string | null,
  excludingId?: string,
): void {
  if (
    cpf
    && tutors.some(
      tutor =>
        tutor.clinic_id === clinicId
        && tutor.cpf === cpf
        && tutor.id !== excludingId,
    )
  ) {
    throw new Error('A tutor with this CPF already exists in the clinic');
  }
}

function requireTutorFields(input: TutorInsert): void {
  if (!input || !input.clinicId || !input.fullName?.trim()) {
    throw new Error('Missing required fields');
  }
}

export const tutorsApi = {
  async list(clinicId: string): Promise<TutorRow[]> {
    await networkDelay();
    assertActiveClinic(clinicId);
    return readTable('tutors').filter(tutor => tutor.clinic_id === clinicId);
  },

  async get(clinicId: string, id: string): Promise<TutorRow | null> {
    await networkDelay();
    assertActiveClinic(clinicId);
    return readTable('tutors').find(
      tutor => tutor.clinic_id === clinicId && tutor.id === id,
    ) ?? null;
  },

  async create(input: TutorInsert): Promise<TutorRow> {
    await networkDelay();
    requireTutorFields(input);
    const session = assertActiveClinic(input.clinicId);
    const now = new Date().toISOString();
    const tutor: TutorRow = {
      id: createLocalId(),
      clinic_id: input.clinicId,
      full_name: input.fullName.trim(),
      cpf: normalizeCpf(input.cpf),
      phone: normalizeOptional(input.phone),
      email: normalizeOptional(input.email)?.toLowerCase() ?? null,
      address: normalizeOptional(input.address),
      city: normalizeOptional(input.city),
      zip: normalizeOptional(input.zip),
      created_by: session.user_id,
      created_at: now,
      updated_at: now,
    };

    const tutors = readTable('tutors');
    assertUniqueCpf(tutors, tutor.clinic_id, tutor.cpf);
    const clinics = readTable('clinics');
    if (!clinics.some(clinic => clinic.id === tutor.clinic_id)) {
      throw new Error('Foreign key violation: clinic does not exist');
    }

    writeTable('tutors', [...tutors, tutor]);
    return tutor;
  },

  async update(clinicId: string, id: string, input: TutorUpdate): Promise<TutorRow> {
    await networkDelay();
    assertActiveClinic(clinicId);
    const tutors = readTable('tutors');
    const index = tutors.findIndex(
      tutor => tutor.clinic_id === clinicId && tutor.id === id,
    );
    if (index < 0) throw new Error('Tutor not found');

    const current = tutors[index];
    const cpf = input.cpf !== undefined ? normalizeCpf(input.cpf) : current.cpf;
    assertUniqueCpf(tutors, clinicId, cpf, id);
    const updated: TutorRow = {
      ...current,
      ...(input.fullName !== undefined ? { full_name: input.fullName.trim() } : {}),
      ...(input.cpf !== undefined ? { cpf } : {}),
      ...(input.phone !== undefined ? { phone: normalizeOptional(input.phone) } : {}),
      ...(input.email !== undefined
        ? { email: normalizeOptional(input.email)?.toLowerCase() ?? null }
        : {}),
      ...(input.address !== undefined ? { address: normalizeOptional(input.address) } : {}),
      ...(input.city !== undefined ? { city: normalizeOptional(input.city) } : {}),
      ...(input.zip !== undefined ? { zip: normalizeOptional(input.zip) } : {}),
      updated_at: new Date().toISOString(),
    };
    if (!updated.full_name) throw new Error('Missing required fields');

    tutors[index] = updated;
    writeTable('tutors', tutors);
    return updated;
  },

  async delete(clinicId: string, id: string): Promise<void> {
    await networkDelay();
    assertActiveClinic(clinicId);
    const tutors = readTable('tutors');
    const tutor = tutors.find(row => row.clinic_id === clinicId && row.id === id);
    if (!tutor) throw new Error('Tutor not found');

    if (readTable('pets').some(
      pet => pet.clinic_id === clinicId && pet.tutor_id === id,
    )) {
      throw new Error('Foreign key violation: tutor has pets');
    }

    writeTable('tutors', tutors.filter(
      row => row.clinic_id !== clinicId || row.id !== id,
    ));
  },
};
