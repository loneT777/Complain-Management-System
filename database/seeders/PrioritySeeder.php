<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Priority;

class PrioritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Priority::firstOrCreate(['level' => 'Low'], [
            'name' => 'Low',
            'description' => 'Low priority - can be handled within normal operations'
        ]);
        
        Priority::firstOrCreate(['level' => 'Medium'], [
            'name' => 'Medium',
            'description' => 'Medium priority - should be handled within reasonable time'
        ]);
        
        Priority::firstOrCreate(['level' => 'Urgent'], [
            'name' => 'Urgent',
            'description' => 'Urgent priority - requires immediate attention'
        ]);
        
        Priority::firstOrCreate(['level' => 'Very Urgent'], [
            'name' => 'Very Urgent',
            'description' => 'Very urgent priority - critical issue requiring immediate resolution'
        ]);
    }
}
