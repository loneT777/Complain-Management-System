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
        $permissions = [
            // Security Module (4 permissions)
            ['name' => 'Security Read', 'code' => 'security.read', 'module' => 'Security', 'description' => 'View security settings'],
            ['name' => 'Security Create', 'code' => 'security.create', 'module' => 'Security', 'description' => 'Create security settings'],
            ['name' => 'Security Update', 'code' => 'security.update', 'module' => 'Security', 'description' => 'Update security settings'],
            ['name' => 'Security Delete', 'code' => 'security.delete', 'module' => 'Security', 'description' => 'Delete security settings'],

            // Setting Module (4 permissions)
            ['name' => 'Setting Read', 'code' => 'setting.read', 'module' => 'Setting', 'description' => 'View settings'],
            ['name' => 'Setting Create', 'code' => 'setting.create', 'module' => 'Setting', 'description' => 'Create settings'],
            ['name' => 'Setting Update', 'code' => 'setting.update', 'module' => 'Setting', 'description' => 'Update settings'],
            ['name' => 'Setting Delete', 'code' => 'setting.delete', 'module' => 'Setting', 'description' => 'Delete settings'],

            // Complaint Module (4 permissions)
            ['name' => 'Complaint Read', 'code' => 'complaint.read', 'module' => 'Complaint', 'description' => 'View complaints'],
            ['name' => 'Complaint Create', 'code' => 'complaint.create', 'module' => 'Complaint', 'description' => 'Create new complaints'],
            ['name' => 'Complaint Update', 'code' => 'complaint.update', 'module' => 'Complaint', 'description' => 'Update complaint details'],
            ['name' => 'Complaint Delete', 'code' => 'complaint.delete', 'module' => 'Complaint', 'description' => 'Delete complaints'],

            // Complaint Assignment (2 permissions)
            ['name' => 'Complaint Assign Process', 'code' => 'complaint.assign.process', 'module' => 'Complaint', 'description' => 'Process complaint assignments'],
            ['name' => 'Complaint Assign View', 'code' => 'complaint.assign.view', 'module' => 'Complaint', 'description' => 'View complaint assignments'],

            // Log (2 permissions)
            ['name' => 'Log Process', 'code' => 'log.process', 'module' => 'Log', 'description' => 'Process complaint logs'],
            ['name' => 'Log View', 'code' => 'log.view', 'module' => 'Log', 'description' => 'View complaint logs'],

            // Attachment (1 permission)
            ['name' => 'Attachment', 'code' => 'attachment.manage', 'module' => 'Attachment', 'description' => 'Manage attachments'],

            // Messages (1 permission)
            ['name' => 'Messages', 'code' => 'message.manage', 'module' => 'Message', 'description' => 'Manage messages'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['code' => $permission['code']],
                $permission
            );
        }
    }
}

