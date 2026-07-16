"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import {
  Controller,
  useForm,
} from "react-hook-form";

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
import { useAuth } from "@/hooks/use-auth";
import {
  taskSchema,
  type TaskFormValues,
} from "@/schemas/task-schema";
import type { Project } from "@/types/project";
import type {
  TaskTargetRole,
} from "@/types/task";
import type { User } from "@/types/user";

type TaskFormProps = {
  projects: Project[];
  members: User[];
  defaultValues?: TaskFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  lockProject?: boolean;

  /**
   * Pass this while editing an existing task.
   *
   * For a newly created task, the form determines
   * the target role from the authenticated user's role:
   *
   * Administrator    -> project-manager
   * Project Manager  -> team-member
   */
  targetRole?: TaskTargetRole;

  onProjectChange?: (
    projectId: number
  ) => void;

  onSubmit: (
    values: TaskFormValues
  ) => Promise<void>;

  onCancel: () => void;
};

export function TaskForm({
  projects,
  members,
  defaultValues,
  isSubmitting,
  submitLabel,
  lockProject = false,
  targetRole,
  onProjectChange,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const {
    hasRole,
  } = useAuth();

  const form =
    useForm<TaskFormValues>({
      resolver: zodResolver(
        taskSchema
      ),

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

  const selectedProjectId =
    form.watch("project_id");

  const selectedAssigneeId =
    form.watch("assigned_to");

  /*
   * While creating:
   * - Administrator creates manager tasks.
   * - Project Manager creates member tasks.
   *
   * While editing:
   * - Use the task's existing target_role.
   */
  const effectiveTargetRole:
    TaskTargetRole =
    targetRole ??
    (hasRole("administrator")
      ? "project-manager"
      : "team-member");

  const selectedProject =
    projects.find(
      (project) =>
        String(project.id) ===
        selectedProjectId
    );

  /*
   * Administrator:
   * Only the selected project's manager
   * should appear.
   *
   * Project Manager:
   * Only active team members assigned to
   * the selected project should appear.
   */
  const assigneeOptions: User[] =
    effectiveTargetRole ===
    "project-manager"
      ? selectedProject?.manager
        ? [selectedProject.manager]
        : []
      : members.filter(
          (member) =>
            member.status ===
              "active" &&
            member.roles?.includes(
              "team-member"
            )
        );

  const selectedAssignee =
    assigneeOptions.find(
      (member) =>
        String(member.id) ===
        selectedAssigneeId
    );

  const assigneeLabel =
    effectiveTargetRole ===
    "project-manager"
      ? "Assign to project manager"
      : "Assign to team member";

  const assigneePlaceholder =
    effectiveTargetRole ===
    "project-manager"
      ? "Select project manager"
      : "Select team member";

  const emptyAssigneeMessage =
    effectiveTargetRole ===
    "project-manager"
      ? "The selected project does not have an active project manager."
      : "No active team members are assigned to this project.";

  return (
    <form
      onSubmit={form.handleSubmit(
        onSubmit
      )}
      className="space-y-5"
      noValidate
    >
      <FieldGroup>
        {/* Project */}
        <Controller
          name="project_id"
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
              <FieldLabel>
                Project
              </FieldLabel>

              <Select
                value={field.value}
                disabled={
                  lockProject ||
                  isSubmitting
                }
                onValueChange={(
                  value
                ) => {
                  const nextProjectId =
                    value ?? "";

                  field.onChange(
                    nextProjectId
                  );

                  /*
                   * Clear the old assignee because
                   * assignees belong to a specific
                   * project.
                   */
                  form.setValue(
                    "assigned_to",
                    "",
                    {
                      shouldValidate:
                        true,
                      shouldDirty: true,
                    }
                  );

                  if (
                    nextProjectId
                  ) {
                    onProjectChange?.(
                      Number(
                        nextProjectId
                      )
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
                  {projects.map(
                    (project) => (
                      <SelectItem
                        key={
                          project.id
                        }
                        value={String(
                          project.id
                        )}
                      >
                        {
                          project.project_key
                        }{" "}
                        —{" "}
                        {
                          project.name
                        }
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

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

        {/* Title */}
        <Controller
          name="title"
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
              <FieldLabel htmlFor="task-title">
                Task title
              </FieldLabel>

              <Input
                {...field}
                id="task-title"
                placeholder={
                  effectiveTargetRole ===
                  "project-manager"
                    ? "Complete project planning"
                    : "Build authentication page"
                }
                disabled={
                  isSubmitting
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

        {/* Description */}
        <Controller
          name="description"
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
              <FieldLabel htmlFor="task-description">
                Description
              </FieldLabel>

              <Textarea
                {...field}
                id="task-description"
                rows={4}
                placeholder="Describe the task requirements, expected outcome and important notes..."
                disabled={
                  isSubmitting
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

        {/* Status and Priority */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Status
                </FieldLabel>

                <Select
                  value={
                    field.value
                  }
                  onValueChange={
                    field.onChange
                  }
                  disabled={
                    isSubmitting
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {field.value ===
                      "todo"
                        ? "To Do"
                        : field.value ===
                            "in_progress"
                          ? "In Progress"
                          : field.value ===
                              "review"
                            ? "Review"
                            : field.value ===
                                "completed"
                              ? "Completed"
                              : "Cancelled"}
                    </SelectValue>
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
                <FieldLabel>
                  Priority
                </FieldLabel>

                <Select
                  value={
                    field.value
                  }
                  onValueChange={
                    field.onChange
                  }
                  disabled={
                    isSubmitting
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {field.value
                        .charAt(0)
                        .toUpperCase() +
                        field.value.slice(
                          1
                        )}
                    </SelectValue>
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

        {/* Assignee */}
        <Controller
          name="assigned_to"
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
              <FieldLabel>
                {assigneeLabel}
              </FieldLabel>

              <Select
                value={
                  field.value ||
                  "unassigned"
                }
                onValueChange={(
                  value
                ) => {
                  field.onChange(
                    value ===
                      "unassigned"
                      ? ""
                      : value
                  );
                }}
                disabled={
                  isSubmitting ||
                  !selectedProjectId ||
                  assigneeOptions.length ===
                    0
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {field.value
                      ? selectedAssignee?.name ??
                        assigneePlaceholder
                      : assigneePlaceholder}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem
                    value="unassigned"
                    disabled
                  >
                    {
                      assigneePlaceholder
                    }
                  </SelectItem>

                  {assigneeOptions.map(
                    (member) => (
                      <SelectItem
                        key={
                          member.id
                        }
                        value={String(
                          member.id
                        )}
                      >
                        <div className="flex flex-col">
                          <span>
                            {
                              member.name
                            }
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {
                              member.email
                            }
                          </span>
                        </div>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              {!selectedProjectId && (
                <p className="text-xs text-muted-foreground">
                  Select a project
                  first.
                </p>
              )}

              {selectedProjectId &&
                assigneeOptions.length ===
                  0 && (
                  <p className="text-xs text-destructive">
                    {
                      emptyAssigneeMessage
                    }
                  </p>
                )}

              {effectiveTargetRole ===
                "project-manager" &&
                selectedProject?.manager && (
                  <p className="text-xs text-muted-foreground">
                    Administrator
                    tasks are assigned
                    to the selected
                    project&apos;s
                    manager.
                  </p>
                )}

              {effectiveTargetRole ===
                "team-member" &&
                assigneeOptions.length >
                  0 && (
                  <p className="text-xs text-muted-foreground">
                    Only active team
                    members assigned to
                    this project are
                    available.
                  </p>
                )}

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

        {/* Due Date and Estimated Hours */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="due_date"
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
                <FieldLabel htmlFor="task-due-date">
                  Due date
                </FieldLabel>

                <Input
                  {...field}
                  id="task-due-date"
                  type="date"
                  disabled={
                    isSubmitting
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
            name="estimated_hours"
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
                  disabled={
                    isSubmitting
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
          disabled={
            isSubmitting ||
            !selectedProjectId ||
            !form.watch(
              "assigned_to"
            ) ||
            assigneeOptions.length ===
              0
          }
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