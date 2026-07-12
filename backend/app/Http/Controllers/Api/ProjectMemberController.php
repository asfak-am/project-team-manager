<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddProjectMemberRequest;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ProjectMemberController extends Controller
{
    public function index(Project $project)
    {
        Gate::authorize('view', $project);

        $members = $project
            ->members()
            ->with('roles')
            ->orderBy('name')
            ->get();

        return UserResource::collection($members);
    }

    public function store(
        AddProjectMemberRequest $request,
        Project $project
    ): JsonResponse {
        Gate::authorize('manageMembers', $project);

        $users = User::query()
            ->whereIn(
                'id',
                $request->validated('user_ids')
            )
            ->get();

        $inactiveUser = $users->firstWhere(
            'status',
            'inactive'
        );

        if ($inactiveUser) {
            throw ValidationException::withMessages([
                'user_ids' => [
                    "{$inactiveUser->name} is inactive and cannot be added.",
                ],
            ]);
        }

        DB::transaction(function () use (
            $request,
            $project,
            $users
        ) {
            $pivotData = $users->mapWithKeys(
                fn (User $user) => [
                    $user->id => [
                        'joined_at' => now(),
                    ],
                ]
            )->all();

            $project->members()->syncWithoutDetaching(
                $pivotData
            );

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'project_id' => $project->id,
                'action' => 'project.members_added',
                'description' => 'Added project members.',
                'properties' => [
                    'user_ids' => $users->pluck('id')->all(),
                ],
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Project members added successfully.',
            'data' => UserResource::collection(
                $project->members()
                    ->with('roles')
                    ->orderBy('name')
                    ->get()
            ),
        ]);
    }

    public function destroy(
        Request $request,
        Project $project,
        User $user
    ): JsonResponse {
        Gate::authorize('manageMembers', $project);

        if ($project->manager_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'The project manager cannot be removed from the project.',
            ], 422);
        }

        if (
            ! $project->members()
                ->where('users.id', $user->id)
                ->exists()
        ) {
            return response()->json([
                'success' => false,
                'message' => 'The selected user is not a project member.',
            ], 404);
        }

        DB::transaction(function () use (
            $request,
            $project,
            $user
        ) {
            $project->tasks()
                ->where('assigned_to', $user->id)
                ->update([
                    'assigned_to' => null,
                ]);

            $project->members()->detach($user->id);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'project_id' => $project->id,
                'action' => 'project.member_removed',
                'description' => "Removed {$user->name} from the project.",
                'properties' => [
                    'removed_user_id' => $user->id,
                ],
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Project member removed successfully.',
        ]);
    }
}
