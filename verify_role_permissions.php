<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Role;
use App\Models\User;

echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║           ROLE PERMISSION VERIFICATION REPORT              ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Get all roles with permissions
$roles = Role::with('permissions')->get();

foreach ($roles as $role) {
    echo "┌─ ROLE: {$role->name} ({$role->code})\n";
    echo "├─ Description: {$role->description}\n";
    echo "├─ Permission Count: " . $role->permissions->count() . "\n";
    echo "├─ Permissions:\n";
    
    if ($role->permissions->isEmpty()) {
        echo "│  └─ ⚠️  NO PERMISSIONS ASSIGNED\n";
    } else {
        $permissionsByModule = $role->permissions->groupBy('module');
        foreach ($permissionsByModule as $module => $permissions) {
            echo "│  ├─ {$module}:\n";
            foreach ($permissions as $permission) {
                echo "│  │  └─ ✓ {$permission->name} ({$permission->code})\n";
            }
        }
    }
    echo "└───────────────────────────────────────────────────────────\n\n";
}

// Test a sample user's permissions
echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║              USER PERMISSION CHECK TEST                     ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

$users = User::with('role.permissions')->limit(5)->get();

foreach ($users as $user) {
    echo "┌─ USER: {$user->username}\n";
    echo "├─ Role: " . ($user->role ? $user->role->name : 'No Role') . "\n";
    echo "├─ Permission Tests:\n";
    
    $testPermissions = [
        'security.read' => 'Can view security settings',
        'complaint.create' => 'Can create complaints',
        'complaint.update' => 'Can update complaints',
        'complaint.assign.process' => 'Can process assignments',
    ];
    
    foreach ($testPermissions as $permCode => $description) {
        $hasPermission = $user->hasPermission($permCode);
        $icon = $hasPermission ? '✅' : '❌';
        echo "│  ├─ {$icon} {$description}\n";
    }
    
    echo "│  └─ Total Permissions: " . count($user->getPermissionCodes()) . "\n";
    echo "└───────────────────────────────────────────────────────────\n\n";
}

echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║                    SUMMARY STATISTICS                       ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

$totalRoles = Role::count();
$totalPermissions = \App\Models\Permission::count();
$totalAssignments = \DB::table('role_permissions')->count();

echo "Total Roles: {$totalRoles}\n";
echo "Total Permissions: {$totalPermissions}\n";
echo "Total Role-Permission Assignments: {$totalAssignments}\n";
echo "\n✅ Permission System Verification Complete!\n\n";
