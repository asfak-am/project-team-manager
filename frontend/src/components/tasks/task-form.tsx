"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
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
  taskSchema,
  type TaskFormValues,
} from "@/schemas/task-schema";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";

type TaskFormProps = {
  projects: Project[];
  members: User[];
  defaultValues?: TaskFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  lockProject?: boolean;
  onProjectChange?: (projectId: number) => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
};

export function TaskForm({
  projects,
  members,
  defaultValues,
  isSubmitting,
  submitLabel,
  lockProject = false,
  onProjectChange,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues:
      defaultValues ?? {
        project_id: "",
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assigned_to: "",
        due_date: "",
        estimated_hours: "",
      },
  });

  const selectedProject = projects.find(
    (project) =>
      String(project.id) ===
      form.watch("project_id")
  );

  const selectedAssignee = members.find(
    (member) =>
      String(member.id) ===
      form.watch("assigned_to")
  );

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <FieldGroup>
        <Controller
          name="project_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Project</FieldLabel>

              <Select
                value={field.value}
                disabled={lockProject || isSubmitting}
                onValueChange={(value) => {
                  const nextProjectId = value ?? "";

                  field.onChange(nextProjectId);

                  // Clear the previous assignee when changing projects.
                  form.setValue("assigned_to", "");

                  if (nextProjectId) {
                    onProjectChange?.(
                      Number(nextProjectId)
                    );
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {selectedProject
                      ? `${selectedProject.project_key} — ${selectedProject.name}`
                      : "Select project"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={String(project.id)}
                    >
                      {project.project_key} — {project.name}
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

        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="task-title">
                Task title
              </FieldLabel>

              <Input
                {...field}
                id="task-title"
                placeholder="Build authentication page"
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
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="task-description">
                Description
              </FieldLabel>

              <Textarea
                {...field}
                id="task-description"
                rows={4}
                placeholder="Describe the task..."
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
                    <SelectItem value="todo">
                      To Do
                    </SelectItem>

                    <SelectItem value="in_progress">
                      In Progress
                    </SelectItem>

                    <SelectItem value="review">
                      Review
                    </SelectItem>

                    <SelectItem value="completed">
                      Completed
                    </SelectItem>

                    <SelectItem value="cancelled">
                      Cancelled
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

        <Controller
          name="assigned_to"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Assignee</FieldLabel>

              <Select
                value={field.value || "unassigned"}
                onValueChange={(value) => {
                  field.onChange(
                    value === "unassigned"
                      ? ""
                      : value
                  );
                }}
                disabled={
                  isSubmitting ||
                  !form.watch("project_id")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {field.value === "" ||
                      field.value === "unassigned"
                      ? "Unassigned"
                      : selectedAssignee?.name ??
                      "Select assignee"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="unassigned">
                    Unassigned
                  </SelectItem>

                  {members.map((member) => (
                    <SelectItem
                      key={member.id}
                      value={String(member.id)}
                    >
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!form.watch("project_id") && (
                <p className="text-xs text-muted-foreground">
                  Select a project first.
                </p>
              )}
            </Field>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="due_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="task-due-date">
                  Due date
                </FieldLabel>

                <Input
                  {...field}
                  id="task-due-date"
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
            name="estimated_hours"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="estimated-hours">
                  Estimated hours
                </FieldLabel>

                <Input
                  {...field}
                  id="estimated-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="5"
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
          {isSubmitting && (
            <LoaderCircle className="animate-spin" />
          )}

          {isSubmitting
            ? "Saving..."
            : submitLabel}
        </Button>
      </div>
    </form>
  );
}