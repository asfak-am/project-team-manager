"use client";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FolderKanban,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { TaskComments } from "@/components/tasks/task-comments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTask } from "@/hooks/use-tasks";
import {
  formatTaskPriority,
  formatTaskStatus,
  getTaskStatusVariant,
  isTaskOverdue,
} from "@/lib/task-utils";

export default function TaskDetailsPage() {
  const params = useParams<{
    id: string;
  }>();

  const taskId = Number(params.id);

  const taskQuery =
    useTask(taskId);

  if (taskQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36" />
        <Skeleton className="h-56" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (
    taskQuery.isError ||
    !taskQuery.data?.data
  ) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="font-medium">
          Task could not be loaded
        </p>

        <Button
          className="mt-4"
          variant="outline"
          nativeButton={false}
          render={<Link href="/tasks" />}
        >
          Back to tasks
        </Button>
      </div>
    );
  }

  const task =
    taskQuery.data.data;

  const overdue = isTaskOverdue(
    task.due_date,
    task.status
  );

  const reference =
    task.project?.project_key
      ? `${task.project.project_key}-${task.task_number}`
      : `TASK-${task.task_number}`;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href="/tasks" />}
      >
        <ArrowLeft />
        Back to tasks
      </Button>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
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

        <h2 className="mt-3 text-3xl font-bold tracking-tight">
          {task.title}
        </h2>

        <p className="mt-2 max-w-3xl whitespace-pre-wrap text-muted-foreground">
          {task.description ||
            "No task description."}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <FolderKanban className="size-5 text-muted-foreground" />

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                Project
              </p>

              <p className="truncate font-semibold">
                {task.project?.name ??
                  "Unknown project"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <UserRound className="size-5 text-muted-foreground" />

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                Assignee
              </p>

              <p className="truncate font-semibold">
                {task.assignee?.name ??
                  "Unassigned"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <CalendarDays className="size-5 text-muted-foreground" />

            <div>
              <p className="text-sm text-muted-foreground">
                Due date
              </p>

              <p className="font-semibold">
                {task.due_date
                  ? new Date(
                      task.due_date
                    ).toLocaleDateString()
                  : "Not specified"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Clock3 className="size-5 text-muted-foreground" />

            <div>
              <p className="text-sm text-muted-foreground">
                Estimated time
              </p>

              <p className="font-semibold">
                {task.estimated_hours
                  ? `${task.estimated_hours} hours`
                  : "Not specified"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              Task information
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">
                Priority
              </p>

              <p className="mt-1 font-medium">
                {formatTaskPriority(
                  task.priority
                )}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Created by
              </p>

              <p className="mt-1 font-medium">
                {task.creator?.name ??
                  "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Started at
              </p>

              <p className="mt-1 font-medium">
                {task.started_at
                  ? new Date(
                      task.started_at
                    ).toLocaleString()
                  : "Not started"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Completed at
              </p>

              <p className="mt-1 font-medium">
                {task.completed_at
                  ? new Date(
                      task.completed_at
                    ).toLocaleString()
                  : "Not completed"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Related project
            </CardTitle>
          </CardHeader>

          <CardContent>
            {task.project ? (
              <>
                <p className="font-semibold">
                  {task.project.name}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {task.project.project_key}
                </p>

                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link
                      href={`/projects/${task.project.id}`}
                    />
                  }
                >
                  View project
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Project information is unavailable.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <TaskComments taskId={taskId} />
    </div>
  );
}