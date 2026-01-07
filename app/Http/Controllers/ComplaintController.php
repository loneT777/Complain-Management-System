<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\ComplaintLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ComplaintController extends Controller
{
    /**
     * Display a paginated listing of complaints with relationships and filtering.
     */
    public function index(Request $request)
    {
        try {
            $query = Complaint::with(['complainant', 'lastStatus', 'categories']);

            // Apply filters if provided
            if ($request->has('status_id')) {
                $query->where('last_status_id', $request->status_id);
            }

            if ($request->has('priority_level')) {
                $query->where('priority_level', $request->priority_level);
            }

            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Commented out pagination to return all complaints
            // $complaints = $query->orderBy('created_at', 'desc')
            //     ->paginate($request->input('per_page', 10));
            
            $complaints = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $complaints
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created complaint in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'channel' => 'nullable|string',
            'priority_level' => 'nullable|string',
            'confidentiality_level' => 'nullable|string',
            'complainant_name' => 'nullable|string',
            'complainant_phone' => 'nullable|string',
            'remark' => 'nullable|string',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Generate unique reference number in a thread-safe way
        $referenceNo = 'CMP-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

        try {
            DB::beginTransaction();
            
            // Get the Pending status
            $pendingStatus = \App\Models\Status::where('code', 'pending')->first();
            
            $complaint = Complaint::create(array_merge($request->except('category_ids'), [
                'reference_no' => $referenceNo,
                'received_at' => now(),
                'complainant_id' => Auth::id() ?? 1, // Use authenticated user ID or default to 1
                'last_status_id' => $pendingStatus ? $pendingStatus->id : 1 // Set initial status to Pending
            ]));

            // Attach categories if provided
            if ($request->has('category_ids') && is_array($request->category_ids)) {
                $complaint->categories()->attach($request->category_ids);
            }

            // Note: Logs are created only after complaint assignment
            // No log created at complaint creation stage

            DB::commit();

            return response()->json([
                'message' => 'Complaint created successfully',
                'data' => $complaint->load(['categories', 'complainant', 'lastStatus'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create complaint: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create complaint: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified complaint with relationships.
     */
    public function show($id)
    {
        try {
            $complaint = Complaint::with([
                'complainant',
                'lastStatus',
                'categories',
                'assignments' => function ($query) {
                    $query->with(['assigneeDivision', 'assigneeUser', 'lastStatus'])
                        ->orderBy('created_at', 'desc');
                },
                'logs' => function ($query) {
                    $query->with(['assignee', 'status'])
                        ->orderBy('created_at', 'desc');
                }
            ])->findOrFail($id);

            return response()->json($complaint);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified complaint in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $complaint = Complaint::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'complainant_id' => 'nullable|exists:persons,id',
                'last_status_id' => 'nullable|exists:status,id',
                'channel' => 'nullable|string',
                'priority_level' => 'nullable|string',
                'confidentiality_level' => 'nullable|string',
                'remark' => 'nullable|string',
                'category_ids' => 'nullable|array',
                'category_ids.*' => 'exists:categories,id',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Get original values for logging
            $originalValues = $complaint->getOriginal();

            // Update complaint fields, excluding category_ids which is handled separately
            $complaint->update($request->except(['category_ids', 'complainant_name', 'complainant_phone']));

            // Handle complainant fields separately if provided
            if ($request->has('complainant_name')) {
                $complaint->complainant_name = $request->complainant_name;
            }
            if ($request->has('complainant_phone')) {
                $complaint->complainant_phone = $request->complainant_phone;
            }
            if ($request->has('remark')) {
                $complaint->remark = $request->remark;
            }
            $complaint->save();

            // Sync categories if provided - this will add new ones and remove old ones
            if ($request->has('category_ids')) {
                $complaint->categories()->sync($request->category_ids);
            }

            // Note: Logs are only created after complaint assignment
            // Update logs are not created at this stage

            return response()->json([
                'message' => 'Complaint updated successfully',
                'data' => $complaint->load(['categories', 'complainant', 'lastStatus'])
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Complaint not found'], 404);
        } catch (\Exception $e) {
            Log::error('Failed to update complaint: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update complaint: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified complaint from storage.
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $complaint = Complaint::findOrFail($id);

            // Note: No log created for deletion since logs require assignment first
            // If complaint has assignments, their logs remain in history

            $complaint->delete();

            DB::commit();

            return response()->json(['message' => 'Complaint deleted successfully']);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Complaint not found'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete complaint: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete complaint: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update complaint status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $complaint = Complaint::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status_id' => 'required|exists:status,id',
                'remark' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $oldStatus = $complaint->lastStatus ? $complaint->lastStatus->name : 'Unknown';
            $newStatus = \App\Models\Status::find($request->status_id)->name;

            $complaint->update(['last_status_id' => $request->status_id]);

            // Create a record in complaint_statuses table to track status history
            DB::table('complaint_statuses')->insert([
                'status_id' => $request->status_id,
                'complaint_id' => $complaint->id,
                'remark' => $request->remark,
                'created_at' => now()
            ]);

            // Log the status change
            ComplaintLog::create([
                'complaint_id' => $complaint->id,
                'action' => 'Status Changed',
                'remark' => "Status changed from {$oldStatus} to {$newStatus}. " . ($request->remark ?? '')
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Complaint status updated successfully',
                'data' => $complaint->load(['lastStatus'])
            ]);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Complaint not found'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update complaint status: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update complaint status'], 500);
        }
    }

    /**
     * Update complaint priority
     */
    public function updatePriority(Request $request, $id)
    {
        try {
            $complaint = Complaint::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'priority_level' => 'required|in:Low,Medium,Urgent,Very Urgent',
                'remark' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $oldPriority = $complaint->priority_level ?? 'Not Set';
            $complaint->update(['priority_level' => $request->priority_level]);

            // Log the priority change
            ComplaintLog::create([
                'complaint_id' => $complaint->id,
                'action' => 'Priority Changed',
                'remark' => "Priority changed from {$oldPriority} to {$request->priority_level}. " . ($request->remark ?? '')
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Complaint priority updated successfully',
                'data' => $complaint
            ]);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Complaint not found'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update complaint priority: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update complaint priority'], 500);
        }
    }

    /**
     * Get all priority levels
     */
    public function getPriorities()
    {
        try {
            $priorities = \App\Models\Priority::all();
            return response()->json($priorities);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get all status levels
     */
    public function getStatuses()
    {
        try {
            $statuses = \App\Models\Status::all();
            return response()->json($statuses);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get dashboard statistics for complaints by status and priority
     */
    public function getDashboardStats()
    {
        try {
            // Get specific status counts
            $pendingCount = Complaint::whereHas('lastStatus', function ($query) {
                $query->where('code', 'pending')->orWhere('code', 'open');
            })->count();
            
            $assignedCount = Complaint::whereHas('lastStatus', function ($query) {
                $query->where('code', 'assigned');
            })->count();
            
            $completedCount = Complaint::whereHas('lastStatus', function ($query) {
                $query->where('code', 'resolved')->orWhere('code', 'closed');
            })->count();

            // Get specific priority counts
            $lowCount = Complaint::where('priority_level', 'low')->count();
            $mediumCount = Complaint::where('priority_level', 'medium')->count();
            $urgentCount = Complaint::where('priority_level', 'urgent')->count();
            $veryUrgentCount = Complaint::where('priority_level', 'very_urgent')->count();

            // Get total complaints
            $totalComplaints = Complaint::count();

            $statusStats = [
                [
                    'status_name' => 'Pending',
                    'status_code' => 'pending',
                    'count' => $pendingCount
                ],
                [
                    'status_name' => 'Assigned',
                    'status_code' => 'assigned',
                    'count' => $assignedCount
                ],
                [
                    'status_name' => 'Completed',
                    'status_code' => 'completed',
                    'count' => $completedCount
                ]
            ];

            $priorityStats = [
                [
                    'priority_level' => 'low',
                    'count' => $lowCount
                ],
                [
                    'priority_level' => 'medium',
                    'count' => $mediumCount
                ],
                [
                    'priority_level' => 'urgent',
                    'count' => $urgentCount
                ],
                [
                    'priority_level' => 'very_urgent',
                    'count' => $veryUrgentCount
                ]
            ];

            return response()->json([
                'status_stats' => $statusStats,
                'priority_stats' => $priorityStats,
                'total_complaints' => $totalComplaints,
                'pending_count' => $pendingCount,
                'assigned_count' => $assignedCount,
                'completed_count' => $completedCount,
                'low_count' => $lowCount,
                'medium_count' => $mediumCount,
                'urgent_count' => $urgentCount,
                'very_urgent_count' => $veryUrgentCount
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
