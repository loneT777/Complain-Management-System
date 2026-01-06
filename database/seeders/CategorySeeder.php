<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['code' => 'BILLING', 'category_name' => 'Billing & Charges', 'description' => 'Issues related to billing, charges, and payment methods', 'division_id' => null, 'updated_session_id' => 1],
            ['code' => 'SERVICE_QUALITY', 'category_name' => 'Service Quality', 'description' => 'Complaints about service quality and speed', 'division_id' => null, 'updated_session_id' => 1],
            ['code' => 'TECHNICAL', 'category_name' => 'Technical Issues', 'description' => 'Technical problems and connectivity issues', 'division_id' => null, 'updated_session_id' => 1],
            ['code' => 'CUSTOMER_SERVICE', 'category_name' => 'Customer Service', 'description' => 'Customer service and support-related issues', 'division_id' => null, 'updated_session_id' => 1],
            ['code' => 'NETWORK', 'category_name' => 'Network & Connectivity', 'description' => 'Network connectivity and signal strength issues', 'division_id' => null, 'updated_session_id' => 1],
        ];

        DB::table('categories')->insert($categories);
    }
}
