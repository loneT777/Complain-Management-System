<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PersonSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();
        
        $persons = [
            [
                'title' => 'Mr.',
                'full_name' => 'Rajitha Perera',
                'nic' => '198523456789',
                'code' => 'EMP001',
                'office_phone' => '011-2345678',
                'whatsapp' => '+94771234567',
                'address' => '123, Galle Road, Colombo 03',
                'type' => 'Employee',
                'designation' => 'IT Manager',
                'division_id' => 1, // IT Division
                'remark' => 'Head of IT Department',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Mr.',
                'full_name' => 'System Administrator',
                'nic' => '199900123456',
                'code' => 'SYS001',
                'office_phone' => '011-2345699',
                'whatsapp' => '+94781234567',
                'address' => '999, IT Park, Colombo 01',
                'type' => 'Employee',
                'designation' => 'System Administrator',
                'division_id' => 1, // IT Division
                'remark' => 'Super Admin user for system management',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Mrs.',
                'full_name' => 'Nimalka Fernando',
                'nic' => '199034567890',
                'code' => 'EMP002',
                'office_phone' => '011-2345679',
                'whatsapp' => '+94772345678',
                'address' => '456, Duplication Road, Colombo 04',
                'type' => 'Employee',
                'designation' => 'HR Manager',
                'division_id' => 2, // HR Division
                'remark' => 'Human Resources Head',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Ms.',
                'full_name' => 'Dilini Jayawardena',
                'nic' => '199245678901',
                'code' => 'EMP003',
                'office_phone' => '011-2345680',
                'whatsapp' => '+94773456789',
                'address' => '789, Baseline Road, Colombo 09',
                'type' => 'Employee',
                'designation' => 'Customer Service Lead',
                'division_id' => 3, // Customer Service
                'remark' => 'Handles customer escalations',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Mr.',
                'full_name' => 'Kasun Wijesinghe',
                'nic' => '198856789012',
                'code' => 'EMP004',
                'office_phone' => '011-2345681',
                'whatsapp' => '+94774567890',
                'address' => '321, Kandy Road, Kaduwela',
                'type' => 'Employee',
                'designation' => 'Finance Officer',
                'division_id' => 4, // Finance
                'remark' => 'Senior Finance Officer',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Mr.',
                'full_name' => 'Pradeep Silva',
                'nic' => '197567890123',
                'code' => null,
                'office_phone' => null,
                'whatsapp' => '+94775678901',
                'address' => '654, Temple Road, Nugegoda',
                'type' => 'Public',
                'designation' => null,
                'division_id' => null,
                'remark' => 'Regular customer',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Mr.',
                'full_name' => 'Tharindu Peris',
                'nic' => '199867890124',
                'code' => 'EMP006',
                'office_phone' => '011-2345682',
                'whatsapp' => '+94776789012',
                'address' => '987, High Street, Colombo 02',
                'type' => 'Employee',
                'designation' => 'Complaint Handler',
                'division_id' => 3, // Customer Service
                'remark' => 'Handles general complaints',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Mr.',
                'full_name' => 'Lasantha Kumar',
                'nic' => '198978901235',
                'code' => 'EMP007',
                'office_phone' => '011-2345683',
                'whatsapp' => '+94777890123',
                'address' => '246, Nawala Road, Colombo 05',
                'type' => 'Employee',
                'designation' => 'Senior IT Manager',
                'division_id' => 1, // IT Division
                'remark' => 'IT Department Manager',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Ms.',
                'full_name' => 'Samantha Fernando',
                'nic' => '199089012346',
                'code' => 'EMP008',
                'office_phone' => '011-2345684',
                'whatsapp' => '+94778901234',
                'address' => '369, Kirillapone Road, Colombo 05',
                'type' => 'Employee',
                'designation' => 'Audit Officer',
                'division_id' => 4, // Finance
                'remark' => 'Internal audit officer',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Mr.',
                'full_name' => 'Jayantha de Silva',
                'nic' => '197890123457',
                'code' => null,
                'office_phone' => null,
                'whatsapp' => '+94779012345',
                'address' => '753, Rajagirilla Mawatha, Colombo 08',
                'type' => 'Public',
                'designation' => null,
                'division_id' => null,
                'remark' => 'Corporate customer',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Ms.',
                'full_name' => 'Anitha Wijayapala',
                'nic' => '199190123468',
                'code' => 'EMP010',
                'office_phone' => '011-2345685',
                'whatsapp' => '+94780123456',
                'address' => '159, Park Street, Colombo 06',
                'type' => 'Employee',
                'designation' => 'Complaint Processor',
                'division_id' => 3, // Customer Service
                'remark' => 'Processes complaints and follows up',
                'session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('persons')->insert($persons);
    }
}
