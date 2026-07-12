<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function before(
        User $user,
        string $ability
    ): bool|null {
        if ($user->hasRole('administrator')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->can('tasks.view-assigned')
            || $user->can('tasks.view-all');
    }

    public function view(
        User $user,
        Task $task
    ): bool {
        if ($task->project->manager_id === $user->id) {
            return true;
        }

        return $task->project
            ->members()
            ->where('users.id', $user->id)
            ->exists();
    }

    public function update(
        User $user,
        Task $task
    ): bool {
        return $user->can('tasks.update')
            && $task->project->manager_id === $user->id;
    }

    public function delete(
        User $user,
        Task $task
    ): bool {
        return $user->can('tasks.delete')
            && $task->project->manager_id === $user->id;
    }

    public function updateStatus(
        User $user,
        Task $task
    ): bool {
        if (
            $user->can('tasks.update-status')
            && $task->project->manager_id === $user->id
        ) {
            return true;
        }

        return $user->can('tasks.update-status')
            && $task->assigned_to === $user->id;
    }

    public function assign(
        User $user,
        Task $task
    ): bool {
        return $user->can('tasks.assign')
            && $task->project->manager_id === $user->id;
    }

    public function comment(
        User $user,
        Task $task
    ): bool {
        return $user->can('comments.create')
            && (
                $task->project->manager_id === $user->id
                || $task->project
                    ->members()
                    ->where('users.id', $user->id)
                    ->exists()
            );
    }
}
