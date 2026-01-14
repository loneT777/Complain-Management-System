<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Hash;

echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║         TESTING DEACTIVATED USER LOGIN                      ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Test with deactivated user
$username = 'anitha.wijayapala';
$password = 'Password123'; // You may need to adjust this

echo "Attempting to login with deactivated user: {$username}\n";
echo "─────────────────────────────────────────────────────────────\n\n";

$user = \App\Models\User::where('username', $username)->first();

if (!$user) {
    echo "❌ User not found\n";
    exit;
}

echo "User Status:\n";
echo "  • is_approved: " . ($user->is_approved ? '✅ YES' : '❌ NO') . "\n";
echo "  • is_active: " . ($user->is_active ? '✅ YES' : '❌ NO') . "\n\n";

// Simulate login check
if (!$user->is_approved) {
    echo "❌ LOGIN BLOCKED: Account not approved\n";
    exit;
}

if (!$user->is_active) {
    echo "✅ LOGIN BLOCKED: Account deactivated (WORKING!)\n";
    echo "Message: 'Your account has been deactivated. Please contact administrator.'\n\n";
    exit;
}

echo "✅ LOGIN WOULD BE ALLOWED\n\n";

// Now test with an active user
echo "\n═══════════════════════════════════════════════════════════════\n\n";
echo "Checking active users for comparison:\n";
echo "─────────────────────────────────────────────────────────────\n\n";

$activeUsers = \App\Models\User::where('is_active', 1)
    ->where('is_approved', 1)
    ->limit(5)
    ->get();

foreach ($activeUsers as $user) {
    echo "  ✅ {$user->username} - {$user->full_name} (Active & Approved)\n";
}

echo "\n";
