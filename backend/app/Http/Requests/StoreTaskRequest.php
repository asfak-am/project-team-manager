<?php

namespace App\Http\Requests;

use App\Enums\Priority;
use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'title' => [
                'required',
                'string',
                'max:200',
            ],

            'description' => [
                'nullable',
                'string',
                'max:10000',
            ],

            'status' => [
                'sometimes',
                Rule::enum(TaskStatus::class),
            ],

            'priority' => [
                'required',
                Rule::enum(Priority::class),
            ],

            'assigned_to' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'due_date' => [
                'nullable',
                'date',
            ],

            'estimated_hours' => [
                'nullable',
                'numeric',
                'min:0',
                'max:9999.99',
            ],

        ];
    }
}
