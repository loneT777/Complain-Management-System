<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            ['name' => 'Super Admin'],
            ['name' => 'Division Manager'],
            ['name' => 'Complaint Handler'],
            ['name' => 'Public User'],
            ['name' => 'Viewer'],
        ];

        DB::table('roles')->insert($roles);
    }
}
