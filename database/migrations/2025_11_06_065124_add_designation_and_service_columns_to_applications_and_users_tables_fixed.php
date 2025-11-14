<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

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
                $table->foreignId('designation_id')->after('organization_id')->constrained('designations')->onDelete('cascade');
                $table->foreignId('service_id')->after('designation_id')->constrained('services')->onDelete('cascade');
            });
        }

        // --- Modifications for the 'users' table ---
        if (!Schema::hasColumn('users', 'designation_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('designation_id')->after('role_id')->constrained('designations')->onDelete('cascade');
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
        if (Schema::hasColumn('applications', 'designation_id')) {
            Schema::table('applications', function (Blueprint $table) {
                // Drop foreign keys only if they exist
                if ($this->foreignKeyExists('applications', 'applications_designation_id_foreign')) {
                    $table->dropForeign(['designation_id']);
                }
                if ($this->foreignKeyExists('applications', 'applications_service_id_foreign')) {
                    $table->dropForeign(['service_id']);
                }
                $table->dropColumn(['designation_id', 'service_id']);
            });
        }

        // --- Rollback for the 'users' table ---
        if (Schema::hasColumn('users', 'designation_id')) {
            Schema::table('users', function (Blueprint $table) {
                // Drop foreign key only if it exists
                if ($this->foreignKeyExists('users', 'users_designation_id_foreign')) {
                    $table->dropForeign(['designation_id']);
                }
                $table->dropColumn('designation_id');
            });
        }
    }

    /**
     * Check if a foreign key exists
     *
     * @param string $table
     * @param string $foreignKey
     * @return bool
     */
    private function foreignKeyExists($table, $foreignKey)
    {
        $databaseName = DB::getDatabaseName();
        $result = DB::select(
            "SELECT CONSTRAINT_NAME 
             FROM information_schema.TABLE_CONSTRAINTS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = ? 
             AND CONSTRAINT_NAME = ? 
             AND CONSTRAINT_TYPE = 'FOREIGN KEY'",
            [$databaseName, $table, $foreignKey]
        );
        
        return count($result) > 0;
    }
};
