<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Complaint;
use App\Models\Category;
use App\Models\Status;
use App\Models\Person;

class ComplaintSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create a sample complainant
        $complainant = Person::firstOrCreate(
            ['nic' => '12345678901'],
            [
                'title' => 'Mr',
                'full_name' => 'John Doe',
                'code' => 'P001',
                'office_phone' => '0712345678',
                'whatsapp' => '0712345678',
                'address' => '123 Main Street, City',
                'type' => 'Complainant',
                'designation' => 'Resident'
            ]
        );

        // Get first category
        $category = Category::first();
        
        // Get first status
        $status = Status::first();

        // Create dummy complaints
        Complaint::create([
            'reference_no' => 'CMP-001-2025',
            'title' => 'Water Supply Issue',
            'description' => 'Water supply has been interrupted for the past 3 days in the area. Customers are facing severe hardship.',
            'complainant_id' => $complainant->id,
            'last_status_id' => $status?->id,
            'channel' => 'Phone',
            'priority_level' => 'High',
            'confidentiality_level' => 'Public'
        ]);

        Complaint::create([
            'reference_no' => 'CMP-002-2025',
            'title' => 'Road Damage',
            'description' => 'Main road has large potholes making it difficult for vehicles to pass. Immediate repair needed.',
            'complainant_id' => $complainant->id,
            'last_status_id' => $status?->id,
            'channel' => 'Email',
            'priority_level' => 'Medium',
            'confidentiality_level' => 'Public'
        ]);

        Complaint::create([
            'reference_no' => 'CMP-003-2025',
            'title' => 'Noise Pollution',
            'description' => 'Construction work is ongoing near residential area causing excessive noise disturbance at odd hours.',
            'complainant_id' => $complainant->id,
            'last_status_id' => $status?->id,
            'channel' => 'Walk-in',
            'priority_level' => 'Low',
            'confidentiality_level' => 'Public'
        ]);

        Complaint::create([
            'reference_no' => 'CMP-004-2025',
            'title' => 'Garbage Collection',
            'description' => 'Garbage is not being collected regularly from residential streets. It is creating unhygienic conditions.',
            'complainant_id' => $complainant->id,
            'last_status_id' => $status?->id,
            'channel' => 'Phone',
            'priority_level' => 'High',
            'confidentiality_level' => 'Public'
        ]);

        Complaint::create([
            'reference_no' => 'CMP-005-2025',
            'title' => 'Street Light Malfunction',
            'description' => 'Multiple street lights in the area are not functioning, making the streets unsafe at night.',
            'complainant_id' => $complainant->id,
            'last_status_id' => $status?->id,
            'channel' => 'Email',
            'priority_level' => 'High',
            'confidentiality_level' => 'Public'
        ]);
    }
}
