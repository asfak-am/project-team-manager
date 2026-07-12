<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $taskCount = $this->whenCounted('tasks');
        $completedCount = $this->completed_tasks_count ?? null;

        $progress = null;

        if (
            is_numeric($taskCount) &&
            is_numeric($completedCount)
        ) {
            $progress = $taskCount > 0
                ? round(($completedCount / $taskCount) * 100)
                : 0;
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'project_key' => $this->project_key,
            'description' => $this->description,
            'status' => $this->status->value,
            'priority' => $this->priority->value,
            'start_date' => $this->start_date?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'completed_at' => $this->completed_at?->toISOString(),

            'manager' => new UserResource(
                $this->whenLoaded('manager')
            ),

            'creator' => new UserResource(
                $this->whenLoaded('creator')
            ),

            'members' => UserResource::collection(
                $this->whenLoaded('members')
            ),

            'tasks_count' => $this->whenCounted('tasks'),

            'completed_tasks_count' => $this->when(
                isset($this->completed_tasks_count),
                $this->completed_tasks_count
            ),

            'progress' => $this->when(
                $progress !== null,
                $progress
            ),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
