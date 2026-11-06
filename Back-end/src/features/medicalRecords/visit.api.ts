import { assertActiveClinic } from '../auth/mockAuth';
import { createLocalId, networkDelay, readTable, writeTable } from '../../services/localDb';
import type {
  ExamFileRow,
  MedicalRecordRow,
  PetRow,
} from '../../types/database';

export interface CreateVisitInput {
  clinicId: string;
  tutorId: string;
  veterinarianId: string;
  pet: {
    name: string;
    species: string;
    breed: string;
    age: number;
    weight: number;
  };
  vaccinationDate: string;
  prescription: string;
  examAttachments: string[];
}

function assertClinicalMembership(clinicId: string, userId: string): void {
  assertActiveClinic(clinicId);
  const membership = readTable('clinic_memberships').find(
    row => row.clinic_id === clinicId
      && row.user_id === userId
      && row.status === 'active',
  );
  if (!membership || !['owner', 'admin', 'vet'].includes(membership.role)) {
    throw new Error('Insufficient permissions to access medical records');
  }
}

export async function createVisit(input: CreateVisitInput): Promise<{
  pet: PetRow;
  medicalRecord: MedicalRecordRow;
}> {
  await networkDelay();
  if (
    !input?.clinicId
    || !input.tutorId
    || !input.veterinarianId
    || !input.pet?.name.trim()
    || !input.pet.species.trim()
    || !Number.isFinite(input.pet.age)
    || input.pet.age < 0
    || !Number.isFinite(input.pet.weight)
    || input.pet.weight <= 0
    || !input.prescription.trim()
  ) {
    throw new Error('Missing or invalid required fields');
  }

  const session = assertActiveClinic(input.clinicId);
  assertClinicalMembership(input.clinicId, input.veterinarianId);
  if (input.veterinarianId !== session.user_id) {
    throw new Error('Row-level security policy violation');
  }

  if (!readTable('tutors').some(
    tutor => tutor.id === input.tutorId && tutor.clinic_id === input.clinicId,
  )) {
    throw new Error('Foreign key violation: tutor does not exist in clinic');
  }

  const now = new Date().toISOString();
  const petDate = new Date();
  petDate.setFullYear(petDate.getFullYear() - input.pet.age);
  const petId = createLocalId();
  const recordId = createLocalId();
  const pet: PetRow = {
    id: petId,
    clinic_id: input.clinicId,
    tutor_id: input.tutorId,
    name: input.pet.name.trim(),
    species: input.pet.species.trim(),
    breed: input.pet.breed.trim() || null,
    birth_date: petDate.toISOString().slice(0, 10),
    weight_kg: input.pet.weight,
    created_at: now,
  };
  const medicalRecord: MedicalRecordRow = {
    id: recordId,
    clinic_id: input.clinicId,
    pet_id: petId,
    veterinarian_id: input.veterinarianId,
    visit_at: now,
    diagnosis: null,
    prescription: input.prescription.trim(),
    vaccination_date: input.vaccinationDate,
    created_by: session.user_id,
    created_at: now,
    updated_at: now,
  };

  const previousPets = readTable('pets');
  const previousRecords = readTable('medical_records');
  const previousFiles = readTable('exam_files');
  const files: ExamFileRow[] = input.examAttachments
    .map(url => url.trim())
    .filter(Boolean)
    .map(url => ({
      id: createLocalId(),
      clinic_id: input.clinicId,
      medical_record_id: recordId,
      object_path: url,
      original_name: url.split('/').pop()?.split('?')[0] || 'exame.pdf',
      content_type: 'application/pdf',
      size_bytes: 1,
      created_at: now,
    }));

  try {
    writeTable('pets', [...previousPets, pet]);
    writeTable('medical_records', [...previousRecords, medicalRecord]);
    writeTable('exam_files', [...previousFiles, ...files]);
  } catch (error) {
    writeTable('pets', previousPets);
    writeTable('medical_records', previousRecords);
    writeTable('exam_files', previousFiles);
    throw error;
  }

  return { pet, medicalRecord };
}
