"use client";

import { LoaderCircle } from "lucide-react";
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
import { useDeleteTask } from "@/hooks/use-tasks";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Task } from "@/types/task";

type DeleteTaskDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTaskDialog({
  task,
  open,
  onOpenChange,
}: DeleteTaskDialogProps) {
  const deleteTask = useDeleteTask();

  async function handleDelete(): Promise<void> {
    if (!task) {
      return;
    }

    try {
      await deleteTask.mutateAsync(task.id);

      toast.success(
        "Task deleted successfully."
      );

      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to delete task."
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
            Delete task?
          </AlertDialogTitle>

          <AlertDialogDescription>
            The task{" "}
            <strong className="text-foreground">
              {task?.title}
            </strong>{" "}
            will be deleted. This action may not
            be reversible.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteTask.isPending}
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={deleteTask.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleteTask.isPending ? (
              <>
                <LoaderCircle className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete task"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}