<?php

namespace App\Http\Controllers;

use App\Models\ComplaintLog;
use App\Models\Complaint;
use App\Models\ComplaintAssignment;
use Illuminate\Http\Request;

class ComplaintLogController extends Controller
{
    /**
     * Display a listing of complaint logs
     */
    public function index(Request $request)
    {
        try {
            $query = ComplaintLog::query();

            // Filter by complaint_id if provided
            if ($request->has('complaint_id')) {
                $query->where('complaint_id', $request->input('complaint_id'));
            }

            $logs = $query->with([
                'complaint',
                'assignee',
                'status'
            ])->orderBy('created_at', 'desc')->get();

            return response()->json($logs);
        } catch (\Exception $e) {
            \Log::error('Error fetching complaint logs: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch logs', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get logs for a specific complaint
     */
    public function getByComplaint($complaintId)
    {
        try {
            $logs = ComplaintLog::where('complaint_id', $complaintId)
                ->select('id', 'complaint_id', 'complaint_assignment_id', 'status_id', 'assignee_id', 'action', 'remark', 'created_at', 'updated_at')
                ->with(['complaint', 'assignee', 'status'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($logs);
        } catch (\Exception $e) {
            \Log::error('Error fetching complaint logs: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch logs', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created complaint log
     */
    public function store(Request $request)
    {
        $request->validate([
            'complaint_id' => 'required|exists:complaints,id',
            'complaint_assignment_id' => 'nullable|exists:complaint_assignments,id',
            'action' => 'required|string',
            'remark' => 'nullable|string',
        ]);

        // Check if complaint has at least one assignment
        $complaint = Complaint::findOrFail($request->input('complaint_id'));
        $hasAssignment = ComplaintAssignment::where('complaint_id', $complaint->id)->exists();

        if (!$hasAssignment) {
            return response()->json([
                'error' => 'Cannot create log for unassigned complaint',
                'message' => 'Complaint must be assigned before logs can be created'
            ], 422);
        }

        $log = ComplaintLog::create([
            'complaint_id' => $request->input('complaint_id'),
            'complaint_assignment_id' => $request->input('complaint_assignment_id'),
            'action' => $request->input('action'),
            'remark' => $request->input('remark'),
        ]);

        $log->load(['assignee', 'status', 'complaint']);

        return response()->json($log, 201);
    }

    /**
     * Update the specified complaint log
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|string',
            'remark' => 'nullable|string',
        ]);

        $log = ComplaintLog::findOrFail($id);

        $log->update([
            'action' => $request->input('action'),
            'remark' => $request->input('remark'),
        ]);

        $log->load(['assignee', 'status', 'complaint']);

        return response()->json($log);
    }

    /**
     * Delete the specified complaint log
     */
    public function destroy($id)
    {
        $log = ComplaintLog::findOrFail($id);
        $log->delete();

        return response()->json(['message' => 'Log deleted successfully']);
    }
}
