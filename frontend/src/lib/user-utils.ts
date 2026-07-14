import type {
  UserRole,
  UserStatus,
} from "@/types/user";

export function formatRole(
  role?: UserRole
): string {
  if (!role) {
    return "No role";
  }

  const labels: Record<UserRole, string> = {
    administrator: "Administrator",
    "project-manager": "Project Manager",
    "team-member": "Team Member",
  };

  return labels[role];
}

export function formatUserStatus(
  status: UserStatus
): string {
  return status === "active"
    ? "Active"
    : "Inactive";
}

export function getUserInitials(
  name: string
): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}