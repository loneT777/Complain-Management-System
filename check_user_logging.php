<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║           USER ACTION LOGGING STATUS CHECK                 ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Check admin_logs table
echo "📊 ADMIN LOGS TABLE\n";
echo "───────────────────────────────────────────────────────────\n";
$adminLogsCount = DB::table('admin_logs')->count();
echo "Total records: {$adminLogsCount}\n";

if ($adminLogsCount > 0) {
    $recentLogs = DB::table('admin_logs')
        ->join('sessions', 'admin_logs.session_id', '=', 'sessions.id')
        ->select('admin_logs.*', 'sessions.username')
        ->orderBy('admin_logs.created_at', 'desc')
        ->limit(5)
        ->get();
    
    echo "\nRecent logs:\n";
    foreach ($recentLogs as $log) {
        echo "  - [{$log->created_at}] {$log->username}: " . substr($log->log, 0, 60) . "...\n";
    }
} else {
    echo "⚠️  No logs found\n";
}

// Check login_sessions table
echo "\n\n📊 LOGIN SESSIONS TABLE\n";
echo "───────────────────────────────────────────────────────────\n";
$loginSessionsCount = DB::table('login_sessions')->count();
echo "Total records: {$loginSessionsCount}\n";

if ($loginSessionsCount > 0) {
    $recentSessions = DB::table('login_sessions')
        ->join('users', 'login_sessions.user_id', '=', 'users.id')
        ->select('login_sessions.*', 'users.username')
        ->orderBy('login_sessions.login_time', 'desc')
        ->limit(5)
        ->get();
    
    echo "\nRecent login sessions:\n";
    foreach ($recentSessions as $session) {
        $status = $session->logout_time ? 'Logged out' : 'Active';
        echo "  - [{$session->login_time}] {$session->username} - {$status}\n";
    }
} else {
    echo "⚠️  No login sessions found\n";
}

// Check complaint_logs table
echo "\n\n📊 COMPLAINT LOGS TABLE\n";
echo "───────────────────────────────────────────────────────────\n";
$complaintLogsCount = DB::table('complaint_logs')->count();
echo "Total records: {$complaintLogsCount}\n";

if ($complaintLogsCount > 0) {
    $recentComplaintLogs = DB::table('complaint_logs')
        ->join('users', 'complaint_logs.user_id', '=', 'users.id')
        ->join('complaints', 'complaint_logs.complaint_id', '=', 'complaints.id')
        ->select('complaint_logs.*', 'users.username', 'complaints.reference_no')
        ->orderBy('complaint_logs.created_at', 'desc')
        ->limit(5)
        ->get();
    
    echo "\nRecent complaint logs:\n";
    foreach ($recentComplaintLogs as $log) {
        echo "  - [{$log->created_at}] {$log->username} - {$log->reference_no}: " . substr($log->log_details, 0, 50) . "\n";
    }
} else {
    echo "⚠️  No complaint logs found\n";
}

// Check if AdminLog model exists
echo "\n\n🔍 MODELS CHECK\n";
echo "───────────────────────────────────────────────────────────\n";
$adminLogModel = file_exists(__DIR__ . '/app/Models/AdminLog.php');
$loginSessionModel = file_exists(__DIR__ . '/app/Models/LoginSession.php');
$complaintLogModel = file_exists(__DIR__ . '/app/Models/ComplaintLog.php');

echo "AdminLog Model: " . ($adminLogModel ? "✓ EXISTS" : "✗ MISSING") . "\n";
echo "LoginSession Model: " . ($loginSessionModel ? "✓ EXISTS" : "✗ MISSING") . "\n";
echo "ComplaintLog Model: " . ($complaintLogModel ? "✓ EXISTS" : "✗ MISSING") . "\n";

// Summary
echo "\n\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║                        SUMMARY                             ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

$loggingStatus = "⚠️  PARTIALLY IMPLEMENTED";
if ($adminLogsCount > 0 || $loginSessionsCount > 0 || $complaintLogsCount > 0) {
    $loggingStatus = "✓ WORKING (with data)";
} else if ($adminLogModel || $loginSessionModel || $complaintLogModel) {
    $loggingStatus = "⚠️  CONFIGURED (no data yet)";
} else {
    $loggingStatus = "✗ NOT IMPLEMENTED";
}

echo "Status: {$loggingStatus}\n\n";

echo "Tables:\n";
echo "  • admin_logs: {$adminLogsCount} records\n";
echo "  • login_sessions: {$loginSessionsCount} records\n";
echo "  • complaint_logs: {$complaintLogsCount} records\n\n";
