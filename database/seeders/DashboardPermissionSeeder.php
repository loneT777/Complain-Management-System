<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DashboardPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if dashboard.view permission already exists
        $dashboardPermission = DB::table('permissions')
            ->where('code', 'dashboard.view')
            ->first();

        // Create dashboard permission if it doesn't exist
        if (!$dashboardPermission) {
            DB::table('permissions')->insert([
                'name' => 'Dashboard View',
                'code' => 'dashboard.view',
                'module' => 'dashboard',
                'description' => 'View dashboard statistics'
            ]);
            
            $dashboardPermission = DB::table('permissions')
                ->where('code', 'dashboard.view')
                ->first();
        }

        // Get all roles
        $roles = DB::table('roles')->get();

        foreach ($roles as $role) {
            // Check if permission is already assigned
            $exists = DB::table('role_permissions')
                ->where('role_id', $role->id)
                ->where('permission_id', $dashboardPermission->id)
                ->exists();

            // Assign dashboard.view to all roles if not already assigned
            if (!$exists) {
                DB::table('role_permissions')->insert([
                    'role_id' => $role->id,
                    'permission_id' => $dashboardPermission->id
                ]);
            }
        }

        $this->command->info('Dashboard permission created and assigned to all roles.');
    }
}
