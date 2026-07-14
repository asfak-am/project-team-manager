"use client";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectForm } from "@/components/projects/project-form";
import { useProjectUserOptions } from "@/hooks/use-project-options";
import { useUpdateProject } from "@/hooks/use-projects";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ProjectFormValues } from "@/schemas/project-schema";
import type { Project } from "@/types/project";

type EditProjectDialogProps = {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: EditProjectDialogProps) {
  const updateProject = useUpdateProject();
  const options = useProjectUserOptions();

  if (!project) {
    return null;
  }

  const projectId = project.id;

  const defaultValues: ProjectFormValues = {
    name: project.name,
    project_key: project.project_key,
    description: project.description ?? "",
    manager_id: String(project.manager?.id ?? ""),
    status: project.status,
    priority: project.priority,
    start_date: project.start_date ?? "",
    due_date: project.due_date ?? "",
  };

  async function handleSubmit(
    values: ProjectFormValues
  ): Promise<void> {
    try {
      await updateProject.mutateAsync({
        projectId,
        payload: {
          name: values.name,
          project_key: values.project_key,
          description: values.description || null,
          manager_id: Number(values.manager_id),
          status: values.status,
          priority: values.priority,
          start_date: values.start_date || null,
          due_date: values.due_date || null,
        },
      });

      toast.success("Project updated successfully.");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to update project."
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
          <DialogTitle>Edit project</DialogTitle>

          <DialogDescription>
            Update project details and manager.
          </DialogDescription>
        </DialogHeader>

        {options.isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading users...
          </p>
        ) : (
          <ProjectForm
            key={projectId}
            defaultValues={defaultValues}
            managers={options.managers}
            isSubmitting={updateProject.isPending}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}