"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { UsersTable } from "@/components/users/users-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers } from "@/hooks/use-users";

export default function UsersPage() {
  const [search, setSearch] =
    useState("");

  const [role, setRole] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [page, setPage] =
    useState(1);

  const usersQuery = useUsers({
    search,
    role:
      role === "all"
        ? ""
        : role as
            | "administrator"
            | "project-manager"
            | "team-member"
            | "",
    status:
      status === "all"
        ? ""
        : status as
            | "active"
            | "inactive"
            | "",
    page,
    per_page: 10,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Users
          </h2>

          <p className="mt-1 text-muted-foreground">
            Manage user accounts, roles and
            system access.
          </p>
        </div>

        <CreateUserDialog />
      </header>

      <section className="grid gap-3 md:grid-cols-[1fr_200px_180px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
              setPage(1);
            }}
            placeholder="Search users..."
            className="pl-9"
          />
        </div>

        <Select
          value={role}
          onValueChange={(value) => {
            setRole(value ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All roles" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All roles
            </SelectItem>

            <SelectItem value="administrator">
              Administrator
            </SelectItem>

            <SelectItem value="project-manager">
              Project Manager
            </SelectItem>

            <SelectItem value="team-member">
              Team Member
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All statuses
            </SelectItem>

            <SelectItem value="active">
              Active
            </SelectItem>

            <SelectItem value="inactive">
              Inactive
            </SelectItem>
          </SelectContent>
        </Select>
      </section>

      {usersQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-16"
            />
          ))}
        </div>
      ) : usersQuery.isError ? (
        <div className="rounded-lg border p-6">
          <p className="font-medium">
            Unable to load users
          </p>
        </div>
      ) : (
        <>
          <UsersTable
            users={
              usersQuery.data?.data ??
              []
            }
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              {usersQuery.data?.meta.from ??
                0}
              –
              {usersQuery.data?.meta.to ??
                0}{" "}
              of{" "}
              {usersQuery.data?.meta.total ??
                0}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      current - 1,
                      1
                    )
                  )
                }
              >
                Previous
              </button>

              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                disabled={
                  page >=
                  (usersQuery.data?.meta
                    .last_page ?? 1)
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}