export type Role =
  | "administrator"
  | "project-manager"
  | "team-member";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  status: "active" | "inactive";
  roles: Role[];
  permissions: string[];
  created_at: string;
  updated_at: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  remember?: boolean;
};