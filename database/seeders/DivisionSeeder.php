<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Division;

class DivisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Division::firstOrCreate(
            ['code' => 'DIV-001'],
            [
                'name' => 'IT Department',
                'location' => 'Building A, 3rd Floor',
                'officer_in_charge' => 'John Doe',
                'contact_no' => '0771234567',
                'is_approved' => true,
                'parent_id' => null
            ]
        );

        Division::firstOrCreate(
            ['code' => 'DIV-002'],
            [
                'name' => 'HR Department',
                'location' => 'Building B, 2nd Floor',
                'officer_in_charge' => 'Jane Smith',
                'contact_no' => '0772345678',
                'is_approved' => true,
                'parent_id' => null
            ]
        );

        Division::firstOrCreate(
            ['code' => 'DIV-003'],
            [
                'name' => 'Finance Department',
                'location' => 'Building C, 1st Floor',
                'officer_in_charge' => 'Mike Johnson',
                'contact_no' => '0773456789',
                'is_approved' => true,
                'parent_id' => null
            ]
        );

        Division::firstOrCreate(
            ['code' => 'DIV-004'],
            [
                'name' => 'Operations',
                'location' => 'Building D, Ground Floor',
                'officer_in_charge' => 'Sarah Williams',
                'contact_no' => '0774567890',
                'is_approved' => true,
                'parent_id' => null
            ]
        );

        Division::firstOrCreate(
            ['code' => 'DIV-005'],
            [
                'name' => 'Customer Service',
                'location' => 'Building E, 4th Floor',
                'officer_in_charge' => 'David Brown',
                'contact_no' => '0775678901',
                'is_approved' => true,
                'parent_id' => null
            ]
        );

        // Sub-divisions
        Division::firstOrCreate(
            ['code' => 'DIV-001-01'],
            [
                'name' => 'Network Team',
                'location' => 'Building A, 3rd Floor, Room 301',
                'officer_in_charge' => 'Alex Lee',
                'contact_no' => '0776789012',
                'is_approved' => true,
                'parent_id' => 1
            ]
        );

        Division::firstOrCreate(
            ['code' => 'DIV-001-02'],
            [
                'name' => 'Software Development',
                'location' => 'Building A, 3rd Floor, Room 302',
                'officer_in_charge' => 'Emma Davis',
                'contact_no' => '0777890123',
                'is_approved' => true,
                'parent_id' => 1
            ]
        );

        Division::firstOrCreate(
            ['code' => 'DIV-002-01'],
            [
                'name' => 'Recruitment Team',
                'location' => 'Building B, 2nd Floor, Room 201',
                'officer_in_charge' => 'Lisa Anderson',
                'contact_no' => '0778901234',
                'is_approved' => true,
                'parent_id' => 2
            ]
        );

        Division::firstOrCreate(
            ['code' => 'DIV-002-02'],
            [
                'name' => 'Employee Relations',
                'location' => 'Building B, 2nd Floor, Room 202',
                'officer_in_charge' => 'Robert Taylor',
                'contact_no' => '0779012345',
                'is_approved' => true,
                'parent_id' => 2
            ]
        );
    }
}
