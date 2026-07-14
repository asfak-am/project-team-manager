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
import { useUpdateUserRole } from "@/hooks/use-users";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  User,
  UserRole,
} from "@/types/user";

type ChangeRoleDialogProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangeRoleDialog({
  user,
  open,
  onOpenChange,
}: ChangeRoleDialogProps) {
  const [role, setRole] =
    useState<UserRole>("team-member");

  const updateRole = useUpdateUserRole();

  useEffect(() => {
    if (user?.roles?.[0]) {
      setRole(user.roles[0]);
    }
  }, [user]);

  async function handleSave(): Promise<void> {
    if (!user) return;

    try {
      await updateRole.mutateAsync({
        userId: user.id,
        payload: { role },
      });

      toast.success("User role updated successfully.");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to update role."
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
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            Assign a new system role to {user?.name}.
          </DialogDescription>
        </DialogHeader>

        <Select
          value={role}
          onValueChange={(value) =>
            setRole(value as UserRole)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="administrator">
              Administrator
            </SelectItem>
            <SelectItem value="project-manager">
              Project Manager
            </SelectItem>
            <SelectItem value="team-member">
              Team Member
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateRole.isPending}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={updateRole.isPending}
          >
            {updateRole.isPending ? (
              <>
                <LoaderCircle className="animate-spin" />
                Updating...
              </>
            ) : (
              "Update role"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}