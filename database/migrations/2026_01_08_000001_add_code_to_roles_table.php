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
        Schema::table('roles', function (Blueprint $table) {
            $table->string('code')->nullable()->after('name');
        });

        // Update existing roles with codes
        DB::table('roles')->where('name', 'Super Admin')->update(['code' => 'super_admin']);
        DB::table('roles')->where('name', 'Admin')->update(['code' => 'admin']);
        DB::table('roles')->where('name', 'Engineer')->update(['code' => 'engineer']);
        DB::table('roles')->where('name', 'User')->update(['code' => 'user']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('code');
        });
    }
};
