<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration to make organization coordinator fields optional.
 * 
 * This migration makes the coordinator_name and coordinator_phone_number fields nullable
 * to allow organizations to be created without complete coordinator information.
 * The coordinator_email field was already nullable in the original migration.
 * 
 * Business Requirement: Sometimes coordinator information is not available at the time
 * of organization creation, so these fields should be optional.
 */
class MakeOrganizationCoordinatorFieldsOptional extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('organizations', function (Blueprint $table) {
            // Make coordinator_name nullable
            $table->string('coordinator_name', 100)->nullable()->change();
            
            // Make coordinator_phone_number nullable
            $table->string('coordinator_phone_number', 12)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('organizations', function (Blueprint $table) {
            // Keep fields nullable in down() to avoid data loss
            // Reverting to NOT NULL could cause issues with existing records
            $table->string('coordinator_name', 100)->nullable()->change();
            $table->string('coordinator_phone_number', 12)->nullable()->change();
        });
    }
}
