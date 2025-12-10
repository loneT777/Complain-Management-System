<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();
        
        $rolePermissions = [
            // Super Admin - all permissions
            ['role_id' => 1, 'permission_id' => 1, 'session_id' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['role_id' => 1, 'permission_id' => 2, 'session_id' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['role_id' => 1, 'permission_id' => 3, 'session_id' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['role_id' => 1, 'permission_id' => 4, 'session_id' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['role_id' => 1, 'permission_id' => 5, 'session_id' => 1, 'created_at' => $now, 'updated_at' => $now],
            
            // Division Manager - manage and view complaints
            ['role_id' => 2, 'permission_id' => 2, 'session_id' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['role_id' => 2, 'permission_id' => 3, 'session_id' => 1, 'created_at' => $now, 'updated_at' => $now],
            
            // Complaint Handler - manage complaints
            ['role_id' => 3, 'permission_id' => 2, 'session_id' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['role_id' => 3, 'permission_id' => 3, 'session_id' => 1, 'created_at' => $now, 'updated_at' => $now],
            
            // Public User - create and view
            ['role_id' => 4, 'permission_id' => 3, 'session_id' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['role_id' => 4, 'permission_id' => 4, 'session_id' => 1, 'created_at' => $now, 'updated_at' => $now],
            
            // Viewer - view only
            ['role_id' => 5, 'permission_id' => 3, 'session_id' => 1, 'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('role_permissions')->insert($rolePermissions);
    }
}
