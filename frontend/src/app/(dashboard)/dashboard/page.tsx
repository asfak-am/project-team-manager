"use client";

import {
  CircleAlert,
  CircleCheckBig,
  FolderKanban,
  ListTodo,
  Users,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";
import { getApiErrorMessage } from "@/lib/api-error";

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const dashboardQuery = useDashboard();

  if (dashboardQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-32"
            />
          ))}
        </div>
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="font-medium">
            Unable to load dashboard
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {getApiErrorMessage(
              dashboardQuery.error,
              "Dashboard data could not be loaded."
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  const data = dashboardQuery.data?.data;
  const statistics = data?.statistics ?? {};

  const administratorCards = [
    {
      title: "Total Users",
      value: statistics.total_users ?? 0,
      description: "Registered system users",
      icon: Users,
    },
    {
      title: "Active Projects",
      value: statistics.active_projects ?? 0,
      description: "Currently active projects",
      icon: FolderKanban,
    },
    {
      title: "Total Tasks",
      value: statistics.total_tasks ?? 0,
      description: "Tasks across all projects",
      icon: ListTodo,
    },
    {
      title: "Overdue Tasks",
      value: statistics.overdue_tasks ?? 0,
      description: "Tasks requiring attention",
      icon: CircleAlert,
    },
  ];

  const managerCards = [
    {
      title: "Managed Projects",
      value: statistics.managed_projects ?? 0,
      description: "Projects under your management",
      icon: FolderKanban,
    },
    {
      title: "Open Tasks",
      value: statistics.open_tasks ?? 0,
      description: "Incomplete project tasks",
      icon: ListTodo,
    },
    {
      title: "Completed Tasks",
      value: statistics.completed_tasks ?? 0,
      description: "Completed project tasks",
      icon: CircleCheckBig,
    },
    {
      title: "Overdue Tasks",
      value: statistics.overdue_tasks ?? 0,
      description: "Tasks requiring attention",
      icon: CircleAlert,
    },
  ];

  const memberCards = [
    {
      title: "Assigned Tasks",
      value: statistics.assigned_tasks ?? 0,
      description: "Tasks assigned to you",
      icon: ListTodo,
    },
    {
      title: "In Progress",
      value: statistics.in_progress_tasks ?? 0,
      description: "Tasks currently in progress",
      icon: FolderKanban,
    },
    {
      title: "Completed",
      value: statistics.completed_tasks ?? 0,
      description: "Tasks you have completed",
      icon: CircleCheckBig,
    },
    {
      title: "Overdue",
      value: statistics.overdue_tasks ?? 0,
      description: "Tasks past their due date",
      icon: CircleAlert,
    },
  ];

  const cards = hasRole("administrator")
    ? administratorCards
    : hasRole("project-manager")
      ? managerCards
      : memberCards;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">
          Welcome back,
        </p>

        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {user?.name}
        </h2>

        <p className="mt-1 text-muted-foreground">
          Here is an overview of your workspace.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            {...card}
          />
        ))}
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>

          <CardContent>
            {data?.recent_activity?.length ? (
              <div className="divide-y">
                {data.recent_activity.map((activity) => (
                  <div
                    key={activity.id}
                    className="py-4 first:pt-0 last:pb-0"
                  >
                    <p className="text-sm font-medium">
                      {activity.description}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {activity.user?.name ?? "System"}
                      {" · "}
                      {new Date(
                        activity.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity is available.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}