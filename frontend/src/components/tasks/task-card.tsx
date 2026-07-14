"use client";

import {
  CalendarDays,
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatTaskPriority,
  formatTaskStatus,
  getTaskStatusVariant,
  isTaskOverdue,
} from "@/lib/task-utils";
import type { Task } from "@/types/task";

type TaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  canUpdate: boolean;
  canDelete: boolean;
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const overdue = isTaskOverdue(
    task.due_date,
    task.status
  );

  const reference =
    task.project?.project_key
      ? `${task.project.project_key}-${task.task_number}`
      : `TASK-${task.task_number}`;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {reference}
              </span>

              <Badge
                variant={getTaskStatusVariant(
                  task.status
                )}
              >
                {formatTaskStatus(task.status)}
              </Badge>

              {overdue && (
                <Badge variant="destructive">
                  Overdue
                </Badge>
              )}
            </div>

            <Link
              href={`/tasks/${task.id}`}
              className="mt-2 block"
            >
              <h3 className="line-clamp-2 font-semibold hover:underline">
                {task.title}
              </h3>
            </Link>
          </div>

          {(canUpdate || canDelete) && (
            <DropdownMenu
              open={menuOpen}
              onOpenChange={setMenuOpen}
            >
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Task actions"
                  />
                }
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {canUpdate && (
                  <DropdownMenuItem
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(task);
                    }}
                  >
                    <Pencil />
                    Edit task
                  </DropdownMenuItem>
                )}

                {canDelete && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(task);
                    }}
                  >
                    <Trash2 />
                    Delete task
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {task.description ||
            "No task description."}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <FolderKanban className="size-4 text-muted-foreground" />

          <span className="truncate">
            {task.project?.name ??
              "Unknown project"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-muted-foreground" />

          <span className="truncate">
            {task.assignee?.name ??
              "Unassigned"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />

          <span>
            {task.due_date
              ? new Date(
                  task.due_date
                ).toLocaleDateString()
              : "No due date"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground">
            Priority:
          </span>{" "}
          <span className="font-medium">
            {formatTaskPriority(
              task.priority
            )}
          </span>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <Button
          variant="outline"
          className="w-full"
          nativeButton={false}
          render={
            <Link href={`/tasks/${task.id}`} />
          }
        >
          View task
        </Button>
      </CardFooter>
    </Card>
  );
}