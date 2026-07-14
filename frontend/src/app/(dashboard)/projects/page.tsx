"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { ProjectCard } from "@/components/projects/project-card";
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
import { useProjects } from "@/hooks/use-projects";
import type {
  Project,
  ProjectPriority,
  ProjectStatus,
} from "@/types/project";

type ProjectAction =
  | "edit"
  | "delete"
  | null;

export default function ProjectsPage() {
  const { hasPermission } = useAuth();

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<ProjectStatus | "all">("all");

  const [priority, setPriority] =
    useState<ProjectPriority | "all">("all");

  const [page, setPage] =
    useState(1);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [action, setAction] =
    useState<ProjectAction>(null);

  const projectsQuery = useProjects({
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

  const canCreate = hasPermission(
    "projects.create"
  );

  const canUpdate = hasPermission(
    "projects.update"
  );

  const canDelete = hasPermission(
    "projects.delete"
  );

  function openEdit(
    project: Project
  ): void {
    setSelectedProject(project);
    setAction("edit");
  }

  function openDelete(
    project: Project
  ): void {
    setSelectedProject(project);
    setAction("delete");
  }

  function closeAction(): void {
    setAction(null);
    setSelectedProject(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Projects
          </h2>

          <p className="mt-1 text-muted-foreground">
            View and manage accessible projects.
          </p>
        </div>

        {canCreate && (
          <CreateProjectDialog />
        )}
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
            placeholder="Search projects..."
            className="pl-9"
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(
              (value ?? "all") as ProjectStatus | "all"
            );
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {status === "all"
                ? "All statuses"
                : status === "planning"
                  ? "Planning"
                  : status === "active"
                    ? "Active"
                    : status === "on_hold"
                      ? "On Hold"
                      : "Completed"}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All statuses
            </SelectItem>

            <SelectItem value="planning">
              Planning
            </SelectItem>

            <SelectItem value="active">
              Active
            </SelectItem>

            <SelectItem value="on_hold">
              On Hold
            </SelectItem>

            <SelectItem value="completed">
              Completed
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priority}
          onValueChange={(value) => {
            setPriority(
              (value ?? "all") as ProjectPriority | "all"
            );
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {priority === "all"
                ? "All priorities"
                : priority === "low"
                  ? "Low"
                  : priority === "medium"
                    ? "Medium"
                    : priority === "high"
                      ? "High"
                      : "Critical"}
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

      {projectsQuery.isLoading ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-80"
              />
            )
          )}
        </section>
      ) : projectsQuery.isError ? (
        <div className="rounded-lg border p-6">
          <p className="font-medium">
            Unable to load projects
          </p>
        </div>
      ) : projectsQuery.data?.data.length ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projectsQuery.data.data.map(
              (project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={openEdit}
                  onDelete={openDelete}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                />
              )
            )}
          </section>

          <footer className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              {projectsQuery.data.meta.from ??
                0}
              –
              {projectsQuery.data.meta.to ??
                0}{" "}
              of{" "}
              {projectsQuery.data.meta.total ??
                0}
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
                  projectsQuery.data.meta
                    .last_page
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
          <p className="font-medium">
            No projects found
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Change the filters or create a new project.
          </p>
        </div>
      )}

      <EditProjectDialog
        project={selectedProject}
        open={action === "edit"}
        onOpenChange={(open) => {
          if (!open) {
            closeAction();
          }
        }}
      />

      <DeleteProjectDialog
        project={selectedProject}
        open={action === "delete"}
        onOpenChange={(open) => {
          if (!open) {
            closeAction();
          }
        }}
      />
    </div>
  );
}