<?php

namespace Database\Seeders;

use App\Models\ComplaintAssignment;
use App\Models\ComplaintLog;
use Illuminate\Database\Seeder;

class ComplaintLogsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all complaint assignments that don't have logs yet
        $assignments = ComplaintAssignment::all();

        foreach ($assignments as $assignment) {
            // Check if log already exists for this assignment
            $existingLog = ComplaintLog::where('complaint_assignment_id', $assignment->id)->exists();

            if (!$existingLog) {
                // Create a log for existing assignments
                ComplaintLog::create([
                    'complaint_id' => $assignment->complaint_id,
                    'complaint_assignment_id' => $assignment->id,
                    'status_id' => $assignment->last_status_id,
                    'action' => 'Assigned',
                    'remark' => 'Assigned to ' . ($assignment->assigneeUser?->full_name ?? 'Division: ' . $assignment->assigneeDivision?->name),
                    'created_at' => $assignment->created_at,
                    'updated_at' => $assignment->updated_at
                ]);
            }
        }

        $this->command->info('Complaint logs created for all existing assignments!');
    }
}
