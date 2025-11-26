<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ComplaintStatusSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();
        
        $complaintStatuses = [
            ['complaint_id' => 1, 'status_id' => 2, 'remark' => 'Technician assigned to investigate connection issue', 'created_at' => $now->copy()->subDays(4)],
            ['complaint_id' => 2, 'status_id' => 1, 'remark' => 'Awaiting billing department verification', 'created_at' => $now->copy()->subDays(3)],
            ['complaint_id' => 3, 'status_id' => 3, 'remark' => 'Customer satisfied with resolution', 'created_at' => $now->copy()->subHours(12)],
            ['complaint_id' => 4, 'status_id' => 2, 'remark' => 'Installation rescheduled for tomorrow', 'created_at' => $now->copy()->subDays(3)],
            ['complaint_id' => 5, 'status_id' => 4, 'remark' => 'Account information sent successfully', 'created_at' => $now->copy()->subDays(1)],
        ];

        DB::table('complaint_statuses')->insert($complaintStatuses);
    }
}
