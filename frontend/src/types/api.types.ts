/**
 * API Types - Shared interfaces for API communication
 */

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface ApiErrorShape {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
