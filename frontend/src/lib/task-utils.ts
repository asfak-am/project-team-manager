import type {
  TaskPriority,
  TaskStatus,
} from "@/types/task";

export function formatTaskStatus(
  status: TaskStatus
): string {
  const labels: Record<
    TaskStatus,
    string
  > = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "Review",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status];
}

export function formatTaskPriority(
  priority: TaskPriority
): string {
  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1)
  );
}

export function getTaskStatusVariant(
  status: TaskStatus
):
  | "default"
  | "secondary"
  | "outline"
  | "destructive" {
  switch (status) {
    case "completed":
      return "default";

    case "in_progress":
    case "review":
      return "secondary";

    case "cancelled":
      return "destructive";

    default:
      return "outline";
  }
}

export function isTaskOverdue(
  dueDate: string | null,
  status: TaskStatus
): boolean {
  if (
    !dueDate ||
    status === "completed" ||
    status === "cancelled"
  ) {
    return false;
  }

  const due = new Date(`${dueDate}T23:59:59`);

  return due.getTime() < Date.now();
}