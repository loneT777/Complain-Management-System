<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Exactly 18 permissions as specified
        $permissions = [
            // Security Module (4 permissions)
            ['name' => 'Security Read', 'code' => 'security.read', 'module' => 'Security', 'description' => 'View security settings'],
            ['name' => 'Security Create', 'code' => 'security.create', 'module' => 'Security', 'description' => 'Create security settings'],
            ['name' => 'Security Update', 'code' => 'security.update', 'module' => 'Security', 'description' => 'Update security settings'],
            ['name' => 'Security Delete', 'code' => 'security.delete', 'module' => 'Security', 'description' => 'Delete security settings'],

            // Category Module (4 permissions)
            ['name' => 'Category Read', 'code' => 'category.read', 'module' => 'Category', 'description' => 'View categories'],
            ['name' => 'Category Create', 'code' => 'category.create', 'module' => 'Category', 'description' => 'Create categories'],
            ['name' => 'Category Update', 'code' => 'category.update', 'module' => 'Category', 'description' => 'Update categories'],
            ['name' => 'Category Delete', 'code' => 'category.delete', 'module' => 'Category', 'description' => 'Delete categories'],

            // Complaint Module (6 permissions)
            ['name' => 'Complaint Read', 'code' => 'complaint.read', 'module' => 'Complaint', 'description' => 'View complaints'],
            ['name' => 'Complaint Create', 'code' => 'complaint.create', 'module' => 'Complaint', 'description' => 'Create new complaints'],
            ['name' => 'Complaint Update', 'code' => 'complaint.update', 'module' => 'Complaint', 'description' => 'Update complaint details'],
            ['name' => 'Complaint Delete', 'code' => 'complaint.delete', 'module' => 'Complaint', 'description' => 'Delete complaints'],
            ['name' => 'Complaint Assign Process', 'code' => 'complaint.assign.process', 'module' => 'Complaint', 'description' => 'Process complaint assignments'],
            ['name' => 'Complaint Assign View', 'code' => 'complaint.assign.view', 'module' => 'Complaint', 'description' => 'View complaint assignments'],

            // Log Module (2 permissions)
            ['name' => 'Log Process', 'code' => 'log.process', 'module' => 'Log', 'description' => 'Process complaint logs'],
            ['name' => 'Log View', 'code' => 'log.view', 'module' => 'Log', 'description' => 'View complaint logs'],

            // Attachment (1 permission)
            ['name' => 'Attachment', 'code' => 'attachment', 'module' => 'Attachment', 'description' => 'Access attachments'],

            // Messages (1 permission)
            ['name' => 'Messages', 'code' => 'messages', 'module' => 'Message', 'description' => 'Access messages'],
        ];

        // Get permission codes to keep
        $permissionCodes = collect($permissions)->pluck('code')->toArray();
        
        // Delete role_permission relationships for permissions that will be deleted
        $permissionsToDelete = Permission::whereNotIn('code', $permissionCodes)->pluck('id')->toArray();
        if (!empty($permissionsToDelete)) {
            \DB::table('role_permissions')->whereIn('permission_id', $permissionsToDelete)->delete();
        }
        
        // Delete permissions not in the list
        Permission::whereNotIn('code', $permissionCodes)->delete();

        // Create or update the 18 permissions
        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['code' => $permission['code']],
                $permission
            );
        }
    }
}

