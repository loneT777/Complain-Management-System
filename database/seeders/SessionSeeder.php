<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SessionSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();
        
        $sessions = [
            [
                'id' => 1,
                'name' => '2025 Session',
                'start_date' => $now->copy()->startOfYear(),
                'end_date' => $now->copy()->endOfYear(),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('sessions')->insertOrIgnore($sessions);
    }
}
