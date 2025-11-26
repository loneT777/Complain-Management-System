<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ComplaintAssignmentSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();
        
        $assignments = [
            [
                'assigner_user_id' => null,
                'assignee_user_id' => 1, // Rajitha (IT Manager)
                'assignee_division_id' => 1, // IT Division
                'last_status_id' => 2, // IN_PROGRESS
                'due_at' => $now->copy()->addDays(3)->toDateString(),
                'remark' => 'Assigned to IT team for network diagnostics',
            ],
            [
                'assigner_user_id' => null,
                'assignee_user_id' => 4, // Kasun (Finance Officer)
                'assignee_division_id' => 4, // Finance Division
                'last_status_id' => 1, // OPEN
                'due_at' => $now->copy()->addDays(2)->toDateString(),
                'remark' => 'Pending billing verification',
            ],
            [
                'assigner_user_id' => null,
                'assignee_user_id' => 3, // Dilini (CS Lead)
                'assignee_division_id' => 3, // Customer Service
                'last_status_id' => 3, // RESOLVED
                'due_at' => $now->copy()->subDays(2)->toDateString(),
                'remark' => 'Completed after staff counseling',
            ],
            [
                'assigner_user_id' => null,
                'assignee_user_id' => 3, // Dilini (CS Lead)
                'assignee_division_id' => 3, // Customer Service
                'last_status_id' => 2, // IN_PROGRESS
                'due_at' => $now->copy()->addDays(1)->toDateString(),
                'remark' => 'Installation team rescheduled',
            ],
            [
                'assigner_user_id' => null,
                'assignee_user_id' => 3, // Dilini (CS Lead)
                'assignee_division_id' => 3, // Customer Service
                'last_status_id' => 4, // CLOSED
                'due_at' => $now->copy()->subDays(1)->toDateString(),
                'remark' => 'Information provided via email',
            ],
        ];

        DB::table('complaint_assignments')->insert($assignments);
    }
}
