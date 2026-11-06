// API Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'veterinario' | 'cliente';
  crmv?: string;
}

export interface Tutor {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  tutorType: 'veterinario' | 'cliente';
  crmv?: string;
}

export interface Pet {
  id: string;
  tutorId: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
}

export interface Prontuario {
  id: string;
  petId: string;
  petName: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  vaccinationDate: string;
  prescription: string;
  examAttachments: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateProntuarioPayload = Omit<
  Prontuario,
  'id' | 'createdAt' | 'updatedAt' | 'petId' | 'examAttachments'
> & {
  tutorId: string;
  examFiles: File[];
};

export interface Appointment {
  id: string;
  time: string;
  petName: string;
  tutorName: string;
  type: 'consulta' | 'vacina' | 'cirurgia' | 'retorno';
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
}

export interface HospitalizedPet {
  id: string;
  petName: string;
  species: string;
  tutorName: string;
  admissionDate: string;
  condition: string;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'danger';
  message: string;
  timestamp: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Query parameters
export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}