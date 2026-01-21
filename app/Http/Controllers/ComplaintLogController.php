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

            $perPage = $request->input('per_page', 'all');
            $search = $request->input('search', '');

            $query = ComplaintLog::query();

            // Filter by complaint_id if provided
            if ($request->has('complaint_id')) {
                $query->where('complaint_id', $request->input('complaint_id'));
            }

            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('action', 'LIKE', "%{$search}%")
                        ->orWhere('remark', 'LIKE', "%{$search}%")
                        ->orWhereHas('complaint', function ($subQ) use ($search) {
                            $subQ->where('reference_no', 'LIKE', "%{$search}%")
                                ->orWhere('title', 'LIKE', "%{$search}%");
                        })
                        ->orWhereHas('assignee', function ($subQ) use ($search) {
                            $subQ->where('full_name', 'LIKE', "%{$search}%");
                        })
                        ->orWhereHas('status', function ($subQ) use ($search) {
                            $subQ->where('name', 'LIKE', "%{$search}%");
                        });
                });
            }

            $query->with([
                'complaint',
                'assignee',
                'status'
            ])->orderBy('created_at', 'desc');

            if ($perPage === 'all' || $perPage === null) {
                $logs = $query->get();
                return response()->json([
                    'success' => true,
                    'data' => $logs
                ]);
            }

            $logs = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $logs->items(),
                'pagination' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                    'from' => $logs->firstItem(),
                    'to' => $logs->lastItem()
                ]
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

            // Check if user is currently assigned (not reassigned away)
            if ($user->person_id) {
                $assignments = ComplaintAssignment::where('complaint_id', $complaint->id)
                    ->orderBy('created_at', 'asc')
                    ->get();

                if ($assignments->isNotEmpty()) {
                    $currentAssignment = $assignments->last();

                    // For engineers: check if they are the current assignee
                    if ($user->isEngineer()) {
                        if ($currentAssignment->assignee_id != $user->person_id) {
                            return response()->json([
                                'success' => false,
                                'error' => 'Cannot add log to reassigned complaint',
                                'message' => 'This complaint has been reassigned to another person. You cannot add logs.'
                            ], 403);
                        }
                    }

                    // For division managers: check if their division is the current assignee
                    if ($user->isDivisionManager() && $user->division_id) {
                        if ($currentAssignment->assignee_division_id != $user->division_id) {
                            return response()->json([
                                'success' => false,
                                'error' => 'Cannot add log to reassigned complaint',
                                'message' => 'This complaint has been reassigned to another division. You cannot add logs.'
                            ], 403);
                        }
                    }
                }
            }

            // Set assignee_id to the person_id of the logged-in user
            $assigneeId = $user->person_id;

            $log = ComplaintLog::create([
                'complaint_id' => $request->input('complaint_id'),
                'complaint_assignment_id' => $request->input('complaint_assignment_id'),
                'assignee_id' => $assigneeId,
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
