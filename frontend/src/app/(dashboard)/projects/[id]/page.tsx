"use client";

import {
  ArrowLeft,
  CalendarDays,
  FolderKanban,
  ListTodo,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ProjectTaskList } from "@/components/projects/project-task-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/use-projects";
import { useProjectTasks } from "@/hooks/use-tasks";
import {
  formatProjectPriority,
  formatProjectStatus,
  getProjectStatusVariant,
} from "@/lib/project-utils";

export default function ProjectDetailsPage() {
  const params = useParams<{
    id: string;
  }>();

  const projectId = Number(params.id);

  const projectQuery =
    useProject(projectId);

  const tasksQuery =
    useProjectTasks(projectId);

  if (
    projectQuery.isLoading ||
    tasksQuery.isLoading
  ) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (
    projectQuery.isError ||
    !projectQuery.data?.data
  ) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="font-medium">
          Project could not be loaded
        </p>

        <Button
          className="mt-4"
          variant="outline"
          nativeButton={false}
          render={
            <Link href="/projects" />
          }
        >
          Back to projects
        </Button>
      </div>
    );
  }

  const project =
    projectQuery.data.data;

  const tasks =
    tasksQuery.data?.data ?? [];

  const completedTasks = tasks.filter(
    (task) =>
      task.status === "completed"
  ).length;

  const progress =
    tasks.length > 0
      ? Math.round(
          (completedTasks /
            tasks.length) *
            100
        )
      : 0;

  const members =
    project.members ?? [];

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        nativeButton={false}
        render={
          <Link href="/projects" />
        }
      >
        <ArrowLeft />
        Back to projects
      </Button>

      <header className="space-y-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border px-2 py-1 text-xs font-semibold">
                {project.project_key}
              </span>

              <Badge
                variant={getProjectStatusVariant(
                  project.status
                )}
              >
                {formatProjectStatus(
                  project.status
                )}
              </Badge>
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              {project.name}
            </h2>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              {project.description ||
                "No project description."}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <FolderKanban className="size-5 text-muted-foreground" />

            <div>
              <p className="text-sm text-muted-foreground">
                Priority
              </p>

              <p className="font-semibold">
                {formatProjectPriority(
                  project.priority
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <UserRound className="size-5 text-muted-foreground" />

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                Manager
              </p>

              <p className="truncate font-semibold">
                {project.manager?.name ??
                  "Not assigned"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Users className="size-5 text-muted-foreground" />

            <div>
              <p className="text-sm text-muted-foreground">
                Members
              </p>

              <p className="font-semibold">
                {members.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <ListTodo className="size-5 text-muted-foreground" />

            <div>
              <p className="text-sm text-muted-foreground">
                Tasks
              </p>

              <p className="font-semibold">
                {tasks.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              Project progress
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>
                {completedTasks} of{" "}
                {tasks.length} tasks completed
              </span>

              <span className="font-semibold">
                {progress}%
              </span>
            </div>

            <Progress value={progress} />

            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">
                  Start date
                </p>

                <p className="mt-1 font-medium">
                  {project.start_date
                    ? new Date(
                        project.start_date
                      ).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">
                  Due date
                </p>

                <p className="mt-1 flex items-center gap-2 font-medium">
                  <CalendarDays className="size-4" />

                  {project.due_date
                    ? new Date(
                        project.due_date
                      ).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Project members
            </CardTitle>
          </CardHeader>

          <CardContent>
            {members.length > 0 ? (
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {member.name
                        .split(" ")
                        .slice(0, 2)
                        .map(
                          (part) =>
                            part[0]
                        )
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {member.name}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No project members.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">
            Project tasks
          </h3>

          <p className="text-sm text-muted-foreground">
            Tasks belonging to this project.
          </p>
        </div>

        <ProjectTaskList
          tasks={tasks}
        />
      </section>
    </div>
  );
}