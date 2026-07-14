"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { TaskCard } from "@/components/tasks/task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types/task";

type TaskAction =
  | "edit"
  | "delete"
  | null;

export default function TasksPage() {
  const { hasPermission } = useAuth();

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<TaskStatus | "all">("all");

  const [priority, setPriority] =
    useState<TaskPriority | "all">("all");

  const [page, setPage] =
    useState(1);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [action, setAction] =
    useState<TaskAction>(null);

  const tasksQuery = useTasks({
    search,
    status:
      status === "all"
        ? ""
        : status,
    priority:
      priority === "all"
        ? ""
        : priority,
    page,
    per_page: 9,
  });

  const canUpdate = hasPermission(
    "tasks.update"
  );

  const canDelete = hasPermission(
    "tasks.delete"
  );

  function openEdit(task: Task): void {
    setSelectedTask(task);
    setAction("edit");
  }

  function openDelete(task: Task): void {
    setSelectedTask(task);
    setAction("delete");
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">
          Tasks
        </h2>

        <p className="mt-1 text-muted-foreground">
          View and manage accessible project tasks.
        </p>
      </header>

      <section className="grid gap-3 lg:grid-cols-[1fr_200px_180px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search tasks..."
            className="pl-9"
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(
              (value ?? "all") as
                | TaskStatus
                | "all"
            );
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {status === "all"
                ? "All statuses"
                : formatStatusLabel(status)}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All statuses
            </SelectItem>
            <SelectItem value="todo">
              To Do
            </SelectItem>
            <SelectItem value="in_progress">
              In Progress
            </SelectItem>
            <SelectItem value="review">
              Review
            </SelectItem>
            <SelectItem value="completed">
              Completed
            </SelectItem>
            <SelectItem value="cancelled">
              Cancelled
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priority}
          onValueChange={(value) => {
            setPriority(
              (value ?? "all") as
                | TaskPriority
                | "all"
            );
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {priority === "all"
                ? "All priorities"
                : priority
                    .charAt(0)
                    .toUpperCase() +
                  priority.slice(1)}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All priorities
            </SelectItem>
            <SelectItem value="low">
              Low
            </SelectItem>
            <SelectItem value="medium">
              Medium
            </SelectItem>
            <SelectItem value="high">
              High
            </SelectItem>
            <SelectItem value="critical">
              Critical
            </SelectItem>
          </SelectContent>
        </Select>
      </section>

      {tasksQuery.isLoading ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-72"
              />
            )
          )}
        </section>
      ) : tasksQuery.isError ? (
        <div className="rounded-lg border p-6">
          Unable to load tasks.
        </div>
      ) : tasksQuery.data?.data.length ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tasksQuery.data.data.map(
              (task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openEdit}
                  onDelete={openDelete}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                />
              )
            )}
          </section>

          <footer className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              {tasksQuery.data.meta.from ?? 0}
              –
              {tasksQuery.data.meta.to ?? 0}{" "}
              of{" "}
              {tasksQuery.data.meta.total ?? 0}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 1)
                  )
                }
              >
                Previous
              </Button>

              <Button
                variant="outline"
                disabled={
                  page >=
                  tasksQuery.data.meta.last_page
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1
                  )
                }
              >
                Next
              </Button>
            </div>
          </footer>
        </>
      ) : (
        <div className="rounded-lg border p-12 text-center">
          No tasks found.
        </div>
      )}

      {/* Edit and delete dialogs come next */}
    </div>
  );
}

function formatStatusLabel(
  status: TaskStatus
): string {
  const labels: Record<
    TaskStatus,
    string
  > = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "Review",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status];
}