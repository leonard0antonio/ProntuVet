import type {
  ClinicMembershipRow,
  ClinicRow,
  ExamFileRow,
  MedicalRecordRow,
  PetRow,
  ProfileRow,
  TutorRow,
} from '../../Back-end/src/types/database';

type ObjectShape<T> = { [Key in keyof T]: T[Key] };

type Table<Row, Insert, Update> = {
  Row: ObjectShape<Row>;
  Insert: ObjectShape<Insert>;
  Update: ObjectShape<Update>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      clinics: Table<ClinicRow, Pick<ClinicRow, 'name'>, Partial<Pick<ClinicRow, 'name'>>>;
      profiles: Table<ProfileRow, Pick<ProfileRow, 'id' | 'full_name' | 'email'>, Partial<Pick<ProfileRow, 'full_name' | 'email'>>>;
      clinic_memberships: Table<ClinicMembershipRow, ClinicMembershipRow, Partial<ClinicMembershipRow>>;
      tutors: Table<TutorRow, Omit<TutorRow, 'id' | 'created_by' | 'created_at' | 'updated_at'>, Partial<Omit<TutorRow, 'id' | 'clinic_id' | 'created_by' | 'created_at'>>>;
      pets: Table<PetRow, Omit<PetRow, 'id' | 'created_at'>, Partial<Omit<PetRow, 'id' | 'clinic_id' | 'created_at'>>>;
      medical_records: Table<MedicalRecordRow, Omit<MedicalRecordRow, 'id' | 'created_at' | 'updated_at'>, Partial<Omit<MedicalRecordRow, 'id' | 'clinic_id' | 'created_by' | 'created_at'>>>;
      exam_files: Table<ExamFileRow, Omit<ExamFileRow, 'id' | 'created_at'>, Partial<Omit<ExamFileRow, 'id' | 'clinic_id' | 'medical_record_id' | 'created_at'>>>;
    };
    Views: { [_ in never]: never };
    Functions: {
      create_clinic_with_owner: {
        Args: ObjectShape<{
          clinic_name: string;
          veterinarian_crmv?: string | null;
          veterinarian_crmv_state?: string | null;
        }>;
        Returns: string;
      };
      create_visit: {
        Args: ObjectShape<{
          clinic_id_input: string;
          tutor_id_input: string;
          pet_name_input: string;
          species_input: string;
          breed_input: string | null;
          age_input: number;
          weight_input: number;
          vaccination_date_input: string | null;
          prescription_input: string;
        }>;
        Returns: { pet_id: string; medical_record_id: string }[];
      };
      has_clinic_access: {
        Args: ObjectShape<{ target_clinic_id: string; allowed_roles?: string[] | null }>;
        Returns: boolean;
      };
      can_access_exam_storage_path: {
        Args: ObjectShape<{ storage_path: string; allowed_roles: string[] }>;
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
