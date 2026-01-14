<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "\n╔════════════════════════════════════════════════════════════════════╗\n";
echo "║         USER ACTION TRACKING - DETAILED ANALYSIS               ║\n";
echo "╚════════════════════════════════════════════════════════════════════╝\n\n";

echo "═══════════════════════════════════════════════════════════════════\n";
echo "1. LOGIN/LOGOUT TRACKING\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

echo "✅ STATUS: IMPLEMENTED & WORKING\n\n";

echo "What's tracked:\n";
echo "  • User login time\n";
echo "  • User logout time\n";
echo "  • Session duration\n";
echo "  • Active/inactive sessions\n\n";

$loginSessions = DB::table('login_sessions')
    ->join('users', 'login_sessions.user_id', '=', 'users.id')
    ->select('login_sessions.*', 'users.username', 'users.full_name')
    ->orderBy('login_sessions.login_time', 'desc')
    ->limit(10)
    ->get();

echo "Recent Login Activity (" . $loginSessions->count() . " records):\n";
echo "─────────────────────────────────────────────────────────────────\n";

if ($loginSessions->isEmpty()) {
    echo "  ⚠️  No login sessions recorded yet\n";
} else {
    foreach ($loginSessions as $session) {
        $status = $session->logout_time ? '🔴 Logged out' : '🟢 Active';
        $duration = $session->logout_time ?
            \Carbon\Carbon::parse($session->logout_time)->diffInMinutes($session->login_time) . ' min' :
            'Current session';
        echo "  • {$session->username} ({$session->full_name})\n";
        echo "    Login: {$session->login_time}\n";
        echo "    Status: {$status}\n";
        echo "    Duration: {$duration}\n\n";
    }
}

echo "\n═══════════════════════════════════════════════════════════════════\n";
echo "2. COMPLAINT ACTIONS TRACKING\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

echo "✅ STATUS: IMPLEMENTED (Partial)\n\n";

echo "What's tracked:\n";
echo "  • Complaint status changes\n";
echo "  • Complaint assignments\n";
echo "  • User actions on complaints\n";
echo "  • Remarks and notes\n\n";

$complaintLogs = DB::table('complaint_logs')
    ->join('complaints', 'complaint_logs.complaint_id', '=', 'complaints.id')
    ->leftJoin('persons', 'complaint_logs.assignee_id', '=', 'persons.id')
    ->leftJoin('status', 'complaint_logs.status_id', '=', 'status.id')
    ->select(
        'complaint_logs.*', 
        'complaints.reference_no',
        'persons.name as assignee_name',
        'status.name as status_name'
    )
    ->orderBy('complaint_logs.created_at', 'desc')
    ->limit(10)
    ->get();

echo "Recent Complaint Actions (" . $complaintLogs->count() . " records):\n";
echo "─────────────────────────────────────────────────────────────────\n";

if ($complaintLogs->isEmpty()) {
    echo "  ⚠️  No complaint actions recorded yet\n";
    echo "  Note: Logs are created when:\n";
    echo "    - Complaints are assigned to engineers\n";
    echo "    - Status updates are made\n";
    echo "    - Assignments are processed\n";
} else {
    foreach ($complaintLogs as $log) {
        echo "  • [{$log->created_at}]\n";
        echo "    Complaint: {$log->reference_no}\n";
        echo "    Action: {$log->action}\n";
        if ($log->assignee_name) {
            echo "    Assignee: {$log->assignee_name}\n";
        }
        if ($log->status_name) {
            echo "    Status: {$log->status_name}\n";
        }
        if ($log->remark) {
            echo "    Remark: " . substr($log->remark, 0, 50) . "\n";
        }
        echo "\n";
    }
}

echo "\n═══════════════════════════════════════════════════════════════════\n";
echo "3. ADMIN LOGS (General Actions)\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

echo "⚠️  STATUS: NOT IMPLEMENTED\n\n";

echo "What COULD be tracked:\n";
echo "  • User creation/updates\n";
echo "  • Role changes\n";
echo "  • Permission changes\n";
echo "  • System configuration changes\n";
echo "  • Delete operations\n\n";

$adminLogs = DB::table('admin_logs')->count();
echo "Admin Logs: {$adminLogs} records\n";
echo "─────────────────────────────────────────────────────────────────\n";
echo "  ✗ Table exists but no logging code implemented\n";
echo "  ✗ No AdminLog model found\n";
echo "  ✗ Controllers not writing to this table\n\n";

echo "\n╔════════════════════════════════════════════════════════════════════╗\n";
echo "║                          SUMMARY                                   ║\n";
echo "╚════════════════════════════════════════════════════════════════════╝\n\n";

$totalLogs = DB::table('login_sessions')->count() + DB::table('complaint_logs')->count();

echo "Overall Status: " . ($totalLogs > 0 ? "✓ PARTIALLY WORKING" : "⚠️  MINIMAL LOGGING") . "\n\n";

echo "Tracking Summary:\n";
echo "┌────────────────────────────────────────┬─────────┬────────────┐\n";
echo "│ Feature                                │ Status  │ Records    │\n";
echo "├────────────────────────────────────────┼─────────┼────────────┤\n";
printf("│ %-38s │ %-7s │ %-10s │\n", "Login/Logout Sessions", "✓ WORKS", DB::table('login_sessions')->count());
printf("│ %-38s │ %-7s │ %-10s │\n", "Complaint Action Logs", "✓ WORKS", DB::table('complaint_logs')->count());
printf("│ %-38s │ %-7s │ %-10s │\n", "Admin/System Logs", "✗ NONE", DB::table('admin_logs')->count());
echo "└────────────────────────────────────────┴─────────┴────────────┘\n\n";

echo "Controllers with Logging:\n";
echo "  ✓ AuthController - Tracks login/logout\n";
echo "  ✓ ComplaintAssignmentController - Logs assignments\n";
echo "  ✓ ComplaintLogController - Logs complaint actions\n\n";

echo "Missing Logging:\n";
echo "  ✗ User CRUD operations (create/update/delete users)\n";
echo "  ✗ Role/Permission changes\n";
echo "  ✗ Category management actions\n";
echo "  ✗ Division management actions\n";
echo "  ✗ General admin actions\n\n";

echo "═══════════════════════════════════════════════════════════════════\n\n";
