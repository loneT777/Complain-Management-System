<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            ['name' => 'manage_users'],
            ['name' => 'manage_complaints'],
            ['name' => 'view_complaints'],
            ['name' => 'create_complaints'],
            ['name' => 'delete_complaints'],
        ];

        DB::table('permissions')->insert($permissions);
    }
}
