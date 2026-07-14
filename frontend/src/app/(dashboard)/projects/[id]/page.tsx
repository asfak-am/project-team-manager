"use client";

import { useParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/use-projects";

export default function ProjectDetailsPage() {
  const params = useParams<{
    id: string;
  }>();

  const projectId = Number(params.id);
  const projectQuery = useProject(projectId);

  if (projectQuery.isLoading) {
    return (
      <Skeleton className="h-64 w-full" />
    );
  }

  if (
    projectQuery.isError ||
    !projectQuery.data?.data
  ) {
    return (
      <div className="rounded-lg border p-6">
        Project could not be loaded.
      </div>
    );
  }

  const project =
    projectQuery.data.data;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">
          {project.project_key}
        </p>

        <h2 className="text-3xl font-bold tracking-tight">
          {project.name}
        </h2>

        <p className="mt-2 max-w-3xl text-muted-foreground">
          {project.description ||
            "No project description."}
        </p>
      </header>

      <div className="rounded-lg border p-6">
        Project details, members and tasks will be added next.
      </div>
    </div>
  );
}