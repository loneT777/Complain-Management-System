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
            SessionSeeder::class,              // 1. Create sessions first
            RoleSeeder::class,                 // 2. Create roles
            PermissionSeeder::class,           // 3. Create permissions
            RolePermissionSeeder::class,       // 4. Assign permissions to roles
            DivisionSeeder::class,             // 5. Create divisions
            PersonSeeder::class,               // 6. Create persons
            UserSeeder::class,                 // 7. Create users (requires roles)
            StatusSeeder::class,               // 8. Create statuses
            PrioritySeeder::class,             // 9. Create priorities
            CompleteComplaintSeeder::class,    // 10. Create sample complaints
        ]);
        
        $this->command->info('✅ Database seeding completed successfully!');
    }
}
