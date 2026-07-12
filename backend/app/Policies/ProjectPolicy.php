<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
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
        return $user->can('projects.view-assigned')
            || $user->can('projects.view-all');
    }

    public function view(
        User $user,
        Project $project
    ): bool {
        if ($project->manager_id === $user->id) {
            return true;
        }

        return $project->members()
            ->where('users.id', $user->id)
            ->exists();
    }

    public function create(User $user): bool
    {
        return $user->can('projects.create');
    }

    public function update(
        User $user,
        Project $project
    ): bool {
        return $user->can('projects.update')
            && $project->manager_id === $user->id;
    }

    public function delete(
        User $user,
        Project $project
    ): bool {
        return $user->can('projects.delete')
            && $project->manager_id === $user->id;
    }

    public function manageMembers(
        User $user,
        Project $project
    ): bool {
        return $user->can('projects.manage-members')
            && $project->manager_id === $user->id;
    }
    public function createTask(
        User $user,
        Project $project
    ): bool {
        return $user->can('tasks.create')
            && $project->manager_id === $user->id;
    }
}
