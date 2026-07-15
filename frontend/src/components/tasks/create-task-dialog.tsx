"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useProjects } from "@/hooks/use-projects";
import { useCreateTask } from "@/hooks/use-tasks";
import { getApiErrorMessage } from "@/lib/api-error";
import type { TaskFormValues } from "@/schemas/task-schema";

type CreateTaskDialogProps = {
  defaultProjectId?: number;
};

export function CreateTaskDialog({
  defaultProjectId,
}: CreateTaskDialogProps) {
  const [open, setOpen] =
    useState(false);

  const [projectId, setProjectId] =
    useState(defaultProjectId ?? 0);

  const projectsQuery = useProjects({
    page: 1,
    per_page: 50,
  });

  const membersQuery =
    useProjectMembers(projectId);

  const createTask = useCreateTask();

  useEffect(() => {
    if (open && defaultProjectId) {
      setProjectId(defaultProjectId);
    }
  }, [defaultProjectId, open]);

  async function handleSubmit(
    values: TaskFormValues
  ): Promise<void> {
    const selectedProjectId =
      Number(values.project_id);

    try {
      await createTask.mutateAsync({
        projectId: selectedProjectId,
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
        "Task created successfully."
      );

      setOpen(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to create task."
        )
      );
    }
  }

  const projects =
    projectsQuery.data?.data ?? [];

  const members =
    membersQuery.data ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Create task
          </Button>
        }
      />

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Create task
          </DialogTitle>

          <DialogDescription>
            Create a new task and assign it
            to a project member.
          </DialogDescription>
        </DialogHeader>

        <TaskForm
          key={`${open}-${defaultProjectId ?? "none"}`}
          projects={projects}
          members={members}
          defaultValues={{
            project_id: defaultProjectId
              ? String(defaultProjectId)
              : "",
            title: "",
            description: "",
            status: "todo",
            priority: "medium",
            assigned_to: "",
            due_date: "",
            estimated_hours: "",
          }}
          lockProject={Boolean(defaultProjectId)}
          isSubmitting={createTask.isPending}
          submitLabel="Create task"
          onProjectChange={setProjectId}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}