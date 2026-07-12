<?php

namespace App\Http\Requests;

use App\Enums\Priority;
use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('project_key')) {
            $this->merge([
                'project_key' => strtoupper(
                    trim($this->project_key)
                ),
            ]);
        }
    }

    public function rules(): array
    {
        $project = $this->route('project');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],

            'project_key' => [
                'sometimes',
                'required',
                'string',
                'min:2',
                'max:10',
                'alpha_num:ascii',
                Rule::unique('projects', 'project_key')
                    ->ignore($project?->id),
            ],

            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'manager_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:users,id',
            ],

            'status' => [
                'sometimes',
                Rule::enum(ProjectStatus::class),
            ],

            'priority' => [
                'sometimes',
                Rule::enum(Priority::class),
            ],

            'start_date' => [
                'nullable',
                'date',
            ],

            'due_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],
        ];
    }
}
