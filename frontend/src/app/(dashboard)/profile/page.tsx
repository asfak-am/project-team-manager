"use client";

import {
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { ProfileInformationForm } from "@/components/profile/profile-information-form";
import { UpdatePasswordForm } from "@/components/profile/update-password-form";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
import { AvatarUpload } from "@/components/profile/avatar-upload";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const profileQuery = useProfile();

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (
    profileQuery.isError ||
    !profileQuery.data?.data
  ) {
    return (
      <div className="rounded-lg border p-8 text-center">
        Unable to load profile.
      </div>
    );
  }

  const user =
    profileQuery.data.data;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">
          Profile
        </h2>

        <p className="mt-1 text-muted-foreground">
          Manage your personal information and account security.
        </p>
      </header>

<Card className="overflow-hidden">
  <div className="h-6 " />

  <CardContent className="-mt-10 p-6 pt-0">
    <AvatarUpload user={user} />

    <div className="mt-6 border-t pt-5">
      <h3 className="text-xl font-semibold">
        {user.name}
      </h3>

      <p className="mt-1 text-sm text-muted-foreground">
        {user.email}
      </p>

      <p className="mt-1 text-sm capitalize text-muted-foreground">
        {user.roles
          ?.map((role) => role.replaceAll("-", " "))
          .join(", ")}
      </p>
    </div>
  </CardContent>
</Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5" />
              Profile information
            </CardTitle>

            <CardDescription>
              Update your name and email address.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ProfileInformationForm
              user={user}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-5" />
              Change password
            </CardTitle>

            <CardDescription>
              Use a strong password that is different from your current one.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <UpdatePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}