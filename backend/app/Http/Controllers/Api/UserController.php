<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Requests\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('users.view');

        $users = User::query()
            ->with('roles')
            ->when(
                $request->filled('search'),
                function ($query) use ($request) {
                    $search = $request->string('search')->trim();

                    $query->where(function ($query) use ($search) {
                        $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                }
            )
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where(
                    'status',
                    $request->string('status')
                )
            )
            ->when(
                $request->filled('role'),
                fn ($query) => $query->role(
                    $request->string('role')
                )
            )
            ->latest()
            ->paginate(
                perPage: min($request->integer('per_page', 10), 50)
            )
            ->withQueryString();

        return UserResource::collection($users);
    }

    public function store(
        StoreUserRequest $request
    ): JsonResponse {
        Gate::authorize('users.create');

        $user = DB::transaction(function () use ($request) {
            $data = $request->safe()->except([
                'role',
                'password_confirmation',
            ]);

            $user = User::create($data);

            $user->syncRoles([
                $request->validated('role'),
            ]);

            return $user;
        });

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data' => new UserResource(
                $user->load('roles')
            ),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        Gate::authorize('users.view');

        return response()->json([
            'success' => true,
            'data' => new UserResource(
                $user->load('roles')
            ),
        ]);
    }

    public function update(
        UpdateUserRequest $request,
        User $user
    ): JsonResponse {
        Gate::authorize('users.update');

        $data = $request->validated();

        if (empty($data['password'] ?? null)) {
            unset($data['password']);
        }

        unset($data['password_confirmation']);

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data' => new UserResource(
                $user->fresh()->load('roles')
            ),
        ]);
    }

    public function updateRole(
        UpdateUserRoleRequest $request,
        User $user
    ): JsonResponse {
        Gate::authorize('users.assign-role');

        if (
            $request->user()->is($user)
            && $request->validated('role') !== 'administrator'
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot remove your own administrator role.',
            ], 422);
        }

        $user->syncRoles([
            $request->validated('role'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User role updated successfully.',
            'data' => new UserResource(
                $user->fresh()->load('roles')
            ),
        ]);
    }

    public function updateStatus(
        UpdateUserStatusRequest $request,
        User $user
    ): JsonResponse {
        Gate::authorize('users.update');

        if (
            $request->user()->is($user)
            && $request->validated('status') === 'inactive'
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own account.',
            ], 422);
        }

        $user->update([
            'status' => $request->validated('status'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully.',
            'data' => new UserResource(
                $user->fresh()->load('roles')
            ),
        ]);
    }

    public function destroy(
        Request $request,
        User $user
    ): JsonResponse {
        Gate::authorize('users.delete');

        if ($request->user()->is($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        if (
            $user->managedProjects()->exists()
            || $user->createdProjects()->exists()
            || $user->createdTasks()->exists()
        ) {
            return response()->json([
                'success' => false,
                'message' => 'This user has related project or task records. Deactivate the account instead.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }
}
