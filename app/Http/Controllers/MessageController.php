<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    /**
     * Get all messages with pagination and search, filtered by role
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $perPage = $request->input('per_page', 10);
            $search = $request->input('search', '');

            $query = Message::with(['complaint', 'parent', 'user']);

            // Apply role-based filtering
            if ($user->isSuperAdmin()) {
                // Super Admin: Display all messages
                // No additional filtering needed
            } elseif ($user->hasDivisionAccess()) {
                // Division User: Display messages for division complaints
                $query->whereHas('complaint', function ($q) use ($user) {
                    $q->where('division_id', $user->division_id);
                });
            } else {
                // Regular User: Display messages for accessible complaints
                $accessibleComplaintIds = $user->getAccessibleComplaintIds();
                $query->whereIn('complaint_id', $accessibleComplaintIds);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('message', 'LIKE', "%{$search}%")
                        ->orWhere('type', 'LIKE', "%{$search}%")
                        ->orWhereHas('complaint', function ($subQuery) use ($search) {
                            $subQuery->where('reference_no', 'LIKE', "%{$search}%")
                                ->orWhere('title', 'LIKE', "%{$search}%");
                        });
                });
            }

            $messages = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $messages->items(),
                'pagination' => [
                    'current_page' => $messages->currentPage(),
                    'last_page' => $messages->lastPage(),
                    'per_page' => $messages->perPage(),
                    'total' => $messages->total(),
                    'from' => $messages->firstItem(),
                    'to' => $messages->lastItem()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all messages without pagination
     */
    public function publicIndex()
    {
        try {
            $messages = Message::with(['complaint', 'parent', 'user'])->orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $messages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new message
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'complaint_id' => 'required|integer|exists:complaints,id',
            'message' => 'required|string',
            'type' => 'nullable|string|max:50',
            'parent_id' => 'nullable|integer|exists:messages,id',
            'session_id' => 'nullable|integer',
        ], [
            'complaint_id.required' => 'Complaint is required',
            'complaint_id.exists' => 'Invalid complaint',
            'message.required' => 'Message content is required',
            'parent_id.exists' => 'Invalid parent message',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            
            // Get authenticated user's ID, or use default user_id from request, or default to 1
            $data['user_id'] = auth()->id() ?? $request->input('user_id', 1);
            
            $message = Message::create($data);
            $message->load(['complaint', 'parent', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Message created successfully',
                'data' => $message
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single message
     */
    public function show($id)
    {
        try {
            $message = Message::with(['complaint', 'parent', 'replies', 'user'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $message
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Message not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update a message
     */
    public function update(Request $request, $id)
    {
        try {
            $message = Message::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'complaint_id' => 'required|integer|exists:complaints,id',
                'message' => 'required|string',
                'type' => 'nullable|string|max:50',
                'parent_id' => 'nullable|integer|exists:messages,id',
                'session_id' => 'nullable|integer',
            ], [
                'complaint_id.required' => 'Complaint is required',
                'complaint_id.exists' => 'Invalid complaint',
                'message.required' => 'Message content is required',
                'parent_id.exists' => 'Invalid parent message',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $message->update($request->all());
            $message->load(['complaint', 'parent']);

            return response()->json([
                'success' => true,
                'message' => 'Message updated successfully',
                'data' => $message
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a message
     */
    public function destroy($id)
    {
        try {
            $message = Message::findOrFail($id);
            
            // Check if message has replies
            if ($message->replies()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete message with replies'
                ], 400);
            }

            $message->delete();

            return response()->json([
                'success' => true,
                'message' => 'Message deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get messages by complaint ID
     */
    public function getByComplaint($complaintId)
    {
        try {
            $messages = Message::with(['parent', 'user'])
                ->where('complaint_id', $complaintId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $messages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
