"use client";

import {
  LoaderCircle,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useAddProjectMembers,
  useRemoveProjectMember,
} from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Project } from "@/types/project";

type ManageMembersDialogProps = {
  project: Project;
};

export function ManageMembersDialog({
  project,
}: ManageMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] =
    useState<number[]>([]);

  const usersQuery = useUsers({
    search,
    status: "active",
    page: 1,
    per_page: 50,
  });

  const addMembers =
    useAddProjectMembers();

  const removeMember =
    useRemoveProjectMember();

  const members = project.members ?? [];

  const memberIds = useMemo(
    () =>
      new Set(
        members.map((member) => member.id)
      ),
    [members]
  );

  const availableUsers = (
    usersQuery.data?.data ?? []
  ).filter(
    (user) => !memberIds.has(user.id)
  );

  function toggleUser(
    userId: number,
    checked: boolean
  ): void {
    setSelectedIds((current) =>
      checked
        ? [...current, userId]
        : current.filter(
            (id) => id !== userId
          )
    );
  }

  async function handleAdd(): Promise<void> {
    if (selectedIds.length === 0) {
      return;
    }

    try {
      await addMembers.mutateAsync({
        projectId: project.id,
        userIds: selectedIds,
      });

      setSelectedIds([]);

      toast.success(
        "Members added successfully."
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to add members."
        )
      );
    }
  }

  async function handleRemove(
    userId: number
  ): Promise<void> {
    try {
      await removeMember.mutateAsync({
        projectId: project.id,
        userId,
      });

      toast.success(
        "Member removed successfully."
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to remove member."
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
          <Button variant="outline">
            <Users />
            Manage members
          </Button>
        }
      />

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Manage project members
          </DialogTitle>

          <DialogDescription>
            Add or remove members from{" "}
            {project.name}.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-3">
          <h3 className="font-medium">
            Current members
          </h3>

          {members.map((member) => {
            const isManager =
              member.id ===
              project.manager?.id;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {member.name}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {member.email}
                    {isManager
                      ? " · Project Manager"
                      : ""}
                  </p>
                </div>

                {!isManager && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      void handleRemove(
                        member.id
                      )
                    }
                    disabled={
                      removeMember.isPending
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </section>

        <section className="space-y-3 border-t pt-5">
          <h3 className="font-medium">
            Add members
          </h3>

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search active users..."
          />

          <div className="max-h-56 space-y-2 overflow-y-auto">
            {availableUsers.map((user) => (
              <label
                key={user.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
              >
                <Checkbox
                  checked={selectedIds.includes(
                    user.id
                  )}
                  onCheckedChange={(checked) =>
                    toggleUser(
                      user.id,
                      checked === true
                    )
                  }
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </label>
            ))}

            {!usersQuery.isLoading &&
              availableUsers.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No users available to add.
                </p>
              )}
          </div>

          <Button
            className="w-full"
            onClick={() =>
              void handleAdd()
            }
            disabled={
              selectedIds.length === 0 ||
              addMembers.isPending
            }
          >
            {addMembers.isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Plus />
            )}

            Add selected members
          </Button>
        </section>
      </DialogContent>
    </Dialog>
  );
}