<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SessionSeeder::class,
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
            DivisionSeeder::class,
            PersonSeeder::class,
            UserSeeder::class,
            StatusSeeder::class,
            CompleteComplaintSeeder::class, // Added sample complaints
        ]);
    }
}
