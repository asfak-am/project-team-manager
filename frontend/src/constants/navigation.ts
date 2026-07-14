import {
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Trash2,
  Users,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  permission?: string;
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
    permission: "projects.view-assigned",
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: ListTodo,
    permission: "tasks.view-assigned",
  },
  {
    title: "My Tasks",
    href: "/my-tasks",
    icon: ListTodo,
    permission: "tasks.view-assigned",
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    permission: "users.view",
  },
  {
  title: "Project Trash",
  href: "/projects/trash",
  icon: Trash2,
  permission: "projects.restore",
},
];