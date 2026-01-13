<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

// Find user by username (email)
$email = 'jayakodythevindu@gmail.com';
$user = User::where('username', $email)->first();

if ($user) {
    $user->is_approved = true;
    $user->save();
    
    echo "✓ User account activated successfully!\n";
    echo "Username: {$user->username}\n";
    echo "Full Name: {$user->full_name}\n";
    echo "Is Approved: " . ($user->is_approved ? 'Yes' : 'No') . "\n";
} else {
    echo "✗ User not found with username: {$email}\n";
    echo "Searching all users...\n";
    
    $users = User::all();
    foreach ($users as $u) {
        echo "- ID: {$u->id}, Username: {$u->username}, Active: " . ($u->is_active ? 'Yes' : 'No') . "\n";
    }
}
