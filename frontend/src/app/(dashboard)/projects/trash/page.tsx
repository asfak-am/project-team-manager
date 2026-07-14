"use client";

import {
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useForceDeleteProject,
  useRestoreProject,
  useTrashedProjects,
} from "@/hooks/use-projects";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Project } from "@/types/project";

export default function ProjectTrashPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const trashQuery = useTrashedProjects({
    search,
    page,
    per_page: 10,
  });

  const restoreProject = useRestoreProject();
  const forceDeleteProject =
    useForceDeleteProject();

  async function handleRestore(
    project: Project
  ): Promise<void> {
    try {
      await restoreProject.mutateAsync(
        project.id
      );

      toast.success(
        "Project restored successfully."
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to restore project."
        )
      );
    }
  }

  async function handleForceDelete(
    project: Project
  ): Promise<void> {
    const confirmed = window.confirm(
      `Permanently delete "${project.name}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await forceDeleteProject.mutateAsync(
        project.id
      );

      toast.success(
        "Project permanently deleted."
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to permanently delete project."
        )
      );
    }
  }

  const projects =
    trashQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">
          Project Trash
        </h2>

        <p className="mt-1 text-muted-foreground">
          Restore deleted projects or remove them
          permanently.
        </p>
      </header>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search Trash..."
          className="pl-9"
        />
      </div>

      {trashQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-20"
              />
            )
          )}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <p className="font-medium">
            Trash is empty
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Soft-deleted projects will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col justify-between gap-4 rounded-lg border bg-background p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  {project.project_key} —{" "}
                  {project.name}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Manager:{" "}
                  {project.manager?.name ??
                    "Not assigned"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    void handleRestore(project)
                  }
                  disabled={
                    restoreProject.isPending ||
                    forceDeleteProject.isPending
                  }
                >
                  <RotateCcw />
                  Restore
                </Button>

                <Button
                  variant="destructive"
                  onClick={() =>
                    void handleForceDelete(
                      project
                    )
                  }
                  disabled={
                    restoreProject.isPending ||
                    forceDeleteProject.isPending
                  }
                >
                  <Trash2 />
                  Delete permanently
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}