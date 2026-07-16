"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { TaskCard } from "@/components/tasks/task-card";
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
import { useMyTasks } from "@/hooks/use-tasks";
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types/task";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";

export default function MyTasksPage() {

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<TaskStatus | "all">("all");

  const [priority, setPriority] =
    useState<TaskPriority | "all">("all");

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [action, setAction] =
    useState<"edit" | "delete" | null>(
      null
    );

  const tasksQuery = useMyTasks({
    search,
    status:
      status === "all"
        ? ""
        : status,
    priority:
      priority === "all"
        ? ""
        : priority,
    page: 1,
    per_page: 50,
  });

  const { hasPermission } = useAuth();

  const canUpdate = hasPermission(
    "tasks.update"
  );

  const canDelete = hasPermission(
    "tasks.delete"
  );

  const canUpdateStatus = hasPermission(
    "tasks.update-status"
  );



  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          My Tasks
        </h2>

        <p className="mt-1 text-muted-foreground">
          Tasks currently assigned to you.
        </p>
      </header>

      <section className="grid gap-3 lg:grid-cols-[1fr_200px_180px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search my tasks..."
            className="pl-9"
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) =>
            setStatus(
              (value ?? "all") as
              | TaskStatus
              | "all"
            )
          }
        >
          <SelectTrigger>
            <SelectValue>
              {status === "all"
                ? "All statuses"
                : status}
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
          onValueChange={(value) =>
            setPriority(
              (value ?? "all") as
              | TaskPriority
              | "all"
            )
          }
        >
          <SelectTrigger>
            <SelectValue>
              {priority === "all"
                ? "All priorities"
                : priority}
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
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-72"
            />
          ))}
        </section>
      ) : tasksQuery.data?.data.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasksQuery.data.data.map(
            (task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(item) => {
                  setSelectedTask(item);
                  setAction("edit");
                }}
                onDelete={(item) => {
                  setSelectedTask(item);
                  setAction("delete");
                }}
                canUpdate={canUpdate}
                canDelete={canDelete}
                canUpdateStatus={canUpdateStatus}
              />
            )
          )}
        </section>
      ) : (
        <div className="rounded-lg border p-12 text-center">
          No assigned tasks found.
        </div>
      )}

      <EditTaskDialog
        task={selectedTask}
        open={action === "edit"}
        onOpenChange={(open) => {
          if (!open) {
            setAction(null);
            setSelectedTask(null);
          }
        }}
      />

      <DeleteTaskDialog
        task={selectedTask}
        open={action === "delete"}
        onOpenChange={(open) => {
          if (!open) {
            setAction(null);
            setSelectedTask(null);
          }
        }}
      />
    </div>
  );
}