"use client";

import {
  LogOut,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navigationItems } from "@/constants/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api-error";

function canDisplayItem(
  permission: string | undefined,
  permissions: string[]
): boolean {
  if (!permission) {
    return true;
  }

  if (permissions.includes(permission)) {
    return true;
  }

  if (
    permission ===
      "projects.view-assigned" &&
    permissions.includes(
      "projects.view-all"
    )
  ) {
    return true;
  }

  if (
    permission ===
      "tasks.view-assigned" &&
    permissions.includes(
      "tasks.view-all"
    )
  ) {
    return true;
  }

  return false;
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    logout,
    isLoggingOut,
  } = useAuth();

  const permissions =
    user?.permissions ?? [];

  const visibleItems =
    navigationItems.filter((item) =>
      canDisplayItem(
        item.permission,
        permissions
      )
    );

  async function handleLogout(): Promise<void> {
    try {
      await logout();

      toast.success(
        "Logged out successfully."
      );

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
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link href="/dashboard" />
              }
              tooltip="TeamFlow"
              className="h-14"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                TF
              </div>

              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  TeamFlow
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  Project Management
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2">
            Workspace
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visibleItems.map(
                (item) => {
                  const isActive =
                    pathname ===
                      item.href ||
                    pathname.startsWith(
                      `${item.href}/`
                    );

                  return (
                    <SidebarMenuItem
                      key={item.href}
                    >
                      <SidebarMenuButton
                        render={
                          <Link
                            href={
                              item.href
                            }
                          />
                        }
                        isActive={
                          isActive
                        }
                        tooltip={
                          item.title
                        }
                        className="h-10"
                      >
                        <item.icon className="size-4 shrink-0" />

                        <span className="truncate">
                          {
                            item.title
                          }
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link href="/profile" />
              }
              isActive={pathname.startsWith(
                "/profile"
              )}
              tooltip="Profile"
              className="h-9"
            >
              <UserRound className="size-4" />

              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              type="button"
              tooltip="Logout"
              className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={isLoggingOut}
              onClick={() => {
                void handleLogout();
              }}
            >
              <LogOut className="size-4" />

              <span>
                {isLoggingOut
                  ? "Logging out..."
                  : "Logout"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}