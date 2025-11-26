<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MessageSeeder extends Seeder
{
    public function run()
    {
        $now = now();
        
        $messages = [
            // Messages for Complaint 1 (Internet issue)
            [
                'parent_id' => null,
                'complaint_id' => 1,
                'session_id' => 1,
                'message' => 'My internet connection keeps dropping every 30 minutes. This has been happening for the past week.',
                'type' => 'initial',
                'created_at' => $now->copy()->subDays(5),
            ],
            [
                'parent_id' => 1,
                'complaint_id' => 1,
                'session_id' => 1,
                'message' => 'We have received your complaint and assigned it to our technical team for investigation.',
                'type' => 'reply',
                'created_at' => $now->copy()->subDays(4),
            ],
            [
                'parent_id' => 2,
                'complaint_id' => 1,
                'session_id' => 1,
                'message' => 'Our team has identified a signal issue in your area. We are working on a fix.',
                'type' => 'update',
                'created_at' => $now->copy()->subDays(2),
            ],
            
            // Messages for Complaint 2 (Billing)
            [
                'parent_id' => null,
                'complaint_id' => 2,
                'session_id' => 1,
                'message' => 'I was charged Rs. 7,500 instead of Rs. 5,000 for my monthly subscription.',
                'type' => 'initial',
                'created_at' => $now->copy()->subDays(3),
            ],
            [
                'parent_id' => 4,
                'complaint_id' => 2,
                'session_id' => 1,
                'message' => 'Thank you for bringing this to our attention. Our finance team will review your bill.',
                'type' => 'reply',
                'created_at' => $now->copy()->subDays(2),
            ],
        ];

        DB::table('messages')->insert($messages);
    }
}
