"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import {
  Controller,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdatePassword } from "@/hooks/use-profile";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  updatePasswordSchema,
  type UpdatePasswordFormValues,
} from "@/schemas/profile-schema";

export function UpdatePasswordForm() {
  const updatePassword =
    useUpdatePassword();

  const form =
    useForm<UpdatePasswordFormValues>({
      resolver: zodResolver(
        updatePasswordSchema
      ),
      defaultValues: {
        current_password: "",
        password: "",
        password_confirmation: "",
      },
    });

  async function onSubmit(
    values: UpdatePasswordFormValues
  ): Promise<void> {
    try {
      await updatePassword.mutateAsync(
        values
      );

      form.reset();

      toast.success(
        "Password changed successfully."
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to change password."
        )
      );
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(
        onSubmit
      )}
      className="space-y-5"
      noValidate
    >
      <FieldGroup>
        <Controller
          name="current_password"
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
              <FieldLabel htmlFor="current-password">
                Current password
              </FieldLabel>

              <Input
                {...field}
                id="current-password"
                type="password"
                autoComplete="current-password"
                disabled={
                  updatePassword.isPending
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
              <FieldLabel htmlFor="new-password">
                New password
              </FieldLabel>

              <Input
                {...field}
                id="new-password"
                type="password"
                autoComplete="new-password"
                disabled={
                  updatePassword.isPending
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
              <FieldLabel htmlFor="confirm-password">
                Confirm new password
              </FieldLabel>

              <Input
                {...field}
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                disabled={
                  updatePassword.isPending
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

      <Button
        type="submit"
        disabled={
          updatePassword.isPending
        }
      >
        {updatePassword.isPending && (
          <LoaderCircle className="animate-spin" />
        )}

        {updatePassword.isPending
          ? "Updating..."
          : "Change password"}
      </Button>
    </form>
  );
}