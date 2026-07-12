<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $administrator = User::updateOrCreate(
            ['email' => 'admin@teamflow.test'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('Password123!'),
                'status' => 'active',
            ]
        );

        $administrator->syncRoles([
            'administrator',
        ]);

        $manager = User::updateOrCreate(
            ['email' => 'manager@teamflow.test'],
            [
                'name' => 'Project Manager',
                'password' => Hash::make('Password123!'),
                'status' => 'active',
            ]
        );

        $manager->syncRoles([
            'project-manager',
        ]);

        $member = User::updateOrCreate(
            ['email' => 'member@teamflow.test'],
            [
                'name' => 'Team Member',
                'password' => Hash::make('Password123!'),
                'status' => 'active',
            ]
        );

        $member->syncRoles([
            'team-member',
        ]);
    }
}
