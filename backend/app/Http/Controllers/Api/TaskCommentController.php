<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskCommentRequest;
use App\Http\Resources\TaskCommentResource;
use App\Models\ActivityLog;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class TaskCommentController extends Controller
{
    public function index(Task $task)
    {
        Gate::authorize('view', $task);

        $comments = $task->comments()
            ->with('user.roles')
            ->oldest()
            ->paginate(20);

        return TaskCommentResource::collection($comments);
    }

    public function store(
        StoreTaskCommentRequest $request,
        Task $task
    ): JsonResponse {
        Gate::authorize('comment', $task);

        $comment = DB::transaction(function () use (
            $request,
            $task
        ) {
            $comment = $task->comments()->create([
                'user_id' => $request->user()->id,
                'comment' => $request->validated('comment'),
            ]);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'project_id' => $task->project_id,
                'task_id' => $task->id,
                'action' => 'task.comment_created',
                'description' => 'Added a comment to the task.',
                'properties' => [
                    'comment_id' => $comment->id,
                ],
            ]);

            return $comment;
        });

        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully.',
            'data' => new TaskCommentResource(
                $comment->load('user.roles')
            ),
        ], 201);
    }

    public function destroy(
        Request $request,
        Task $task,
        TaskComment $comment
    ): JsonResponse {
        Gate::authorize('view', $task);

        if ($comment->task_id !== $task->id) {
            abort(404);
        }

        $canDelete = $request->user()->hasRole('administrator')
            || $comment->user_id === $request->user()->id
            || (
                $request->user()->can('comments.delete')
                && $task->project->manager_id ===
                    $request->user()->id
            );

        abort_unless($canDelete, 403);

        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully.',
        ]);
    }
}
