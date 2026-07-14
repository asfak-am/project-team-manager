"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
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
  const [permanent, setPermanent] =
    useState(false);

  const deleteProject = useDeleteProject();

  useEffect(() => {
    if (open) {
      setPermanent(false);
    }
  }, [open]);

  async function handleDelete(): Promise<void> {
    if (!project) {
      return;
    }

    try {
      await deleteProject.mutateAsync({
        projectId: project.id,
        permanent,
      });

      toast.success(
        permanent
          ? "Project permanently deleted."
          : "Project moved to Trash."
      );

      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          permanent
            ? "Unable to permanently delete project."
            : "Unable to move project to Trash."
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
            Delete project?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Without selecting permanent deletion,
            <strong className="mx-1 text-foreground">
              {project?.name}
            </strong>
            will be moved to Trash and can be restored later.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="permanent-delete"
              checked={permanent}
              onCheckedChange={(checked) =>
                setPermanent(checked === true)
              }
              disabled={deleteProject.isPending}
            />

            <div className="space-y-1">
              <Label
                htmlFor="permanent-delete"
                className="cursor-pointer font-medium"
              >
                Delete permanently
              </Label>

              <p className="text-sm text-muted-foreground">
                This cannot be undone. The project,
                its tasks, and project memberships will
                be permanently removed.
              </p>
            </div>
          </div>
        </div>

        {permanent && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            Permanent deletion is selected. This project
            cannot be restored afterward.
          </div>
        )}

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
            className={
              permanent
                ? "bg-destructive text-white hover:bg-destructive/90"
                : undefined
            }
          >
            {deleteProject.isPending ? (
              <>
                <LoaderCircle className="animate-spin" />
                Deleting...
              </>
            ) : permanent ? (
              "Delete permanently"
            ) : (
              "Move to Trash"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}