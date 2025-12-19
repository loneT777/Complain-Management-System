<?php
require 'bootstrap/app.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = \Illuminate\Http\Request::capture()
);

// Test the model directly
$assignment = \App\Models\ComplaintAssignment::with(['assigneeDivision', 'assigneeUser'])->first();
echo "Assignment data: " . json_encode($assignment, JSON_PRETTY_PRINT) . "\n";
echo "\n\nAssignment as Array: " . json_encode($assignment->toArray(), JSON_PRETTY_PRINT) . "\n";

$response->send();
