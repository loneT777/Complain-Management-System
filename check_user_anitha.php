<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

$user = User::where('username', 'anitha.wijayapala')->first();

if ($user) {
    echo "User found:\n";
    echo "  Username: {$user->username}\n";
    echo "  Full Name: {$user->full_name}\n";
    echo "  is_active: " . ($user->is_active ? 'YES (1)' : 'NO (0)') . "\n";
    echo "  is_approved: " . ($user->is_approved ? 'YES (1)' : 'NO (0)') . "\n";
    echo "  Role: " . ($user->role ? $user->role->name : 'No role') . "\n";
} else {
    echo "User 'anitha.wijayapala' not found\n";
}
