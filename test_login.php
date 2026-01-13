<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing Login Credentials...\n\n";

// Test users
$testUsers = [
    ['username' => 'admin@gmail.com', 'password' => '12345678'],
    ['username' => 'superadmin@gmail.com', 'password' => '12345678'],
    ['username' => 'hr.manager', 'password' => '12345678'],
];

foreach ($testUsers as $test) {
    echo "Testing: {$test['username']}\n";
    
    $user = App\Models\User::where('username', $test['username'])->first();
    
    if ($user) {
        echo "  ✓ User found: {$user->full_name}\n";
        echo "  ✓ Role: {$user->role->name}\n";
        echo "  ✓ Is Approved: " . ($user->is_approved ? 'Yes' : 'No') . "\n";
        
        $passwordCheck = Hash::check($test['password'], $user->password);
        echo "  ✓ Password Check: " . ($passwordCheck ? 'PASS ✓' : 'FAIL ✗') . "\n";
        
        if (!$passwordCheck) {
            echo "  ✗ Hash in DB: {$user->password}\n";
            echo "  ✗ Hash of password: " . Hash::make($test['password']) . "\n";
        }
    } else {
        echo "  ✗ User not found!\n";
    }
    echo "\n";
}

echo "Done!\n";
