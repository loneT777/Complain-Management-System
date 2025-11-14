<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            'super_admin',
            'privilege_officer',
            'executive_officer',
            'administrative_officer',
            'subject_officer'
        ];

        foreach ($roles as $role) {
            Role::create(['name' => $role]);
        }
    }
}