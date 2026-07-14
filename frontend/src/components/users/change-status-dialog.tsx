"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateUserStatus } from "@/hooks/use-users";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  User,
  UserStatus,
} from "@/types/user";

type ChangeStatusDialogProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangeStatusDialog({
  user,
  open,
  onOpenChange,
}: ChangeStatusDialogProps) {
  const [status, setStatus] =
    useState<UserStatus>("active");

  const updateStatus = useUpdateUserStatus();

  useEffect(() => {
    if (user) {
      setStatus(user.status);
    }
  }, [user]);

  async function handleSave(): Promise<void> {
    if (!user) return;

    try {
      await updateStatus.mutateAsync({
        userId: user.id,
        payload: { status },
      });

      toast.success("User status updated successfully.");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to update user status."
        )
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change status</DialogTitle>
          <DialogDescription>
            Activate or deactivate {user?.name}.
          </DialogDescription>
        </DialogHeader>

        <Select
          value={status}
          onValueChange={(value) =>
            setStatus(value as UserStatus)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="active">
              Active
            </SelectItem>
            <SelectItem value="inactive">
              Inactive
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateStatus.isPending}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending ? (
              <>
                <LoaderCircle className="animate-spin" />
                Updating...
              </>
            ) : (
              "Update status"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}