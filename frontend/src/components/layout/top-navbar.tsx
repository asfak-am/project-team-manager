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

  if (pathname.startsWith("/projects")) {
    return "Projects";
  }

  if (pathname.startsWith("/my-tasks")) {
    return "My Tasks";
  }

  if (pathname.startsWith("/tasks")) {
    return "Tasks";
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
    .map((part) => part[0])
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
              variant="ghost"
              className="h-auto max-w-64 gap-3 px-2 py-1.5"
            />
          }
        >
          <Avatar className="size-8 shrink-0">
            <AvatarFallback>
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>

          <div className="hidden min-w-0 text-left sm:block">
            <p className="truncate text-sm font-medium">
              {user?.name}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {user?.roles?.join(", ")}
            </p>
          </div>

          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-60"
        >
          <DropdownMenuLabel>
            <p className="font-medium">
              {user?.name}
            </p>

            <p className="truncate text-xs font-normal text-muted-foreground">
              {user?.email}
            </p>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem disabled>
            <UserRound />
            Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <LogOut />
            )}

            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}