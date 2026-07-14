"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoaderCircle,
  Plus,
} from "lucide-react";
import { useState } from "react";
import {
  Controller,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUser } from "@/hooks/use-users";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  createUserSchema,
  type CreateUserFormValues,
} from "@/schemas/user-schema";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);

  const createUser = useCreateUser();

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(
      createUserSchema
    ),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "team-member",
      status: "active",
    },
  });

  async function onSubmit(
    values: CreateUserFormValues
  ): Promise<void> {
    try {
      await createUser.mutateAsync(values);

      toast.success(
        "User created successfully."
      );

      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to create user."
        )
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Add user
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Create user
          </DialogTitle>

          <DialogDescription>
            Create a new account and assign
            its system role.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(
            onSubmit
          )}
          className="space-y-5"
          noValidate
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel htmlFor="name">
                    Name
                  </FieldLabel>

                  <Input
                    {...field}
                    id="name"
                    placeholder="Nimal Perera"
                    disabled={
                      createUser.isPending
                    }
                  />

                  {fieldState.error && (
                    <FieldError>
                      {
                        fieldState.error
                          .message
                      }
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel htmlFor="email">
                    Email
                  </FieldLabel>

                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="nimal@example.com"
                    disabled={
                      createUser.isPending
                    }
                  />

                  {fieldState.error && (
                    <FieldError>
                      {
                        fieldState.error
                          .message
                      }
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>
                      Role
                    </FieldLabel>

                    <Select
                      value={field.value}
                      onValueChange={
                        field.onChange
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
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
                  </Field>
                )}
              />

              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>
                      Status
                    </FieldLabel>

                    <Select
                      value={field.value}
                      onValueChange={
                        field.onChange
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="active">
                          Active
                        </SelectItem>

                        <SelectItem value="inactive">
                          Inactive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            <Controller
              name="password"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel htmlFor="password">
                    Password
                  </FieldLabel>

                  <Input
                    {...field}
                    id="password"
                    type="password"
                    disabled={
                      createUser.isPending
                    }
                  />

                  {fieldState.error && (
                    <FieldError>
                      {
                        fieldState.error
                          .message
                      }
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              name="password_confirmation"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel htmlFor="password_confirmation">
                    Confirm password
                  </FieldLabel>

                  <Input
                    {...field}
                    id="password_confirmation"
                    type="password"
                    disabled={
                      createUser.isPending
                    }
                  />

                  {fieldState.error && (
                    <FieldError>
                      {
                        fieldState.error
                          .message
                      }
                    </FieldError>
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setOpen(false)
              }
              disabled={
                createUser.isPending
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                createUser.isPending
              }
            >
              {createUser.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create user"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}