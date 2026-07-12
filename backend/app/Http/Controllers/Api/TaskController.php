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
                function ($query) use ($user) {
                    $query->whereHas(
                        'project',
                        function ($projectQuery) use ($user) {
                            $projectQuery->where(
                                function ($query) use ($user) {
                                    $query
                                        ->where(
                                            'manager_id',
                                            $user->id
                                        )
                                        ->orWhereHas(
                                            'members',
                                            fn ($memberQuery) =>
                                                $memberQuery->where(
                                                    'users.id',
                                                    $user->id
                                                )
                                        );
                                }
                            );
                        }
                    );
                }
            )
            ->when(
                $request->filled('project_id'),
                fn ($query) => $query->where(
                    'project_id',
                    $request->integer('project_id')
                )
            )
            ->when(
                $request->filled('assigned_to'),
                fn ($query) => $query->where(
                    'assigned_to',
                    $request->integer('assigned_to')
                )
            )
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where(
                    'status',
                    $request->string('status')
                )
            )
            ->when(
                $request->filled('priority'),
                fn ($query) => $query->where(
                    'priority',
                    $request->string('priority')
                )
            )
            ->when(
                $request->filled('search'),
                function ($query) use ($request) {
                    $search = $request->string('search')->trim();

                    $query->where(
                        'title',
                        'like',
                        "%{$search}%"
                    );
                }
            )
            ->when(
                $request->boolean('overdue'),
                fn ($query) => $query
                    ->whereDate('due_date', '<', today())
                    ->where('status', '!=', 'completed')
            )
            ->orderByRaw('due_date IS NULL')
            ->orderBy('due_date')
            ->latest('id')
            ->paginate(
                perPage: min($request->integer('per_page', 10), 50)
            )
            ->withQueryString();

        return TaskResource::collection($tasks);
    }

    public function myTasks(Request $request)
    {
        $tasks = Task::query()
            ->where('assigned_to', $request->user()->id)
            ->with([
                'project.manager',
                'assignee.roles',
                'creator.roles',
            ])
            ->withCount('comments')
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where(
                    'status',
                    $request->string('status')
                )
            )
            ->when(
                $request->filled('priority'),
                fn ($query) => $query->where(
                    'priority',
                    $request->string('priority')
                )
            )
            ->orderByRaw('due_date IS NULL')
            ->orderBy('due_date')
            ->paginate(
                perPage: min($request->integer('per_page', 10), 50)
            )
            ->withQueryString();

        return TaskResource::collection($tasks);
    }

    public function store(
        StoreTaskRequest $request,
        Project $project
    ): JsonResponse {
        Gate::authorize('createTask', $project);

        $assignedUser = $this->validateAssignee(
            $project,
            $request->validated('assigned_to')
        );

        $task = DB::transaction(function () use (
            $request,
            $project,
            $assignedUser
        ) {
            /*
             * Locking the project row prevents two simultaneous
             * requests from generating the same task number.
             */
            Project::query()
                ->whereKey($project->id)
                ->lockForUpdate()
                ->firstOrFail();

            $nextTaskNumber = (
                Task::query()
                    ->withTrashed()
                    ->where('project_id', $project->id)
                    ->max('task_number') ?? 0
            ) + 1;

            $task = $project->tasks()->create([
                ...$request->validated(),
                'assigned_to' => $assignedUser?->id,
                'task_number' => $nextTaskNumber,
                'created_by' => $request->user()->id,
            ]);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'project_id' => $project->id,
                'task_id' => $task->id,
                'action' => 'task.created',
                'description' => "Created task {$project->project_key}-{$task->task_number}",
                'properties' => [
                    'assigned_to' => $task->assigned_to,
                ],
            ]);

            return $task;
        });

        return response()->json([
            'success' => true,
            'message' => 'Task created successfully.',
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
            $assignedUser = $this->validateAssignee(
                $task->project,
                $data['assigned_to']
            );

            $data['assigned_to'] = $assignedUser?->id;
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

        $assignedUser = $this->validateAssignee(
            $task->project,
            $request->validated('assigned_to')
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

    private function validateAssignee(
        Project $project,
        mixed $assignedTo
    ): ?User {
        if ($assignedTo === null) {
            return null;
        }

        $user = User::findOrFail((int) $assignedTo);

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'assigned_to' => [
                    'The selected user is inactive.',
                ],
            ]);
        }

        $isProjectMember = $project
            ->members()
            ->where('users.id', $user->id)
            ->exists();

        if (! $isProjectMember) {
            throw ValidationException::withMessages([
                'assigned_to' => [
                    'Tasks can only be assigned to project members.',
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
