<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateApplicationsTableNullableEmployeeAndAddParliamentMemberId extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            // Make employee_id nullable
            $table->unsignedBigInteger('employee_id')->nullable()->change();

            // Add nullable parliament_member_id column
            $table->unsignedBigInteger('parliament_member_id')->nullable()->after('employee_id');

            // Add foreign key constraint if needed (adjust table name if different)
            $table->foreign('parliament_member_id')->references('id')->on('parliament_members')->onDelete('set null')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            // Drop foreign key and column
            $table->dropForeign(['parliament_member_id']);
            $table->dropColumn('parliament_member_id');

            // Make employee_id not nullable again
            $table->unsignedBigInteger('employee_id')->nullable(false)->change();
        });
    }
}