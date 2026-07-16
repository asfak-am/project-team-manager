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
        if (
            $user->hasRole(
                'administrator'
            )
        ) {
            return true;
        }

        return null;
    }

    public function viewAny(
        User $user
    ): bool {
        return $user->can(
            'tasks.view-assigned'
        ) || $user->can(
            'tasks.view-all'
        );
    }

    public function view(
        User $user,
        Task $task
    ): bool {
        if ($user->hasRole('administrator')) {
            return true;
        }

        if ($user->hasRole('project-manager')) {
            return $task->assigned_to === $user->id
                || $task->created_by === $user->id;
        }

        return $user->hasRole('team-member')
            && $task->target_role === 'team-member'
            && $task->assigned_to === $user->id;
    }

    public function update(
        User $user,
        Task $task
    ): bool {
        if (! $user->can('tasks.update')) {
            return false;
        }

        if ($user->hasRole('administrator')) {
            return true;
        }

        return $user->hasRole('project-manager')
            && $task->created_by === $user->id
            && $task->target_role === 'team-member';
    }

    public function delete(
        User $user,
        Task $task
    ): bool {
        if (! $user->can('tasks.delete')) {
            return false;
        }

        if ($user->hasRole('administrator')) {
            return true;
        }

        return $user->hasRole('project-manager')
            && $task->created_by === $user->id
            && $task->target_role === 'team-member';
    }

    public function updateStatus(
        User $user,
        Task $task
    ): bool {
        if (! $user->can('tasks.update-status')) {
            return false;
        }

        if ($user->hasRole('administrator')) {
            return true;
        }

        if ($task->assigned_to === $user->id) {
            return true;
        }

        return $user->hasRole('project-manager')
            && $task->created_by === $user->id;
    }

    public function assign(
        User $user,
        Task $task
    ): bool {
        if (! $user->can('tasks.assign')) {
            return false;
        }

        if ($user->hasRole('administrator')) {
            return $task->target_role ===
                'project-manager';
        }

        return $user->hasRole('project-manager')
            && $task->created_by === $user->id
            && $task->target_role ===
            'team-member';
    }

    public function comment(
        User $user,
        Task $task
    ): bool {
        return $user->can(
            'comments.create'
        )
            && $this->view(
                $user,
                $task
            );
    }
}
