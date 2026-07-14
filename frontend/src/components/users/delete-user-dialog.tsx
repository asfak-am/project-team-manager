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
import { useDeleteUser } from "@/hooks/use-users";
import { getApiErrorMessage } from "@/lib/api-error";
import type { User } from "@/types/user";

type DeleteUserDialogProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
}: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser();

  async function handleDelete(): Promise<void> {
    if (!user) return;

    try {
      await deleteUser.mutateAsync(user.id);

      toast.success("User deleted successfully.");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to delete user."
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
            Delete user?
          </AlertDialogTitle>

          <AlertDialogDescription>
            This will delete {user?.name}. Users with related
            projects or tasks may need to be deactivated instead.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteUser.isPending}
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending ? (
              <>
                <LoaderCircle className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete user"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}