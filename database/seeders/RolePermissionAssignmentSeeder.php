<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all roles by name
        $superAdmin = Role::where('name', 'Super Admin')->first();
        $divisionManager = Role::where('name', 'Division Manager')->first();
        $complaintHandler = Role::where('name', 'Complaint Handler')->first();
        $publicUser = Role::where('name', 'Public User')->first();
        $viewer = Role::where('name', 'Viewer')->first();

        // Super Admin - Gets ALL 18 permissions
        if ($superAdmin) {
            $allPermissions = Permission::pluck('id')->toArray();
            $superAdmin->permissions()->sync($allPermissions);
            $this->command->info("Super Admin assigned " . count($allPermissions) . " permissions (all)");
        }

        // Division Manager - Can manage complaints and settings in their division
        if ($divisionManager) {
            $divisionPermissions = Permission::whereIn('code', [
                // Security - Read only
                'security.read',
                
                // Settings - Full CRUD
                'setting.read',
                'setting.create',
                'setting.update',
                'setting.delete',
                
                // Complaints - Full CRUD
                'complaint.read',
                'complaint.create',
                'complaint.update',
                'complaint.delete',
                'complaint.assign.process',
                'complaint.assign.view',
                
                // Log
                'log.process',
                'log.view',
                
                // Attachment & Messages
                'attachment.manage',
                'message.manage',
            ])->pluck('id')->toArray();
            
            $divisionManager->permissions()->sync($divisionPermissions);
            $this->command->info("Division Manager assigned " . count($divisionPermissions) . " permissions");
        }

        // Complaint Handler - Can process complaints
        if ($complaintHandler) {
            $handlerPermissions = Permission::whereIn('code', [
                // Complaints - Create, Read, Update
                'complaint.read',
                'complaint.create',
                'complaint.update',
                'complaint.assign.process',
                'complaint.assign.view',
                
                // Log
                'log.process',
                'log.view',
                
                // Attachment & Messages
                'attachment.manage',
                'message.manage',
            ])->pluck('id')->toArray();
            
            $complaintHandler->permissions()->sync($handlerPermissions);
            $this->command->info("Complaint Handler assigned " . count($handlerPermissions) . " permissions");
        }

        // Viewer - Read-only access
        if ($viewer) {
            $viewerPermissions = Permission::whereIn('code', [
                // Security - Read only
                'security.read',
                
                // Settings - Read only
                'setting.read',
                
                // Complaints - View only
                'complaint.read',
                'complaint.assign.view',
                
                // Log - View only
                'log.view',
                
                // Attachment & Messages
                'attachment.manage',
                'message.manage',
            ])->pluck('id')->toArray();
            
            $viewer->permissions()->sync($viewerPermissions);
            $this->command->info("Viewer assigned " . count($viewerPermissions) . " permissions");
        }

        // Public User - Can create and view their own complaints
        if ($publicUser) {
            $userPermissions = Permission::whereIn('code', [
                // Complaints - Create and Read own
                'complaint.read',
                'complaint.create',
                
                // View assignments and logs
                'complaint.assign.view',
                'log.view',
                
                // Attachment & Messages for own complaints
                'attachment.manage',
                'message.manage',
            ])->pluck('id')->toArray();
            
            $publicUser->permissions()->sync($userPermissions);
            $this->command->info("Public User assigned " . count($userPermissions) . " permissions");
        }

        $this->command->info("Role permissions assigned successfully!");
    }
}
