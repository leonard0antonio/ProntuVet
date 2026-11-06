export interface ClinicRow {
  id: string;
  name: string;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface AuthAccountRow {
  id: string;
  email: string;
  password_salt: string;
  password_hash: string;
  created_at: string;
}

export interface ClinicMembershipRow {
  clinic_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'vet' | 'receptionist';
  status: 'active' | 'invited' | 'disabled';
  crmv: string | null;
  crmv_state: string | null;
  created_at: string;
}

export interface TutorRow {
  id: string;
  clinic_id: string;
  full_name: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PetRow {
  id: string;
  clinic_id: string;
  tutor_id: string;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  weight_kg: number | null;
  created_at: string;
}

export interface MedicalRecordRow {
  id: string;
  clinic_id: string;
  pet_id: string;
  veterinarian_id: string;
  visit_at: string;
  diagnosis: string | null;
  prescription: string | null;
  vaccination_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExamFileRow {
  id: string;
  clinic_id: string;
  medical_record_id: string;
  object_path: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
}

export interface LocalTables {
  clinics: ClinicRow[];
  profiles: ProfileRow[];
  auth_accounts: AuthAccountRow[];
  clinic_memberships: ClinicMembershipRow[];
  tutors: TutorRow[];
  pets: PetRow[];
  medical_records: MedicalRecordRow[];
  exam_files: ExamFileRow[];
}

export type LocalTableName = keyof LocalTables;

export interface TutorInsert {
  clinicId: string;
  fullName: string;
  cpf?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  zip?: string | null;
}

export type TutorUpdate = Partial<Omit<TutorInsert, 'clinicId'>>;

export interface MedicalRecordInsert {
  clinicId: string;
  petId: string;
  veterinarianId: string;
  visitAt?: string;
  diagnosis?: string | null;
  prescription?: string | null;
  vaccinationDate?: string | null;
}

export type MedicalRecordUpdate = Partial<Omit<MedicalRecordInsert, 'clinicId'>>;

export interface PetInsert {
  clinicId: string;
  tutorId: string;
  name: string;
  species: string;
  breed?: string | null;
  age: number;
  weight: number;
}

export type PetUpdate = Partial<Omit<PetInsert, 'clinicId' | 'tutorId'>> & {
  tutorId?: string;
};
