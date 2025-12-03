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
        // Seed categories, statuses, complaints, and divisions
        $this->call([
            CategorySeeder::class,
            StatusSeeder::class,
            ComplaintSeeder::class,
            DivisionSeeder::class,
        ]);
    }
}
