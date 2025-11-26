<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'code' => 'CAT001',
                'parent_id' => null,
                'category_name' => 'Technical Issues',
                'description' => 'All technical and IT related complaints',
                'division_id' => 1, // IT Division
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'CAT002',
                'parent_id' => null,
                'category_name' => 'Billing',
                'description' => 'Payment and billing related complaints',
                'division_id' => 4, // Finance Division
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'CAT003',
                'parent_id' => null,
                'category_name' => 'Service Quality',
                'description' => 'Service delivery and quality related issues',
                'division_id' => 3, // Customer Service Division
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'CAT004',
                'parent_id' => null,
                'category_name' => 'Staff Behavior',
                'description' => 'Employee conduct and behavior complaints',
                'division_id' => 2, // HR Division
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'CAT005',
                'parent_id' => null,
                'category_name' => 'General Inquiry',
                'description' => 'General questions and information requests',
                'division_id' => 3, // Customer Service Division
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('categories')->insert($categories);
    }
}
