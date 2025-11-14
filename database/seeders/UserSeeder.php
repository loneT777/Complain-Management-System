<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Clear existing users
        User::truncate();

        // Get roles
        $roles = Role::all()->pluck('id', 'name');

        // Create test users
        $users = [
            [
                'role_id' => $roles['super_admin'],
                'username' => 'superadmin@gov.lk',
                'full_name' => 'Super Admin User',
                'password' => Hash::make('SuperAdmin@123'),
            ],
            [
                'role_id' => $roles['privilege_officer'],
                'username' => 'privilege.officer@gov.lk',
                'full_name' => 'Privilege Officer',
                'password' => Hash::make('Privilege@123'),
            ],
            [
                'role_id' => $roles['executive_officer'],
                'username' => 'executive.officer@gov.lk',
                'full_name' => 'Executive Officer',
                'password' => Hash::make('Executive@123'),
            ],
            [
                'role_id' => $roles['administrative_officer'],
                'username' => 'admin.officer@gov.lk',
                'full_name' => 'Administrative Officer',
                'password' => Hash::make('AdminOfficer@123'),
            ],
            [
                'role_id' => $roles['subject_officer'],
                'username' => 'subject.officer@gov.lk',
                'full_name' => 'Subject Officer',
                'password' => Hash::make('SubjectOfficer@123'),
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}