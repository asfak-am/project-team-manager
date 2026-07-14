"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";
import { getApiStatus } from "@/lib/api-error";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();

  const {
    user,
    isLoadingUser,
    userError,
  } = useAuth();

  const status = getApiStatus(userError);

  useEffect(() => {
    if (!isLoadingUser && !user && status === 401) {
      router.replace("/login");
    }
  }, [isLoadingUser, router, status, user]);

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}