<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ComplaintCategorySeeder extends Seeder
{
    public function run()
    {
        $complaintCategories = [
            ['complaint_id' => 1, 'category_id' => 1], // Internet - Technical Issues
            ['complaint_id' => 2, 'category_id' => 2], // Billing
            ['complaint_id' => 3, 'category_id' => 3], // Poor Service - Service Quality
            ['complaint_id' => 4, 'category_id' => 3], // Delayed Service - Service Quality
            ['complaint_id' => 5, 'category_id' => 5], // General Inquiry
        ];

        DB::table('complaint_categories')->insert($complaintCategories);
    }
}
