import { assertActiveClinic } from '../auth/mockAuth';
import { createLocalId, networkDelay, readTable, writeTable } from '../../services/localDb';
import type { PetInsert, PetRow, PetUpdate } from '../../types/database';

function birthDateFromAge(age: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - age);
  return date.toISOString().slice(0, 10);
}

function assertPetFields(input: PetInsert): void {
  if (
    !input
    || !input.clinicId
    || !input.tutorId
    || !input.name?.trim()
    || !input.species?.trim()
    || !Number.isFinite(input.age)
    || input.age < 0
    || !Number.isFinite(input.weight)
    || input.weight <= 0
  ) {
    throw new Error('Missing or invalid required fields');
  }
}

export const petsApi = {
  async list(clinicId: string, tutorId?: string): Promise<PetRow[]> {
    await networkDelay();
    assertActiveClinic(clinicId);
    return readTable('pets').filter(pet =>
      pet.clinic_id === clinicId && (!tutorId || pet.tutor_id === tutorId),
    );
  },

  async get(clinicId: string, id: string): Promise<PetRow | null> {
    await networkDelay();
    assertActiveClinic(clinicId);
    return readTable('pets').find(pet => pet.clinic_id === clinicId && pet.id === id) ?? null;
  },

  async create(input: PetInsert): Promise<PetRow> {
    await networkDelay();
    assertPetFields(input);
    assertActiveClinic(input.clinicId);
    if (!readTable('tutors').some(
      tutor => tutor.id === input.tutorId && tutor.clinic_id === input.clinicId,
    )) {
      throw new Error('Foreign key violation: tutor does not exist in clinic');
    }

    const pet: PetRow = {
      id: createLocalId(),
      clinic_id: input.clinicId,
      tutor_id: input.tutorId,
      name: input.name.trim(),
      species: input.species.trim(),
      breed: input.breed?.trim() || null,
      birth_date: birthDateFromAge(input.age),
      weight_kg: input.weight,
      created_at: new Date().toISOString(),
    };
    writeTable('pets', [...readTable('pets'), pet]);
    return pet;
  },

  async update(clinicId: string, id: string, input: PetUpdate): Promise<PetRow> {
    await networkDelay();
    assertActiveClinic(clinicId);
    const pets = readTable('pets');
    const index = pets.findIndex(pet => pet.clinic_id === clinicId && pet.id === id);
    if (index < 0) throw new Error('Pet not found');

    const current = pets[index];
    if (input.tutorId !== undefined && !readTable('tutors').some(
      tutor => tutor.id === input.tutorId && tutor.clinic_id === clinicId,
    )) {
      throw new Error('Foreign key violation: tutor does not exist in clinic');
    }
    const updated: PetRow = {
      ...current,
      ...(input.tutorId !== undefined ? { tutor_id: input.tutorId } : {}),
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.species !== undefined ? { species: input.species.trim() } : {}),
      ...(input.breed !== undefined ? { breed: input.breed?.trim() || null } : {}),
      ...(input.age !== undefined ? { birth_date: birthDateFromAge(input.age) } : {}),
      ...(input.weight !== undefined ? { weight_kg: input.weight } : {}),
    };
    pets[index] = updated;
    writeTable('pets', pets);
    return updated;
  },

  async delete(clinicId: string, id: string): Promise<void> {
    await networkDelay();
    assertActiveClinic(clinicId);
    const pets = readTable('pets');
    if (!pets.some(pet => pet.clinic_id === clinicId && pet.id === id)) {
      throw new Error('Pet not found');
    }
    if (readTable('medical_records').some(
      record => record.clinic_id === clinicId && record.pet_id === id,
    )) {
      throw new Error('Foreign key violation: pet has medical records');
    }
    writeTable('pets', pets.filter(pet => pet.clinic_id !== clinicId || pet.id !== id));
  },
};
