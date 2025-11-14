<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration to make email, phone_no, whatsapp_no, and passport_no fields optional in employees table
 * 
 * Note: These fields are already nullable in the original migration (2025_08_06_100007_create_employees_table.php)
 * This migration serves as documentation of the business requirement change.
 * 
 * Changes:
 * - email: nullable (already nullable)
 * - phone_no: nullable (already nullable)
 * - whatsapp_no: nullable (already nullable)
 * - passport_no: nullable (already nullable)
 * 
 * These fields now only validate format when provided, but are not required.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Ensure fields are nullable (they already are, but explicitly defining for clarity)
            $table->string('email', 150)->nullable()->change();
            $table->string('phone_no', 12)->nullable()->change();
            $table->string('whatsapp_no', 12)->nullable()->change();
            $table->string('passport_no', 20)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Revert to required (this is hypothetical, original was already nullable)
            // Keep as nullable since reverting to required could cause data issues
            $table->string('email', 150)->nullable()->change();
            $table->string('phone_no', 12)->nullable()->change();
            $table->string('whatsapp_no', 12)->nullable()->change();
            $table->string('passport_no', 20)->nullable()->change();
        });
    }
};
