"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  projectSchema,
  type ProjectFormValues,
} from "@/schemas/project-schema";
import type { User } from "@/types/user";

type ProjectFormProps = {
  defaultValues?: ProjectFormValues;
  managers: User[];
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onCancel: () => void;
};

export function ProjectForm({
  defaultValues,
  managers,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues:
      defaultValues ?? {
        name: "",
        project_key: "",
        description: "",
        manager_id: "",
        status: "planning",
        priority: "medium",
        start_date: "",
        due_date: "",
      },
  });

  return (
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
              <FieldLabel htmlFor="project-name">
                Project name
              </FieldLabel>

              <Input
                {...field}
                id="project-name"
                placeholder="TeamFlow Platform"
                disabled={isSubmitting}
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
          name="project_key"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="project-key">
                Project key
              </FieldLabel>

              <Input
                {...field}
                id="project-key"
                placeholder="TF"
                disabled={isSubmitting}
                onChange={(event) =>
                  field.onChange(
                    event.target.value.toUpperCase()
                  )
                }
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
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="project-description">
                Description
              </FieldLabel>

              <Textarea
                {...field}
                id="project-description"
                rows={4}
                placeholder="Describe the project..."
                disabled={isSubmitting}
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
          name="manager_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Project manager
              </FieldLabel>

              <Select
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(value ?? "")
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>

                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem
                      key={manager.id}
                      value={String(manager.id)}
                    >
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {fieldState.error && (
                <FieldError>
                  {fieldState.error.message}
                </FieldError>
              )}
            </Field>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Status</FieldLabel>

                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="planning">
                      Planning
                    </SelectItem>
                    <SelectItem value="active">
                      Active
                    </SelectItem>
                    <SelectItem value="on_hold">
                      On Hold
                    </SelectItem>
                    <SelectItem value="completed">
                      Completed
                    </SelectItem>
                    <SelectItem value="archived">
                      Archived
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="priority"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Priority</FieldLabel>

                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="low">
                      Low
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium
                    </SelectItem>
                    <SelectItem value="high">
                      High
                    </SelectItem>
                    <SelectItem value="critical">
                      Critical
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="start_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="start-date">
                  Start date
                </FieldLabel>

                <Input
                  {...field}
                  id="start-date"
                  type="date"
                  disabled={isSubmitting}
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
            name="due_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="due-date">
                  Due date
                </FieldLabel>

                <Input
                  {...field}
                  id="due-date"
                  type="date"
                  disabled={isSubmitting}
                />

                {fieldState.error && (
                  <FieldError>
                    {fieldState.error.message}
                  </FieldError>
                )}
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : submitLabel}
        </Button>
      </div>
    </form>
  );
}