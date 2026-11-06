import { assertActiveClinic } from '../auth/mockAuth';
import { createLocalId, networkDelay, readTable, writeTable } from '../../services/localDb';
import type {
  MedicalRecordInsert,
  MedicalRecordRow,
  MedicalRecordUpdate,
} from '../../types/database';

function assertClinicalAccess(clinicId: string): void {
  const session = assertActiveClinic(clinicId);
  const membership = readTable('clinic_memberships').find(
    row => row.clinic_id === clinicId
      && row.user_id === session.user_id
      && row.status === 'active',
  );
  if (!membership || !['owner', 'admin', 'vet'].includes(membership.role)) {
    throw new Error('Insufficient permissions to access medical records');
  }
}

function requireRecordFields(input: MedicalRecordInsert): void {
  if (!input || !input.clinicId || !input.petId || !input.veterinarianId) {
    throw new Error('Missing required fields');
  }
}

export const medicalRecordsApi = {
  async list(clinicId: string, petId?: string): Promise<MedicalRecordRow[]> {
    await networkDelay();
    assertClinicalAccess(clinicId);
    return readTable('medical_records').filter(record =>
      record.clinic_id === clinicId && (!petId || record.pet_id === petId),
    );
  },

  async get(clinicId: string, id: string): Promise<MedicalRecordRow | null> {
    await networkDelay();
    assertClinicalAccess(clinicId);
    return readTable('medical_records').find(
      record => record.clinic_id === clinicId && record.id === id,
    ) ?? null;
  },

  async create(input: MedicalRecordInsert): Promise<MedicalRecordRow> {
    await networkDelay();
    requireRecordFields(input);
    const session = assertActiveClinic(input.clinicId);
    assertClinicalAccess(input.clinicId);

    const petExists = readTable('pets').some(
      pet => pet.id === input.petId && pet.clinic_id === input.clinicId,
    );
    if (!petExists) throw new Error('Foreign key violation: pet does not exist in clinic');

    const membershipExists = readTable('clinic_memberships').some(
      membership =>
        membership.clinic_id === input.clinicId
        && membership.user_id === input.veterinarianId
        && membership.status === 'active'
        && ['owner', 'admin', 'vet'].includes(membership.role),
    );
    if (!membershipExists) {
      throw new Error('Foreign key violation: veterinarian is not an active clinic member');
    }

    const now = new Date().toISOString();
    const record: MedicalRecordRow = {
      id: createLocalId(),
      clinic_id: input.clinicId,
      pet_id: input.petId,
      veterinarian_id: input.veterinarianId,
      visit_at: input.visitAt ?? now,
      diagnosis: input.diagnosis?.trim() || null,
      prescription: input.prescription?.trim() || null,
      vaccination_date: input.vaccinationDate ?? null,
      created_by: session.user_id,
      created_at: now,
      updated_at: now,
    };

    writeTable('medical_records', [...readTable('medical_records'), record]);
    return record;
  },

  async update(
    clinicId: string,
    id: string,
    input: MedicalRecordUpdate,
  ): Promise<MedicalRecordRow> {
    await networkDelay();
    assertClinicalAccess(clinicId);
    const records = readTable('medical_records');
    const index = records.findIndex(
      record => record.clinic_id === clinicId && record.id === id,
    );
    if (index < 0) throw new Error('Medical record not found');

    const current = records[index];
    const nextPetId = input.petId ?? current.pet_id;
    if (!readTable('pets').some(
      pet => pet.id === nextPetId && pet.clinic_id === clinicId,
    )) {
      throw new Error('Foreign key violation: pet does not exist in clinic');
    }
    const nextVeterinarianId = input.veterinarianId ?? current.veterinarian_id;
    if (!readTable('clinic_memberships').some(
      membership =>
        membership.clinic_id === clinicId
        && membership.user_id === nextVeterinarianId
        && membership.status === 'active'
        && ['owner', 'admin', 'vet'].includes(membership.role),
    )) {
      throw new Error('Foreign key violation: veterinarian is not an active clinic member');
    }

    const updated: MedicalRecordRow = {
      ...current,
      ...(input.petId !== undefined ? { pet_id: input.petId } : {}),
      ...(input.veterinarianId !== undefined
        ? { veterinarian_id: input.veterinarianId }
        : {}),
      ...(input.visitAt !== undefined ? { visit_at: input.visitAt } : {}),
      ...(input.diagnosis !== undefined
        ? { diagnosis: input.diagnosis?.trim() || null }
        : {}),
      ...(input.prescription !== undefined
        ? { prescription: input.prescription?.trim() || null }
        : {}),
      ...(input.vaccinationDate !== undefined
        ? { vaccination_date: input.vaccinationDate }
        : {}),
      updated_at: new Date().toISOString(),
    };
    records[index] = updated;
    writeTable('medical_records', records);
    return updated;
  },

  async delete(clinicId: string, id: string): Promise<void> {
    await networkDelay();
    assertClinicalAccess(clinicId);
    const records = readTable('medical_records');
    const record = records.find(row => row.clinic_id === clinicId && row.id === id);
    if (!record) throw new Error('Medical record not found');

    if (readTable('exam_files').some(
      file => file.clinic_id === clinicId && file.medical_record_id === id,
    )) {
      throw new Error('Foreign key violation: medical record has exam files');
    }

    writeTable('medical_records', records.filter(
      row => row.clinic_id !== clinicId || row.id !== id,
    ));
  },
};
