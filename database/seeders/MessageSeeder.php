<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MessageSeeder extends Seeder
{
    public function run()
    {
        // First create some sample persons for complainants
        $persons = [
            [
                'id' => 1,
                'title' => 'Mr.',
                'full_name' => 'John Smith',
                'nic' => '199012345678',
                'office_phone' => '0112345678',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];
        DB::table('persons')->insert($persons);

        // Then create some sample complaints
        $complaints = [
            [
                'id' => 1,
                'reference_no' => 'CMP-2025-001',
                'title' => 'Network connectivity issues in Building A',
                'description' => 'WiFi connection drops frequently in the main office area',
                'complainant_id' => 1,
                'priority_level' => 'high',
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5)
            ],
            [
                'id' => 2,
                'reference_no' => 'CMP-2025-002',
                'title' => 'Payroll discrepancy for November',
                'description' => 'Missing overtime payment in the recent payroll',
                'complainant_id' => 1,
                'priority_level' => 'medium',
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3)
            ],
            [
                'id' => 3,
                'reference_no' => 'CMP-2025-003',
                'title' => 'Office printer not working',
                'description' => 'Color printer in HR department has paper jam and not responding',
                'complainant_id' => 1,
                'priority_level' => 'low',
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2)
            ],
        ];

        DB::table('complaints')->insert($complaints);

        // Now create messages for these complaints
        $messages = [
            // Messages for Complaint 1 (Network issues)
            [
                'id' => 1,
                'parent_id' => null,
                'session_id' => null,
                'complaint_id' => 1,
                'message' => 'Complaint received. IT team has been notified and will investigate the network issues in Building A.',
                'type' => 'update',
                'created_at' => now()->subDays(5)->addHours(1)
            ],
            [
                'id' => 2,
                'parent_id' => 1,
                'session_id' => null,
                'complaint_id' => 1,
                'message' => 'Network diagnostics completed. Found issue with main router. Replacement scheduled for tomorrow.',
                'type' => 'update',
                'created_at' => now()->subDays(4)
            ],
            [
                'id' => 3,
                'parent_id' => 2,
                'session_id' => null,
                'complaint_id' => 1,
                'message' => 'Router has been replaced and network is now stable. Monitoring for 24 hours.',
                'type' => 'resolution',
                'created_at' => now()->subDays(3)
            ],

            // Messages for Complaint 2 (Payroll)
            [
                'id' => 4,
                'parent_id' => null,
                'session_id' => null,
                'complaint_id' => 2,
                'message' => 'Your payroll query has been forwarded to the Finance Department for review.',
                'type' => 'update',
                'created_at' => now()->subDays(3)->addHours(2)
            ],
            [
                'id' => 5,
                'parent_id' => 4,
                'session_id' => null,
                'complaint_id' => 2,
                'message' => 'Finance team is reviewing overtime records for November. This may take 2-3 business days.',
                'type' => 'update',
                'created_at' => now()->subDays(2)
            ],
            [
                'id' => 6,
                'parent_id' => null,
                'session_id' => null,
                'complaint_id' => 2,
                'message' => 'Internal note: Check timesheet entries against payroll system logs.',
                'type' => 'internal',
                'created_at' => now()->subDays(2)->addHours(3)
            ],
            [
                'id' => 7,
                'parent_id' => 5,
                'session_id' => null,
                'complaint_id' => 2,
                'message' => 'Overtime hours verified. Payment will be processed in the next payroll cycle with retroactive adjustment.',
                'type' => 'resolution',
                'created_at' => now()->subDays(1)
            ],

            // Messages for Complaint 3 (Printer)
            [
                'id' => 8,
                'parent_id' => null,
                'session_id' => null,
                'complaint_id' => 3,
                'message' => 'Maintenance request logged. Technician will visit HR department this afternoon.',
                'type' => 'update',
                'created_at' => now()->subDays(2)->addHours(1)
            ],
            [
                'id' => 9,
                'parent_id' => 8,
                'session_id' => null,
                'complaint_id' => 3,
                'message' => 'Paper jam cleared. Printer drum needs replacement. Ordering parts.',
                'type' => 'update',
                'created_at' => now()->subDays(1)
            ],
            [
                'id' => 10,
                'parent_id' => null,
                'session_id' => null,
                'complaint_id' => 3,
                'message' => 'Escalating to vendor for urgent parts delivery due to critical office operations.',
                'type' => 'escalation',
                'created_at' => now()->subHours(12)
            ],

            // Additional standalone messages
            [
                'id' => 11,
                'parent_id' => null,
                'session_id' => null,
                'complaint_id' => 1,
                'message' => 'Follow-up: Network has been stable for 48 hours. Case can be closed.',
                'type' => 'resolution',
                'created_at' => now()->subDays(1)
            ],
            [
                'id' => 12,
                'parent_id' => null,
                'session_id' => null,
                'complaint_id' => 2,
                'message' => 'Customer called to confirm receipt of resolution notice. Satisfied with the response.',
                'type' => 'reply',
                'created_at' => now()->subHours(6)
            ],
        ];

        DB::table('messages')->insert($messages);
    }
}
