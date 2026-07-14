<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Project::class);

        $user = $request->user();

        $projects = Project::query()
            ->with([
                'manager.roles',
                'members.roles',
            ])
            ->withCount([
                'tasks',
                'tasks as completed_tasks_count' => fn($query) =>
                $query->where('status', 'completed'),
            ])
            ->when(
                ! $user->hasRole('administrator'),
                function ($query) use ($user) {
                    $query->where(function ($query) use ($user) {
                        $query
                            ->where('manager_id', $user->id)
                            ->orWhereHas(
                                'members',
                                fn($memberQuery) =>
                                $memberQuery->where(
                                    'users.id',
                                    $user->id
                                )
                            );
                    });
                }
            )
            ->when(
                $request->filled('search'),
                function ($query) use ($request) {
                    $search = $request->string('search')->trim();

                    $query->where(function ($query) use ($search) {
                        $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere(
                                'project_key',
                                'like',
                                "%{$search}%"
                            );
                    });
                }
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
            ->latest()
            ->paginate(
                perPage: min($request->integer('per_page', 10), 50)
            )
            ->withQueryString();

        return ProjectResource::collection($projects);
    }

    public function store(
        StoreProjectRequest $request
    ): JsonResponse {
        Gate::authorize('create', Project::class);

        $manager = User::findOrFail(
            $request->integer('manager_id')
        );

        if (
            ! $manager->hasAnyRole([
                'administrator',
                'project-manager',
            ])
        ) {
            throw ValidationException::withMessages([
                'manager_id' => [
                    'The selected user must be an administrator or project manager.',
                ],
            ]);
        }

        if ($manager->status !== 'active') {
            throw ValidationException::withMessages([
                'manager_id' => [
                    'The selected project manager is inactive.',
                ],
            ]);
        }

        $project = DB::transaction(function () use (
            $request,
            $manager
        ) {
            $projectData = $request->safe()->except([
                'member_ids',
            ]);

            $projectData['created_by'] = $request->user()->id;

            $project = Project::create($projectData);

            $memberIds = collect(
                $request->validated('member_ids', [])
            )
                ->push($manager->id)
                ->unique()
                ->values();

            $pivotData = $memberIds->mapWithKeys(
                fn(int $userId) => [
                    $userId => [
                        'joined_at' => now(),
                    ],
                ]
            )->all();

            $project->members()->sync($pivotData);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'project_id' => $project->id,
                'action' => 'project.created',
                'description' => "Created project {$project->project_key}",
                'properties' => [
                    'project_name' => $project->name,
                ],
            ]);

            return $project;
        });

        return response()->json([
            'success' => true,
            'message' => 'Project created successfully.',
            'data' => new ProjectResource(
                $project->load([
                    'manager.roles',
                    'creator.roles',
                    'members.roles',
                ])->loadCount([
                    'tasks',
                    'tasks as completed_tasks_count' => fn($query) =>
                    $query->where('status', 'completed'),
                ])
            ),
        ], 201);
    }

    public function show(Project $project): JsonResponse
    {
        Gate::authorize('view', $project);

        $project->load([
            'manager.roles',
            'creator.roles',
            'members.roles',
        ])->loadCount([
            'tasks',
            'tasks as completed_tasks_count' => fn($query) =>
            $query->where('status', 'completed'),
        ]);

        return response()->json([
            'success' => true,
            'data' => new ProjectResource($project),
        ]);
    }

    public function update(
        UpdateProjectRequest $request,
        Project $project
    ): JsonResponse {
        Gate::authorize('update', $project);

        $data = $request->validated();

        if (isset($data['manager_id'])) {
            $manager = User::findOrFail($data['manager_id']);

            if (
                ! $manager->hasAnyRole([
                    'administrator',
                    'project-manager',
                ])
            ) {
                throw ValidationException::withMessages([
                    'manager_id' => [
                        'The selected user must be an administrator or project manager.',
                    ],
                ]);
            }

            if ($manager->status !== 'active') {
                throw ValidationException::withMessages([
                    'manager_id' => [
                        'The selected project manager is inactive.',
                    ],
                ]);
            }
        }

        DB::transaction(function () use (
            $request,
            $project,
            $data
        ) {
            $oldValues = $project->only([
                'name',
                'manager_id',
                'status',
                'priority',
                'due_date',
            ]);

            $project->update($data);

            if (isset($data['manager_id'])) {
                $project->members()->syncWithoutDetaching([
                    $data['manager_id'] => [
                        'joined_at' => now(),
                    ],
                ]);
            }

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'project_id' => $project->id,
                'action' => 'project.updated',
                'description' => "Updated project {$project->project_key}",
                'properties' => [
                    'old' => $oldValues,
                    'new' => $project->only([
                        'name',
                        'manager_id',
                        'status',
                        'priority',
                        'due_date',
                    ]),
                ],
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Project updated successfully.',
            'data' => new ProjectResource(
                $project->fresh()->load([
                    'manager.roles',
                    'creator.roles',
                    'members.roles',
                ])->loadCount([
                    'tasks',
                    'tasks as completed_tasks_count' => fn($query) =>
                    $query->where('status', 'completed'),
                ])
            ),
        ]);
    }

    // public function destroy(
    //     Request $request,
    //     Project $project
    // ): JsonResponse {
    //     Gate::authorize('delete', $project);

    //     DB::transaction(function () use ($request, $project) {
    //         ActivityLog::create([
    //             'user_id' => $request->user()->id,
    //             'project_id' => $project->id,
    //             'action' => 'project.deleted',
    //             'description' => "Archived project {$project->project_key}",
    //         ]);

    //         $project->delete();
    //     });

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Project archived successfully.',
    //     ]);
    // }

    public function destroy(
        Request $request,
        Project $project
    ): JsonResponse {
        Gate::authorize('delete', $project);

        $validated = $request->validate([
            'permanent' => ['sometimes', 'boolean'],
        ]);

        $permanent = (bool) ($validated['permanent'] ?? false);

        $projectId = $project->id;
        $projectName = $project->name;
        $projectKey = $project->project_key;

        DB::transaction(function () use (
            $request,
            $project,
            $permanent,
            $projectId,
            $projectName,
            $projectKey
        ): void {
            if ($permanent) {
                /*
             * Store the activity without project_id because that
             * project record will no longer exist.
             */
                ActivityLog::create([
                    'user_id' => $request->user()->id,
                    'project_id' => null,
                    'task_id' => null,
                    'action' => 'project.force_deleted',
                    'description' =>
                    "Permanently deleted project {$projectKey}.",
                    'properties' => [
                        'deleted_project_id' => $projectId,
                        'project_name' => $projectName,
                        'project_key' => $projectKey,
                    ],
                ]);

                /*
             * Use these lines if your database does not have
             * appropriate cascading foreign keys.
             */
                $project->members()->detach();

                $project->tasks()
                    ->withTrashed()
                    ->forceDelete();

                $project->forceDelete();

                return;
            }

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'project_id' => $project->id,
                'task_id' => null,
                'action' => 'project.trashed',
                'description' =>
                "Moved project {$projectKey} to Trash.",
                'properties' => [
                    'project_name' => $projectName,
                    'project_key' => $projectKey,
                ],
            ]);

            $project->delete();
        });

        return response()->json([
            'success' => true,
            'message' => $permanent
                ? 'Project permanently deleted successfully.'
                : 'Project moved to Trash successfully.',
            'data' => null,
        ]);
    }

    public function trashed(Request $request)
    {
        Gate::authorize('viewTrash', Project::class);

        $projects = Project::query()
            ->onlyTrashed()
            ->with([
                'manager.roles',
                'creator.roles',
                'members.roles',
            ])
            ->when(
                $request->filled('search'),
                function ($query) use ($request): void {
                    $search = $request
                        ->string('search')
                        ->trim()
                        ->toString();

                    $query->where(
                        function ($query) use ($search): void {
                            $query
                                ->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'project_key',
                                    'like',
                                    "%{$search}%"
                                );
                        }
                    );
                }
            )
            ->latest('deleted_at')
            ->paginate(
                min(
                    max($request->integer('per_page', 10), 1),
                    50
                )
            )
            ->withQueryString();

        return ProjectResource::collection($projects);
    }

    public function restore(
        Request $request,
        Project $project
    ): JsonResponse {
        Gate::authorize('restore', $project);

        if (! $project->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'This project is not in Trash.',
            ], 422);
        }

        DB::transaction(function () use (
            $request,
            $project
        ): void {
            $project->restore();

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'project_id' => $project->id,
                'task_id' => null,
                'action' => 'project.restored',
                'description' =>
                "Restored project {$project->project_key}.",
                'properties' => [
                    'project_name' => $project->name,
                ],
            ]);
        });

        $project->refresh()->load([
            'manager.roles',
            'creator.roles',
            'members.roles',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Project restored successfully.',
            'data' => new ProjectResource($project),
        ]);
    }

    public function forceDelete(
        Request $request,
        Project $project
    ): JsonResponse {
        Gate::authorize('forceDelete', $project);

        if (! $project->trashed()) {
            return response()->json([
                'success' => false,
                'message' =>
                'Only projects in Trash can be permanently deleted.',
            ], 422);
        }

        $projectId = $project->id;
        $projectName = $project->name;
        $projectKey = $project->project_key;

        DB::transaction(function () use (
            $request,
            $project,
            $projectId,
            $projectName,
            $projectKey
        ): void {
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'project_id' => null,
                'task_id' => null,
                'action' => 'project.force_deleted',
                'description' =>
                "Permanently deleted project {$projectKey}.",
                'properties' => [
                    'deleted_project_id' => $projectId,
                    'project_name' => $projectName,
                    'project_key' => $projectKey,
                ],
            ]);

            $project->members()->detach();

            $project->tasks()
                ->withTrashed()
                ->forceDelete();

            $project->forceDelete();
        });

        return response()->json([
            'success' => true,
            'message' =>
            'Project permanently deleted successfully.',
            'data' => null,
        ]);
    }
}
