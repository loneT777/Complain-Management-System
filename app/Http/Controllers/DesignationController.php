<?php
namespace App\Http\Controllers;

use App\Models\Designation;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class DesignationController extends Controller
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
     * Get all designations
     * Requires Designation_read_all permission
     */
    public function index(Request $request)
    {
        if (!$this->hasPermission('Settings_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view designations.'
            ], 403);
        }

        $perPage = 10; // Changed from 5 to 10
        $query = Designation::query();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('code', 'LIKE', "%{$search}%");
            });
        }

        // $designations = $query->paginate($perPage);
        $designations = $query
            ->orderBy('designations.id', 'desc')
            ->paginate(perPage: $perPage);

        return response()->json([
            'data' => $designations->items(),
            'current_page' => $designations->currentPage(),
            'last_page' => $designations->lastPage(),
            'per_page' => $designations->perPage(),
            'total' => $designations->total(),
            'from' => $designations->firstItem(),
            'to' => $designations->lastItem()
        ]);
    }

    /**
     * Store new designation
     * Requires Designation_create permission
     */
    public function store(Request $request)
    {
        if (!$this->hasPermission('Settings_create')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to create designations.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:100',
                'regex:/^[\p{L} \'.\-]+$/u',
                Rule::unique('designations', 'name'),
            ],
            'code' => [
                'required',
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9\-]+$/',
                Rule::unique('designations', 'code'),
            ],
        ], [
            'name.required' => 'Designation name is required.',
            'name.string' => 'Designation name must be a string.',
            'name.max' => 'Designation name may not be greater than 100 characters.',
            'name.regex' => 'Designation name must only contain letters, spaces, hyphens, apostrophes, and periods.',
            'name.unique' => 'This designation name already exists.',
            'code.required' => 'Designation code is required.',
            'code.string' => 'Designation code must be a string.',
            'code.max' => 'Designation code may not be greater than 50 characters.',
            'code.regex' => 'Designation code must only contain letters, numbers, and hyphens.',
            'code.unique' => 'This designation code already exists.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $designation = Designation::create($validator->validated());
            return response()->json([
                'success' => true,
                'message' => 'Designation created successfully',
                'data' => $designation
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create designation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific designation
     * Requires Designation_read_one permission
     */
    public function show($id)
    {
        if (!$this->hasPermission('Settings_read_one')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view designation details.'
            ], 403);
        }

        try {
            $designation = Designation::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $designation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Designation not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update an existing designation
     * Requires Designation_update permission
     */
    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('Settings_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update designations.'
            ], 403);
        }

        try {
            $designation = Designation::findOrFail($id);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Designation not found',
                'error' => $e->getMessage()
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                'regex:/^[\p{L} \'.\-]+$/u',
                Rule::unique('designations', 'name')->ignore($id),
            ],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9\-]+$/',
                Rule::unique('designations', 'code')->ignore($id),
            ],
        ], [
            'name.required' => 'Designation name is required.',
            'name.string' => 'Designation name must be a string.',
            'name.max' => 'Designation name may not be greater than 100 characters.',
            'name.regex' => 'Designation name must only contain letters, spaces, hyphens, apostrophes, and periods.',
            'name.unique' => 'This designation name already exists.',
            'code.required' => 'Designation code is required.',
            'code.string' => 'Designation code must be a string.',
            'code.max' => 'Designation code may not be greater than 50 characters.',
            'code.regex' => 'Designation code must only contain letters, numbers, and hyphens.',
            'code.unique' => 'This designation code already exists.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $designation->update($validator->validated());
            return response()->json([
                'success' => true,
                'message' => 'Designation updated successfully',
                'data' => $designation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update designation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a designation
     * Requires Designation_delete permission
     */
    public function destroy($id)
    {
        if (!$this->hasPermission('Settings_delete')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to delete designations.'
            ], 403);
        }

        try {
            $designation = Designation::findOrFail($id);
            $designation->delete();
            return response()->json([
                'success' => true,
                'message' => 'Designation deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete designation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}