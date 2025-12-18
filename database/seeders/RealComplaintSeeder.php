<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Complaint;
use App\Models\Attachment;
use App\Models\User;
use Illuminate\Support\Str;

class RealComplaintSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get first user or create one
        $user = User::first();
        if (!$user) {
            $this->command->error('No users found. Please create a user first.');
            return;
        }

        // Get or create a person for complainant
        $person = \App\Models\Person::first();
        if (!$person) {
            $this->command->error('No persons found. Creating a sample person...');
            $person = \App\Models\Person::create([
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john.doe@example.com',
                'phone' => '1234567890',
            ]);
        }

        // Create a realistic complaint
        $complaint = Complaint::create([
            'reference_no' => 'CMP-2025-' . strtoupper(Str::random(4)),
            'title' => 'Office AC Not Working - IT Department',
            'description' => 'The air conditioning unit in IT Department (3rd Floor) has stopped working since yesterday morning. Temperature is getting too high for computer equipment. Request urgent maintenance.',
            'complainant_id' => $person->id,
            'last_status_id' => 1,
            'channel' => 'Email',
            'priority_level' => 'High',
            'received_at' => now(),
            'user_received_id' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info("Created complaint: {$complaint->reference_no}");

        // Create sample file content
        $attachmentsDir = storage_path('app/public/attachments');
        if (!file_exists($attachmentsDir)) {
            mkdir($attachmentsDir, 0755, true);
        }

        // Create dummy files with actual content
        $files = [
            [
                'original_name' => 'AC_Unit_Photo.jpg',
                'content' => base64_decode('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AH//Z'),
                'extension' => 'jpg',
                'description' => 'Photo of the malfunctioning AC unit'
            ],
            [
                'original_name' => 'Maintenance_Request_Form.pdf',
                'content' => '%PDF-1.4 Sample maintenance request form',
                'extension' => 'pdf',
                'description' => 'Filled maintenance request form'
            ],
            [
                'original_name' => 'Temperature_Log.xlsx',
                'content' => 'Temperature readings for the past week',
                'extension' => 'xlsx',
                'description' => 'Temperature monitoring log showing rising temps'
            ]
        ];

        foreach ($files as $index => $fileData) {
            $fileName = time() . '_' . $index . '_' . Str::slug(pathinfo($fileData['original_name'], PATHINFO_FILENAME)) . '.' . $fileData['extension'];
            $filePath = $attachmentsDir . '/' . $fileName;
            
            // Write file content
            file_put_contents($filePath, $fileData['content']);

            // Create attachment record
            Attachment::create([
                'complaint_id' => $complaint->id,
                'file_name' => $fileData['original_name'],
                'file_path' => 'attachments/' . $fileName,
                'extension' => $fileData['extension'],
                'description' => $fileData['description'],
                'user_id' => $user->id,
                'uploaded_at' => now(),
            ]);

            $this->command->info("Created attachment: {$fileData['original_name']}");
        }

        $this->command->info('Real complaint with attachments created successfully!');
        $this->command->info("Complaint ID: {$complaint->id}");
        $this->command->info("Reference: {$complaint->reference_no}");
        $this->command->info("Total Attachments: " . count($files));
    }
}
