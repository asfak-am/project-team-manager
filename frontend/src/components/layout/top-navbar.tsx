"use client";

import {
  ChevronsUpDown,
  LoaderCircle,
  LogOut,
  UserRound,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api-error";

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/users")) {
    return "Users";
  }

  if (pathname.startsWith("/projects/trash")) {
    return "Project Trash";
  }

  if (pathname.startsWith("/projects")) {
    return "Projects";
  }

  if (pathname.startsWith("/my-tasks")) {
    return "My Tasks";
  }

  if (pathname.startsWith("/tasks")) {
    return "Tasks";
  }

  if (pathname.startsWith("/profile")) {
    return "Profile";
  }

  return "Dashboard";
}

function getInitials(name?: string): string {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    logout,
    isLoggingOut,
  } = useAuth();

  async function handleLogout(): Promise<void> {
    try {
      await logout();

      toast.success("Logged out successfully.");

      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to log out."
        )
      );
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background px-4">
      <SidebarTrigger className="shrink-0" />

      <Separator
        orientation="vertical"
        className="h-5"
      />

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              className="h-auto max-w-64 gap-3 px-2 py-1.5"
              aria-label="Open account menu"
            />
          }
        >
          <Avatar className="size-8 shrink-0">
            {user?.avatar_url && (
              <AvatarImage
                src={user.avatar_url}
                alt={user.name ?? "User avatar"}
                className="object-cover"
              />
            )}
            <AvatarFallback>
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>

          <div className="hidden min-w-0 text-left sm:block">
            <p className="truncate text-sm font-medium">
              {user?.name}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {user?.roles?.join(", ") || "No role"}
            </p>
          </div>

          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-64"
        >
          <DropdownMenuItem
            disabled
            className="block opacity-100"
          >
            <div className="min-w-0 space-y-1">
              <p className="truncate font-medium text-foreground">
                {user?.name}
              </p>

              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>

              <p className="truncate text-xs capitalize text-muted-foreground">
                {user?.roles?.join(", ") || "No role"}
              </p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              router.push("/profile");
            }}
          >
            <UserRound className="size-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              void handleLogout();
            }}
            disabled={isLoggingOut}
            className="text-destructive"
          >
            {isLoggingOut ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}

            {isLoggingOut
              ? "Logging out..."
              : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}