<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Role;
use App\Models\Permission;

echo "\n╔══════════════════════════════════════════════════════════════════════════════╗\n";
echo "║                        ROLE PERMISSION MATRIX                                ║\n";
echo "╚══════════════════════════════════════════════════════════════════════════════╝\n\n";

$roles = Role::with('permissions')->get();
$allPerms = Permission::orderBy('module')->orderBy('code')->get();

// Header
echo str_pad('Permission', 35) . ' | ';
foreach ($roles as $role) {
    echo str_pad(substr($role->name, 0, 11), 12) . '| ';
}
echo "\n" . str_repeat('─', 120) . "\n";

// Permissions by module
$currentModule = null;
foreach ($allPerms as $perm) {
    // Print module header
    if ($currentModule !== $perm->module) {
        $currentModule = $perm->module;
        echo "\n" . str_pad("» {$currentModule} Module", 35) . " |\n";
        echo str_repeat('─', 120) . "\n";
    }
    
    // Print permission row
    echo str_pad("  " . $perm->code, 35) . ' | ';
    foreach ($roles as $role) {
        $has = $role->permissions->contains('id', $perm->id);
        echo str_pad($has ? '    ✓' : '     ', 12) . '| ';
    }
    echo "\n";
}

echo "\n" . str_repeat('═', 120) . "\n";
echo "Legend: ✓ = Has Permission\n\n";

// Summary
echo "Summary:\n";
foreach ($roles as $role) {
    $count = $role->permissions->count();
    echo "  • {$role->name}: {$count} permissions\n";
}
echo "\n";
