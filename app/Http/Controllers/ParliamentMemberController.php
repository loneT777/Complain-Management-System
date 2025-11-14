<?php

namespace App\Http\Controllers;

use App\Models\ParliamentMember;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ParliamentMemberController extends Controller
{
    /**
     * Check if current user has a specific permission
     */
    private function hasPermission($permissionName)
    {
        $user = auth()->user();
        if (!$user) {
            return false;
        }

        // Super Admin bypass (role_id = 1)
        // if ($user->role_id == 1) {
        //     return true;
        // }

        $permission = Permission::where('name', $permissionName)->first();
        if (!$permission) {
            return false;
        }

        return DB::table('role_permissions')
            ->where('role_id', $user->role_id)
            ->where('permission_id', $permission->id)
            ->exists();
    }

    /**
     * Check if session_id column exists in the database
     */
    private function hasSessionIdColumn()
    {
        return Schema::hasColumn('parliament_members', 'session_id');
    }

    /**
     * Display a listing of parliament members.
     * Requires ParliamentMember_read_all permission
     */
    public function index(Request $request)
    {
        if (!$this->hasPermission('Employee_read_all')){
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view all parliament members.'
            ], 403);
        }

        try {
            $perPage = 10;
            $query = ParliamentMember::with(['organization', 'designation']);
            
            // Only include session relationship if column exists
            if ($this->hasSessionIdColumn()) {
                $query->with('session');
            }

            if ($request->has('search') && $request->search != '') {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('code', 'LIKE', "%{$search}%")
                      ->orWhere('job_role', 'LIKE', "%{$search}%");
                });
            }

            $members = $query
                ->orderBy('parliament_members.id', 'desc')
                ->paginate(perPage: $perPage);

            return response()->json([
                'data' => $members->items(),
                'current_page' => $members->currentPage(),
                'last_page' => $members->lastPage(),
                'per_page' => $members->perPage(),
                'total' => $members->total(),
                'from' => $members->firstItem(),
                'to' => $members->lastItem()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch parliament members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created parliament member in storage.
     * Requires ParliamentMember_create permission
     */
    public function store(Request $request)
    {
        if (!$this->hasPermission('Employee_create')){
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to create parliament members.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z\s\'-]+$/',
                Rule::unique('parliament_members', 'name')
            ],
            'title' => 'required|string|max:20',
            'job_role' => 'required|string|max:255',
            'designation_id' => 'required|exists:designations,id',
        ], [
            'name.required' => 'Name is required.',
            'name.unique' => 'A parliament member with this name already exists.',
            'name.regex' => 'Name may only contain letters, spaces, hyphens, and apostrophes.',
            'title.required' => 'Title is required.',
            'title.max' => 'Title may not be greater than 20 characters.',
            'job_role.required' => 'Job role is required.',
            'designation_id.required' => 'Designation is required.',
            'designation_id.exists' => 'The selected designation is invalid.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Generate the next code
            $lastMember = ParliamentMember::orderBy('id', 'desc')->first();
            $nextNumber = $lastMember
                ? ((int) preg_replace('/[^0-9]/', '', $lastMember->code)) + 1
                : 1;
            $nextCode = 'PM' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

            // Prepare member data
            $memberData = [
                'code'            => $nextCode,
                'title'           => $request->title,
                'name'            => $request->name,
                'job_role'        => $request->job_role,
                'organization_id' => 3, // Always set to Parliament (id=3)
                'designation_id'  => $request->designation_id,
            ];

            // Only add session_id if column exists
            if ($this->hasSessionIdColumn()) {
                // Get the current session ID
                $currentUser = auth()->user();
                if ($currentUser) {
                    // Find the current user's most recent active login session (where logout_time is null)
                    $activeSession = \App\Models\LoginSession::where('user_id', $currentUser->id)
                        ->whereNull('logout_time')
                        ->orderBy('login_time', 'desc')
                        ->first();
                        
                    if ($activeSession) {
                        $memberData['session_id'] = $activeSession->id;
                    }
                }
            }

            $member = ParliamentMember::create($memberData);

            // Load relationships based on column existence
            if ($this->hasSessionIdColumn()) {
                $member->load(['organization', 'designation', 'session']);
            } else {
                $member->load(['organization', 'designation']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Parliament member created successfully',
                'data' => $member
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create parliament member',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified parliament member.
     * Requires ParliamentMember_read_one permission
     */
    public function show($id)
    {
        if (!$this->hasPermission('Employee_read_one')){
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view parliament member details.'
            ], 403);
        }

        try {
            // Build query based on column existence
            if ($this->hasSessionIdColumn()) {
                $member = ParliamentMember::with(['organization', 'designation', 'session'])->find($id);
            } else {
                $member = ParliamentMember::with(['organization', 'designation'])->find($id);
            }

            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parliament member not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $member
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching parliament member',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified parliament member in storage.
     * Requires ParliamentMember_update permission
     */
    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('Employee_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update parliament members.'
            ], 403);
        }

        $member = ParliamentMember::find($id);

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Parliament member not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z\s\'-]+$/',
                Rule::unique('parliament_members', 'name')->ignore($member->id)
            ],
            'title' => 'required|string|max:20',
            'job_role' => 'required|string|max:255',
            'designation_id' => 'required|exists:designations,id',
        ], [
            'name.required' => 'Name is required.',
            'name.unique' => 'A parliament member with this name already exists.',
            'name.regex' => 'Name may only contain letters, spaces, hyphens, and apostrophes.',
            'title.required' => 'Title is required.',
            'title.max' => 'Title may not be greater than 20 characters.',
            'job_role.required' => 'Job role is required.',
            'designation_id.required' => 'Designation is required.',
            'designation_id.exists' => 'The selected designation is invalid.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Prepare update data
            $updateData = [
                'title'           => $request->title,
                'name'            => $request->name,
                'job_role'        => $request->job_role,
                'organization_id' => 3, // Always set to Parliament (id=3)
                'designation_id'  => $request->designation_id,
            ];

            // Only add session_id if column exists
            if ($this->hasSessionIdColumn()) {
                // Get the current session ID if not provided
                $currentUser = auth()->user();
                if ($currentUser) {
                    // Find the current user's most recent active login session (where logout_time is null)
                    $activeSession = \App\Models\LoginSession::where('user_id', $currentUser->id)
                        ->whereNull('logout_time')
                        ->orderBy('login_time', 'desc')
                        ->first();
                        
                    if ($activeSession) {
                        $updateData['session_id'] = $activeSession->id;
                    }
                }
            }

            // Code stays the same on update
            $member->update($updateData);

            // Load relationships based on column existence
            if ($this->hasSessionIdColumn()) {
                $member->load(['organization', 'designation', 'session']);
            } else {
                $member->load(['organization', 'designation']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Parliament member updated successfully',
                'data' => $member
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update parliament member',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified parliament member from storage.
     * Requires ParliamentMember_delete permission
     */
    public function destroy($id)
    {
        if (!$this->hasPermission('Employee_deactivate')){
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to delete parliament members.'
            ], 403);
        }

        try {
            $member = ParliamentMember::find($id);

            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parliament member not found'
                ], 404);
            }

            $member->delete();

            return response()->json([
                'success' => true,
                'message' => 'Parliament member deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete parliament member',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}