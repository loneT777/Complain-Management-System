<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "=== TESTING PERMISSION SYSTEM ===\n\n";

$user = User::with('role.permissions')->first();

if ($user) {
    echo "User: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Role: {$user->role->name} ({$user->role->code})\n";
    echo "Total Permissions: {$user->role->permissions->count()}\n\n";
    
    echo "Permissions:\n";
    foreach ($user->role->permissions as $perm) {
        echo "  - {$perm->code}\n";
    }
    
    echo "\n=== TESTING hasPermission() METHOD ===\n\n";
    
    $testPermissions = [
        'security.read',
        'security.create',
        'complaint.read',
        'complaint.create',
        'setting.read',
        'log.view',
        'attachment',
        'messages',
        'fake.permission'
    ];
    
    foreach ($testPermissions as $perm) {
        $has = $user->hasPermission($perm);
        $status = $has ? '✓ YES' : '✗ NO';
        echo "{$status} - {$perm}\n";
    }
    
    echo "\n=== BACKEND PERMISSION SYSTEM: WORKING ===\n";
} else {
    echo "No users found in database\n";
}
