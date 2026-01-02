<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        $users = [
            [
                'role_id' => 1, // Super Admin
                'username' => 'admin@gmail.com',
                'password' => Hash::make('12345678'),
                'full_name' => 'Rajitha Perera',
                'person_id' => 1,
                'division_id' => 1, // IT
                'is_approved' => true,
                'session_id' => 1,
                'updated_session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id' => 1, // Super Admin
                'username' => 'superadmin@gmail.com',
                'password' => Hash::make('12345678'),
                'full_name' => 'System Administrator',
                'person_id' => 11,
                'division_id' => 1, // IT
                'is_approved' => true,
                'session_id' => 1,
                'updated_session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id' => 2, // Division Manager
                'username' => 'hr.manager',
                'password' => Hash::make('12345678'),
                'full_name' => 'Nimalka Fernando',
                'person_id' => 2,
                'division_id' => 2, // HR
                'is_approved' => true,
                'session_id' => 1,
                'updated_session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id' => 3, // Complaint Handler
                'username' => 'cs.lead',
                'password' => Hash::make('12345678'),
                'full_name' => 'Dilini Jayawardena',
                'person_id' => 3,
                'division_id' => 3, // Customer Service
                'is_approved' => true,
                'session_id' => 1,
                'updated_session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id' => 5, // Viewer
                'username' => 'finance.officer',
                'password' => Hash::make('12345678'),
                'full_name' => 'Kasun Wijesinghe',
                'person_id' => 4,
                'division_id' => 4, // Finance
                'is_approved' => true,
                'session_id' => 1,
                'updated_session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id' => 4, // Public User
                'username' => 'pradeep.silva',
                'password' => Hash::make('12345678'),
                'full_name' => 'Pradeep Silva',
                'person_id' => 5,
                'division_id' => 3, // Assigned to CS for support
                'is_approved' => true,
                'session_id' => 1,
                'updated_session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id' => 3, // Complaint Handler
                'username' => 'tharindu.peris',
                'password' => Hash::make('12345678'),
                'full_name' => 'Tharindu Peris',
                'person_id' => 6,
                'division_id' => 3, // Customer Service
                'is_approved' => true,
                'session_id' => 1,
                'updated_session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id' => 2, // Division Manager
                'username' => 'it.manager',
                'password' => Hash::make('12345678'),
                'full_name' => 'Lasantha Kumar',
                'person_id' => 7,
                'division_id' => 1, // IT
                'is_approved' => true,
                'session_id' => 1,
                'updated_session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id' => 5, // Viewer
                'username' => 'audit.officer',
                'password' => Hash::make('12345678'),
                'full_name' => 'Samantha Fernando',
                'person_id' => 8,
                'division_id' => 4, // Finance
                'is_approved' => true,
                'session_id' => 1,
                'updated_session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id' => 4, // Public User
                'username' => 'jayantha.de',
                'password' => Hash::make('12345678'),
                'full_name' => 'Jayantha de Silva',
                'person_id' => 9,
                'division_id' => 3, // Customer Service
                'is_approved' => true,
                'session_id' => 1,
                'updated_session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id' => 3, // Complaint Handler
                'username' => 'anitha.wijayapala',
                'password' => Hash::make('12345678'),
                'full_name' => 'Anitha Wijayapala',
                'person_id' => 10,
                'division_id' => 3, // Customer Service
                'is_approved' => true,
                'session_id' => 1,
                'updated_session_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('users')->insert($users);
    }
}