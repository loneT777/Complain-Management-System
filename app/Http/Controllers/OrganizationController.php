<?php

namespace App\Http\Controllers;

use App\Models\Organization;
// use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class OrganizationController extends Controller
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

        // $permission = Permission::where('name', $permissionName)->first();
        // if (!$permission) {
        //     return false;
        // }

        // return DB::table('role_permissions')
        //     ->where('role_id', $user->role_id)
        //     ->where('permission_id', $permission->id)
        //     ->exists();
        return true;
    }

    /**
     * GET /api/organizations (ministries + departments)
     * Requires Organization_read_all permission
     */
    public function index(Request $request)
    {
        if (!$this->hasPermission('Organization_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view organizations.'
            ], 403);
        }

        $perPage = 10;
        $query = Organization::query();

        // Include parent organization data if requested
        if ($request->has('with')) {
            $relations = explode(',', $request->with);
            if (in_array('parent', $relations)) {
                $query->with('parent');
            }
            if (in_array('children', $relations)) {
                $query->with('children');
            }
        }

        // Get only parent organizations (those without parent_id) - for ministries
        if ($request->has('parents_only') && $request->parents_only === 'true') {
            $query->whereNull('parent_id');
        }

        // Get ALL organizations that can be parents (both ministries and departments)
        if ($request->has('all_parents') && $request->all_parents === 'true') {
            // All organizations can be parents, no filter applied
            // We'll return all organizations for parent selection
        }

        // Filter by parent_id (null for top-level, numeric for specific parent)
        if ($request->has('parent_id')) {
            if ($request->parent_id === 'null') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }

        // Allow searching for organizations
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('code', 'LIKE', "%{$search}%")
                    ->orWhere('coordinator_name', 'LIKE', "%{$search}%");
            });
        }

        // Check if pagination is needed
        if ($request->has('page')) {
            // Return paginated results
            // $organizations = $query->paginate($perPage);
            $organizations = $query
                ->orderBy('organizations.id', 'desc')
                ->paginate(perPage: $perPage);

            return response()->json([
                'data' => $organizations->items(),
                'current_page' => $organizations->currentPage(),
                'last_page' => $organizations->lastPage(),
                'per_page' => $organizations->perPage(),
                'total' => $organizations->total(),
                'from' => $organizations->firstItem(),
                'to' => $organizations->lastItem()
            ]);
        } else {
            // Set a limit for non-paginated results when searching to prevent overwhelming responses
            if ($request->has('search')) {
                $query->limit(30);
            } else {
                $query->limit(30);
            }
            // Load all results for complete listing
            $organizations = $query->get();

            return response()->json([
                'data' => $organizations
            ]);
        }
    }

    /**
     * GET /api/organizations/{id}
     * Requires Organization_read_one permission
     */
    public function show($id)
    {
        if (!$this->hasPermission('Organization_read_one')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view organization details.'
            ], 403);
        }

        try {
            $organization = Organization::with(['children', 'parent'])->findOrFail($id);
            return response()->json($organization);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Organization not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * POST /api/organizations
     * Requires Organization_create permission
     */
    public function store(Request $request)
    {
        if (!$this->hasPermission('Organization_create')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to create organizations.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-zA-Z\s\'\x{2019}.,\-\x{2013}\x{2014}]+$/u',
                Rule::unique('organizations', 'name'),
            ],
            'code' => [
                'required',
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9\-]+$/',
                Rule::unique('organizations', 'code'),
            ],
            'coordinator_name' => 'nullable|string|max:100|regex:/^[a-zA-Z\s\'\-]+$/',
            'coordinator_designation' => 'required|string|max:100|regex:/^[a-zA-Z\s\'\-]+$/',
            'coordinator_phone_number' => [
                'nullable',
                'string',
                'size:10',
                'regex:/^07\d{8}$/',
                Rule::unique('organizations', 'coordinator_phone_number'),
            ],
            'coordinator_email' => [
                'nullable',
                'email',
                'max:150',
                'regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/',
                Rule::unique('organizations', 'coordinator_email'),
            ],
            'parent_id' => 'nullable|exists:organizations,id', // Changed from required to nullable
            'session_id' => 'nullable|exists:login_sessions,id',
        ], [
            'name.required' => 'Organization name is required.',
            'name.regex' => 'The organization name must only contain letters, spaces, hyphens, apostrophes, periods, and commas.',
            'name.max' => 'The organization name may not be greater than 100 characters.',
            'name.unique' => 'The organization name has already been taken.',
            'code.required' => 'Code is required.',
            'code.max' => 'The code may not be greater than 50 characters.',
            'code.regex' => 'The code must only contain letters, numbers, and hyphens.',
            'code.unique' => 'The code has already been taken.',
            'coordinator_name.regex' => 'The coordinator name must only contain letters, spaces, hyphens, and apostrophes.',
            'coordinator_name.max' => 'The coordinator name may not be greater than 100 characters.',
            'coordinator_designation.required' => 'Coordinator designation is required.',
            'coordinator_designation.regex' => 'The coordinator designation must only contain letters, spaces, hyphens, and apostrophes.',
            'coordinator_designation.max' => 'The coordinator designation may not be greater than 100 characters.',
            'coordinator_phone_number.size' => 'The coordinator phone number must be exactly 10 digits.',
            'coordinator_phone_number.regex' => 'The coordinator phone number must start with 07 followed by 8 digits (e.g., 0712345678).',
            'coordinator_phone_number.unique' => 'The coordinator phone number has already been taken.',
            'coordinator_email.email' => 'The coordinator email must be a valid email address.',
            'coordinator_email.regex' => 'The coordinator email must be in a valid format (e.g., user@example.com).',
            'coordinator_email.max' => 'The coordinator email may not be greater than 150 characters.',
            'coordinator_email.unique' => 'The coordinator email has already been taken.',
            'parent_id.exists' => 'The selected parent organization does not exist.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $validated = $validator->validated();

            // If no session_id provided or session_id is null, get current user's active session
            if (!isset($validated['session_id']) || $validated['session_id'] === null) {
                // Auto-assign the current user's active login session
                $currentUser = auth()->user();
                if ($currentUser) {
                    // Find the current user's most recent active login session (where logout_time is null)
                    // $activeSession = \App\Models\LoginSession::where('user_id', $currentUser->id)
                    //     ->whereNull('logout_time')
                    //     ->orderBy('login_time', 'desc')
                    //     ->first();

                    // if ($activeSession) {
                    //     $validated['session_id'] = $activeSession->id;
                    // } else {
                    $validated['session_id'] = 1; // Default to session 1 if no active session
                    // }
                } else {
                    $validated['session_id'] = 1; // Default to session 1 if no user
                }
            }

            $organization = Organization::create($validated);
            return response()->json([
                'success' => true,
                'message' => 'Organization created successfully',
                'data' => $organization
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create organization',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/organizations/{id}
     * Requires Organization_update permission
     */
    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('Organization_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update organizations.'
            ], 403);
        }

        try {
            $organization = Organization::findOrFail($id);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Organization not found',
                'error' => $e->getMessage()
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                'regex:/^[a-zA-Z\s\'\x{2019}.,\-\x{2013}\x{2014}]+$/u',
                Rule::unique('organizations', 'name')->ignore($organization->id),
            ],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9\-]+$/',
                Rule::unique('organizations', 'code')->ignore($organization->id),
            ],
            'coordinator_name' => 'sometimes|nullable|string|max:100|regex:/^[a-zA-Z\s\'\-]+$/',
            'coordinator_designation' => 'sometimes|required|string|max:100|regex:/^[a-zA-Z\s\'\-]+$/',
            'coordinator_phone_number' => [
                'sometimes',
                'nullable',
                'string',
                'size:10',
                'regex:/^07\d{8}$/',
                Rule::unique('organizations', 'coordinator_phone_number')->ignore($organization->id),
            ],
            'coordinator_email' => [
                'sometimes',
                'nullable',
                'email',
                'max:150',
                'regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/',
                Rule::unique('organizations', 'coordinator_email')->ignore($organization->id),
            ],
            'parent_id' => 'nullable|exists:organizations,id', // Changed from required to nullable
            'session_id' => 'nullable|exists:login_sessions,id',
        ], [
            'name.required' => 'Organization name is required.',
            'name.regex' => 'The organization name must only contain letters, spaces, hyphens, apostrophes, periods, and commas.',
            'name.max' => 'The organization name may not be greater than 100 characters.',
            'name.unique' => 'The organization name has already been taken.',
            'code.required' => 'Code is required.',
            'code.max' => 'The code may not be greater than 50 characters.',
            'code.regex' => 'The code must only contain letters, numbers, and hyphens.',
            'code.unique' => 'The code has already been taken.',
            'coordinator_name.regex' => 'The coordinator name must only contain letters, spaces, hyphens, and apostrophes.',
            'coordinator_name.max' => 'The coordinator name may not be greater than 100 characters.',
            'coordinator_designation.required' => 'Coordinator designation is required.',
            'coordinator_designation.regex' => 'The coordinator designation must only contain letters, spaces, hyphens, and apostrophes.',
            'coordinator_designation.max' => 'The coordinator designation may not be greater than 100 characters.',
            'coordinator_phone_number.size' => 'The coordinator phone number must be exactly 10 digits.',
            'coordinator_phone_number.regex' => 'The coordinator phone number must start with 07 followed by 8 digits (e.g., 0712345678).',
            'coordinator_phone_number.unique' => 'The coordinator phone number has already been taken.',
            'coordinator_email.email' => 'The coordinator email must be a valid email address.',
            'coordinator_email.regex' => 'The coordinator email must be in a valid format (e.g., user@example.com).',
            'coordinator_email.max' => 'The coordinator email may not be greater than 150 characters.',
            'coordinator_email.unique' => 'The coordinator email has already been taken.',
            'parent_id.exists' => 'The selected parent organization does not exist.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $validated = $validator->validated();

            // If session_id is explicitly provided in the request, use it
            if (isset($request->session_id)) {
                $validated['session_id'] = $request->session_id;
            }
            // If no session_id provided or session_id is null, get current user's active session
            elseif (!isset($validated['session_id']) || $validated['session_id'] === null) {
                // Auto-assign the current user's active login session
                $currentUser = auth()->user();
                if ($currentUser) {
                    // Find the current user's most recent active login session (where logout_time is null)
                    // $activeSession = \App\Models\LoginSession::where('user_id', $currentUser->id)
                    //     ->whereNull('logout_time')
                    //     ->orderBy('login_time', 'desc')
                    //     ->first();

                    // if ($activeSession) {
                    //     $validated['session_id'] = $activeSession->id;
                    // }
                }
            }

            $organization->update($validated);
            return response()->json([
                'success' => true,
                'message' => 'Organization updated successfully',
                'data' => $organization
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update organization',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/organizations/{id}
     * Requires Organization_delete permission
     */
    public function destroy($id)
    {
        if (!$this->hasPermission('Organization_delete')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have have permission to delete organizations.'
            ], 403);
        }

        try {
            $organization = Organization::findOrFail($id);
            $organization->delete();
            return response()->json([
                'success' => true,
                'message' => 'Organization deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete organization',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
