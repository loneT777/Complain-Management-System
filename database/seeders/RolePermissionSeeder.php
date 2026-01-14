<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolePermissionSeeder extends Seeder
{
    /**
     * Seed the role_permissions table with proper permission assignments
     */
    public function run(): void
    {
        // Clear existing role permissions
        DB::table('role_permissions')->truncate();
        $this->command->info('Cleared existing role permissions');

        // Get all roles by code
        $roles = DB::table('roles')->get()->keyBy('code');
        
        // Get all permissions by code
        $permissions = DB::table('permissions')->get()->keyBy('code');

        if ($roles->isEmpty() || $permissions->isEmpty()) {
            $this->command->error('Roles or permissions not found. Please run RoleSeeder and PermissionSeeder first.');
            return;
        }

        // Define permission assignments for each role
        $rolePermissions = [
            'super_admin' => [
                // Super admin gets ALL permissions (18 total)
                'security.read', 'security.create', 'security.update', 'security.delete',
                'category.read', 'category.create', 'category.update', 'category.delete',
                'complaint.read', 'complaint.create', 'complaint.update', 'complaint.delete',
                'complaint.assign.process', 'complaint.assign.view',
                'log.process', 'log.view',
                'attachment', 'messages',
            ],
            
            'division_manager' => [
                // Division managers can manage their division's complaints and categories
                'security.read',
                'category.read', 'category.create', 'category.update',
                'complaint.read', 'complaint.create', 'complaint.update', 'complaint.delete',
                'complaint.assign.process', 'complaint.assign.view',
                'log.process', 'log.view',
                'attachment', 'messages',
            ],
            
            'complaint_manager' => [
                // Complaint managers handle complaint processing and assignment
                'category.read',
                'complaint.read', 'complaint.create', 'complaint.update',
                'complaint.assign.process', 'complaint.assign.view',
                'log.process', 'log.view',
                'attachment', 'messages',
            ],
            
            'engineer' => [
                // Engineers work on assigned complaints
                'category.read',
                'complaint.read', 'complaint.update',
                'complaint.assign.view',
                'log.view',
                'attachment', 'messages',
            ],
            
            'normal_user' => [
                // Normal users can create and view their own complaints
                'category.read',
                'complaint.read', 'complaint.create',
                'attachment', 'messages',
            ],
        ];

        // Assign permissions to roles
        $totalAssigned = 0;
        
        foreach ($rolePermissions as $roleCode => $permissionCodes) {
            if (!isset($roles[$roleCode])) {
                $this->command->warn("Role not found: {$roleCode}");
                continue;
            }
            
            $roleId = $roles[$roleCode]->id;
            $assigned = 0;
            
            foreach ($permissionCodes as $permCode) {
                if (isset($permissions[$permCode])) {
                    DB::table('role_permissions')->insert([
                        'role_id' => $roleId,
                        'permission_id' => $permissions[$permCode]->id,
                    ]);
                    $assigned++;
                    $totalAssigned++;
                } else {
                    $this->command->warn("Permission not found: {$permCode}");
                }
            }
            
            $this->command->info("✓ Assigned {$assigned} permissions to: {$roles[$roleCode]->name}");
        }

        $this->command->info("✅ Successfully assigned {$totalAssigned} total role-permission relationships!");
    }
}
