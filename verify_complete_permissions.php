<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$roles = DB::table('roles')->orderBy('id')->get();

echo "\n=== ROLE PERMISSIONS SUMMARY ===\n\n";

foreach ($roles as $role) {
    $permissions = DB::table('role_permissions as rp')
        ->join('permissions as p', 'rp.permission_id', '=', 'p.id')
        ->where('rp.role_id', $role->id)
        ->orderBy('p.code')
        ->pluck('p.code')
        ->toArray();
    
    echo "{$role->name} ({$role->code}): " . count($permissions) . " permissions\n";
    echo "  - " . implode("\n  - ", $permissions) . "\n\n";
}
