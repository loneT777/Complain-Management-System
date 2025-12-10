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
                'file_path' => 'attachments/network_screenshot.png',
                'description' => 'Screenshot showing network connectivity issues and error messages',
                'uploaded_at' => $now->copy()->subDays(5),
                'extension' => 'png',
            ],
            [
                'complaint_id' => 2,
                'complaint_log_id' => null,
                'user_id' => 5,
                'file_name' => 'bill_november.pdf',
                'file_path' => 'attachments/bill_november.pdf',
                'description' => 'November billing statement showing incorrect charges',
                'uploaded_at' => $now->copy()->subDays(3),
                'extension' => 'pdf',
            ],
            [
                'complaint_id' => 3,
                'complaint_log_id' => null,
                'user_id' => 5,
                'file_name' => 'staff_interaction.jpg',
                'file_path' => 'attachments/staff_interaction.jpg',
                'description' => 'Photo documentation of staff interaction at service center',
                'uploaded_at' => $now->copy()->subDays(7),
                'extension' => 'jpg',
            ],
            [
                'complaint_id' => 4,
                'complaint_log_id' => null,
                'user_id' => 5,
                'file_name' => 'installation_receipt.pdf',
                'file_path' => 'attachments/installation_receipt.pdf',
                'description' => 'Original installation receipt and service agreement',
                'uploaded_at' => $now->copy()->subDays(10),
                'extension' => 'pdf',
            ],
            [
                'complaint_id' => 5,
                'complaint_log_id' => null,
                'user_id' => 5,
                'file_name' => 'account_details.docx',
                'file_path' => 'attachments/account_details.docx',
                'description' => 'Complete account information and verification documents',
                'uploaded_at' => $now->copy()->subDays(2),
                'extension' => 'docx',
            ],
        ];

        DB::table('attachments')->insert($attachments);
    }
}
