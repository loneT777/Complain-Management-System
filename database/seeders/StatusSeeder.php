<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatusSeeder extends Seeder
{
    public function run()
    {
        $statuses = [
            ['name' => 'Open', 'code' => 'OPEN', 'created_at' => now()],
            ['name' => 'In Progress', 'code' => 'IN_PROGRESS', 'created_at' => now()],
            ['name' => 'Resolved', 'code' => 'RESOLVED', 'created_at' => now()],
            ['name' => 'Closed', 'code' => 'CLOSED', 'created_at' => now()],
            ['name' => 'Reopened', 'code' => 'REOPENED', 'created_at' => now()],
        ];

        DB::table('status')->insert($statuses);
    }
}
