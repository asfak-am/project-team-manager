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
  created_at: string | null;
  updated_at: string | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
  remember?: boolean;
};