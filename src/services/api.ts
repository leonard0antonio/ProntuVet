import { sanitizeText, sanitizeUrl } from '../utils/sanitize';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'veterinario' | 'cliente';
  crmv?: string;
}

interface Tutor {
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

interface Pet {
  id: string;
  tutorId: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
}

interface Prontuario {
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

interface Appointment {
  id: string;
  time: string;
  petName: string;
  tutorName: string;
  type: 'consulta' | 'vacina' | 'cirurgia' | 'retorno';
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
}

interface HospitalizedPet {
  id: string;
  petName: string;
  species: string;
  tutorName: string;
  admissionDate: string;
  condition: string;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'danger';
  message: string;
  timestamp: string;
}

const mockUsers: User[] = [
  { id: '1', email: 'vet@clinica.com', name: 'Dr. João Veterinário', role: 'veterinario', crmv: '1234567' },
  { id: '2', email: 'cliente@email.com', name: 'Maria Cliente', role: 'cliente' },
];

const mockTutors: Tutor[] = [
  { id: '1', name: 'João Silva', cpf: '123.456.789-00', phone: '(11) 99999-9999', email: 'joao@email.com', address: 'Rua A, 123', city: 'São Paulo', zip: '01234567', tutorType: 'cliente' },
  { id: '2', name: 'Maria Santos', cpf: '987.654.321-00', phone: '(11) 88888-8888', email: 'maria@email.com', address: 'Rua B, 456', city: 'São Paulo', zip: '01234567', tutorType: 'cliente' },
];

const mockPets: Pet[] = [
  { id: '1', tutorId: '1', name: 'Rex', species: 'cachorro', breed: 'Labrador', age: 3, weight: 25 },
  { id: '2', tutorId: '1', name: 'Mimi', species: 'gato', breed: 'Siamês', age: 2, weight: 4 },
  { id: '3', tutorId: '2', name: 'Thor', species: 'cachorro', breed: 'Pastor Alemão', age: 5, weight: 35 },
];

const mockProntuarios: Prontuario[] = [
  {
    id: '1',
    petId: '1',
    petName: 'Rex',
    species: 'cachorro',
    breed: 'Labrador',
    age: 3,
    weight: 25,
    vaccinationDate: '2024-01-10',
    prescription: 'Antibiótico por 7 dias. Repouso absoluto.',
    examAttachments: ['http://example.com/exame1.pdf'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

const mockAppointments: Appointment[] = [
  { id: '1', time: '08:00', petName: 'Rex', tutorName: 'João Silva', type: 'consulta', status: 'agendado' },
  { id: '2', time: '09:30', petName: 'Mimi', tutorName: 'Maria Santos', type: 'vacina', status: 'agendado' },
  { id: '3', time: '11:00', petName: 'Thor', tutorName: 'Pedro Oliveira', type: 'cirurgia', status: 'em_andamento' },
  { id: '4', time: '14:00', petName: 'Luna', tutorName: 'Ana Costa', type: 'retorno', status: 'agendado' },
];

const mockHospitalizedPets: HospitalizedPet[] = [
  { id: '1', petName: 'Bolt', species: 'Cachorro', tutorName: 'Carlos Lima', admissionDate: '2024-01-15', condition: 'Pós-operatório' },
  { id: '2', petName: 'Nina', species: 'Gato', tutorName: 'Fernanda Alves', admissionDate: '2024-01-14', condition: 'Desidratação' },
];

const mockAlerts: Alert[] = [
  { id: '1', type: 'warning', message: 'Vacina V10 vencendo em 3 dias para o pet Rex', timestamp: '2024-01-15 08:00' },
  { id: '2', type: 'info', message: 'Nova atualização do sistema disponível', timestamp: '2024-01-15 07:30' },
  { id: '3', type: 'danger', message: 'Pet Thor em cirurgia de emergência', timestamp: '2024-01-15 11:00' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const sanitizeTutor = (tutor: Partial<Tutor>): Partial<Tutor> => ({
  ...tutor,
  name: tutor.name ? sanitizeText(tutor.name) : undefined,
  cpf: tutor.cpf ? sanitizeText(tutor.cpf) : undefined,
  phone: tutor.phone ? sanitizeText(tutor.phone) : undefined,
  email: tutor.email ? sanitizeText(tutor.email) : undefined,
  address: tutor.address ? sanitizeText(tutor.address) : undefined,
  city: tutor.city ? sanitizeText(tutor.city) : undefined,
  zip: tutor.zip ? sanitizeText(tutor.zip) : undefined,
  crmv: tutor.crmv ? sanitizeText(tutor.crmv) : undefined,
});

const sanitizeProntuario = (prontuario: Partial<Prontuario>): Partial<Prontuario> => ({
  ...prontuario,
  petName: prontuario.petName ? sanitizeText(prontuario.petName) : undefined,
  species: prontuario.species ? sanitizeText(prontuario.species) : undefined,
  breed: prontuario.breed ? sanitizeText(prontuario.breed) : undefined,
  prescription: prontuario.prescription ? sanitizeText(prontuario.prescription) : undefined,
  examAttachments: prontuario.examAttachments ? prontuario.examAttachments.map(sanitizeUrl).filter(Boolean) : undefined,
});

export const api = {
  auth: {
    async login(email: string, _password: string): Promise<{ user: User; token: string }> {
      await delay(1000);
      const user = mockUsers.find(u => u.email === email);
      if (!user) throw new Error('Credenciais inválidas');
      return { user, token: 'mock-jwt-token-' + Date.now() };
    },

    async logout(): Promise<void> {
      await delay(500);
    },
  },

  tutors: {
    async list(): Promise<Tutor[]> {
      await delay(800);
      return [...mockTutors];
    },

    async get(id: string): Promise<Tutor | null> {
      await delay(500);
      return mockTutors.find(t => t.id === id) || null;
    },

    async create(data: Omit<Tutor, 'id'>): Promise<Tutor> {
      await delay(1000);
      const sanitized = sanitizeTutor(data);
      const newTutor: Tutor = { id: String(Date.now()), ...sanitized } as Tutor;
      mockTutors.push(newTutor);
      return newTutor;
    },

    async update(id: string, data: Partial<Tutor>): Promise<Tutor | null> {
      await delay(800);
      const index = mockTutors.findIndex(t => t.id === id);
      if (index === -1) return null;
      const sanitized = sanitizeTutor(data);
      mockTutors[index] = { ...mockTutors[index], ...sanitized };
      return mockTutors[index];
    },

    async delete(id: string): Promise<boolean> {
      await delay(500);
      const index = mockTutors.findIndex(t => t.id === id);
      if (index === -1) return false;
      mockTutors.splice(index, 1);
      return true;
    },
  },

  pets: {
    async list(tutorId?: string): Promise<Pet[]> {
      await delay(600);
      return tutorId ? mockPets.filter(p => p.tutorId === tutorId) : [...mockPets];
    },

    async get(id: string): Promise<Pet | null> {
      await delay(400);
      return mockPets.find(p => p.id === id) || null;
    },

    async create(data: Omit<Pet, 'id'>): Promise<Pet> {
      await delay(800);
      const newPet: Pet = { id: String(Date.now()), ...data };
      mockPets.push(newPet);
      return newPet;
    },

    async update(id: string, data: Partial<Pet>): Promise<Pet | null> {
      await delay(600);
      const index = mockPets.findIndex(p => p.id === id);
      if (index === -1) return null;
      mockPets[index] = { ...mockPets[index], ...data };
      return mockPets[index];
    },

    async delete(id: string): Promise<boolean> {
      await delay(400);
      const index = mockPets.findIndex(p => p.id === id);
      if (index === -1) return false;
      mockPets.splice(index, 1);
      return true;
    },
  },

  prontuarios: {
    async list(petId?: string): Promise<Prontuario[]> {
      await delay(700);
      return petId ? mockProntuarios.filter(p => p.petId === petId) : [...mockProntuarios];
    },

    async get(id: string): Promise<Prontuario | null> {
      await delay(500);
      return mockProntuarios.find(p => p.id === id) || null;
    },

    async create(data: Omit<Prontuario, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prontuario> {
      await delay(1000);
      const sanitized = sanitizeProntuario(data);
      const now = new Date().toISOString();
      const newProntuario: Prontuario = { id: String(Date.now()), ...sanitized, createdAt: now, updatedAt: now } as Prontuario;
      mockProntuarios.push(newProntuario);
      return newProntuario;
    },

    async update(id: string, data: Partial<Prontuario>): Promise<Prontuario | null> {
      await delay(800);
      const index = mockProntuarios.findIndex(p => p.id === id);
      if (index === -1) return null;
      const sanitized = sanitizeProntuario(data);
      mockProntuarios[index] = { ...mockProntuarios[index], ...sanitized, updatedAt: new Date().toISOString() };
      return mockProntuarios[index];
    },

    async delete(id: string): Promise<boolean> {
      await delay(500);
      const index = mockProntuarios.findIndex(p => p.id === id);
      if (index === -1) return false;
      mockProntuarios.splice(index, 1);
      return true;
    },
  },

  dashboard: {
    async getAppointments(): Promise<Appointment[]> {
      await delay(600);
      return [...mockAppointments];
    },

    async getHospitalizedPets(): Promise<HospitalizedPet[]> {
      await delay(500);
      return [...mockHospitalizedPets];
    },

    async getAlerts(): Promise<Alert[]> {
      await delay(400);
      return [...mockAlerts];
    },
  },
};