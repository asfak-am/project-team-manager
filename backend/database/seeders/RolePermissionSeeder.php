<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        $permissions = [
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.assign-role',

            'projects.view-all',
            'projects.view-assigned',
            'projects.create',
            'projects.update',
            'projects.delete',
            'projects.manage-members',

            'tasks.view-all',
            'tasks.view-assigned',
            'tasks.create',
            'tasks.update',
            'tasks.delete',
            'tasks.assign',
            'tasks.update-status',

            'comments.create',
            'comments.delete',

            'activity.view',
        ];

        foreach ($permissions as $permissionName) {
            Permission::findOrCreate(
                $permissionName,
                'web'
            );
        }

        $administrator = Role::findOrCreate(
            'administrator',
            'web'
        );

        $projectManager = Role::findOrCreate(
            'project-manager',
            'web'
        );

        $teamMember = Role::findOrCreate(
            'team-member',
            'web'
        );

        $administrator->syncPermissions(
            Permission::where('guard_name', 'web')->get()
        );

        $projectManager->syncPermissions([
            'projects.view-assigned',
            'projects.create',
            'projects.update',
            'projects.delete',
            'projects.manage-members',

            'tasks.view-assigned',
            'tasks.create',
            'tasks.update',
            'tasks.delete',
            'tasks.assign',
            'tasks.update-status',

            'comments.create',
            'comments.delete',
            'activity.view',
        ]);

        $teamMember->syncPermissions([
            'projects.view-assigned',
            'tasks.view-assigned',
            'tasks.update-status',
            'comments.create',
            'activity.view',
        ]);

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();
    }
}
