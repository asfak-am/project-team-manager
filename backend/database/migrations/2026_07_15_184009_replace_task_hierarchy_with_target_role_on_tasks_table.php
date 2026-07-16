<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'parent_task_id')) {
                $table->dropForeign(['parent_task_id']);
            }
        });

        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'task_type')) {
                $table->dropIndex([
                    'task_type',
                    'parent_task_id',
                ]);
            }

            $columns = [];

            if (Schema::hasColumn('tasks', 'task_type')) {
                $columns[] = 'task_type';
            }

            if (Schema::hasColumn('tasks', 'parent_task_id')) {
                $columns[] = 'parent_task_id';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }

            $table->enum('target_role', [
                'project-manager',
                'team-member',
            ])
                ->nullable()
                ->after('task_number')
                ->index();
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['target_role']);
            $table->dropColumn('target_role');

            $table->enum('task_type', [
                'main',
                'subtask',
            ])
                ->default('main')
                ->after('task_number');

            $table->foreignId('parent_task_id')
                ->nullable()
                ->after('task_type')
                ->constrained('tasks')
                ->nullOnDelete();

            $table->index([
                'task_type',
                'parent_task_id',
            ]);
        });
    }
};
