<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'code' => 'super_admin',
                'description' => 'Full system access with all permissions',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Division Manager',
                'code' => 'division_manager',
                'description' => 'Manages division complaints and assignments',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Complaint Manager',
                'code' => 'complaint_manager',
                'description' => 'Manages all complaints and categories',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Engineer',
                'code' => 'engineer',
                'description' => 'Handles complaint processing and resolution',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Normal User',
                'code' => 'normal_user',
                'description' => 'Basic user access for creating and viewing own complaints',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Get role codes to keep
        $roleCodesToKeep = ['super_admin', 'division_manager', 'complaint_manager', 'engineer', 'normal_user'];
        
        // First, create/update the new roles
        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['code' => $role['code']],
                $role
            );
        }
        
        // Get IDs of roles to delete and roles to keep
        $rolesToDelete = DB::table('roles')->whereNotIn('code', $roleCodesToKeep)->pluck('id')->toArray();
        $normalUserRole = DB::table('roles')->where('code', 'normal_user')->first();
        
        if (!empty($rolesToDelete) && $normalUserRole) {
            // Update users with old roles to normal_user role
            DB::table('users')->whereIn('role_id', $rolesToDelete)->update(['role_id' => $normalUserRole->id]);
            
            // Delete role_permission relationships for roles that will be deleted
            DB::table('role_permissions')->whereIn('role_id', $rolesToDelete)->delete();
            
            // Delete old roles
            DB::table('roles')->whereIn('id', $rolesToDelete)->delete();
        }
    }
}
