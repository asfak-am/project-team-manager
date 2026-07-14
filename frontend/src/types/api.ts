export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type PaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
};

export type ValidationErrorResponse = {
  message: string;
  errors: Record<string, string[]>;
};