<?php
namespace App\Http\Controllers;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
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
        // // Super Admin bypass (role_id = 1)
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

    public function index(Request $request)
    {
        if (!$this->hasPermission('Security_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view permissions.'
            ], 403);
        }

        $perPage = 10;
        $query = Permission::query();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('name', 'LIKE', "%{$search}%");
        }

        $permissions = $query->paginate($perPage);
        // $permissions = $query
        //     ->orderBy('permissions.id', 'desc')
        //     ->paginate(perPage: $perPage);

        return response()->json([
            'data' => $permissions->items(),
            'current_page' => $permissions->currentPage(),
            'last_page' => $permissions->lastPage(),
            'per_page' => $permissions->perPage(),
            'total' => $permissions->total(),
            'from' => $permissions->firstItem(),
            'to' => $permissions->lastItem()
        ]);
    }
    
    public function store(Request $request)
    {
        if (!$this->hasPermission('Security_create')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to create permissions.'
            ], 403);
        }
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z_]+(?:\.[a-zA-Z_]+)*$/', // Fixed: removed comma typo
                'unique:permissions,name'
            ],
        ], [
            'name.required' => 'Permission name is required',
            'name.string' => 'Permission name must be a string',
            'name.max' => 'Permission name may not be greater than 255 characters',
            'name.regex' => 'Permission name must be in alphanumeric with underscores and dots (e.g., "Users.Create")',
            'name.unique' => 'This permission name already exists'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }
        try {
            $permission = Permission::create([
                'name' => $request->name
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Permission created successfully',
                'data' => $permission
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // Update permission
    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('Security_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update permissions.'
            ], 403);
        }
        $permission = Permission::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z_]+(?:\.[a-zA-Z_]+)*$/', // Fixed: removed comma typo
                Rule::unique('permissions', 'name')->ignore($id)
            ],
        ], [
            'name.required' => 'Permission name is required',
            'name.string' => 'Permission name must be a string',
            'name.max' => 'Permission name may not be greater than 255 characters',
            'name.regex' => 'Permission name must be in alphanumeric with underscores and dots (e.g., "Users.Create")',
            'name.unique' => 'This permission name already exists'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }
        try {
            $permission->update([
                'name' => $request->name
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Permission updated successfully',
                'data' => $permission
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // Delete permission
    public function destroy($id)
    {
        if (!$this->hasPermission('Security_delete')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to delete permissions.'
            ], 403);
        }
        
        try {
            // Find and delete the permission
            $permission = Permission::findOrFail($id);
            $permissionName = $permission->name;
            $permission->delete();
            
            // Run artisan command to reset IDs
            \Illuminate\Support\Facades\Artisan::call('permissions:reset-ids');
            
            return response()->json([
                'success' => true,
                'message' => "Permission '{$permissionName}' deleted successfully"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}