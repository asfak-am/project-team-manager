"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
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
import { useUpdateProfile } from "@/hooks/use-profile";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "@/schemas/profile-schema";
import type { User } from "@/types/user";

type ProfileInformationFormProps = {
  user: User;
};

export function ProfileInformationForm({
  user,
}: ProfileInformationFormProps) {
  const updateProfile =
    useUpdateProfile();

  const form =
    useForm<UpdateProfileFormValues>({
      resolver: zodResolver(
        updateProfileSchema
      ),
      defaultValues: {
        name: user.name,
        email: user.email,
      },
    });

  useEffect(() => {
    form.reset({
      name: user.name,
      email: user.email,
    });
  }, [
    form,
    user.email,
    user.name,
  ]);

  async function onSubmit(
    values: UpdateProfileFormValues
  ): Promise<void> {
    try {
      await updateProfile.mutateAsync(
        values
      );

      toast.success(
        "Profile updated successfully."
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to update profile."
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
              <FieldLabel htmlFor="profile-name">
                Full name
              </FieldLabel>

              <Input
                {...field}
                id="profile-name"
                disabled={
                  updateProfile.isPending
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
              <FieldLabel htmlFor="profile-email">
                Email address
              </FieldLabel>

              <Input
                {...field}
                id="profile-email"
                type="email"
                disabled={
                  updateProfile.isPending
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
          updateProfile.isPending ||
          !form.formState.isDirty
        }
      >
        {updateProfile.isPending && (
          <LoaderCircle className="animate-spin" />
        )}

        {updateProfile.isPending
          ? "Saving..."
          : "Save changes"}
      </Button>
    </form>
  );
}