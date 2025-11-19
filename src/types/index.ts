/**
 * Main Type Definitions Export
 * Central export point for all TypeScript definitions
 */

// Enums
export * from './enums';

// Models
export * from './buyer';
export * from './user';
export * from './order';
export * from './vendor';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  count: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: T[];
}

// Common Types
export interface SelectOption {
  label: string;
  value: string;
  description?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}
