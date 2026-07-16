<?php

namespace App\Http\Controllers\Api;

use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssignTaskRequest;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\UpdateTaskStatusRequest;
use App\Http\Resources\TaskResource;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $tasks = Task::query()
            ->with([
                'project.manager',
                'assignee.roles',
                'creator.roles',
            ])
            ->withCount('comments')

            ->when(
                ! $user->hasRole('administrator'),
                function ($query) use ($user): void {
                    if (
                        $user->hasRole(
                            'project-manager'
                        )
                    ) {
                        $query->where(
                            function ($taskQuery) use ($user): void {
                                $taskQuery
                                    ->where(
                                        'assigned_to',
                                        $user->id
                                    )
                                    ->orWhere(
                                        'created_by',
                                        $user->id
                                    );
                            }
                        );

                        return;
                    }

                    if (
                        $user->hasRole(
                            'team-member'
                        )
                    ) {
                        $query
                            ->where(
                                'target_role',
                                'team-member'
                            )
                            ->where(
                                'assigned_to',
                                $user->id
                            );
                    }
                }
            )

            // Keep your existing filters below:
            ->when(
                $request->filled('project_id'),
                fn($query) => $query->where(
                    'project_id',
                    $request->integer('project_id')
                )
            )
            ->when(
                $request->filled('assigned_to'),
                fn($query) => $query->where(
                    'assigned_to',
                    $request->integer('assigned_to')
                )
            )
            ->when(
                $request->filled('status'),
                fn($query) => $query->where(
                    'status',
                    $request->string('status')
                )
            )
            ->when(
                $request->filled('priority'),
                fn($query) => $query->where(
                    'priority',
                    $request->string('priority')
                )
            )
            ->when(
                $request->filled('search'),
                function ($query) use ($request): void {
                    $search = $request
                        ->string('search')
                        ->trim();

                    $query->where(
                        'title',
                        'like',
                        "%{$search}%"
                    );
                }
            )
            ->when(
                $request->boolean('overdue'),
                fn($query) => $query
                    ->whereDate(
                        'due_date',
                        '<',
                        today()
                    )
                    ->where(
                        'status',
                        '!=',
                        'completed'
                    )
            )
            ->orderByRaw('due_date IS NULL')
            ->orderBy('due_date')
            ->latest('id')
            ->paginate(
                perPage: min(
                    $request->integer(
                        'per_page',
                        10
                    ),
                    50
                )
            )
            ->withQueryString();

        return TaskResource::collection($tasks);
    }

    public function myTasks(Request $request)
    {
        $user = $request->user();

        $tasks = Task::query()
            ->where(
                'assigned_to',
                $user->id
            )
            ->when(
                $user->hasRole(
                    'project-manager'
                ),
                fn($query) => $query->where(
                    'target_role',
                    'project-manager'
                )
            )
            ->when(
                $user->hasRole(
                    'team-member'
                ),
                fn($query) => $query->where(
                    'target_role',
                    'team-member'
                )
            )
            ->with([
                'project.manager',
                'assignee.roles',
                'creator.roles',
            ])
            ->withCount('comments')
            ->when(
                $request->filled('status'),
                fn($query) => $query->where(
                    'status',
                    $request->string('status')
                )
            )
            ->when(
                $request->filled('priority'),
                fn($query) => $query->where(
                    'priority',
                    $request->string('priority')
                )
            )
            ->when(
                $request->filled('search'),
                function ($query) use ($request): void {
                    $search = $request
                        ->string('search')
                        ->trim();

                    $query->where(
                        'title',
                        'like',
                        "%{$search}%"
                    );
                }
            )
            ->orderByRaw('due_date IS NULL')
            ->orderBy('due_date')
            ->paginate(
                perPage: min(
                    $request->integer(
                        'per_page',
                        10
                    ),
                    50
                )
            )
            ->withQueryString();

        return TaskResource::collection($tasks);
    }

    public function assignedByMe(
        Request $request
    ) {
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole([
                'administrator',
                'project-manager',
            ]),
            403,
            'You are not allowed to access delegated tasks.'
        );

        $tasks = Task::query()
            ->where(
                'created_by',
                $user->id
            )
            ->when(
                $user->hasRole(
                    'project-manager'
                ),
                fn($query) => $query->where(
                    'target_role',
                    'team-member'
                )
            )
            ->with([
                'project.manager',
                'assignee.roles',
                'creator.roles',
            ])
            ->withCount('comments')
            ->when(
                $request->filled('status'),
                fn($query) => $query->where(
                    'status',
                    $request->string('status')
                )
            )
            ->when(
                $request->filled('priority'),
                fn($query) => $query->where(
                    'priority',
                    $request->string('priority')
                )
            )
            ->when(
                $request->filled('search'),
                function ($query) use ($request): void {
                    $search = $request
                        ->string('search')
                        ->trim();

                    $query->where(
                        'title',
                        'like',
                        "%{$search}%"
                    );
                }
            )
            ->orderByRaw('due_date IS NULL')
            ->orderBy('due_date')
            ->paginate(
                perPage: min(
                    $request->integer(
                        'per_page',
                        10
                    ),
                    50
                )
            )
            ->withQueryString();

        return TaskResource::collection($tasks);
    }

    private function validateAssigneeForTargetRole(
        Project $project,
        mixed $assignedTo,
        string $targetRole
    ): User {
        if ($assignedTo === null) {
            throw ValidationException::withMessages([
                'assigned_to' => [
                    'Please select an assignee.',
                ],
            ]);
        }

        $user = User::query()
            ->with('roles')
            ->findOrFail((int) $assignedTo);

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'assigned_to' => [
                    'The selected user is inactive.',
                ],
            ]);
        }

        if ($targetRole === 'project-manager') {
            if (! $user->hasRole('project-manager')) {
                throw ValidationException::withMessages([
                    'assigned_to' => [
                        'Administrator tasks can only be assigned to a project manager.',
                    ],
                ]);
            }

            if ($project->manager_id !== $user->id) {
                throw ValidationException::withMessages([
                    'assigned_to' => [
                        'The task must be assigned to the selected project’s manager.',
                    ],
                ]);
            }

            return $user;
        }

        if (! $user->hasRole('team-member')) {
            throw ValidationException::withMessages([
                'assigned_to' => [
                    'Manager-created tasks can only be assigned to team members.',
                ],
            ]);
        }

        $isProjectMember = $project
            ->members()
            ->where(
                'users.id',
                $user->id
            )
            ->exists();

        if (! $isProjectMember) {
            throw ValidationException::withMessages([
                'assigned_to' => [
                    'The selected user is not a member of this project.',
                ],
            ]);
        }

        return $user;
    }

    public function store(
        StoreTaskRequest $request,
        Project $project
    ): JsonResponse {
        Gate::authorize('createTask', $project);

        $creator = $request->user();

        if (
            ! $creator->hasAnyRole([
                'administrator',
                'project-manager',
            ])
        ) {
            abort(
                403,
                'You are not allowed to create tasks.'
            );
        }

        $targetRole = $creator->hasRole(
            'administrator'
        )
            ? 'project-manager'
            : 'team-member';

        $assignedUser =
            $this->validateAssigneeForTargetRole(
                project: $project,
                assignedTo: $request->validated(
                    'assigned_to'
                ),
                targetRole: $targetRole
            );

        $task = DB::transaction(function () use (
            $request,
            $project,
            $creator,
            $targetRole,
            $assignedUser
        ): Task {
            Project::query()
                ->whereKey($project->id)
                ->lockForUpdate()
                ->firstOrFail();

            $nextTaskNumber = (
                Task::query()
                ->withTrashed()
                ->where(
                    'project_id',
                    $project->id
                )
                ->max('task_number') ?? 0
            ) + 1;

            $task = $project->tasks()->create([
                ...$request->validated(),

                'target_role' => $targetRole,
                'assigned_to' => $assignedUser->id,
                'task_number' => $nextTaskNumber,
                'created_by' => $creator->id,
            ]);

            ActivityLog::create([
                'user_id' => $creator->id,
                'project_id' => $project->id,
                'task_id' => $task->id,
                'action' => 'task.created',
                'description' =>
                "Created task {$project->project_key}-{$task->task_number} for {$assignedUser->name}.",
                'properties' => [
                    'target_role' => $targetRole,
                    'assigned_to' => $assignedUser->id,
                ],
            ]);

            return $task;
        });

        return response()->json([
            'success' => true,
            'message' =>
            $targetRole === 'project-manager'
                ? 'Manager task created successfully.'
                : 'Team member task created successfully.',

            'data' => new TaskResource(
                $task->load([
                    'project.manager',
                    'assignee.roles',
                    'creator.roles',
                ])->loadCount('comments')
            ),
        ], 201);
    }

    public function show(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $task->load([
            'project.manager',
            'assignee.roles',
            'creator.roles',
            'comments.user.roles',
        ])->loadCount('comments');

        return response()->json([
            'success' => true,
            'data' => new TaskResource($task),
        ]);
    }

    public function update(
        UpdateTaskRequest $request,
        Task $task
    ): JsonResponse {
        Gate::authorize('update', $task);

        $data = $request->validated();

        if (array_key_exists('assigned_to', $data)) {
            $assignedUser =
                $this->validateAssigneeForTargetRole(
                    project: $task->project,
                    assignedTo: $data['assigned_to'],
                    targetRole: $task->target_role
                );

            $data['assigned_to'] =
                $assignedUser->id;
        }

        DB::transaction(function () use (
            $request,
            $task,
            $data
        ) {
            $oldValues = $task->only([
                'title',
                'status',
                'priority',
                'assigned_to',
                'due_date',
            ]);

            $task->update($data);

            $this->synchronizeStatusTimestamps($task);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'project_id' => $task->project_id,
                'task_id' => $task->id,
                'action' => 'task.updated',
                'description' => 'Updated task details.',
                'properties' => [
                    'old' => $oldValues,
                    'new' => $task->only([
                        'title',
                        'status',
                        'priority',
                        'assigned_to',
                        'due_date',
                    ]),
                ],
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully.',
            'data' => new TaskResource(
                $task->fresh()->load([
                    'project.manager',
                    'assignee.roles',
                    'creator.roles',
                ])->loadCount('comments')
            ),
        ]);
    }

    public function updateStatus(
        UpdateTaskStatusRequest $request,
        Task $task
    ): JsonResponse {
        Gate::authorize('updateStatus', $task);

        $oldStatus = $task->status->value;
        $newStatus = $request->validated('status');

        DB::transaction(function () use (
            $request,
            $task,
            $oldStatus,
            $newStatus
        ) {
            $task->update([
                'status' => $newStatus,
            ]);

            $this->synchronizeStatusTimestamps($task);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'project_id' => $task->project_id,
                'task_id' => $task->id,
                'action' => 'task.status_updated',
                'description' => "Changed task status from {$oldStatus} to {$newStatus}.",
                'properties' => [
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ],
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Task status updated successfully.',
            'data' => new TaskResource(
                $task->fresh()->load([
                    'project.manager',
                    'assignee.roles',
                    'creator.roles',
                ])->loadCount('comments')
            ),
        ]);
    }

    public function assign(
        AssignTaskRequest $request,
        Task $task
    ): JsonResponse {
        Gate::authorize('assign', $task);

        $assignedUser =
            $this->validateAssigneeForTargetRole(
                project: $task->project,
                assignedTo: $request->validated(
                    'assigned_to'
                ),
                targetRole: $task->target_role
            );
        $oldAssignee = $task->assigned_to;

        $task->update([
            'assigned_to' => $assignedUser?->id,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'project_id' => $task->project_id,
            'task_id' => $task->id,
            'action' => 'task.assigned',
            'description' => $assignedUser
                ? "Assigned task to {$assignedUser->name}."
                : 'Task was unassigned.',
            'properties' => [
                'old_assigned_to' => $oldAssignee,
                'new_assigned_to' => $assignedUser?->id,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => $assignedUser
                ? 'Task assigned successfully.'
                : 'Task unassigned successfully.',
            'data' => new TaskResource(
                $task->fresh()->load([
                    'project.manager',
                    'assignee.roles',
                    'creator.roles',
                ])->loadCount('comments')
            ),
        ]);
    }

    public function destroy(
        Request $request,
        Task $task
    ): JsonResponse {
        Gate::authorize('delete', $task);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'project_id' => $task->project_id,
            'task_id' => $task->id,
            'action' => 'task.deleted',
            'description' => 'Archived task.',
        ]);

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task archived successfully.',
        ]);
    }

    private function validateAssigneeForTaskType(
        Project $project,
        mixed $assignedTo,
        string $taskType
    ): ?User {
        if ($assignedTo === null) {
            return null;
        }

        $user = User::findOrFail(
            (int) $assignedTo
        );

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'assigned_to' => [
                    'The selected user is inactive.',
                ],
            ]);
        }

        if ($taskType === 'main') {
            if (
                ! $user->hasRole(
                    'project-manager'
                )
            ) {
                throw ValidationException::withMessages([
                    'assigned_to' => [
                        'Main tasks can only be assigned to a project manager.',
                    ],
                ]);
            }

            if (
                $project->manager_id !==
                $user->id
            ) {
                throw ValidationException::withMessages([
                    'assigned_to' => [
                        'The task must be assigned to the manager of the selected project.',
                    ],
                ]);
            }

            return $user;
        }

        if (
            ! $user->hasRole(
                'team-member'
            )
        ) {
            throw ValidationException::withMessages([
                'assigned_to' => [
                    'Subtasks can only be assigned to team members.',
                ],
            ]);
        }

        $isProjectMember = $project
            ->members()
            ->where(
                'users.id',
                $user->id
            )
            ->exists();

        if (! $isProjectMember) {
            throw ValidationException::withMessages([
                'assigned_to' => [
                    'Subtasks can only be assigned to members of the selected project.',
                ],
            ]);
        }

        return $user;
    }

    private function synchronizeStatusTimestamps(
        Task $task
    ): void {
        if (
            $task->status === TaskStatus::InProgress
            && $task->started_at === null
        ) {
            $task->started_at = now();
        }

        if ($task->status === TaskStatus::Completed) {
            $task->completed_at ??= now();
        } else {
            $task->completed_at = null;
        }

        $task->save();
    }
}
