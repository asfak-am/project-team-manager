import type {
  ProjectPriority,
  ProjectStatus,
} from "@/types/project";

export function formatProjectStatus(
  status: ProjectStatus
): string {
  const labels: Record<
    ProjectStatus,
    string
  > = {
    planning: "Planning",
    active: "Active",
    on_hold: "On Hold",
    completed: "Completed",
    archived: "Archived",
  };

  return labels[status];
}

export function formatProjectPriority(
  priority: ProjectPriority
): string {
  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1)
  );
}

export function getProjectStatusVariant(
  status: ProjectStatus
):
  | "default"
  | "secondary"
  | "outline"
  | "destructive" {
  switch (status) {
    case "active":
      return "default";

    case "completed":
      return "secondary";

    case "archived":
      return "outline";

    case "on_hold":
      return "destructive";

    default:
      return "outline";
  }
}