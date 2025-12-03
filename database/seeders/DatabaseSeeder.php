<?php

namespace Database\Seeders;

<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
>>>>>>> Stashed changes
=======
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
>>>>>>> Stashed changes
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
<<<<<<< Updated upstream
<<<<<<< Updated upstream
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            CategorySeeder::class,
=======
=======
>>>>>>> Stashed changes
     */
    public function run(): void
    {
        // Seed categories and statuses first
        $this->call([
            CategorySeeder::class,
            StatusSeeder::class,
            ComplaintSeeder::class,
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        ]);
    }
}
