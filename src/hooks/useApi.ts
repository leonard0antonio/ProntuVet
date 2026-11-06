// Custom hooks for API data fetching with loading/error states
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services';
import type { ListParams, PaginatedResponse } from '../services/apiTypes';
import { ApiError as ApiErrorType } from '../services/apiClient';

// Generic fetch state
interface FetchState<T> {
  data: T | null;
  error: ApiErrorType | Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

// Generic fetch options
interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiErrorType | Error) => void;
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
}

// Generic hook for single resource
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions<T> = {}
): FetchState<T> & { refetch: () => Promise<void> } {
  const { onSuccess, onError, enabled = true, retry = 0, retryDelay = 1000 } = options;
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
    isError: false,
    isSuccess: false,
  });
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const executeFetch = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isLoading: true, isError: false }));

    try {
      const data = await fetchFn();
      if (!isMountedRef.current) return;

      setState({
        data,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true,
      });
      retryCountRef.current = 0;
      onSuccess?.(data);
    } catch (error) {
      if (!isMountedRef.current) return;

      const apiError = error as ApiErrorType | Error;

      // Retry logic
      if (retryCountRef.current < retry && apiError instanceof ApiErrorType && apiError.status >= 500) {
        retryCountRef.current++;
        setTimeout(executeFetch, retryDelay * retryCountRef.current);
        return;
      }

      setState({
        data: null,
        error: apiError,
        isLoading: false,
        isError: true,
        isSuccess: false,
      });
      onError?.(apiError);
    }
  }, [fetchFn, enabled, onSuccess, onError, retry, retryDelay]);

  useEffect(() => {
    isMountedRef.current = true;
    executeFetch();

    return () => {
      isMountedRef.current = false;
    };
  }, [executeFetch]);

  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await executeFetch();
  }, [executeFetch]);

  return { ...state, refetch };
}

// Hook for paginated lists
export function usePaginatedFetch<T>(
  fetchFn: (params: ListParams) => Promise<PaginatedResponse<T>>,
  initialParams: ListParams = {},
  options: UseFetchOptions<PaginatedResponse<T>> = {}
) {
  const [params, setParams] = useState<ListParams>(initialParams);
  const { data, error, isLoading, isError, isSuccess, refetch } = useFetch(
    () => fetchFn(params),
    options
  );

  const setPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setParams(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams(prev => ({ ...prev, search, page: 1 }));
  }, []);

  const setSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
    setParams(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  }, []);

  return {
    data: data?.data || [],
    pagination: data ? {
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    } : null,
    params,
    setParams,
    setPage,
    setPageSize,
    setSearch,
    setSort,
    error,
    isLoading,
    isError,
    isSuccess,
    refetch,
  };
}

// Hook for mutations (create, update, delete)
interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiErrorType | Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: ApiErrorType | Error | null, variables: TVariables) => void;
}

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: ApiErrorType | Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const { onSuccess, onError, onSettled } = options;
  const [state, setState] = useState<{
    data: TData | null;
    error: ApiErrorType | Error | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
  });

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setState(prev => ({ ...prev, isLoading: true, isError: false, isSuccess: false }));

    try {
      const data = await mutationFn(variables);
      setState({
        data,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true,
      });
      onSuccess?.(data, variables);
      onSettled?.(data, null, variables);
      return data;
    } catch (error) {
      const apiError = error as ApiErrorType | Error;

      setState({
        data: null,
        error: apiError,
        isLoading: false,
        isError: true,
        isSuccess: false,
      });
      onError?.(apiError, variables);
      onSettled?.(undefined, apiError, variables);
      throw error;
    }
  }, [mutationFn, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    });
  }, []);

  return {
    mutate,
    mutateAsync: mutate,
    ...state,
    reset,
  };
}

// Specific hooks for each entity
export function useTutors(params?: ListParams) {
  return usePaginatedFetch(api.tutors.list, params || {});
}

export function useTutor(id: string) {
  return useFetch(() => api.tutors.get(id), { enabled: !!id });
}

export function useCreateTutor() {
  return useMutation(api.tutors.create);
}

export function useUpdateTutor() {
  return useMutation(({ id, data }: { id: string; data: Partial<import('../services/apiTypes').Tutor> }) =>
    api.tutors.update(id, data)
  );
}

export function useDeleteTutor() {
  return useMutation(api.tutors.delete);
}

export function usePets(tutorId?: string, params?: ListParams) {
  return usePaginatedFetch(
    (p) => api.pets.list(tutorId, p),
    params || {}
  );
}

export function usePet(id: string) {
  return useFetch(() => api.pets.get(id), { enabled: !!id });
}

export function useCreatePet() {
  return useMutation(api.pets.create);
}

export function useUpdatePet() {
  return useMutation(({ id, data }: { id: string; data: Partial<import('../services/apiTypes').Pet> }) =>
    api.pets.update(id, data)
  );
}

export function useDeletePet() {
  return useMutation(api.pets.delete);
}

export function useProntuarios(petId?: string, params?: ListParams) {
  return usePaginatedFetch(
    (p) => api.prontuarios.list(petId, p),
    params || {}
  );
}

export function useProntuario(id: string) {
  return useFetch(() => api.prontuarios.get(id), { enabled: !!id });
}

export function useCreateProntuario() {
  return useMutation(api.prontuarios.create);
}

export function useUpdateProntuario() {
  return useMutation(({ id, data }: { id: string; data: Partial<import('../services/apiTypes').Prontuario> }) =>
    api.prontuarios.update(id, data)
  );
}

export function useDeleteProntuario() {
  return useMutation(api.prontuarios.delete);
}

export function useDashboardAppointments() {
  return useFetch(api.dashboard.getAppointments);
}

export function useDashboardHospitalizedPets() {
  return useFetch(api.dashboard.getHospitalizedPets);
}

export function useDashboardAlerts() {
  return useFetch(api.dashboard.getAlerts);
}

export function useDashboardStats() {
  return useFetch(api.dashboard.getStats);
}

// Auth hooks
export function useLogin() {
  return useMutation(({ email, password }: { email: string; password: string }) =>
    api.auth.login(email, password)
  );
}

export function useLogout() {
  return useMutation(api.auth.logout);
}

export function useCurrentUser() {
  return useFetch(api.auth.getCurrentUser, { enabled: true });
}