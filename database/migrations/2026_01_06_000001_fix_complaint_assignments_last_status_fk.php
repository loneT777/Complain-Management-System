<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('complaint_assignments', function (Blueprint $table) {
            // In some environments this FK was created against complaint_statuses (history table).
            // The application uses Status IDs, so point last_status_id to the status lookup table.
            try {
                $table->dropForeign(['last_status_id']);
            } catch (\Throwable $e) {
                // Ignore if FK does not exist or name differs.
            }

            // Ensure the column exists before adding FK
            if (Schema::hasColumn('complaint_assignments', 'last_status_id')) {
                $table
                    ->foreign('last_status_id')
                    ->references('id')
                    ->on('status')
                    ->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaint_assignments', function (Blueprint $table) {
            try {
                $table->dropForeign(['last_status_id']);
            } catch (\Throwable $e) {
                // Ignore
            }

            if (Schema::hasColumn('complaint_assignments', 'last_status_id')) {
                $table
                    ->foreign('last_status_id')
                    ->references('id')
                    ->on('complaint_statuses')
                    ->nullOnDelete();
            }
        });
    }
};
