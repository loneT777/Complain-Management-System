<?php

namespace App\Http\Controllers;

use App\Models\ComplaintLog;
use App\Models\Complaint;
use App\Models\ComplaintAssignment;
use Illuminate\Http\Request;
<<<<<<< Updated upstream
<<<<<<< Updated upstream
use Illuminate\Support\Facades\Log;
=======
use Illuminate\Support\Facades\Auth;
>>>>>>> Stashed changes
=======
use Illuminate\Support\Facades\Auth;
>>>>>>> Stashed changes

class ComplaintLogController extends Controller
{
    /**
     * Display a listing of complaint logs with role-based filtering
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $query = ComplaintLog::query();

            // Apply role-based filtering
            if ($user->isSuperAdmin()) {
                // Super Admin: Display all logs
                // No additional filtering needed
            } elseif ($user->hasDivisionAccess()) {
                // Division User: Display logs for division complaints
                $query->whereHas('complaint', function ($q) use ($user) {
                    $q->where('division_id', $user->division_id);
                });
            } else {
                // Regular User: Display logs for accessible complaints
                $accessibleComplaintIds = $user->getAccessibleComplaintIds();
                $query->whereIn('complaint_id', $accessibleComplaintIds);
            }

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
            Log::error('Error fetching complaint logs: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch logs', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get logs for a specific complaint
     * Checks if user has access to view this complaint's logs
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

            // Check access permission
            if (!$user->isSuperAdmin()) {
                if ($user->hasDivisionAccess()) {
                    if ($complaint->division_id !== $user->division_id) {
                        return response()->json(['error' => 'Forbidden'], 403);
                    }
                } else {
                    $hasAccess = $complaint->created_by === $user->id ||
                        $complaint->assignments()->where('user_id', $user->id)->exists();
                    
                    if (!$hasAccess) {
                        return response()->json(['error' => 'Forbidden'], 403);
                    }
                }
            }

            $logs = ComplaintLog::where('complaint_id', $complaintId)
                ->select('id', 'complaint_id', 'complaint_assignment_id', 'status_id', 'assignee_id', 'action', 'remark', 'created_at', 'updated_at')
                ->with(['complaint', 'assignee', 'status'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($logs);
        } catch (\Exception $e) {
            Log::error('Error fetching complaint logs: ' . $e->getMessage());
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
