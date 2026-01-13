<?php

namespace App\Http\Controllers;

use App\Models\ComplaintLog;
use App\Models\Complaint;
use App\Models\ComplaintAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ComplaintLogController extends Controller
{
    /**
     * Display a listing of complaint logs
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

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

            return response()->json([
                'success' => true,
                'data' => $logs
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching complaint logs: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch logs',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get logs for a specific complaint
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

            $logs = ComplaintLog::where('complaint_id', $complaintId)
                ->select('id', 'complaint_id', 'complaint_assignment_id', 'status_id', 'assignee_id', 'action', 'remark', 'created_at', 'updated_at')
                ->with(['complaint', 'assignee', 'status'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $logs
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching complaint logs: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch logs',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created complaint log
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

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
                    'success' => false,
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

            return response()->json([
                'success' => true,
                'message' => 'Log created successfully',
                'data' => $log
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating complaint log: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to create log',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified complaint log
     */
    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

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

            return response()->json([
                'success' => true,
                'message' => 'Log updated successfully',
                'data' => $log
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating complaint log: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to update log',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete the specified complaint log
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $log = ComplaintLog::findOrFail($id);
            $log->delete();

            return response()->json([
                'success' => true,
                'message' => 'Log deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting complaint log: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete log',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}