<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

// Update all messages to have user_id = 1 (admin)
$updated = DB::table('messages')->update(['user_id' => 1]);

echo "Updated {$updated} messages with user_id = 1\n";

// Check the result
$total = DB::table('messages')->count();
$withUser = DB::table('messages')->whereNotNull('user_id')->count();

echo "Total messages: {$total}\n";
echo "Messages with user_id: {$withUser}\n";
