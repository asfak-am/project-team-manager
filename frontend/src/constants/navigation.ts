import {
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Trash2,
  Users,
  UserRoundCheck,
} from "lucide-react";

export const navigationItems = [
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
    permission: "tasks.view-all",
  },
  {
    title: "My Tasks",
    href: "/my-tasks",
    icon: UserRoundCheck,
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