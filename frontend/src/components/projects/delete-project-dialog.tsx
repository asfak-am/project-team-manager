"use client";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteProject } from "@/hooks/use-projects";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Project } from "@/types/project";

type DeleteProjectDialogProps = {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
}: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject();

  async function handleDelete(): Promise<void> {
    if (!project) {
      return;
    }

    try {
      await deleteProject.mutateAsync(
        project.id
      );

      toast.success(
        "Project archived successfully."
      );

      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to archive project."
        )
      );
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Archive project?
          </AlertDialogTitle>

          <AlertDialogDescription>
            {project?.name} will no longer appear in
            active project lists. This uses soft deletion
            on the backend.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteProject.isPending}
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending
              ? "Archiving..."
              : "Archive project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}