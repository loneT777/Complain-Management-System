<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::firstOrCreate(
            ['code' => 'GEN'],
            ['category_name' => 'General', 'description' => 'General complaint category']
        );

        Category::firstOrCreate(
            ['code' => 'INF'],
            ['category_name' => 'Infrastructure', 'description' => 'Road, water, electricity issues']
        );

        Category::firstOrCreate(
            ['code' => 'SAN'],
            ['category_name' => 'Sanitation', 'description' => 'Garbage collection and cleanliness']
        );

        Category::firstOrCreate(
            ['code' => 'NP'],
            ['category_name' => 'Noise Pollution', 'description' => 'Noise related complaints']
        );

        Category::firstOrCreate(
            ['code' => 'SAF'],
            ['category_name' => 'Safety', 'description' => 'Public safety concerns']
        );
    }
}

