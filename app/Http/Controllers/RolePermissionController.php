<?php

namespace App\Http\Controllers;

use App\Models\RolePermission;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RolePermissionController extends Controller
{
    /**
     * Get all permissions for a specific role
     */
    public function show($roleId)
    {
        $role = Role::findOrFail($roleId);
        $rolePermissions = RolePermission::with('permission')
            ->where('role_id', $roleId)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rolePermissions
        ]);
    }

    /**
     * Update role permissions (bulk update)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id'
        ]);

        DB::beginTransaction();
        try {
            // Delete existing permissions for this role
            RolePermission::where('role_id', $validated['role_id'])->delete();

            // Insert new permissions
            $rolePermissions = [];
            foreach ($validated['permission_ids'] as $permissionId) {
                $rolePermissions[] = [
                    'role_id' => $validated['role_id'],
                    'permission_id' => $permissionId
                ];
            }

            RolePermission::insert($rolePermissions);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role permissions updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating role permissions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all roles with their permissions with pagination and search
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search', '');

            $query = Role::with(['permissions']);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%")
                        ->orWhereHas('permissions', function ($subQ) use ($search) {
                            $subQ->where('name', 'LIKE', "%{$search}%")
                                ->orWhere('code', 'LIKE', "%{$search}%");
                        });
                });
            }

            $roles = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $roles->items(),
                'pagination' => [
                    'current_page' => $roles->currentPage(),
                    'last_page' => $roles->lastPage(),
                    'per_page' => $roles->perPage(),
                    'total' => $roles->total(),
                    'from' => $roles->firstItem(),
                    'to' => $roles->lastItem()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching role permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
