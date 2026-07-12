<?php

namespace App\Http\Controllers\Api;

use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Http\Resources\TaskResource;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        if ($user->hasRole('administrator')) {
            return $this->administratorDashboard();
        }

        if ($user->hasRole('project-manager')) {
            return $this->managerDashboard($user);
        }

        return $this->memberDashboard($user);
    }

    private function administratorDashboard(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'statistics' => [
                    'total_users' => User::count(),
                    'active_users' => User::where(
                        'status',
                        'active'
                    )->count(),

                    'active_projects' => Project::where(
                        'status',
                        'active'
                    )->count(),

                    'total_tasks' => Task::count(),

                    'completed_tasks' => Task::where(
                        'status',
                        TaskStatus::Completed->value
                    )->count(),

                    'overdue_tasks' => Task::whereDate(
                        'due_date',
                        '<',
                        today()
                    )
                        ->where(
                            'status',
                            '!=',
                            TaskStatus::Completed->value
                        )
                        ->count(),
                ],

                'recent_activity' =>
                    ActivityLogResource::collection(
                        ActivityLog::with('user.roles')
                            ->latest()
                            ->limit(10)
                            ->get()
                    ),
            ],
        ]);
    }

    private function managerDashboard(
        User $user
    ): JsonResponse {
        $projectIds = Project::where(
            'manager_id',
            $user->id
        )->pluck('id');

        return response()->json([
            'success' => true,
            'data' => [
                'statistics' => [
                    'managed_projects' => $projectIds->count(),

                    'open_tasks' => Task::whereIn(
                        'project_id',
                        $projectIds
                    )
                        ->where(
                            'status',
                            '!=',
                            TaskStatus::Completed->value
                        )
                        ->count(),

                    'completed_tasks' => Task::whereIn(
                        'project_id',
                        $projectIds
                    )
                        ->where(
                            'status',
                            TaskStatus::Completed->value
                        )
                        ->count(),

                    'overdue_tasks' => Task::whereIn(
                        'project_id',
                        $projectIds
                    )
                        ->whereDate('due_date', '<', today())
                        ->where(
                            'status',
                            '!=',
                            TaskStatus::Completed->value
                        )
                        ->count(),
                ],

                'recent_activity' =>
                    ActivityLogResource::collection(
                        ActivityLog::with('user.roles')
                            ->whereIn('project_id', $projectIds)
                            ->latest()
                            ->limit(10)
                            ->get()
                    ),
            ],
        ]);
    }

    private function memberDashboard(
        User $user
    ): JsonResponse {
        $taskQuery = Task::where(
            'assigned_to',
            $user->id
        );

        return response()->json([
            'success' => true,
            'data' => [
                'statistics' => [
                    'assigned_tasks' => (clone $taskQuery)->count(),

                    'in_progress_tasks' =>
                        (clone $taskQuery)
                            ->where(
                                'status',
                                TaskStatus::InProgress->value
                            )
                            ->count(),

                    'completed_tasks' =>
                        (clone $taskQuery)
                            ->where(
                                'status',
                                TaskStatus::Completed->value
                            )
                            ->count(),

                    'overdue_tasks' =>
                        (clone $taskQuery)
                            ->whereDate(
                                'due_date',
                                '<',
                                today()
                            )
                            ->where(
                                'status',
                                '!=',
                                TaskStatus::Completed->value
                            )
                            ->count(),
                ],

                'upcoming_tasks' =>
                    TaskResource::collection(
                        Task::where('assigned_to', $user->id)
                            ->where(
                                'status',
                                '!=',
                                TaskStatus::Completed->value
                            )
                            ->whereNotNull('due_date')
                            ->with([
                                'project.manager',
                                'assignee.roles',
                                'creator.roles',
                            ])
                            ->withCount('comments')
                            ->orderBy('due_date')
                            ->limit(5)
                            ->get()
                    ),
            ],
        ]);
    }
}
