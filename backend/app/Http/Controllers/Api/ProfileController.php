<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->load('roles');

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    public function update(
        UpdateProfileRequest $request
    ): JsonResponse {
        $user = $request->user();

        $oldValues = [
            'name' => $user->name,
            'email' => $user->email,
        ];

        DB::transaction(function () use (
            $request,
            $user,
            $oldValues
        ): void {
            $user->update(
                $request->validated()
            );

            ActivityLog::create([
                'user_id' => $user->id,
                'project_id' => null,
                'task_id' => null,
                'action' => 'profile.updated',
                'description' =>
                'Updated personal profile information.',
                'properties' => [
                    'old' => $oldValues,
                    'new' => [
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                ],
            ]);
        });

        $user->load('roles');

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => new UserResource($user),
        ]);
    }

    public function updatePassword(
        UpdatePasswordRequest $request
    ): JsonResponse {
        $user = $request->user();

        DB::transaction(function () use (
            $request,
            $user
        ): void {
            $user->update([
                'password' => Hash::make(
                    $request->validated('password')
                ),
            ]);

            ActivityLog::create([
                'user_id' => $user->id,
                'project_id' => null,
                'task_id' => null,
                'action' => 'profile.password_updated',
                'description' =>
                'Changed account password.',
                'properties' => null,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' =>
            'Password changed successfully.',
            'data' => null,
        ]);
    }
public function updateAvatar(
    Request $request
): JsonResponse {
    $validated = $request->validate([
        'avatar' => [
            'required',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:2048',
        ],
    ]);

    $user = $request->user();

    $path = $request
        ->file('avatar')
        ->store('avatars', 'public');

    $user->update([
        'avatar_path' => $path,
    ]);

    $user->load('roles');

    return response()->json([
        'success' => true,
        'message' =>
            'Profile picture updated successfully.',
        'data' => new UserResource($user),
    ]);
}

    public function deleteAvatar(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete(
                $user->avatar_path
            );

            $user->update([
                'avatar_path' => null,
            ]);
        }

        $user->load('roles');

        return response()->json([
            'success' => true,
            'message' =>
            'Profile picture removed successfully.',
            'data' => new UserResource($user),
        ]);
    }
}
