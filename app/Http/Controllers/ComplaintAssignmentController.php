<?php

namespace App\Http\Controllers;

use App\Models\ComplaintAssignment;
use App\Models\Complaint;
use App\Models\ComplaintLog;
use App\Models\Status;
use App\Config\PrioritySLA;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ComplaintAssignmentController extends Controller
{
    /**
     * Display a listing of complaint assignments
     */
    public function index(Request $request)
    {
        try {
            $query = ComplaintAssignment::query();

            // Filter by complaint_id if provided
            if ($request->has('complaint_id')) {
                $query->where('complaint_id', $request->input('complaint_id'));
            }

            $assignments = $query->with([
                'complaint',
                'assigneeDivision',
                'assigneeUser',
                'assignerUser',
                'lastStatus'
            ])->get();

            return response()->json($assignments);
        } catch (\Exception $e) {
            \Log::error('Error fetching complaint assignments: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch assignments', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get assignments for a specific complaint
     */
    public function getByComplaint($complaintId)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Verify complaint exists
            $complaint = Complaint::findOrFail($complaintId);

            $assignments = ComplaintAssignment::where('complaint_id', $complaintId)
                ->with(['assigneeDivision', 'assigneeUser', 'assignerUser', 'lastStatus', 'complaint'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->makeVisible(['assigneeDivision', 'assigneeUser', 'assignerUser', 'lastStatus', 'complaint']);

            return response()->json([
                'data' => $assignments,
                'assignments' => $assignments->map(function ($assign) {
                    return [
                        'id' => $assign->id,
                        'complaint_id' => $assign->complaint_id,
                        'assignee_division_id' => $assign->assignee_division_id,
                        'assignee_id' => $assign->assignee_id,
                        'assigner_id' => $assign->assigner_id,
                        'last_status_id' => $assign->last_status_id,
                        'due_at' => $assign->due_at,
                        'remark' => $assign->remark,
                        'created_at' => $assign->created_at,
                        'updated_at' => $assign->updated_at,
                        'assigneeDivision' => $assign->assigneeDivision,
                        'assigneeUser' => $assign->assigneeUser,
                        'assignerUser' => $assign->assignerUser,
                        'lastStatus' => $assign->lastStatus,
                        'complaint' => $assign->complaint,
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching complaint assignments: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch assignments', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get complaint SLA information for assignment form
     */
    public function getComplaintSLA($complaintId)
    {
        try {
            $complaint = Complaint::findOrFail($complaintId);
            $slaDays = PrioritySLA::getDays($complaint->priority_level);

            return response()->json([
                'complaint_id' => $complaint->id,
                'priority_level' => $complaint->priority_level,
                'sla_days' => $slaDays,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching complaint SLA: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch complaint SLA', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created complaint assignment
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'complaint_id' => 'required|exists:complaints,id',
                'assignee_division_id' => 'nullable|exists:divisions,id',
                'assignee_id' => 'nullable|exists:persons,id',
                'due_at' => 'nullable|date',
                'remark' => 'nullable|string',
            ]);

            // Get the 'assigned' status
            $assignedStatus = Status::where('code', 'assigned')->first();

            // Create assignment
            $assignment = ComplaintAssignment::create([
                'complaint_id' => $request->input('complaint_id'),
                'assignee_division_id' => $request->input('assignee_division_id'),
                'assignee_id' => $request->input('assignee_id'),
                'due_at' => $request->input('due_at'),
                'remark' => $request->input('remark'),
                'assigner_id' => Auth::user()?->person_id ?? 1,
                'last_status_id' => null, // Foreign key references wrong table, keeping null
            ]);

            // Update the complaint's last_status_id to 'assigned'
            $complaint = Complaint::findOrFail($request->input('complaint_id'));
            if ($assignedStatus) {
                $complaint->update(['last_status_id' => $assignedStatus->id]);
            }

            // Load relationships for response
            $assignment->load([
                'complaint',
                'assigneeDivision',
                'assigneeUser',
                'assignerUser',
                'lastStatus'
            ]);

            // Log the assignment
            try {
                ComplaintLog::create([
                    'complaint_id' => $assignment->complaint_id,
                    'complaint_assignment_id' => $assignment->id,
                    'status_id' => $assignedStatus ? $assignedStatus->id : null,
                    'action' => 'Assigned',
                    'remark' => 'Assigned to ' . ($assignment->assigneeUser?->full_name ?? 'Division: ' . $assignment->assigneeDivision?->name)
                ]);
            } catch (\Exception $e) {
                // Log creation failed but assignment is successful
                \Log::error('Failed to log assignment: ' . $e->getMessage());
            }

            return response()->json($assignment, 201);
        } catch (\Exception $e) {
            \Log::error('Error creating complaint assignment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create assignment', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified complaint assignment
     */
    public function show($id)
    {
        $assignment = ComplaintAssignment::with([
            'complaint',
            'assigneeDivision',
            'assigneeUser',
            'assignerUser',
            'lastStatus'
        ])->findOrFail($id);

        return response()->json($assignment);
    }

    /**
     * Update the specified complaint assignment
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'assignee_division_id' => 'nullable|exists:divisions,id',
            'assignee_id' => 'nullable|exists:persons,id',
            'due_at' => 'nullable|date',
            'remark' => 'nullable|string',
        ]);

        $oldAssignment = ComplaintAssignment::findOrFail($id);
        $complaintId = $oldAssignment->complaint_id;

        // Create NEW assignment instead of updating (to keep history for blur/reassigned flag)
        $assignmentData = [
            'complaint_id' => $complaintId,
            'assignee_division_id' => $request->input('assignee_division_id'),
            'assignee_id' => $request->input('assignee_id'),
            'due_at' => $request->input('due_at'),
            'remark' => $request->input('remark'),
            'assigner_id' => Auth::user()->person_id ?? 1,
            'last_status_id' => null, // Foreign key references wrong table, keeping null
        ];

        $assignment = ComplaintAssignment::create($assignmentData);

        // Update complaint status to 'assigned' if it's being reassigned
        $assignedStatus = Status::where('code', 'assigned')->first();
        if ($assignedStatus) {
            $complaint = Complaint::findOrFail($complaintId);
            $complaint->update(['last_status_id' => $assignedStatus->id]);
        }

        $assignment->load([
            'complaint',
            'assigneeDivision',
            'assigneeUser',
            'assignerUser',
            'lastStatus'
        ]);

        // Log the reassignment/update
        try {
            ComplaintLog::create([
                'complaint_id' => $assignment->complaint_id,
                'complaint_assignment_id' => $assignment->id,
                'status_id' => $request->has('status_id') ? $request->input('status_id') : $assignment->last_status_id,
                'action' => 'Updated Assignment',
                'remark' => 'Assignment updated - Assigned to ' . ($assignment->assigneeUser?->full_name ?? 'Division: ' . $assignment->assigneeDivision?->name) . ($request->input('remark') ? '. Remark: ' . $request->input('remark') : '')
            ]);
        } catch (\Exception $e) {
            // Log creation failed but assignment update is successful
            \Log::error('Failed to log assignment update: ' . $e->getMessage());
        }

        return response()->json($assignment);
    }

    /**
     * Remove the specified complaint assignment
     */
    public function destroy($id)
    {
        $assignment = ComplaintAssignment::findOrFail($id);
        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted successfully']);
    }
}
