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
        Schema::table('role_permissions', function (Blueprint $table) {
            // Drop existing foreign keys if they exist
            if (Schema::hasColumn('role_permissions', 'role_id')) {
                $foreignKeys = $this->listTableForeignKeys('role_permissions');
                if (in_array('role_permissions_role_id_foreign', $foreignKeys)) {
                    $table->dropForeign('role_permissions_role_id_foreign');
                }
            }
            
            if (Schema::hasColumn('role_permissions', 'permission_id')) {
                $foreignKeys = $this->listTableForeignKeys('role_permissions');
                if (in_array('role_permissions_permission_id_foreign', $foreignKeys)) {
                    $table->dropForeign('role_permissions_permission_id_foreign');
                }
            }
            
            // Add foreign keys with cascade delete
            $table->foreign('role_id')
                ->references('id')
                ->on('roles')
                ->onDelete('cascade');
                
            $table->foreign('permission_id')
                ->references('id')
                ->on('permissions')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('role_permissions', function (Blueprint $table) {
            // Drop the new foreign keys
            if (Schema::hasColumn('role_permissions', 'role_id')) {
                $foreignKeys = $this->listTableForeignKeys('role_permissions');
                if (in_array('role_permissions_role_id_foreign', $foreignKeys)) {
                    $table->dropForeign('role_permissions_role_id_foreign');
                }
            }
            
            if (Schema::hasColumn('role_permissions', 'permission_id')) {
                $foreignKeys = $this->listTableForeignKeys('role_permissions');
                if (in_array('role_permissions_permission_id_foreign', $foreignKeys)) {
                    $table->dropForeign('role_permissions_permission_id_foreign');
                }
            }
            
            // Recreate original foreign keys without cascade
            $table->foreign('role_id')
                ->references('id')
                ->on('roles');
                
            $table->foreign('permission_id')
                ->references('id')
                ->on('permissions');
        });
    }
    
    /**
     * Get the list of foreign keys for a table
     */
    protected function listTableForeignKeys($table)
    {
        $conn = Schema::getConnection()->getDoctrineSchemaManager();
        return array_map(function($key) {
            return $key->getName();
        }, $conn->listTableForeignKeys($table));
    }
};