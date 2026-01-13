<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompleteRolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, update the existing 18 permissions to have proper codes
        $permissionUpdates = [
            // ID 1-4: Security permissions (already correct)
            // ID 5-8: Setting permissions (update to proper module codes)
            5 => ['code' => 'category.read', 'name' => 'Category Read'],
            6 => ['code' => 'category.create', 'name' => 'Category Create'],
            7 => ['code' => 'category.update', 'name' => 'Category Update'],
            8 => ['code' => 'category.delete', 'name' => 'Category Delete'],
            // ID 9-16: Complaint and Log permissions (already correct)
            // ID 17: Attachment (update to proper codes)
            17 => ['code' => 'attachment.read', 'name' => 'Attachment Read'],
            // ID 18: Messages (update to proper code)
            18 => ['code' => 'message.read', 'name' => 'Message Read'],
        ];

        foreach ($permissionUpdates as $id => $data) {
            DB::table('permissions')->where('id', $id)->update($data);
            $this->command->info("Updated permission ID {$id}: {$data['code']}");
        }

        // Clear existing role_permissions first
        DB::table('role_permissions')->truncate();
        $this->command->info('Cleared existing role permissions');

        // Delete duplicate permissions (IDs 19+)
        $deletedCount = DB::table('permissions')->where('id', '>', 18)->delete();
        if ($deletedCount > 0) {
            $this->command->info("Deleted {$deletedCount} duplicate permissions");
        }

        // Get all permissions (should now be IDs 1-18)
        $permissions = DB::table('permissions')->orderBy('id')->get()->keyBy('code');
        
        // Define role permissions mapping using only IDs 1-18
        // ID 1-4: security.read/create/update/delete
        // ID 5-8: category.read/create/update/delete (was setting.*)
        // ID 9-12: complaint.read/create/update/delete
        // ID 13-14: complaint.assign.process/view
        // ID 15-16: log.process/view
        // ID 17: attachment.read
        // ID 18: message.read
        
        $rolePermissions = [
            'super_admin' => 'all', // Super admin gets all 18 permissions
            
            'division_manager' => [
                'security.read',
                'category.read', 'category.create', 'category.update',
                'complaint.read', 'complaint.create', 'complaint.update', 'complaint.delete',
                'complaint.assign.process', 'complaint.assign.view',
                'log.process', 'log.view',
                'attachment.read',
                'message.read',
            ],
            
            'complaint_manager' => [
                'category.read',
                'complaint.read', 'complaint.create', 'complaint.update',
                'complaint.assign.process', 'complaint.assign.view',
                'log.process', 'log.view',
                'attachment.read',
                'message.read',
            ],
            
            'engineer' => [
                'category.read',
                'complaint.read', 'complaint.update',
                'complaint.assign.view',
                'log.view',
                'attachment.read',
                'message.read',
            ],
            
            'normal_user' => [
                'category.read',
                'complaint.read', 'complaint.create',
                'attachment.read',
                'message.read',
            ],
        ];

        // Assign permissions to roles
        $roles = DB::table('roles')->get()->keyBy('code');
        
        foreach ($rolePermissions as $roleCode => $perms) {
            if (!isset($roles[$roleCode])) {
                continue;
            }
            
            $role = $roles[$roleCode];
            $roleId = $role->id;
            
            if ($perms === 'all') {
                // Super admin gets all permissions
                foreach ($permissions as $permission) {
                    DB::table('role_permissions')->insert([
                        'role_id' => $roleId,
                        'permission_id' => $permission->id,
                    ]);
                }
                $this->command->info("Assigned ALL permissions to role: {$role->name}");
            } else {
                // Assign specific permissions
                foreach ($perms as $permCode) {
                    if (isset($permissions[$permCode])) {
                        DB::table('role_permissions')->insert([
                            'role_id' => $roleId,
                            'permission_id' => $permissions[$permCode]->id,
                        ]);
                    }
                }
                $this->command->info("Assigned " . count($perms) . " permissions to role: {$role->name}");
            }
        }

        $this->command->info('✅ All role permissions have been configured successfully!');
    }
}
