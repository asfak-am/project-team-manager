"use client";

import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTaskStatus } from "@/hooks/use-tasks";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  TaskStatus,
} from "@/types/task";

type TaskStatusSelectProps = {
  taskId: number;
  status: TaskStatus;
  disabled?: boolean;
};

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

export function TaskStatusSelect({
  taskId,
  status,
  disabled = false,
}: TaskStatusSelectProps) {
  const updateStatus =
    useUpdateTaskStatus();

  async function handleChange(
    value: string | null
  ): Promise<void> {
    if (
      !value ||
      value === status
    ) {
      return;
    }

    try {
      await updateStatus.mutateAsync({
        taskId,
        payload: {
          status: value as TaskStatus,
        },
      });

      toast.success(
        "Task status updated."
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to update task status."
        )
      );
    }
  }

  return (
    <Select
      value={status}
      disabled={
        disabled ||
        updateStatus.isPending
      }
      onValueChange={(value) => {
        void handleChange(value);
      }}
    >
      <SelectTrigger className="h-8 w-36">
        <SelectValue>
          {labels[status]}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="todo">
          To Do
        </SelectItem>

        <SelectItem value="in_progress">
          In Progress
        </SelectItem>

        <SelectItem value="review">
          Review
        </SelectItem>

        <SelectItem value="completed">
          Completed
        </SelectItem>

        <SelectItem value="cancelled">
          Cancelled
        </SelectItem>
      </SelectContent>
    </Select>
  );
}