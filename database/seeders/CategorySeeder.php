<?php

namespace Database\Seeders;

<<<<<<< Updated upstream
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run()
    {
        // First, create divisions
        $divisions = [
            ['id' => 1, 'name' => 'IT Department', 'parent_id' => null, 'location' => 'Building A', 'is_approved' => true, 'code' => 'DIV-001', 'officer_in_charge' => 'John Doe', 'contact_no' => '0771234567', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'HR Department', 'parent_id' => null, 'location' => 'Building B', 'is_approved' => true, 'code' => 'DIV-002', 'officer_in_charge' => 'Jane Smith', 'contact_no' => '0772345678', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Finance Department', 'parent_id' => null, 'location' => 'Building C', 'is_approved' => true, 'code' => 'DIV-003', 'officer_in_charge' => 'Mike Johnson', 'contact_no' => '0773456789', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Operations', 'parent_id' => null, 'location' => 'Building D', 'is_approved' => true, 'code' => 'DIV-004', 'officer_in_charge' => 'Sarah Williams', 'contact_no' => '0774567890', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Customer Service', 'parent_id' => null, 'location' => 'Building E', 'is_approved' => true, 'code' => 'DIV-005', 'officer_in_charge' => 'David Brown', 'contact_no' => '0775678901', 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('divisions')->insert($divisions);

        // Create parent categories
        $categories = [
            [
                'id' => 1,
                'code' => 'CAT-001',
                'parent_id' => null,
                'category_name' => 'Technical Issues',
                'description' => 'All technical and IT related complaints',
                'division_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 2,
                'code' => 'CAT-002',
                'parent_id' => null,
                'category_name' => 'Employee Relations',
                'description' => 'HR and employee related matters',
                'division_id' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 3,
                'code' => 'CAT-003',
                'parent_id' => null,
                'category_name' => 'Financial',
                'description' => 'Finance and accounting complaints',
                'division_id' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 4,
                'code' => 'CAT-004',
                'parent_id' => null,
                'category_name' => 'Operational',
                'description' => 'Daily operations and process issues',
                'division_id' => 4,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 5,
                'code' => 'CAT-005',
                'parent_id' => null,
                'category_name' => 'Customer Issues',
                'description' => 'Customer service and satisfaction',
                'division_id' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ],
            // Sub-categories for Technical Issues
            [
                'id' => 6,
                'code' => 'CAT-001-01',
                'parent_id' => 1,
                'category_name' => 'Hardware Problems',
                'description' => 'Computer, printer, and equipment issues',
                'division_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 7,
                'code' => 'CAT-001-02',
                'parent_id' => 1,
                'category_name' => 'Software Issues',
                'description' => 'Application and software bugs',
                'division_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 8,
                'code' => 'CAT-001-03',
                'parent_id' => 1,
                'category_name' => 'Network Connectivity',
                'description' => 'Internet and network access problems',
                'division_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            // Sub-categories for Employee Relations
            [
                'id' => 9,
                'code' => 'CAT-002-01',
                'parent_id' => 2,
                'category_name' => 'Workplace Harassment',
                'description' => 'Harassment and discrimination complaints',
                'division_id' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 10,
                'code' => 'CAT-002-02',
                'parent_id' => 2,
                'category_name' => 'Leave Issues',
                'description' => 'Leave approval and management',
                'division_id' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            // Sub-categories for Financial
            [
                'id' => 11,
                'code' => 'CAT-003-01',
                'parent_id' => 3,
                'category_name' => 'Payroll Errors',
                'description' => 'Salary and payment discrepancies',
                'division_id' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 12,
                'code' => 'CAT-003-02',
                'parent_id' => 3,
                'category_name' => 'Reimbursement Delays',
                'description' => 'Expense reimbursement issues',
                'division_id' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            // Sub-categories for Operational
            [
                'id' => 13,
                'code' => 'CAT-004-01',
                'parent_id' => 4,
                'category_name' => 'Process Inefficiency',
                'description' => 'Workflow and process improvements',
                'division_id' => 4,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 14,
                'code' => 'CAT-004-02',
                'parent_id' => 4,
                'category_name' => 'Resource Shortage',
                'description' => 'Lack of equipment or materials',
                'division_id' => 4,
                'created_at' => now(),
                'updated_at' => now()
            ],
            // Sub-categories for Customer Issues
            [
                'id' => 15,
                'code' => 'CAT-005-01',
                'parent_id' => 5,
                'category_name' => 'Service Quality',
                'description' => 'Quality of service complaints',
                'division_id' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 16,
                'code' => 'CAT-005-02',
                'parent_id' => 5,
                'category_name' => 'Response Time',
                'description' => 'Slow response or delayed service',
                'division_id' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];

        DB::table('categories')->insert($categories);
=======
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
>>>>>>> Stashed changes
    }
}
