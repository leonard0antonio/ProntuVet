// Enhanced API Service with interceptors, error handling, and token management
import { sanitizeText, sanitizeUrl } from '../utils/sanitize';
import type {
  User,
  Tutor,
  Pet,
  Prontuario,
  Appointment,
  HospitalizedPet,
  Alert,
  ListParams,
  PaginatedResponse,
} from './apiTypes';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Custom error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Erro de conexão. Verifique sua internet.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Sessão expirada. Faça login novamente.') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Você não tem permissão para esta ação.') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Recurso não encontrado.') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Dados inválidos.', errors?: Record<string, string[]>) {
    super(message, 422, errors);
    this.name = 'ValidationError';
  }
}

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  clearAuth: (): void => {
    tokenManager.removeToken();
    tokenManager.removeUser();
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getToken() && !!tokenManager.getUser();
  },
};

// Request/Response interceptors
type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
type ErrorInterceptor = (error: Error) => Error | Promise<Error>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const errorInterceptors: ErrorInterceptor[] = [];

export const interceptors = {
  request: {
    add: (interceptor: RequestInterceptor) => {
      requestInterceptors.push(interceptor);
    },
    remove: (interceptor: RequestInterceptor) => {
      const index = requestInterceptors.indexOf(interceptor);
      if (index > -1) requestInterceptors.splice(index, 1);
    },
    clear: () => {
      requestInterceptors.length = 0;
    },
  },
  response: {
    add: (interceptor: ResponseInterceptor) => {
      responseInterceptors.push(interceptor);
    },
    remove: (interceptor: ResponseInterceptor) => {
      const index = responseInterceptors.indexOf(interceptor);
      if (index > -1) responseInterceptors.splice(index, 1);
    },
    clear: () => {
      responseInterceptors.length = 0;
    },
  },
  error: {
    add: (interceptor: ErrorInterceptor) => {
      errorInterceptors.push(interceptor);
    },
    remove: (interceptor: ErrorInterceptor) => {
      const index = errorInterceptors.indexOf(interceptor);
      if (index > -1) errorInterceptors.splice(index, 1);
    },
    clear: () => {
      errorInterceptors.length = 0;
    },
  },
};

// Core fetch function with interceptors
async function fetchWithInterceptors(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Apply request interceptors
  let config = { ...options };
  for (const interceptor of requestInterceptors) {
    config = await interceptor(config);
  }

  // Add auth header if token exists
  const token = tokenManager.getToken();
  if (token && !config.headers) {
    config.headers = {};
  }
  if (token && config.headers) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  // Add default headers
  if (!config.headers) {
    config.headers = {};
  }
  const headers = config.headers as Record<string, string>;
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    // Apply response interceptors
    let finalResponse = response;
    for (const interceptor of responseInterceptors) {
      finalResponse = await interceptor(finalResponse);
    }

    return finalResponse;
  } catch (error) {
    // Apply error interceptors
    let finalError = error instanceof Error ? error : new Error(String(error));
    for (const interceptor of errorInterceptors) {
      finalError = await interceptor(finalError);
    }
    throw finalError;
  }
}

// Error handling
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    switch (response.status) {
      case 401:
        tokenManager.clearAuth();
        throw new UnauthorizedError();
      case 403:
        throw new ForbiddenError();
      case 404:
        throw new NotFoundError();
      case 422:
        throw new ValidationError('Dados inválidos', errorData as Record<string, string[]>);
      default: {
        const message = (errorData as { message?: string })?.message || `Erro ${response.status}: ${response.statusText}`;
        throw new ApiError(message, response.status, undefined, errorData);
      }
    }
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Generic API methods
const apiClient = {
  get: async <T>(url: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    const response = await fetchWithInterceptors(fullUrl, { method: 'GET' });
    return handleResponse<T>(response);
  },

  post: async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await fetchWithInterceptors(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  put: async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await fetchWithInterceptors(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await fetchWithInterceptors(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await fetchWithInterceptors(url, { method: 'DELETE' });
    return handleResponse<T>(response);
  },
};

// Sanitization helpers
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
  examAttachments: prontuario.examAttachments
    ? prontuario.examAttachments.map(sanitizeUrl).filter(Boolean)
    : undefined,
});

// API endpoints
export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/login', { email, password });
      tokenManager.setToken(response.token);
      tokenManager.setUser(response.user);
      return response;
    },

    logout: async (): Promise<void> => {
      try {
        await apiClient.post('/auth/logout');
      } finally {
        tokenManager.clearAuth();
      }
    },

    refreshToken: async (): Promise<string> => {
      const response = await apiClient.post<{ token: string }>('/auth/refresh');
      tokenManager.setToken(response.token);
      return response.token;
    },

    getCurrentUser: async (): Promise<User> => {
      return apiClient.get<User>('/auth/me');
    },
  },

  // Tutors
  tutors: {
    list: async (params?: ListParams): Promise<PaginatedResponse<Tutor>> => {
      return apiClient.get<PaginatedResponse<Tutor>>('/tutors', params as Record<string, string | number | boolean | undefined>);
    },

    get: async (id: string): Promise<Tutor> => {
      return apiClient.get<Tutor>(`/tutors/${id}`);
    },

    create: async (data: Omit<Tutor, 'id'>): Promise<Tutor> => {
      return apiClient.post<Tutor>('/tutors', sanitizeTutor(data));
    },

    update: async (id: string, data: Partial<Tutor>): Promise<Tutor> => {
      return apiClient.put<Tutor>(`/tutors/${id}`, sanitizeTutor(data));
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/tutors/${id}`);
    },
  },

  // Pets
  pets: {
    list: async (tutorId?: string, params?: ListParams): Promise<PaginatedResponse<Pet>> => {
      const queryParams: Record<string, string | number | boolean | undefined> = { ...params };
      if (tutorId) queryParams.tutorId = tutorId;
      return apiClient.get<PaginatedResponse<Pet>>('/pets', queryParams);
    },

    get: async (id: string): Promise<Pet> => {
      return apiClient.get<Pet>(`/pets/${id}`);
    },

    create: async (data: Omit<Pet, 'id'>): Promise<Pet> => {
      return apiClient.post<Pet>('/pets', data);
    },

    update: async (id: string, data: Partial<Pet>): Promise<Pet> => {
      return apiClient.put<Pet>(`/pets/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/pets/${id}`);
    },
  },

  // Prontuarios
  prontuarios: {
    list: async (petId?: string, params?: ListParams): Promise<PaginatedResponse<Prontuario>> => {
      const queryParams: Record<string, string | number | boolean | undefined> = { ...params };
      if (petId) queryParams.petId = petId;
      return apiClient.get<PaginatedResponse<Prontuario>>('/prontuarios', queryParams);
    },

    get: async (id: string): Promise<Prontuario> => {
      return apiClient.get<Prontuario>(`/prontuarios/${id}`);
    },

    create: async (data: Omit<Prontuario, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prontuario> => {
      return apiClient.post<Prontuario>('/prontuarios', sanitizeProntuario(data));
    },

    update: async (id: string, data: Partial<Prontuario>): Promise<Prontuario> => {
      return apiClient.put<Prontuario>(`/prontuarios/${id}`, sanitizeProntuario(data));
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/prontuarios/${id}`);
    },
  },

  // Dashboard
  dashboard: {
    getAppointments: async (): Promise<Appointment[]> => {
      return apiClient.get<Appointment[]>('/dashboard/appointments');
    },

    getHospitalizedPets: async (): Promise<HospitalizedPet[]> => {
      return apiClient.get<HospitalizedPet[]>('/dashboard/hospitalized-pets');
    },

    getAlerts: async (): Promise<Alert[]> => {
      return apiClient.get<Alert[]>('/dashboard/alerts');
    },

    getStats: async (): Promise<{
      totalAppointments: number;
      todayAppointments: number;
      hospitalizedPets: number;
      pendingAlerts: number;
    }> => {
      return apiClient.get('/dashboard/stats');
    },
  },
};

// Setup default interceptors
interceptors.request.add(async (config) => {
  // Add request timestamp for debugging
  return config;
});

interceptors.response.add(async (response) => {
  // Log response for debugging in development
  if (import.meta.env.DEV) {
    console.log(`[API] ${response.status} ${response.url}`);
  }
  return response;
});

interceptors.error.add(async (error) => {
  // Log error for debugging
  if (import.meta.env.DEV) {
    console.error('[API Error]', error);
  }
  return error;
});

  export { apiClient };
export type { RequestInterceptor, ResponseInterceptor, ErrorInterceptor };