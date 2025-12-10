<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ComplaintSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();
        
        $complaints = [
            [
                'reference_no' => 'CMP-2025-001',
                'title' => 'Internet Connection Dropping Frequently',
                'description' => 'Customer experiencing frequent disconnections during peak hours. The issue occurs daily between 6 PM to 10 PM affecting work from home productivity.',
                'complainant_id' => 5, // Pradeep Silva
                'complainant_name' => 'Pradeep Silva',
                'complainant_phone' => '+94775678901',
                'last_status_id' => 2, // In Progress
                'complaint_requested_id' => null,
                'received_at' => $now->copy()->subDays(4),
                'user_received_id' => 3, // cs.lead
                'channel' => 'Email',
                'priority_level' => 'High',
                'confidentiality_level' => 'Public',
                'due_at' => $now->copy()->addDays(3)->toDateString(),
                'remark' => 'Assigned to technical team for investigation',
                'created_at' => $now->copy()->subDays(4),
                'updated_at' => $now->copy(),
            ],
            [
                'reference_no' => 'CMP-2025-002',
                'title' => 'Incorrect Billing Amount Charged',
                'description' => 'Customer was overcharged by Rs. 2,500 in last month bill. Expected amount was Rs. 3,200 but charged Rs. 5,700.',
                'complainant_id' => 5,
                'complainant_name' => 'Pradeep Silva',
                'complainant_phone' => '+94775678901',
                'last_status_id' => 1, // Open
                'complaint_requested_id' => null,
                'received_at' => $now->copy()->subDays(2),
                'user_received_id' => 4, // finance.officer
                'channel' => 'Phone',
                'priority_level' => 'Medium',
                'confidentiality_level' => 'Internal',
                'due_at' => $now->copy()->addDays(5)->toDateString(),
                'remark' => 'Pending verification from billing department',
                'created_at' => $now->copy()->subDays(2),
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'reference_no' => 'CMP-2025-003',
                'title' => 'Poor Customer Service Experience',
                'description' => 'Customer service representative was rude and unhelpful when inquiring about data package upgrades. Interaction ID: CS-789456.',
                'complainant_id' => 5,
                'complainant_name' => 'Pradeep Silva',
                'complainant_phone' => '+94775678901',
                'last_status_id' => 3, // Resolved
                'complaint_requested_id' => null,
                'received_at' => $now->copy()->subDays(6),
                'user_received_id' => 2, // hr.manager
                'channel' => 'Web Portal',
                'priority_level' => 'Low',
                'confidentiality_level' => 'Confidential',
                'due_at' => null,
                'remark' => 'Issue resolved after staff counseling and customer apology',
                'created_at' => $now->copy()->subDays(6),
                'updated_at' => $now->copy()->subHours(7),
            ],
            [
                'reference_no' => 'CMP-2025-004',
                'title' => 'Delayed Service Installation',
                'description' => 'Installation scheduled for last week but still not completed. Original appointment was on November 16, 2025. Technician never showed up.',
                'complainant_id' => 5,
                'complainant_name' => 'Pradeep Silva',
                'complainant_phone' => '+94775678901',
                'last_status_id' => 2, // In Progress
                'complaint_requested_id' => null,
                'received_at' => $now->copy()->subDays(9),
                'user_received_id' => 3, // cs.lead
                'channel' => 'Walk-in',
                'priority_level' => 'High',
                'confidentiality_level' => 'Public',
                'due_at' => $now->copy()->addDays(1)->toDateString(),
                'remark' => 'Rescheduled for tomorrow morning 10 AM',
                'created_at' => $now->copy()->subDays(9),
                'updated_at' => $now->copy()->subDays(2),
            ],
            [
                'reference_no' => 'CMP-2025-005',
                'title' => 'Request for Account Information',
                'description' => 'General inquiry about account details including current plan, data usage, and payment history for the last 3 months.',
                'complainant_id' => 5,
                'complainant_name' => 'Pradeep Silva',
                'complainant_phone' => '+94775678901',
                'last_status_id' => 4, // Closed
                'complaint_requested_id' => null,
                'received_at' => $now->copy()->subDays(1),
                'user_received_id' => 3, // cs.lead
                'channel' => 'Email',
                'priority_level' => 'Low',
                'confidentiality_level' => 'Internal',
                'due_at' => null,
                'remark' => 'All requested information sent via email',
                'created_at' => $now->copy()->subDays(1),
                'updated_at' => $now->copy(),
            ],
        ];

        DB::table('complaints')->insert($complaints);
    }
}
