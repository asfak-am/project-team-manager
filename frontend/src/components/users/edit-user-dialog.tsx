"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateUser } from "@/hooks/use-users";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  updateUserSchema,
  type UpdateUserFormValues,
} from "@/schemas/user-schema";
import type { User } from "@/types/user";

type EditUserDialogProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const updateUser = useUpdateUser();

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: "",
        password_confirmation: "",
      });
    }
  }, [form, user]);

  async function onSubmit(
    values: UpdateUserFormValues
  ): Promise<void> {
    if (!user) return;

    const payload = {
      name: values.name,
      email: values.email,
      ...(values.password
        ? {
            password: values.password,
            password_confirmation:
              values.password_confirmation,
          }
        : {}),
    };

    try {
      await updateUser.mutateAsync({
        userId: user.id,
        payload,
      });

      toast.success("User updated successfully.");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to update user."
        )
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Update the user’s name, email, or password.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-name">
                    Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="edit-name"
                    disabled={updateUser.isPending}
                  />
                  {fieldState.error && (
                    <FieldError>
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-email">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="edit-email"
                    type="email"
                    disabled={updateUser.isPending}
                  />
                  {fieldState.error && (
                    <FieldError>
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-password">
                    New password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="edit-password"
                    type="password"
                    placeholder="Leave empty to keep current password"
                    disabled={updateUser.isPending}
                  />
                  {fieldState.error && (
                    <FieldError>
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              name="password_confirmation"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-password-confirmation">
                    Confirm new password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="edit-password-confirmation"
                    type="password"
                    disabled={updateUser.isPending}
                  />
                  {fieldState.error && (
                    <FieldError>
                      {fieldState.error.message}
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
              onClick={() => onOpenChange(false)}
              disabled={updateUser.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}