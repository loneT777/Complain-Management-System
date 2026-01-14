<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\ComplaintLog;
use App\Models\User;
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
     * Filters complaints based on user role and permissions.
     */
    public function index(Request $request)
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            // Auth is guaranteed by middleware, but add safety check
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $query = Complaint::with([
                'complainant',
                'lastStatus',
                'assignments' => function ($q) {
                    $q->with(['assigneeDivision', 'assigneeUser'])
                        ->orderBy('created_at', 'desc');
                }
            ]);

            // Apply search filter
            if ($request->has('search') && $request->search != '') {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'LIKE', "%{$search}%")
                        ->orWhere('complainant_name', 'LIKE', "%{$search}%")
                        ->orWhere('complainant_phone', 'LIKE', "%{$search}%")
                        ->orWhereHas('complainant', function ($subQ) use ($search) {
                            $subQ->where('full_name', 'LIKE', "%{$search}%");
                        });
                });
            }

            // Apply role-based filtering
            if ($user->hasAdminAccess()) {
                // Super Admin & Complaint Manager: Display all complaints
                // No additional filtering needed
            } elseif ($user->isEngineer()) {
                // Engineer: Display assigned complaints + complaints they received
                if ($user->person_id) {
                    // Show complaints where user is assigned OR user received the complaint
                    $query->where(function ($q) use ($user) {
                        $q->whereHas('assignments', function ($assignQuery) use ($user) {
                            $assignQuery->where('assignee_id', $user->person_id);
                        })
                            ->orWhere('user_received_id', $user->id);
                    });
                } else {
                    // Engineer without person_id can see complaints they received
                    $query->where('user_received_id', $user->id);
                }
            } elseif ($user->isDivisionManager()) {
                // Division Manager: Display complaints assigned to their division (current or past) OR created by division members
                if ($user->division_id) {
                    $query->where(function ($q) use ($user) {
                        // Show complaints with ANY assignment to this division (even if reassigned away)
                        $q->whereHas('assignments', function ($assignQuery) use ($user) {
                            $assignQuery->where('assignee_division_id', $user->division_id);
                        });
                    })
                        // OR show complaints created by people in this division
                        ->orWhere(function ($q) use ($user) {
                            $q->whereHas('complainant', function ($personQuery) use ($user) {
                                $personQuery->where('division_id', $user->division_id);
                            });
                        });
                }
            } elseif ($user->isComplainant()) {
                // Complainant (Public User): Display only their own complaints
                if ($user->person_id) {
                    $query->where('complainant_id', $user->person_id);
                } else {
                    // If no person_id, show complaints created by this user_id (fallback)
                    $query->where('user_received_id', $user->id);
                }
            } elseif ($user->hasDivisionAccess()) {
                // Division User: Display division-specific complaints
                $query->where('division_id', $user->division_id);
            } else {
                // Regular User: Display complaints they received or are assigned to
                $query->where(function ($q) use ($user) {
                    $q->where('user_received_id', $user->id)
                        ->orWhereHas('assignments', function ($assignQuery) use ($user) {
                            $assignQuery->where('assignee_id', $user->person_id ?? $user->id);
                        });
                });
            }

            // Apply additional filters if provided
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

            $complaints = $query->orderBy('created_at', 'desc')->get();

            Log::info('Fetching complaints', [
                'user_id' => $user->id,
                'user_role' => $user->role?->code,
                'complaints_count' => $complaints->count()
            ]);

            // Add is_reassigned_away flag for Role 5 users and Role 2 Division Managers
            if ($user->isEngineer()) {
                $complaints = $complaints->map(function ($complaint) use ($user) {
                    $complaint->is_reassigned_away = $this->isReassignedAwayFromUser($complaint, $user);
                    return $complaint;
                });
            } elseif ($user->isDivisionManager()) {
                $complaints = $complaints->map(function ($complaint) use ($user) {
                    $complaint->is_reassigned_away = $this->isReassignedAwayFromDivision($complaint, $user);
                    return $complaint;
                });
            }

            return response()->json([
                'success' => true,
                'data' => $complaints
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching complaints: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
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
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Generate sequential reference number
            $lastComplaint = Complaint::orderBy('id', 'desc')->first();
            $nextNumber = $lastComplaint ? ($lastComplaint->id + 1) : 1;
            $referenceNo = 'CMP-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

            // Get the Pending status
            $pendingStatus = \App\Models\Status::where('code', 'pending')->first();

            // Get the authenticated user's person_id or use the person_id from request
            /** @var User $user */
            $user = Auth::user();

            // Try to get complainant_id from request, then from user's person_id, then default to 1
            $complainantId = $request->input('complainant_id')
                ? (int)$request->input('complainant_id')
                : ($user && $user->person_id ? $user->person_id : 1);

            // Verify the person exists
            $person = \App\Models\Person::find($complainantId);
            if (!$person) {
                DB::rollBack();
                return response()->json([
                    'error' => "Person with ID {$complainantId} does not exist"
                ], 422);
            }

            $complaint = Complaint::create(array_merge($request->except('category_ids'), [
                'reference_no' => $referenceNo,
                'received_at' => now(),
                'complainant_id' => $complainantId,
                'user_received_id' => $user ? $user->id : null, // Set user who received/created the complaint
                'last_status_id' => $pendingStatus ? $pendingStatus->id : 1 // Set initial status to Pending
            ]));

            // Attach categories if provided
            if ($request->has('category_ids') && is_array($request->category_ids)) {
                $complaint->categories()->attach($request->category_ids);
            }

            // Handle file attachments
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $filePath = $file->storeAs('complaints/attachments', $fileName, 'public');

                    // Create attachment record (you'll need an Attachment model)
                    DB::table('complaint_attachments')->insert([
                        'complaint_id' => $complaint->id,
                        'file_name' => $fileName,
                        'file_path' => $filePath,
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }

            // Note: Logs are created only after complaint assignment
            // No log created at complaint creation stage

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Complaint created successfully',
                'data' => $complaint->load(['categories', 'complainant', 'lastStatus'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create complaint: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create complaint: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified complaint with relationships.
     * Checks if user has permission to view this complaint.
     */
    public function show($id)
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

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

            // Check if user has access to view this complaint
            if ($user->hasAdminAccess()) {
                // Super Admin & Complaint Manager: Can view any complaint
                // No restrictions
            } elseif ($user->isEngineer()) {
                // Engineer: Check if complaint is assigned to them OR they received it
                if (!$user->person_id) {
                    return response()->json(['error' => 'Forbidden - Engineer without person_id'], 403);
                }

                $isAssigned = $complaint->assignments()
                    ->where('assignee_id', $user->person_id)
                    ->exists();

                $isReceived = $complaint->user_received_id === $user->id;

                if (!$isAssigned && !$isReceived) {
                    return response()->json(['error' => 'Forbidden - Complaint not assigned to you or received by you'], 403);
                }
            } elseif ($user->isDivisionManager()) {
                // Division Manager: Check if complaint is created by their division members OR assigned to their division
                if (!$user->division_id) {
                    return response()->json(['error' => 'Forbidden - Division Manager without division_id'], 403);
                }

                $isCreatedByDivisionMember = $complaint->complainant()
                    ->where('division_id', $user->division_id)
                    ->exists();

                // Also check if complaint is currently assigned to their division
                $isAssignedToDivision = $complaint->assignments()
                    ->where('assignee_division_id', $user->division_id)
                    ->exists();

                if (!$isCreatedByDivisionMember && !$isAssignedToDivision) {
                    return response()->json(['error' => 'Forbidden - Complaint not in your division'], 403);
                }
            } elseif ($user->isComplainant()) {
                // Complainant: Can only view their own complaints
                if ($user->person_id) {
                    if ($complaint->complainant_id !== $user->person_id) {
                        return response()->json(['error' => 'Forbidden - You can only view your own complaints'], 403);
                    }
                } else {
                    // Fallback: check if user received the complaint
                    if ($complaint->user_received_id !== $user->id) {
                        return response()->json(['error' => 'Forbidden - You can only view your own complaints'], 403);
                    }
                }
            } elseif ($user->hasDivisionAccess()) {
                // Check if complaint belongs to user's division
                if ($complaint->division_id !== $user->division_id) {
                    return response()->json(['error' => 'Forbidden - You cannot view this complaint'], 403);
                }
            } else {
                // Check if user created or is assigned to this complaint
                $hasAccess = $complaint->created_by === $user->id ||
                    $complaint->assignments()->where('user_id', $user->id)->exists();

                if (!$hasAccess) {
                    return response()->json(['error' => 'Forbidden - You cannot view this complaint'], 403);
                }
            }

            // Add is_reassigned_away flag for Role 5 users and Role 2 Division Managers
            if ($user->isEngineer()) {
                $complaint->is_reassigned_away = $this->isReassignedAwayFromUser($complaint, $user);
            } elseif ($user->isDivisionManager()) {
                $complaint->is_reassigned_away = $this->isReassignedAwayFromDivision($complaint, $user);
            }

            return response()->json([
                'success' => true,
                'data' => $complaint
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
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
                'success' => true,
                'message' => 'Complaint updated successfully',
                'data' => $complaint->load(['categories', 'complainant', 'lastStatus'])
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Complaint not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Failed to update complaint: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update complaint: ' . $e->getMessage()
            ], 500);
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

            return response()->json([
                'success' => true,
                'message' => 'Complaint deleted successfully'
            ]);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Complaint not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete complaint: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete complaint: ' . $e->getMessage()
            ], 500);
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

            // Note: According to the application design, logs are only created after complaint assignment
            // If we need to log status changes, it should be done through the assignment process

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Complaint status updated successfully',
                'data' => $complaint->load(['lastStatus'])
            ]);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Complaint not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update complaint status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update complaint status'
            ], 500);
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

            // Note: According to the application design, logs are only created after complaint assignment
            // If we need to log priority changes, it should be done through the assignment process

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Complaint priority updated successfully',
                'data' => $complaint
            ]);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Complaint not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update complaint priority: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update complaint priority'
            ], 500);
        }
    }

    /**
     * Get all priority levels
     */
    public function getPriorities()
    {
        try {
            $priorities = \App\Models\Priority::all();
            return response()->json([
                'success' => true,
                'data' => $priorities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all status levels
     */
    public function getStatuses()
    {
        try {
            $statuses = \App\Models\Status::all();
            return response()->json([
                'success' => true,
                'data' => $statuses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
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

            // Get specific priority counts - using the same format as validation
            $lowCount = Complaint::where('priority_level', 'Low')->count();
            $mediumCount = Complaint::where('priority_level', 'Medium')->count();
            $urgentCount = Complaint::where('priority_level', 'Urgent')->count();
            $veryUrgentCount = Complaint::where('priority_level', 'Very Urgent')->count();

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
                    'priority_level' => 'Low',
                    'count' => $lowCount
                ],
                [
                    'priority_level' => 'Medium',
                    'count' => $mediumCount
                ],
                [
                    'priority_level' => 'Urgent',
                    'count' => $urgentCount
                ],
                [
                    'priority_level' => 'Very Urgent',
                    'count' => $veryUrgentCount
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => [
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
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if a complaint has been reassigned away from the given user
     * (i.e., user was previously assigned but is no longer the current assignee)
     */
    private function isReassignedAwayFromUser($complaint, $user)
    {
        if (!$user->isEngineer() || !$user->person_id) {
            return false;
        }

        // Get all assignments for this complaint ordered by creation date
        $assignments = $complaint->assignments()->orderBy('created_at', 'asc')->get();

        if ($assignments->isEmpty()) {
            return false;
        }

        // Get the latest assignment (most recent)
        $currentAssignment = $assignments->last();

        // Check if the CURRENT assignment is to this user
        if ($currentAssignment->assignee_id == $user->person_id) {
            // If currently assigned to this user, not reassigned away
            return false;
        }

        // Check if user appears in any previous assignment
        $userWasPreviouslyAssigned = false;
        foreach ($assignments as $assignment) {
            if ($assignment->assignee_id == $user->person_id) {
                $userWasPreviouslyAssigned = true;
                break;
            }
        }

        // Return true only if was previously assigned to this user AND current assignment is different
        return $userWasPreviouslyAssigned;
    }

    private function isReassignedAwayFromDivision($complaint, $user)
    {
        if (!$user->isDivisionManager() || !$user->division_id) {
            return false;
        }

        // Use already loaded assignments if available, otherwise fetch them
        $assignments = $complaint->relationLoaded('assignments')
            ? $complaint->assignments->sortBy('created_at')
            : $complaint->assignments()->orderBy('created_at', 'asc')->get();

        if ($assignments->isEmpty()) {
            return false;
        }

        // Get the latest assignment (most recent)
        $currentAssignment = $assignments->last();

        // Check if the CURRENT assignment is to this division
        if ($currentAssignment->assignee_division_id == $user->division_id) {
            // If currently assigned to their division, not reassigned away
            return false;
        }

        // Check if division appears in any previous assignment
        $divisionWasPreviouslyAssigned = false;
        foreach ($assignments as $assignment) {
            if ($assignment->assignee_division_id == $user->division_id) {
                $divisionWasPreviouslyAssigned = true;
                break;
            }
        }

        // Return true only if was previously assigned to their division AND current assignment is different
        return $divisionWasPreviouslyAssigned;
    }
}
