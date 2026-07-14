"use client";

import {
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
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
import { Progress } from "@/components/ui/progress";
import {
  formatProjectPriority,
  formatProjectStatus,
  getProjectStatusVariant,
} from "@/lib/project-utils";
import type { Project } from "@/types/project";

type ProjectCardProps = {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  canUpdate: boolean;
  canDelete: boolean;
};

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const progress = Math.min(
    Math.max(project.progress ?? 0, 0),
    100
  );

  const memberCount =
    project.members?.length ?? 0;

  function handleEdit(): void {
    setMenuOpen(false);
    onEdit(project);
  }

  function handleDelete(): void {
    setMenuOpen(false);
    onDelete(project);
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
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

            <Link
              href={`/projects/${project.id}`}
              className="mt-3 block"
            >
              <h3 className="truncate text-lg font-semibold hover:underline">
                {project.name}
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
                    className="shrink-0"
                    aria-label="Project actions"
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {canUpdate && (
                  <DropdownMenuItem
                    onClick={handleEdit}
                  >
                    <Pencil className="size-4" />
                    Edit project
                  </DropdownMenuItem>
                )}

                {canDelete && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="size-4" />
                    Delete project
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {project.description ||
            "No project description."}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">
              Priority
            </p>

            <p className="font-medium">
              {formatProjectPriority(
                project.priority
              )}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">
              Manager
            </p>

            <p className="truncate font-medium">
              {project.manager?.name ??
                "Not assigned"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progress
            </span>

            <span className="font-medium">
              {progress}%
            </span>
          </div>

          <Progress value={progress} />
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Users className="size-4" />

            {memberCount}{" "}
            {memberCount === 1
              ? "member"
              : "members"}
          </span>

          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" />

            {project.due_date
              ? new Date(
                  project.due_date
                ).toLocaleDateString()
              : "No due date"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <Button
          variant="outline"
          className="w-full"
          nativeButton={false}
          render={
            <Link
              href={`/projects/${project.id}`}
            />
          }
        >
          View project
        </Button>
      </CardFooter>
    </Card>
  );
}