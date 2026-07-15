<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProjectMemberController;
use App\Http\Controllers\Api\TaskCommentController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| Public authentication route
|--------------------------------------------------------------------------
*/

Route::post('/login', [
    AuthController::class,
    'login',
]);

/*
|--------------------------------------------------------------------------
| Authenticated routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::prefix('profile')->group(function () {
    Route::get('/', [
        ProfileController::class,
        'show',
    ]);

    Route::put('/', [
        ProfileController::class,
        'update',
    ]);

    Route::put('/password', [
        ProfileController::class,
        'updatePassword',
    ]);
});

    Route::get('/user', [
        AuthController::class,
        'user',
    ]);

    Route::post('/logout', [
        AuthController::class,
        'logout',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', DashboardController::class);

    /*
    |--------------------------------------------------------------------------
    | User management
    |--------------------------------------------------------------------------
    */

    Route::get('/users', [
        UserController::class,
        'index',
    ])->middleware('permission:users.view');

    Route::post('/users', [
        UserController::class,
        'store',
    ])->middleware('permission:users.create');

    Route::get('/users/{user}', [
        UserController::class,
        'show',
    ])->middleware('permission:users.view');

    Route::put('/users/{user}', [
        UserController::class,
        'update',
    ])->middleware('permission:users.update');

    Route::patch('/users/{user}/role', [
        UserController::class,
        'updateRole',
    ])->middleware('permission:users.assign-role');

    Route::patch('/users/{user}/status', [
        UserController::class,
        'updateStatus',
    ])->middleware('permission:users.update');

    Route::delete('/users/{user}', [
        UserController::class,
        'destroy',
    ])->middleware('permission:users.delete');

    /*
    |--------------------------------------------------------------------------
    | Projects
    |--------------------------------------------------------------------------
    */

    Route::get('/projects', [
        ProjectController::class,
        'index',
    ]);

    Route::post('/projects', [
        ProjectController::class,
        'store',
    ])->middleware('permission:projects.create');

    Route::get('/projects/{project}', [
        ProjectController::class,
        'show',
    ]);

    Route::put('/projects/{project}', [
        ProjectController::class,
        'update',
    ])->middleware('permission:projects.update');

    Route::delete('/projects/{project}', [
        ProjectController::class,
        'destroy',
    ])->middleware('permission:projects.delete');

    /*
|--------------------------------------------------------------------------
| Project Trash
|--------------------------------------------------------------------------
*/

    Route::get('/trashed-projects', [
        ProjectController::class,
        'trashed',
    ])->middleware('permission:projects.restore');

    Route::patch('/trashed-projects/{project}/restore', [
        ProjectController::class,
        'restore',
    ])
        ->middleware('permission:projects.restore')
        ->withTrashed();

    Route::delete('/trashed-projects/{project}/force', [
        ProjectController::class,
        'forceDelete',
    ])
        ->middleware('permission:projects.force-delete')
        ->withTrashed();

    /*
    |--------------------------------------------------------------------------
    | Project members
    |--------------------------------------------------------------------------
    */

    Route::get('/projects/{project}/members', [
        ProjectMemberController::class,
        'index',
    ]);

    Route::post('/projects/{project}/members', [
        ProjectMemberController::class,
        'store',
    ])->middleware('permission:projects.manage-members');

    Route::delete(
        '/projects/{project}/members/{user}',
        [
            ProjectMemberController::class,
            'destroy',
        ]
    )->middleware('permission:projects.manage-members');

    /*
    |--------------------------------------------------------------------------
    | Tasks
    |--------------------------------------------------------------------------
    |
    | Keep /my-tasks before /tasks/{task}; otherwise Laravel could
    | interpret "my-tasks" as a task route parameter in a conflicting
    | route design.
    |
    */

    Route::get('/my-tasks', [
        TaskController::class,
        'myTasks',
    ])->middleware('permission:tasks.view-assigned');

    Route::get('/tasks', [
        TaskController::class,
        'index',
    ]);

    Route::post('/projects/{project}/tasks', [
        TaskController::class,
        'store',
    ])->middleware('permission:tasks.create');

    Route::get('/tasks/{task}', [
        TaskController::class,
        'show',
    ]);

    Route::put('/tasks/{task}', [
        TaskController::class,
        'update',
    ])->middleware('permission:tasks.update');

    Route::patch('/tasks/{task}/status', [
        TaskController::class,
        'updateStatus',
    ])->middleware('permission:tasks.update-status');

    Route::patch('/tasks/{task}/assignee', [
        TaskController::class,
        'assign',
    ])->middleware('permission:tasks.assign');

    Route::delete('/tasks/{task}', [
        TaskController::class,
        'destroy',
    ])->middleware('permission:tasks.delete');

    /*
    |--------------------------------------------------------------------------
    | Task comments
    |--------------------------------------------------------------------------
    */

    Route::get('/tasks/{task}/comments', [
        TaskCommentController::class,
        'index',
    ]);

    Route::post('/tasks/{task}/comments', [
        TaskCommentController::class,
        'store',
    ])->middleware('permission:comments.create');

    Route::delete(
        '/tasks/{task}/comments/{comment}',
        [
            TaskCommentController::class,
            'destroy',
        ]
    )->middleware('permission:comments.delete');
});
