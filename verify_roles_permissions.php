<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Permission;
use App\Models\Role;

echo "=== DATABASE VERIFICATION ===\n\n";

echo "Total Permissions: " . Permission::count() . "\n";
echo "Total Roles: " . Role::count() . "\n\n";

echo "=== ROLES AND THEIR PERMISSIONS ===\n\n";
$roles = Role::with('permissions')->get();
foreach ($roles as $role) {
    echo "Role: {$role->name} ({$role->code})\n";
    echo "Permissions ({$role->permissions->count()}):\n";
    foreach ($role->permissions as $permission) {
        echo "  - {$permission->code}\n";
    }
    echo "\n";
}

echo "=== ALL PERMISSIONS ===\n\n";
$permissions = Permission::orderBy('module')->orderBy('code')->get();
foreach ($permissions as $permission) {
    echo "{$permission->code} - {$permission->name} [{$permission->module}]\n";
}

