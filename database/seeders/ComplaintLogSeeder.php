<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ComplaintLogSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();
        
        $logs = [
            [
                'complaint_id' => 1,
                'complaint_assignment_id' => 1,
                'status_id' => 2, // IN_PROGRESS
                'assignee_id' => 1, // Rajitha (IT Manager)
                'action' => 'Assignment',
                'remark' => 'Initial assignment to IT team for investigation',
                'created_at' => $now->copy()->subDays(4),
                'updated_at' => $now->copy()->subDays(4),
            ],
            [
                'complaint_id' => 1,
                'complaint_assignment_id' => 1,
                'status_id' => 2,
                'assignee_id' => 1,
                'action' => 'Update',
                'remark' => 'Technical team identified signal issue in customer area',
                'created_at' => $now->copy()->subDays(2),
                'updated_at' => $now->copy()->subDays(2),
            ],
            [
                'complaint_id' => 2,
                'complaint_assignment_id' => 2,
                'status_id' => 1, // OPEN
                'assignee_id' => 4, // Kasun (Finance Officer)
                'action' => 'Assignment',
                'remark' => 'Assigned to finance team for billing review',
                'created_at' => $now->copy()->subDays(3),
                'updated_at' => $now->copy()->subDays(3),
            ],
            [
                'complaint_id' => 3,
                'complaint_assignment_id' => 3,
                'status_id' => 3, // RESOLVED
                'assignee_id' => 3, // Dilini (CS Lead)
                'action' => 'Resolution',
                'remark' => 'Customer service review completed. Issue resolved with apology and compensation',
                'created_at' => $now->copy()->subHours(12),
                'updated_at' => $now->copy()->subHours(12),
            ],
            [
                'complaint_id' => 4,
                'complaint_assignment_id' => 4,
                'status_id' => 2, // IN_PROGRESS
                'assignee_id' => 3,
                'action' => 'Update',
                'remark' => 'Installation team contacted. Rescheduling for this week',
                'created_at' => $now->copy()->subDays(3),
                'updated_at' => $now->copy()->subDays(3),
            ],
        ];

        DB::table('complaint_logs')->insert($logs);
    }
}
