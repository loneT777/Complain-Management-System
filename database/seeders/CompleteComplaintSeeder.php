<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Complaint;
use App\Models\Attachment;
use App\Models\Message;
use App\Models\ComplaintLog;
use App\Models\ComplaintAssignment;
use App\Models\Category;
use App\Models\User;
use App\Models\Person;
use App\Models\Division;
use App\Models\Status;
use Illuminate\Support\Str;

class CompleteComplaintSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('Creating comprehensive complaint data...');

        // Get or create required entities
        $user = User::first();
        if (!$user) {
            $this->command->error('No users found. Please create a user first.');
            return;
        }

        $person = Person::first();
        if (!$person) {
            $person = Person::create([
                'full_name' => 'Sarah Johnson',
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'nic' => '199512345678',
                'office_phone' => '+94771234567',
            ]);
        }

        $division = Division::first();
        if (!$division) {
            $division = Division::create([
                'name' => 'IT Support',
                'code' => 'IT-SUP',
                'description' => 'Information Technology Support Division',
                'session_id' => 1,
            ]);
        }

        // Status is already created by StatusSeeder, so just get it
        $status = Status::where('code', 'pending')->first();

        $category = Category::first();
        if (!$category) {
            $category = Category::create([
                'code' => 'HW-001',
                'category_name' => 'Hardware Issues',
                'description' => 'Problems related to computer hardware',
            ]);
        }

        // Create main complaint
        $complaint = Complaint::create([
            'reference_no' => 'CMP-2025-' . strtoupper(Str::random(4)),
            'title' => 'Laptop Screen Flickering and Overheating',
            'description' => 'My laptop screen has been flickering intermittently for the past week, especially when running multiple applications. Additionally, the device gets extremely hot even with minimal usage. This is affecting my productivity as I cannot work continuously for more than 30 minutes. I have tried restarting and updating drivers but the issue persists.',
            'complainant_id' => $person->id,
            'last_status_id' => $status->id,
            'channel' => 'Email',
            'priority_level' => 'High',
            'confidentiality_level' => 'Internal',
            'received_at' => now()->subDays(3),
            'user_received_id' => $user->id,
            'due_at' => now()->addDays(4),
            'complainant_name' => $person->first_name . ' ' . $person->last_name,
            'complainant_phone' => $person->office_phone,
            'remark' => 'Urgent - affecting daily work',
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subHours(2),
        ]);

        $this->command->info("Created complaint: {$complaint->reference_no}");

        // Attach categories
        $complaint->categories()->attach($category->id);

        // Create attachments
        $attachmentsDir = storage_path('app/public/attachments');
        if (!file_exists($attachmentsDir)) {
            mkdir($attachmentsDir, 0755, true);
        }

        $attachments = [
            [
                'original_name' => 'Laptop_Screen_Issue.jpg',
                'content' => base64_decode('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AH//Z'),
                'extension' => 'jpg',
                'description' => 'Photo showing screen flickering issue'
            ],
            [
                'original_name' => 'System_Diagnostics_Report.pdf',
                'content' => '%PDF-1.4 System Diagnostics Report - CPU: 95°C, GPU: 88°C',
                'extension' => 'pdf',
                'description' => 'System diagnostics showing temperature readings'
            ],
            [
                'original_name' => 'Hardware_Warranty.pdf',
                'content' => '%PDF-1.4 Warranty Document - Valid until Dec 2026',
                'extension' => 'pdf',
                'description' => 'Warranty documentation for reference'
            ]
        ];

        foreach ($attachments as $index => $fileData) {
            $fileName = time() . '_' . $index . '_' . Str::slug(pathinfo($fileData['original_name'], PATHINFO_FILENAME)) . '.' . $fileData['extension'];
            $filePath = $attachmentsDir . '/' . $fileName;
            file_put_contents($filePath, $fileData['content']);

            Attachment::create([
                'complaint_id' => $complaint->id,
                'file_name' => $fileData['original_name'],
                'extension' => $fileData['extension'],
                'user_id' => $user->id,
                'uploaded_at' => now()->subDays(3),
            ]);
        }

        $this->command->info("Created " . count($attachments) . " attachments");

        // Create messages/communication logs
        $messages = [
            [
                'content' => 'Thank you for reporting this issue. We have received your complaint and assigned it to our technical team. They will investigate and get back to you within 2 business days.',
                'sent_at' => now()->subDays(3)->addHours(1),
                'sender_type' => 'support',
            ],
            [
                'content' => 'I have checked the diagnostics report. The CPU temperature is abnormally high. Is the laptop placed on a flat surface with proper ventilation?',
                'sent_at' => now()->subDays(2),
                'sender_type' => 'support',
            ],
            [
                'content' => 'Yes, I keep it on a desk with nothing blocking the vents. The fan is running constantly and very loudly.',
                'sent_at' => now()->subDays(2)->addHours(3),
                'sender_type' => 'user',
            ],
            [
                'content' => 'Based on the symptoms, this appears to be a hardware issue. We will schedule an on-site inspection tomorrow morning at 10 AM. Please confirm if this time works for you.',
                'sent_at' => now()->subDays(1),
                'sender_type' => 'support',
            ],
            [
                'content' => 'That works perfectly. I will be available. Thank you for the quick response!',
                'sent_at' => now()->subDays(1)->addHours(2),
                'sender_type' => 'user',
            ],
        ];

        foreach ($messages as $msgData) {
            Message::create([
                'complaint_id' => $complaint->id,
                'message' => $msgData['content'],
                'type' => $msgData['sender_type'],
                'created_at' => $msgData['sent_at'],
            ]);
        }

        $this->command->info("Created " . count($messages) . " messages");

        $this->command->info("\n=== Comprehensive Complaint Created Successfully! ===");
        $this->command->info("Complaint ID: {$complaint->id}");
        $this->command->info("Reference: {$complaint->reference_no}");
        $this->command->info("Complainant: {$person->first_name} {$person->last_name}");
        $this->command->info("Status: {$status->name}");
        $this->command->info("Priority: {$complaint->priority_level}");
        $this->command->info("Category: {$category->name}");
        $this->command->info("Attachments: " . count($attachments));
        $this->command->info("Messages: " . count($messages));
        $this->command->info("\nYou can now view complaint {$complaint->reference_no} in the complaint detail page!");
    }
}
