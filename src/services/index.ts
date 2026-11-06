export * from './apiTypes';
export {
  ApiError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  apiClient,
  interceptors,
  tokenManager,
} from './apiClient';
export type {
  ErrorInterceptor,
  RequestInterceptor,
  ResponseInterceptor,
} from './apiClient';
export { api } from './api';
export type { CreateProntuarioPayload } from './api';