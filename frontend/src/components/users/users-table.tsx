"use client";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ChangeRoleDialog } from "@/components/users/change-role-dialog";
import { ChangeStatusDialog } from "@/components/users/change-status-dialog";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { EditUserDialog } from "@/components/users/edit-user-dialog";

import {
  formatRole,
  getUserInitials,
} from "@/lib/user-utils";
import type { User } from "@/types/user";

type UsersTableProps = {
  users: User[];
};

type UserAction =
  | "edit"
  | "role"
  | "status"
  | "delete"
  | null;

export function UsersTable({
  users,
}: UsersTableProps) {
  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [action, setAction] =
    useState<UserAction>(null);

  function openAction(
    user: User,
    nextAction: Exclude<UserAction, null>
  ): void {
    console.log(
      "Opening user action:",
      nextAction,
      user
    );

    setSelectedUser(user);
    setAction(nextAction);
  }

  function closeAction(): void {
    setAction(null);
    setSelectedUser(null);
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border p-10 text-center">
        <p className="font-medium">
          No users found
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Try changing the search or filter values.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 border">
                      {user.avatar_url && (
                        <AvatarImage
                          src={user.avatar_url}
                          alt={user.name}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="text-xs font-semibold">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {user.name}
                      </p>

                      <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {formatRole(user.roles?.[0])}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      user.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {user.status === "active"
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.created_at
                    ? new Date(
                        user.created_at
                      ).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                        />
                      }
                    >
                      <MoreHorizontal />

                      <span className="sr-only">
                        User actions
                      </span>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          openAction(user, "edit")
                        }
                      >
                        Edit user
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          openAction(user, "role")
                        }
                      >
                        Change role
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          openAction(user, "status")
                        }
                      >
                        Change status
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() =>
                          openAction(user, "delete")
                        }
                      >
                        Delete user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditUserDialog
        user={selectedUser}
        open={action === "edit"}
        onOpenChange={(open) => {
          if (!open) {
            closeAction();
          }
        }}
      />

      <ChangeRoleDialog
        user={selectedUser}
        open={action === "role"}
        onOpenChange={(open) => {
          if (!open) {
            closeAction();
          }
        }}
      />

      <ChangeStatusDialog
        user={selectedUser}
        open={action === "status"}
        onOpenChange={(open) => {
          if (!open) {
            closeAction();
          }
        }}
      />

      <DeleteUserDialog
        user={selectedUser}
        open={action === "delete"}
        onOpenChange={(open) => {
          if (!open) {
            closeAction();
          }
        }}
      />
    </>
  );
}