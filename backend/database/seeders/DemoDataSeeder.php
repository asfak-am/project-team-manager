<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            /*
            |--------------------------------------------------------------------------
            | Users
            |--------------------------------------------------------------------------
            */

            $admin = User::updateOrCreate(
                ['email' => 'admin@teamflow.test'],
                [
                    'name' => 'System Administrator',
                    'password' => Hash::make('Password123!'),
                    'status' => 'active',
                    'avatar' => null,
                ]
            );

            $managerOne = User::updateOrCreate(
                ['email' => 'manager@teamflow.test'],
                [
                    'name' => 'Project Manager One',
                    'password' => Hash::make('Password123!'),
                    'status' => 'active',
                    'avatar' => null,
                ]
            );

            $managerTwo = User::updateOrCreate(
                ['email' => 'manager2@teamflow.test'],
                [
                    'name' => 'Project Manager Two',
                    'password' => Hash::make('Password123!'),
                    'status' => 'active',
                    'avatar' => null,
                ]
            );

            $memberOne = User::updateOrCreate(
                ['email' => 'member@teamflow.test'],
                [
                    'name' => 'Team Member One',
                    'password' => Hash::make('Password123!'),
                    'status' => 'active',
                    'avatar' => null,
                ]
            );

            $memberTwo = User::updateOrCreate(
                ['email' => 'member2@teamflow.test'],
                [
                    'name' => 'Team Member Two',
                    'password' => Hash::make('Password123!'),
                    'status' => 'active',
                    'avatar' => null,
                ]
            );

            $memberThree = User::updateOrCreate(
                ['email' => 'member3@teamflow.test'],
                [
                    'name' => 'Team Member Three',
                    'password' => Hash::make('Password123!'),
                    'status' => 'active',
                    'avatar' => null,
                ]
            );

            $admin->syncRoles(['administrator']);
            $managerOne->syncRoles(['project-manager']);
            $managerTwo->syncRoles(['project-manager']);
            $memberOne->syncRoles(['team-member']);
            $memberTwo->syncRoles(['team-member']);
            $memberThree->syncRoles(['team-member']);

            /*
            |--------------------------------------------------------------------------
            | Projects
            |--------------------------------------------------------------------------
            */

            $projectOne = Project::updateOrCreate(
                ['project_key' => 'TF'],
                [
                    'name' => 'TeamFlow Platform',
                    'description' => 'Project and team task management platform for the internship assignment.',
                    'manager_id' => $managerOne->id,
                    'status' => 'active',
                    'priority' => 'critical',
                    'start_date' => now()->subDays(10)->toDateString(),
                    'due_date' => now()->addDays(20)->toDateString(),
                    'completed_at' => null,
                    'created_by' => $admin->id,
                ]
            );

            $projectTwo = Project::updateOrCreate(
                ['project_key' => 'WEB'],
                [
                    'name' => 'Corporate Website Redesign',
                    'description' => 'A responsive redesign project for a business website.',
                    'manager_id' => $managerTwo->id,
                    'status' => 'planning',
                    'priority' => 'high',
                    'start_date' => now()->subDays(3)->toDateString(),
                    'due_date' => now()->addDays(30)->toDateString(),
                    'completed_at' => null,
                    'created_by' => $admin->id,
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Project Memberships
            |--------------------------------------------------------------------------
            */

            $projectOne->members()->sync([
                $managerOne->id => [
                    'joined_at' => now()->subDays(10),
                ],
                $memberOne->id => [
                    'joined_at' => now()->subDays(9),
                ],
                $memberTwo->id => [
                    'joined_at' => now()->subDays(8),
                ],
            ]);

            $projectTwo->members()->sync([
                $managerTwo->id => [
                    'joined_at' => now()->subDays(3),
                ],
                $memberTwo->id => [
                    'joined_at' => now()->subDays(2),
                ],
                $memberThree->id => [
                    'joined_at' => now()->subDay(),
                ],
            ]);

            /*
            |--------------------------------------------------------------------------
            | Clear old project task demo data
            |--------------------------------------------------------------------------
            |
            | This makes the seeder repeatable without creating duplicates.
            |
            */

            TaskComment::query()
                ->whereHas('task', function ($query) use ($projectOne, $projectTwo) {
                    $query->whereIn('project_id', [
                        $projectOne->id,
                        $projectTwo->id,
                    ]);
                })
                ->forceDelete();

            ActivityLog::query()
                ->whereIn('project_id', [
                    $projectOne->id,
                    $projectTwo->id,
                ])
                ->delete();

            Task::withTrashed()
                ->whereIn('project_id', [
                    $projectOne->id,
                    $projectTwo->id,
                ])
                ->forceDelete();

            /*
            |--------------------------------------------------------------------------
            | Project One Tasks
            |--------------------------------------------------------------------------
            */

            $taskOne = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 1,
                'title' => 'Design database schema',
                'description' => 'Create tables, keys and relationships for the platform.',
                'status' => 'completed',
                'priority' => 'critical',
                'assigned_to' => $memberOne->id,
                'created_by' => $managerOne->id,
                'due_date' => now()->subDays(6)->toDateString(),
                'started_at' => now()->subDays(9),
                'completed_at' => now()->subDays(7),
                'estimated_hours' => 6,
            ]);

            $taskTwo = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 2,
                'title' => 'Build authentication API',
                'description' => 'Implement Laravel Sanctum login, logout and current-user endpoints.',
                'status' => 'completed',
                'priority' => 'high',
                'assigned_to' => $memberOne->id,
                'created_by' => $managerOne->id,
                'due_date' => now()->subDays(2)->toDateString(),
                'started_at' => now()->subDays(6),
                'completed_at' => now()->subDays(3),
                'estimated_hours' => 8,
            ]);

            $taskThree = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 3,
                'title' => 'Create Next.js login page',
                'description' => 'Build the responsive login screen and connect it to the Laravel API.',
                'status' => 'in_progress',
                'priority' => 'high',
                'assigned_to' => $memberTwo->id,
                'created_by' => $managerOne->id,
                'due_date' => now()->addDays(2)->toDateString(),
                'started_at' => now()->subDay(),
                'completed_at' => null,
                'estimated_hours' => 7,
            ]);

            $taskFour = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 4,
                'title' => 'Prepare API documentation',
                'description' => 'Document all endpoints in Postman with examples and permissions.',
                'status' => 'review',
                'priority' => 'medium',
                'assigned_to' => $memberTwo->id,
                'created_by' => $managerOne->id,
                'due_date' => now()->subDay()->toDateString(),
                'started_at' => now()->subDays(4),
                'completed_at' => null,
                'estimated_hours' => 4,
            ]);

            $taskFive = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 5,
                'title' => 'Build dashboard statistics',
                'description' => 'Create role-based dashboard cards and recent activity sections.',
                'status' => 'todo',
                'priority' => 'critical',
                'assigned_to' => $memberOne->id,
                'created_by' => $managerOne->id,
                'due_date' => now()->addDays(5)->toDateString(),
                'started_at' => null,
                'completed_at' => null,
                'estimated_hours' => 6,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Project Two Tasks
            |--------------------------------------------------------------------------
            */

            $taskSix = Task::create([
                'project_id' => $projectTwo->id,
                'task_number' => 1,
                'title' => 'Create homepage wireframe',
                'description' => 'Prepare a responsive homepage structure and content hierarchy.',
                'status' => 'completed',
                'priority' => 'medium',
                'assigned_to' => $memberThree->id,
                'created_by' => $managerTwo->id,
                'due_date' => now()->subDay()->toDateString(),
                'started_at' => now()->subDays(3),
                'completed_at' => now()->subDays(2),
                'estimated_hours' => 4,
            ]);

            $taskSeven = Task::create([
                'project_id' => $projectTwo->id,
                'task_number' => 2,
                'title' => 'Develop services section',
                'description' => 'Build the responsive services section with reusable components.',
                'status' => 'in_progress',
                'priority' => 'high',
                'assigned_to' => $memberTwo->id,
                'created_by' => $managerTwo->id,
                'due_date' => now()->subDays(2)->toDateString(),
                'started_at' => now()->subDays(3),
                'completed_at' => null,
                'estimated_hours' => 5,
            ]);

            $taskEight = Task::create([
                'project_id' => $projectTwo->id,
                'task_number' => 3,
                'title' => 'Test mobile responsiveness',
                'description' => 'Verify the website layout on mobile, tablet and desktop.',
                'status' => 'todo',
                'priority' => 'low',
                'assigned_to' => $memberThree->id,
                'created_by' => $managerTwo->id,
                'due_date' => now()->addDays(10)->toDateString(),
                'started_at' => null,
                'completed_at' => null,
                'estimated_hours' => 3,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Task Comments
            |--------------------------------------------------------------------------
            */

            TaskComment::create([
                'task_id' => $taskThree->id,
                'user_id' => $memberTwo->id,
                'comment' => 'The login layout is complete. I am now connecting the form to the API.',
            ]);

            TaskComment::create([
                'task_id' => $taskThree->id,
                'user_id' => $managerOne->id,
                'comment' => 'Please also add validation messages and a loading state.',
            ]);

            TaskComment::create([
                'task_id' => $taskFour->id,
                'user_id' => $memberTwo->id,
                'comment' => 'All task and project endpoints have been tested in Postman.',
            ]);

            TaskComment::create([
                'task_id' => $taskSeven->id,
                'user_id' => $managerTwo->id,
                'comment' => 'The task is overdue. Please prioritize the final responsive adjustments.',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Activity Logs
            |--------------------------------------------------------------------------
            */

            $activities = [
                [
                    'user_id' => $admin->id,
                    'project_id' => $projectOne->id,
                    'task_id' => null,
                    'action' => 'project.created',
                    'description' => 'Created project TF.',
                    'properties' => [
                        'project_name' => $projectOne->name,
                    ],
                ],
                [
                    'user_id' => $managerOne->id,
                    'project_id' => $projectOne->id,
                    'task_id' => $taskThree->id,
                    'action' => 'task.created',
                    'description' => 'Created task TF-3.',
                    'properties' => [
                        'assigned_to' => $memberTwo->id,
                    ],
                ],
                [
                    'user_id' => $memberTwo->id,
                    'project_id' => $projectOne->id,
                    'task_id' => $taskThree->id,
                    'action' => 'task.status_updated',
                    'description' => 'Changed task status from todo to in_progress.',
                    'properties' => [
                        'old_status' => 'todo',
                        'new_status' => 'in_progress',
                    ],
                ],
                [
                    'user_id' => $managerTwo->id,
                    'project_id' => $projectTwo->id,
                    'task_id' => $taskSeven->id,
                    'action' => 'task.updated',
                    'description' => 'Updated task due date and priority.',
                    'properties' => [
                        'priority' => 'high',
                    ],
                ],
            ];

            foreach ($activities as $activity) {
                ActivityLog::create($activity);
            }
        });
    }
}
