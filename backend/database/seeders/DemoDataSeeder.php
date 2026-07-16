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
                [
                    'email' => 'admin@teamflow.test',
                ],
                [
                    'name' => 'System Administrator',
                    'password' => Hash::make(
                        'Password123!'
                    ),
                    'status' => 'active',
                    'avatar_path' => null,
                ]
            );

            $managerOne = User::updateOrCreate(
                [
                    'email' => 'manager@teamflow.test',
                ],
                [
                    'name' => 'Project Manager One',
                    'password' => Hash::make(
                        'Password123!'
                    ),
                    'status' => 'active',
                    'avatar_path' => null,
                ]
            );

            $managerTwo = User::updateOrCreate(
                [
                    'email' => 'manager2@teamflow.test',
                ],
                [
                    'name' => 'Project Manager Two',
                    'password' => Hash::make(
                        'Password123!'
                    ),
                    'status' => 'active',
                    'avatar_path' => null,
                ]
            );

            $memberOne = User::updateOrCreate(
                [
                    'email' => 'member@teamflow.test',
                ],
                [
                    'name' => 'Frontend Developer',
                    'password' => Hash::make(
                        'Password123!'
                    ),
                    'status' => 'active',
                    'avatar_path' => null,
                ]
            );

            $memberTwo = User::updateOrCreate(
                [
                    'email' => 'member2@teamflow.test',
                ],
                [
                    'name' => 'Backend Developer',
                    'password' => Hash::make(
                        'Password123!'
                    ),
                    'status' => 'active',
                    'avatar_path' => null,
                ]
            );

            $memberThree = User::updateOrCreate(
                [
                    'email' => 'member3@teamflow.test',
                ],
                [
                    'name' => 'UI UX Designer',
                    'password' => Hash::make(
                        'Password123!'
                    ),
                    'status' => 'active',
                    'avatar_path' => null,
                ]
            );

            $admin->syncRoles([
                'administrator',
            ]);

            $managerOne->syncRoles([
                'project-manager',
            ]);

            $managerTwo->syncRoles([
                'project-manager',
            ]);

            $memberOne->syncRoles([
                'team-member',
            ]);

            $memberTwo->syncRoles([
                'team-member',
            ]);

            $memberThree->syncRoles([
                'team-member',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Projects
            |--------------------------------------------------------------------------
            */

            $projectOne = Project::updateOrCreate(
                [
                    'project_key' => 'TF',
                ],
                [
                    'name' => 'TeamFlow Platform',
                    'description' =>
                        'Project and team task management platform developed for the full-stack internship assessment.',
                    'manager_id' => $managerOne->id,
                    'status' => 'active',
                    'priority' => 'critical',
                    'start_date' => now()
                        ->subDays(14)
                        ->toDateString(),
                    'due_date' => now()
                        ->addDays(25)
                        ->toDateString(),
                    'completed_at' => null,
                    'created_by' => $admin->id,
                ]
            );

            $projectTwo = Project::updateOrCreate(
                [
                    'project_key' => 'WEB',
                ],
                [
                    'name' =>
                        'Corporate Website Redesign',
                    'description' =>
                        'Redesign and rebuild the company website with a responsive and conversion-focused interface.',
                    'manager_id' => $managerTwo->id,
                    'status' => 'planning',
                    'priority' => 'high',
                    'start_date' => now()
                        ->subDays(5)
                        ->toDateString(),
                    'due_date' => now()
                        ->addDays(35)
                        ->toDateString(),
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
                    'joined_at' => now()
                        ->subDays(14),
                ],
                $memberOne->id => [
                    'joined_at' => now()
                        ->subDays(13),
                ],
                $memberTwo->id => [
                    'joined_at' => now()
                        ->subDays(12),
                ],
            ]);

            $projectTwo->members()->sync([
                $managerTwo->id => [
                    'joined_at' => now()
                        ->subDays(5),
                ],
                $memberOne->id => [
                    'joined_at' => now()
                        ->subDays(4),
                ],
                $memberThree->id => [
                    'joined_at' => now()
                        ->subDays(3),
                ],
            ]);

            /*
            |--------------------------------------------------------------------------
            | Clear Existing Demo Task Data
            |--------------------------------------------------------------------------
            |
            | This makes the seeder safe to execute repeatedly.
            |
            */

            $projectIds = [
                $projectOne->id,
                $projectTwo->id,
            ];

            TaskComment::query()
                ->whereHas(
                    'task',
                    fn ($query) =>
                        $query->whereIn(
                            'project_id',
                            $projectIds
                        )
                )
                ->forceDelete();

            ActivityLog::query()
                ->whereIn(
                    'project_id',
                    $projectIds
                )
                ->delete();

            Task::withTrashed()
                ->whereIn(
                    'project_id',
                    $projectIds
                )
                ->forceDelete();

            /*
            |--------------------------------------------------------------------------
            | Project One: Administrator → Manager Tasks
            |--------------------------------------------------------------------------
            |
            | These are management-level tasks.
            | Team members must not be able to see these tasks.
            |
            */

            $managerTaskOne = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 1,
                'target_role' => 'project-manager',
                'title' =>
                    'Prepare TeamFlow implementation plan',
                'description' =>
                    'Prepare the project phases, team responsibilities, delivery milestones and technical implementation plan.',
                'status' => 'completed',
                'priority' => 'critical',
                'assigned_to' => $managerOne->id,
                'created_by' => $admin->id,
                'due_date' => now()
                    ->subDays(8)
                    ->toDateString(),
                'started_at' => now()
                    ->subDays(13),
                'completed_at' => now()
                    ->subDays(9),
                'estimated_hours' => 6,
            ]);

            $managerTaskTwo = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 2,
                'target_role' => 'project-manager',
                'title' =>
                    'Coordinate backend and frontend delivery',
                'description' =>
                    'Coordinate the Laravel API and Next.js frontend implementation and ensure all modules follow the approved requirements.',
                'status' => 'in_progress',
                'priority' => 'critical',
                'assigned_to' => $managerOne->id,
                'created_by' => $admin->id,
                'due_date' => now()
                    ->addDays(7)
                    ->toDateString(),
                'started_at' => now()
                    ->subDays(4),
                'completed_at' => null,
                'estimated_hours' => 12,
            ]);

            $managerTaskThree = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 3,
                'target_role' => 'project-manager',
                'title' =>
                    'Complete final quality review',
                'description' =>
                    'Review the completed functionality, documentation, permissions and deployment readiness before submission.',
                'status' => 'todo',
                'priority' => 'high',
                'assigned_to' => $managerOne->id,
                'created_by' => $admin->id,
                'due_date' => now()
                    ->addDays(18)
                    ->toDateString(),
                'started_at' => null,
                'completed_at' => null,
                'estimated_hours' => 8,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Project One: Manager → Member Tasks
            |--------------------------------------------------------------------------
            */

            $memberTaskOne = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 4,
                'target_role' => 'team-member',
                'title' =>
                    'Build authentication and authorization API',
                'description' =>
                    'Implement Sanctum authentication, CSRF protection, role permissions and protected API routes.',
                'status' => 'completed',
                'priority' => 'critical',
                'assigned_to' => $memberTwo->id,
                'created_by' => $managerOne->id,
                'due_date' => now()
                    ->subDays(5)
                    ->toDateString(),
                'started_at' => now()
                    ->subDays(11),
                'completed_at' => now()
                    ->subDays(6),
                'estimated_hours' => 12,
            ]);

            $memberTaskTwo = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 5,
                'target_role' => 'team-member',
                'title' =>
                    'Develop responsive authentication interface',
                'description' =>
                    'Build the TeamFlow login page and connect it to the Laravel authentication API.',
                'status' => 'completed',
                'priority' => 'high',
                'assigned_to' => $memberOne->id,
                'created_by' => $managerOne->id,
                'due_date' => now()
                    ->subDays(2)
                    ->toDateString(),
                'started_at' => now()
                    ->subDays(7),
                'completed_at' => now()
                    ->subDays(3),
                'estimated_hours' => 8,
            ]);

            $memberTaskThree = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 6,
                'target_role' => 'team-member',
                'title' =>
                    'Implement project and member management API',
                'description' =>
                    'Create project CRUD endpoints, Trash functionality and project member assignment endpoints.',
                'status' => 'review',
                'priority' => 'high',
                'assigned_to' => $memberTwo->id,
                'created_by' => $managerOne->id,
                'due_date' => now()
                    ->addDay()
                    ->toDateString(),
                'started_at' => now()
                    ->subDays(5),
                'completed_at' => null,
                'estimated_hours' => 10,
            ]);

            $memberTaskFour = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 7,
                'target_role' => 'team-member',
                'title' =>
                    'Build dashboard and project pages',
                'description' =>
                    'Implement the responsive dashboard, project list, project details and member management interfaces.',
                'status' => 'in_progress',
                'priority' => 'high',
                'assigned_to' => $memberOne->id,
                'created_by' => $managerOne->id,
                'due_date' => now()
                    ->addDays(4)
                    ->toDateString(),
                'started_at' => now()
                    ->subDays(2),
                'completed_at' => null,
                'estimated_hours' => 12,
            ]);

            $memberTaskFive = Task::create([
                'project_id' => $projectOne->id,
                'task_number' => 8,
                'target_role' => 'team-member',
                'title' =>
                    'Prepare API and technical documentation',
                'description' =>
                    'Prepare Postman documentation, diagrams, README setup instructions and the feature completion report.',
                'status' => 'todo',
                'priority' => 'medium',
                'assigned_to' => $memberTwo->id,
                'created_by' => $managerOne->id,
                'due_date' => now()
                    ->addDays(10)
                    ->toDateString(),
                'started_at' => null,
                'completed_at' => null,
                'estimated_hours' => 7,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Project Two: Administrator → Manager Tasks
            |--------------------------------------------------------------------------
            */

            $managerTaskFour = Task::create([
                'project_id' => $projectTwo->id,
                'task_number' => 1,
                'target_role' => 'project-manager',
                'title' =>
                    'Prepare website redesign strategy',
                'description' =>
                    'Define the website redesign goals, content hierarchy, technical approach and implementation milestones.',
                'status' => 'completed',
                'priority' => 'high',
                'assigned_to' => $managerTwo->id,
                'created_by' => $admin->id,
                'due_date' => now()
                    ->subDay()
                    ->toDateString(),
                'started_at' => now()
                    ->subDays(5),
                'completed_at' => now()
                    ->subDays(2),
                'estimated_hours' => 5,
            ]);

            $managerTaskFive = Task::create([
                'project_id' => $projectTwo->id,
                'task_number' => 2,
                'target_role' => 'project-manager',
                'title' =>
                    'Manage design and development delivery',
                'description' =>
                    'Coordinate design approval, frontend implementation and responsive testing for the corporate website.',
                'status' => 'in_progress',
                'priority' => 'high',
                'assigned_to' => $managerTwo->id,
                'created_by' => $admin->id,
                'due_date' => now()
                    ->addDays(14)
                    ->toDateString(),
                'started_at' => now()
                    ->subDays(2),
                'completed_at' => null,
                'estimated_hours' => 10,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Project Two: Manager → Member Tasks
            |--------------------------------------------------------------------------
            */

            $memberTaskSix = Task::create([
                'project_id' => $projectTwo->id,
                'task_number' => 3,
                'target_role' => 'team-member',
                'title' =>
                    'Create homepage UI design',
                'description' =>
                    'Prepare the homepage visual design, layout system, typography and responsive component specifications.',
                'status' => 'completed',
                'priority' => 'high',
                'assigned_to' => $memberThree->id,
                'created_by' => $managerTwo->id,
                'due_date' => now()
                    ->subDay()
                    ->toDateString(),
                'started_at' => now()
                    ->subDays(4),
                'completed_at' => now()
                    ->subDays(2),
                'estimated_hours' => 6,
            ]);

            $memberTaskSeven = Task::create([
                'project_id' => $projectTwo->id,
                'task_number' => 4,
                'target_role' => 'team-member',
                'title' =>
                    'Develop responsive homepage',
                'description' =>
                    'Implement the approved homepage design using reusable and responsive frontend components.',
                'status' => 'in_progress',
                'priority' => 'high',
                'assigned_to' => $memberOne->id,
                'created_by' => $managerTwo->id,
                'due_date' => now()
                    ->addDays(5)
                    ->toDateString(),
                'started_at' => now()
                    ->subDay(),
                'completed_at' => null,
                'estimated_hours' => 9,
            ]);

            $memberTaskEight = Task::create([
                'project_id' => $projectTwo->id,
                'task_number' => 5,
                'target_role' => 'team-member',
                'title' =>
                    'Complete mobile usability testing',
                'description' =>
                    'Test the website on mobile, tablet and desktop screen sizes and document all usability issues.',
                'status' => 'todo',
                'priority' => 'medium',
                'assigned_to' => $memberThree->id,
                'created_by' => $managerTwo->id,
                'due_date' => now()
                    ->addDays(12)
                    ->toDateString(),
                'started_at' => null,
                'completed_at' => null,
                'estimated_hours' => 5,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Task Comments
            |--------------------------------------------------------------------------
            */

            TaskComment::create([
                'task_id' => $managerTaskTwo->id,
                'user_id' => $managerOne->id,
                'comment' =>
                    'The backend and frontend teams are currently working on their assigned modules.',
            ]);

            TaskComment::create([
                'task_id' => $managerTaskTwo->id,
                'user_id' => $admin->id,
                'comment' =>
                    'Please ensure that role restrictions are tested before the final quality review.',
            ]);

            TaskComment::create([
                'task_id' => $memberTaskThree->id,
                'user_id' => $memberTwo->id,
                'comment' =>
                    'Project CRUD and member management APIs are complete and ready for review.',
            ]);

            TaskComment::create([
                'task_id' => $memberTaskThree->id,
                'user_id' => $managerOne->id,
                'comment' =>
                    'Please verify the project Trash restore and permanent delete operations.',
            ]);

            TaskComment::create([
                'task_id' => $memberTaskFour->id,
                'user_id' => $memberOne->id,
                'comment' =>
                    'The dashboard and project list are complete. I am now working on the project details page.',
            ]);

            TaskComment::create([
                'task_id' => $memberTaskSeven->id,
                'user_id' => $managerTwo->id,
                'comment' =>
                    'Please ensure the homepage matches the approved mobile design.',
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
                    'description' =>
                        'Created TeamFlow Platform project.',
                    'properties' => [
                        'project_key' =>
                            $projectOne->project_key,
                        'manager_id' =>
                            $managerOne->id,
                    ],
                ],
                [
                    'user_id' => $admin->id,
                    'project_id' => $projectOne->id,
                    'task_id' => $managerTaskTwo->id,
                    'action' => 'task.created',
                    'description' =>
                        'Assigned coordination task to Project Manager One.',
                    'properties' => [
                        'target_role' =>
                            'project-manager',
                        'assigned_to' =>
                            $managerOne->id,
                    ],
                ],
                [
                    'user_id' => $managerOne->id,
                    'project_id' => $projectOne->id,
                    'task_id' => $memberTaskFour->id,
                    'action' => 'task.created',
                    'description' =>
                        'Assigned dashboard and project page task to Frontend Developer.',
                    'properties' => [
                        'target_role' =>
                            'team-member',
                        'assigned_to' =>
                            $memberOne->id,
                    ],
                ],
                [
                    'user_id' => $memberOne->id,
                    'project_id' => $projectOne->id,
                    'task_id' => $memberTaskFour->id,
                    'action' =>
                        'task.status_updated',
                    'description' =>
                        'Changed task status from todo to in_progress.',
                    'properties' => [
                        'old_status' => 'todo',
                        'new_status' =>
                            'in_progress',
                    ],
                ],
                [
                    'user_id' => $managerTwo->id,
                    'project_id' => $projectTwo->id,
                    'task_id' => $memberTaskSeven->id,
                    'action' => 'task.created',
                    'description' =>
                        'Assigned responsive homepage development to Frontend Developer.',
                    'properties' => [
                        'target_role' =>
                            'team-member',
                        'assigned_to' =>
                            $memberOne->id,
                    ],
                ],
                [
                    'user_id' => $memberThree->id,
                    'project_id' => $projectTwo->id,
                    'task_id' => $memberTaskSix->id,
                    'action' =>
                        'task.status_updated',
                    'description' =>
                        'Changed homepage UI design task status from review to completed.',
                    'properties' => [
                        'old_status' => 'review',
                        'new_status' =>
                            'completed',
                    ],
                ],
            ];

            foreach ($activities as $activity) {
                ActivityLog::create(
                    $activity
                );
            }
        });
    }
}
