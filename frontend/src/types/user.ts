export type UserRole =
  | "administrator"
  | "project-manager"
  | "team-member";

export type UserStatus =
  | "active"
  | "inactive";

export type User = {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  status: UserStatus;
  roles: UserRole[];
  permissions?: string[];
  created_at: string | null;
  updated_at: string | null;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  status: UserStatus;
};

export type UpdateUserPayload = {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
};

export type UpdateUserRolePayload = {
  role: UserRole;
};

export type UpdateUserStatusPayload = {
  status: UserStatus;
};

export type UserFilters = {
  search?: string;
  role?: UserRole | "";
  status?: UserStatus | "";
  page?: number;
  per_page?: number;
};

export type Role =
  | "administrator"
  | "project-manager"
  | "team-member";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  status: "active" | "inactive";
  roles: Role[];
  permissions: string[];
};