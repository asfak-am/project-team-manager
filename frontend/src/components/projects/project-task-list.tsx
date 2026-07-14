"use client";

import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  formatTaskPriority,
  formatTaskStatus,
  getTaskStatusVariant,
  isTaskOverdue,
} from "@/lib/task-utils";
import type { Task } from "@/types/task";

type ProjectTaskListProps = {
  tasks: Task[];
};

function StatusIcon({
  status,
}: {
  status: Task["status"];
}) {
  if (status === "completed") {
    return (
      <CheckCircle2 className="size-4 text-green-600" />
    );
  }

  if (status === "in_progress") {
    return (
      <Clock3 className="size-4 text-blue-600" />
    );
  }

  return (
    <Circle className="size-4 text-muted-foreground" />
  );
}

export function ProjectTaskList({
  tasks,
}: ProjectTaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border p-10 text-center">
        <p className="font-medium">
          No tasks yet
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Tasks created for this project will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const overdue = isTaskOverdue(
          task.due_date,
          task.status
        );

        return (
          <Card key={task.id}>
            <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 gap-3">
                <div className="pt-1">
                  <StatusIcon status={task.status} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {task.project?.project_key
                        ? `${task.project.project_key}-${task.task_number}`
                        : `TASK-${task.task_number}`}
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

                  <p className="mt-1 truncate font-medium">
                    {task.title}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>
                      Priority:{" "}
                      {formatTaskPriority(
                        task.priority
                      )}
                    </span>

                    <span>
                      Assignee:{" "}
                      {task.assignee?.name ??
                        "Unassigned"}
                    </span>

                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" />

                      {task.due_date
                        ? new Date(
                            task.due_date
                          ).toLocaleDateString()
                        : "No due date"}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <Link
                    href={`/tasks/${task.id}`}
                  />
                }
              >
                View task
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}