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
        Status::firstOrCreate(['code' => 'open'], ['name' => 'Open']);
        Status::firstOrCreate(['code' => 'in_progress'], ['name' => 'In Progress']);
        Status::firstOrCreate(['code' => 'resolved'], ['name' => 'Resolved']);
        Status::firstOrCreate(['code' => 'closed'], ['name' => 'Closed']);
        Status::firstOrCreate(['code' => 'rejected'], ['name' => 'Rejected']);
    }
}
