<?php

// Test Permission System
// Run: php test_permissions.php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Testing Permission System ===\n\n";

// Test 1: Check roles have codes
echo "1. Checking roles have codes...\n";
$roles = App\Models\Role::all();
foreach ($roles as $role) {
    echo "   - {$role->name}: " . ($role->code ?? 'NO CODE') . "\n";
}
echo "\n";

// Test 2: Check user and permissions
echo "2. Checking first user permissions...\n";
$user = App\Models\User::with('role.permissions')->first();
if ($user) {
    echo "   - User: {$user->full_name}\n";
    echo "   - Role: {$user->role->name}\n";
    echo "   - Role Code: " . ($user->role->code ?? 'NO CODE') . "\n";
    echo "   - Permissions: " . $user->role->permissions->count() . "\n";
    
    if ($user->role->permissions->count() > 0) {
        echo "   - First 5 permissions:\n";
        foreach ($user->role->permissions->take(5) as $perm) {
            echo "     * {$perm->name} ({$perm->code})\n";
        }
    }
} else {
    echo "   - No users found\n";
}
echo "\n";

// Test 3: Check permission methods
echo "3. Testing permission methods...\n";
if ($user) {
    $testPerms = ['dashboard.view', 'complaint.read', 'security.delete'];
    foreach ($testPerms as $perm) {
        $has = $user->hasPermission($perm);
        echo "   - hasPermission('{$perm}'): " . ($has ? 'YES' : 'NO') . "\n";
    }
}
echo "\n";

// Test 4: Check role-permission assignments
echo "4. Checking role-permission assignments...\n";
$rolePerms = DB::table('role_permissions')
    ->join('roles', 'role_permissions.role_id', '=', 'roles.id')
    ->select('roles.name', DB::raw('COUNT(*) as perm_count'))
    ->groupBy('roles.name', 'roles.id')
    ->get();
foreach ($rolePerms as $rp) {
    echo "   - {$rp->name}: {$rp->perm_count} permissions\n";
}
echo "\n";

echo "=== Test Complete ===\n";
