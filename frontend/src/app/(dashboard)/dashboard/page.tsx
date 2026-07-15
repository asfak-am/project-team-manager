"use client";

import {
  CircleAlert,
  CircleCheckBig,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

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

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function useGreeting() {
  const [greeting, setGreeting] =
    useState("Welcome");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return greeting;
}

const activityActionIcons: Record<
  string,
  { icon: typeof Sparkles; color: string }
> = {
  "project.created": {
    icon: FolderKanban,
    color: "text-blue-500",
  },
  "task.created": {
    icon: ListTodo,
    color: "text-violet-500",
  },
  "task.completed": {
    icon: CircleCheckBig,
    color: "text-emerald-500",
  },
  "task.updated": {
    icon: TrendingUp,
    color: "text-amber-500",
  },
  "project.updated": {
    icon: TrendingUp,
    color: "text-cyan-500",
  },
};

function getActivityIcon(
  action: string
): { icon: typeof Sparkles; color: string } {
  return (
    activityActionIcons[action] ?? {
      icon: Sparkles,
      color: "text-muted-foreground",
    }
  );
}

export default function DashboardPage() {
    const { user, hasRole } = useAuth();
  const dashboardQuery = useDashboard();
  const greeting = useGreeting();

  if (dashboardQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-2xl" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-32"
            />
          ))}
        </div>

        <Skeleton className="h-64 w-full rounded-xl" />
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
      variant: "blue" as const,
    },
    {
      title: "Active Projects",
      value: statistics.active_projects ?? 0,
      description: "Currently active projects",
      icon: FolderKanban,
      variant: "violet" as const,
    },
    {
      title: "Total Tasks",
      value: statistics.total_tasks ?? 0,
      description: "Tasks across all projects",
      icon: ListTodo,
      variant: "emerald" as const,
    },
    {
      title: "Overdue Tasks",
      value: statistics.overdue_tasks ?? 0,
      description: "Tasks requiring attention",
      icon: CircleAlert,
      variant: "rose" as const,
    },
  ];

  const managerCards = [
    {
      title: "Managed Projects",
      value: statistics.managed_projects ?? 0,
      description: "Projects under your management",
      icon: FolderKanban,
      variant: "violet" as const,
    },
    {
      title: "Open Tasks",
      value: statistics.open_tasks ?? 0,
      description: "Incomplete project tasks",
      icon: ListTodo,
      variant: "amber" as const,
    },
    {
      title: "Completed Tasks",
      value: statistics.completed_tasks ?? 0,
      description: "Completed project tasks",
      icon: CircleCheckBig,
      variant: "emerald" as const,
    },
    {
      title: "Overdue Tasks",
      value: statistics.overdue_tasks ?? 0,
      description: "Tasks requiring attention",
      icon: CircleAlert,
      variant: "rose" as const,
    },
  ];

  const memberCards = [
    {
      title: "Assigned Tasks",
      value: statistics.assigned_tasks ?? 0,
      description: "Tasks assigned to you",
      icon: ListTodo,
      variant: "blue" as const,
    },
    {
      title: "In Progress",
      value: statistics.in_progress_tasks ?? 0,
      description: "Tasks currently in progress",
      icon: FolderKanban,
      variant: "amber" as const,
    },
    {
      title: "Completed",
      value: statistics.completed_tasks ?? 0,
      description: "Tasks you have completed",
      icon: CircleCheckBig,
      variant: "emerald" as const,
    },
    {
      title: "Overdue",
      value: statistics.overdue_tasks ?? 0,
      description: "Tasks past their due date",
      icon: CircleAlert,
      variant: "rose" as const,
    },
  ];

  const cards = hasRole("administrator")
    ? administratorCards
    : hasRole("project-manager")
      ? managerCards
      : memberCards;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      {/* <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-500 to-white-900 p-8 shadow-xl shadow-blue-500/20">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 size-36 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-100/80">
            <Sparkles className="size-4" />
            <span>{greeting}</span>
          </div>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {user?.name?.split(" ")[0] ?? "User"} 👋
          </h2>

          <p className="mt-2 max-w-xl text-blue-100/80">
            Here is an overview of your workspace. Track projects,
            manage tasks, and stay on top of your progress.
          </p>
        </div>
      </section> */}

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            variant={card.variant}
          />
        ))}
      </section>

      {/* Recent activity */}
      <section>
        <Card className="border-transparent shadow-lg shadow-black/5">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                <LayoutDashboard className="size-4 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <CardTitle>Recent Activity</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Latest actions across your workspace
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {data?.recent_activity?.length ? (
              <div className="divide-y">
                {data.recent_activity.map((activity, index) => {
                  const { icon: ActivityIcon, color } =
                    getActivityIcon(activity.action);

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
                    >
                      <div
                        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted ${color}`}
                      >
                        <ActivityIcon className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {activity.description}
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {activity.user?.name ?? "System"}
                          {" · "}
                          {new Date(
                            activity.created_at
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="shrink-0 text-xs text-muted-foreground">
                        #{index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-6 py-12">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <LayoutDashboard className="size-6 text-muted-foreground" />
                </div>

                <p className="text-sm text-muted-foreground">
                  No recent activity is available.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}