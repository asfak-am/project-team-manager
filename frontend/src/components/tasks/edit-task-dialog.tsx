"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { TaskForm } from "@/components/tasks/task-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useProjects } from "@/hooks/use-projects";
import { useUpdateTask } from "@/hooks/use-tasks";
import { getApiErrorMessage } from "@/lib/api-error";
import type { TaskFormValues } from "@/schemas/task-schema";
import type { Task } from "@/types/task";

type EditTaskDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: EditTaskDialogProps) {
  const [projectId, setProjectId] =
    useState(task?.project_id ?? 0);

  const projectsQuery = useProjects({
    page: 1,
    per_page: 50,
  });

  const membersQuery =
    useProjectMembers(projectId);

  const updateTask = useUpdateTask();

  useEffect(() => {
    if (task) {
      setProjectId(task.project_id);
    }
  }, [task]);

  if (!task) {
    return null;
  }

  const taskId = task.id;

  const defaultValues: TaskFormValues = {
    project_id: String(
      task.project_id
    ),
    title: task.title,
    description:
      task.description ?? "",
    status: task.status,
    priority: task.priority,
    assigned_to:
      task.assigned_to
        ? String(task.assigned_to)
        : "",
    due_date:
      task.due_date ?? "",
    estimated_hours:
      task.estimated_hours !== null
        ? String(task.estimated_hours)
        : "",
  };

  async function handleSubmit(
    values: TaskFormValues
  ): Promise<void> {
    try {
      await updateTask.mutateAsync({
        taskId,
        payload: {
          title: values.title,
          description:
            values.description || null,
          status: values.status,
          priority: values.priority,
          assigned_to:
            values.assigned_to
              ? Number(values.assigned_to)
              : null,
          due_date:
            values.due_date || null,
          estimated_hours:
            values.estimated_hours
              ? Number(
                  values.estimated_hours
                )
              : null,
        },
      });

      toast.success(
        "Task updated successfully."
      );

      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to update task."
        )
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Edit task
          </DialogTitle>

          <DialogDescription>
            Update task details and assignee.
          </DialogDescription>
        </DialogHeader>

        <TaskForm
          key={task.id}
          projects={
            projectsQuery.data?.data ?? []
          }
          members={
            membersQuery.data ?? []
          }
          defaultValues={defaultValues}
          lockProject
          isSubmitting={
            updateTask.isPending
          }
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          onCancel={() =>
            onOpenChange(false)
          }
        />
      </DialogContent>
    </Dialog>
  );
}