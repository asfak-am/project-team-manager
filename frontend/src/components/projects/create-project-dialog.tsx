"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectForm } from "@/components/projects/project-form";
import { useCreateProject } from "@/hooks/use-projects";
import { useProjectUserOptions } from "@/hooks/use-project-options";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ProjectFormValues } from "@/schemas/project-schema";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);

  const createProject = useCreateProject();
  const options = useProjectUserOptions();

  async function handleSubmit(
    values: ProjectFormValues
  ): Promise<void> {
    try {
      await createProject.mutateAsync({
        name: values.name,
        project_key: values.project_key,
        description:
          values.description || null,
        manager_id: Number(values.manager_id),
        status: values.status,
        priority: values.priority,
        start_date:
          values.start_date || null,
        due_date:
          values.due_date || null,
        member_ids: [
          Number(values.manager_id),
        ],
      });

      toast.success(
        "Project created successfully."
      );

      setOpen(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to create project."
        )
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Create project
          </Button>
        }
      />

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Create project
          </DialogTitle>

          <DialogDescription>
            Create a project and assign its manager.
          </DialogDescription>
        </DialogHeader>

        {options.isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading users...
          </p>
        ) : options.isError ? (
          <p className="text-sm text-destructive">
            Unable to load project manager options.
          </p>
        ) : (
          <ProjectForm
            managers={options.managers}
            isSubmitting={
              createProject.isPending
            }
            submitLabel="Create project"
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}