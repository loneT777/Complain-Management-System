<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Status;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete old statuses
        Status::whereNotIn('code', ['pending','cancel', 'assigned', 'completed',])->delete();
        
        // Create/update only the required statuses
        Status::firstOrCreate(['code' => 'pending'], ['name' => 'Pending']);
        Status::firstOrCreate(['code' => 'cancel'], ['name' => 'Cancel']);
        Status::firstOrCreate(['code' => 'assigned'], ['name' => 'Assigned']);
        Status::firstOrCreate(['code' => 'completed'], ['name' => 'Completed']);
    }
}
