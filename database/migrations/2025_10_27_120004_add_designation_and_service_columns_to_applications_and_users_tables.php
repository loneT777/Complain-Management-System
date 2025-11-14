<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // --- Modifications for the 'applications' table ---
        // Check if the columns don't already exist before adding them.
        if (!Schema::hasColumn('applications', 'designation_id')) {
            Schema::table('applications', function (Blueprint $table) {
                $table->foreignId('designation_id')->after('organization_id')->constrained('designation')->onDelete('cascade');
                $table->foreignId('service_id')->after('designation_id')->constrained('service')->onDelete('cascade');
            });
        }

        // --- Modifications for the 'users' table ---
        if (!Schema::hasColumn('users', 'designation_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('designation_id')->after('role_id')->constrained('designation')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // --- Rollback for the 'applications' table ---
        // Check if the columns exist before trying to drop them.
        if (Schema::hasColumn('applications', 'designation_id')) {
            Schema::table('applications', function (Blueprint $table) {
                $table->dropForeign(['designation_id']);
                $table->dropForeign(['service_id']);
                $table->dropColumn(['designation_id', 'service_id']);
            });
        }

        // --- Rollback for the 'users' table ---
        if (Schema::hasColumn('users', 'designation_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['designation_id']);
                $table->dropColumn('designation_id');
            });
        }
    }
};