<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            SessionSeeder::class,
            RoleSeeder::class,
            PermissionSeeder::class,
            DivisionSeeder::class,
            PersonSeeder::class,
            UserSeeder::class,
            RolePermissionSeeder::class,
            StatusSeeder::class,
            CategorySeeder::class,
            ComplaintSeeder::class,
            ComplaintCategorySeeder::class,
            MessageSeeder::class,
            AttachmentSeeder::class,
        ]);
    }
}
