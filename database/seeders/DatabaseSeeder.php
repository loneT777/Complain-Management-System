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
            // Session must be first due to foreign key constraints
            SessionSeeder::class,
            
            // Core tables
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
            DivisionSeeder::class,
            StatusSeeder::class,
            
            // Person and User tables
            PersonSeeder::class,
            UserSeeder::class,
            
            // Categories
            CategorySeeder::class,
            
            // Complaints and related tables
            ComplaintSeeder::class,
            ComplaintCategorySeeder::class,
            ComplaintAssignmentSeeder::class,
            ComplaintStatusSeeder::class,
            ComplaintLogSeeder::class,
            
            // Messages and Attachments
            MessageSeeder::class,
            AttachmentSeeder::class,
        ]);
    }
}
