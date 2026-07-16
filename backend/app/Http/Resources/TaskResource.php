<?php

namespace App\Http\Resources;

use App\Enums\TaskStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isCompleted = $this->status === TaskStatus::Completed;

        return [
            'id' => $this->id,

            'reference' => $this->whenLoaded(
                'project',
                fn () => "{$this->project->project_key}-{$this->task_number}"
            ),

            'task_number' => $this->task_number,
            'target_role' => $this->target_role,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status->value,
            'priority' => $this->priority->value,
            'due_date' => $this->due_date?->toDateString(),
            'started_at' => $this->started_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'estimated_hours' => $this->estimated_hours,

            'is_overdue' => $this->due_date !== null
                && $this->due_date->isPast()
                && ! $isCompleted,

            'project' => new ProjectResource(
                $this->whenLoaded('project')
            ),

            'assignee' => new UserResource(
                $this->whenLoaded('assignee')
            ),

            'creator' => new UserResource(
                $this->whenLoaded('creator')
            ),

            'comments_count' => $this->whenCounted('comments'),

            'comments' => TaskCommentResource::collection(
                $this->whenLoaded('comments')
            ),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
