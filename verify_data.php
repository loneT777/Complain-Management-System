<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Database Seeding Verification ===\n\n";

$tables = [
    'sessions' => 'Sessions',
    'roles' => 'Roles',
    'permissions' => 'Permissions',
    'divisions' => 'Divisions',
    'persons' => 'Persons',
    'users' => 'Users',
    'categories' => 'Categories',
    'status' => 'Statuses',
    'complaints' => 'Complaints',
    'complaint_categories' => 'Complaint Categories',
    'complaint_assignments' => 'Complaint Assignments',
    'complaint_statuses' => 'Complaint Statuses',
    'complaint_logs' => 'Complaint Logs',
    'messages' => 'Messages',
    'attachments' => 'Attachments',
];

foreach ($tables as $table => $name) {
    $count = DB::table($table)->count();
    echo sprintf("%-25s: %d records\n", $name, $count);
}

echo "\n=== Sample Data ===\n\n";

echo "Divisions:\n";
$divisions = DB::table('divisions')->select('id', 'name', 'location')->get();
foreach ($divisions as $div) {
    echo "  - {$div->name} ({$div->location})\n";
}

echo "\nComplaints:\n";
$complaints = DB::table('complaints')->select('reference_no', 'title', 'priority_level')->get();
foreach ($complaints as $complaint) {
    echo "  - {$complaint->reference_no}: {$complaint->title} [{$complaint->priority_level}]\n";
}

echo "\nCategories:\n";
$categories = DB::table('categories')->select('id', 'category_name')->get();
foreach ($categories as $category) {
    echo "  - {$category->category_name}\n";
}

echo "\n=== Verification Complete ===\n";
