<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DivisionSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();
        
        $divisions = [
            [
                'parent_id' => null,
                'name' => 'Information Technology',
                'code' => 'IT',
                'location' => 'Building A, Floor 3',
                'officer_in_charge' => 'Rajitha Perera',
                'is_approved' => true,
                'remark' => 'Handles all IT-related complaints',
                'contact_no' => '011-2345678',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'parent_id' => null,
                'name' => 'Human Resources',
                'code' => 'HR',
                'location' => 'Building B, Floor 2',
                'officer_in_charge' => 'Nimalka Fernando',
                'is_approved' => true,
                'remark' => 'Manages employee-related issues',
                'contact_no' => '011-2345679',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'parent_id' => null,
                'name' => 'Customer Service',
                'code' => 'CS',
                'location' => 'Building A, Floor 1',
                'officer_in_charge' => 'Dilini Jayawardena',
                'is_approved' => true,
                'remark' => 'Handles customer complaints and inquiries',
                'contact_no' => '011-2345680',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'parent_id' => null,
                'name' => 'Finance',
                'code' => 'FIN',
                'location' => 'Building C, Floor 4',
                'officer_in_charge' => 'Kasun Wijesinghe',
                'is_approved' => true,
                'remark' => 'Financial complaints and billing issues',
                'contact_no' => '011-2345681',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'parent_id' => null,
                'name' => 'Operations',
                'code' => 'OPS',
                'location' => 'Building D, Floor 2',
                'officer_in_charge' => 'Priyanka Mendis',
                'is_approved' => true,
                'remark' => 'Operational and service delivery issues',
                'contact_no' => '011-2345682',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('divisions')->insert($divisions);
    }
}
