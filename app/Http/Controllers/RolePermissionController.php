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
     * Get all roles with their permissions
     */
    public function index()
    {
        $roles = Role::with(['permissions'])->get();
        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }
}
