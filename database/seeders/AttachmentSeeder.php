<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttachmentSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();
        
        $attachments = [
            [
                'complaint_id' => 1,
                'complaint_log_id' => null,
                'user_id' => 5, // Pradeep Silva
                'file_name' => 'network_screenshot.png',
                'uploaded_at' => $now->copy()->subDays(5),
                'extension' => 'png',
            ],
            [
                'complaint_id' => 2,
                'complaint_log_id' => null,
                'user_id' => 5,
                'file_name' => 'bill_november.pdf',
                'uploaded_at' => $now->copy()->subDays(3),
                'extension' => 'pdf',
            ],
            [
                'complaint_id' => 3,
                'complaint_log_id' => null,
                'user_id' => 5,
                'file_name' => 'staff_interaction.jpg',
                'uploaded_at' => $now->copy()->subDays(7),
                'extension' => 'jpg',
            ],
            [
                'complaint_id' => 4,
                'complaint_log_id' => null,
                'user_id' => 5,
                'file_name' => 'installation_receipt.pdf',
                'uploaded_at' => $now->copy()->subDays(10),
                'extension' => 'pdf',
            ],
            [
                'complaint_id' => 5,
                'complaint_log_id' => null,
                'user_id' => 5,
                'file_name' => 'account_details.docx',
                'uploaded_at' => $now->copy()->subDays(2),
                'extension' => 'docx',
            ],
        ];

        DB::table('attachments')->insert($attachments);
    }
}
