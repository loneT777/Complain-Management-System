<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
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
     * Get current user's permissions
     */
    public function permissions()
    {
        $user = auth()->user();
        
        // Get all permissions for the user's role
        $permissions = DB::table('role_permissions')
            ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
            ->where('role_permissions.role_id', $user->role_id)
            ->pluck('permissions.name')
            ->toArray();
        
        return response()->json([
            'permissions' => $permissions
        ]);
    }

    public function index(Request $request)
    {
        if (!$this->hasPermission('Security_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view users.'
            ], 403);
        }
        
        $query = User::with('role', 'designation');

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'LIKE', "%{$search}%")
                  ->orWhere('full_name', 'LIKE', "%{$search}%");
            });
        }

        $users = $query->paginate(10);
        return response()->json($users);
    }

    public function store(Request $request)
    {
        if (!$this->hasPermission('Security_create')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to create users.'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users,username|regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/',
            'full_name' => 'required|string|max:255|regex:/^[A-Za-z\s\.\-]+$/',
            'password' => 'required|string|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'role_id' => 'required|exists:roles,id',
            'designation_id' => 'nullable|exists:designations,id'
        ], [
            'username.required' => 'Username is required',
            'username.regex' => 'Please enter a valid email address',
            'full_name.required' => 'Full name is required',
            'full_name.regex' => 'Full name can only contain letters, spaces, periods, and hyphens',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 6 characters',
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'role_id.required' => 'Role is required',
            'designation_id.exists' => 'Selected designation does not exist'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'username' => $request->username,
            'full_name' => $request->full_name,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'designation_id' => $request->designation_id,
            'is_active' => true  // New users are active by default
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user->load('role', 'designation')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('Security_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update users.'
            ], 403);
        }
        
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/|unique:users,username,'.$id,
            'full_name' => 'required|string|max:255|regex:/^[A-Za-z\s\.\-]+$/',
            'role_id' => 'required|exists:roles,id',
            'designation_id' => 'nullable|exists:designations,id',
            'password' => 'nullable|string|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
        ], [
            'username.required' => 'Username is required',
            'username.regex' => 'Please enter a valid email address',
            'full_name.required' => 'Full name is required',
            'full_name.regex' => 'Full name can only contain letters, spaces, periods, and hyphens',
            'role_id.required' => 'Role is required',
            'designation_id.exists' => 'Selected designation does not exist',
            'password.min' => 'Password must be at least 6 characters',
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = [
            'username' => $request->username,
            'full_name' => $request->full_name,
            'role_id' => $request->role_id,
            'designation_id' => $request->designation_id
        ];

        // Only hash and update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user->load('role', 'designation')
        ]);
    }

    // Toggle user active/inactive status
    public function toggleStatus($id)
    {
        if (!$this->hasPermission('Security_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update user status.'
            ], 403);
        }
        
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;  // Toggle the value
        $user->save();  // Save the change

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => $user->load('role', 'designation')
        ]);
    }

    // Get all roles for dropdown
    public function getRoles()
    {
        if (!$this->hasPermission('Security_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view roles.'
            ], 403);
        }
        
        $roles = Role::all();
        return response()->json($roles);
    }
}