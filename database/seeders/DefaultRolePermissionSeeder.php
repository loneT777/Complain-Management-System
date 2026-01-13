<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class DefaultRolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all roles
        $superAdmin = Role::where('code', 'super_admin')->first();
        $divisionManager = Role::where('code', 'division_manager')->first();
        $complaintManager = Role::where('code', 'complaint_manager')->first();
        $engineer = Role::where('code', 'engineer')->first();
        $normalUser = Role::where('code', 'normal_user')->first();

        // Super Admin - All 18 permissions
        if ($superAdmin) {
            $allPermissions = Permission::all();
            $superAdmin->permissions()->sync($allPermissions->pluck('id')->toArray());
        }

        // Division Manager - Security, Settings, Complaint Management (14 permissions)
        if ($divisionManager) {
            $divisionManagerPermissions = Permission::whereIn('code', [
                'security.read',
                'security.create',
                'security.update',
                'setting.read',
                'setting.create',
                'setting.update',
                'complaint.read',
                'complaint.create',
                'complaint.update',
                'complaint.assign.process',
                'complaint.assign.view',
                'log.view',
                'attachment',
                'messages',
            ])->pluck('id')->toArray();
            
            $divisionManager->permissions()->sync($divisionManagerPermissions);
        }

        // Complaint Manager - Complaint and Log Management (12 permissions)
        if ($complaintManager) {
            $complaintManagerPermissions = Permission::whereIn('code', [
                'setting.read',
                'complaint.read',
                'complaint.create',
                'complaint.update',
                'complaint.delete',
                'complaint.assign.process',
                'complaint.assign.view',
                'log.process',
                'log.view',
                'attachment',
                'messages',
            ])->pluck('id')->toArray();
            
            $complaintManager->permissions()->sync($complaintManagerPermissions);
        }

        // Engineer - Complaint Processing (7 permissions)
        if ($engineer) {
            $engineerPermissions = Permission::whereIn('code', [
                'complaint.read',
                'complaint.update',
                'complaint.assign.view',
                'log.process',
                'log.view',
                'attachment',
                'messages',
            ])->pluck('id')->toArray();
            
            $engineer->permissions()->sync($engineerPermissions);
        }

        // Normal User - Basic complaint viewing and creation (5 permissions)
        if ($normalUser) {
            $normalUserPermissions = Permission::whereIn('code', [
                'complaint.read',
                'complaint.create',
                'log.view',
                'attachment',
                'messages',
            ])->pluck('id')->toArray();
            
            $normalUser->permissions()->sync($normalUserPermissions);
        }
    }
}
