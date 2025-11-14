<?php
namespace App\Http\Controllers;

use App\Models\Services;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class ServicesController extends Controller
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
     * Display a listing of the services
     * Requires Service_read_all permission
     */
    public function index(Request $request)
    {
        if (!$this->hasPermission('Settings_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view services.'
            ], 403);
        }

        $perPage = 10;
        $query = Services::query();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('code', 'LIKE', "%{$search}%");
            });
        }

        // $services = $query->paginate($perPage);
        $services = $query
            ->orderBy('services.id', 'desc')
            ->paginate(perPage: $perPage);

        return response()->json([
            'data' => $services->items(),
            'current_page' => $services->currentPage(),
            'last_page' => $services->lastPage(),
            'per_page' => $services->perPage(),
            'total' => $services->total(),
            'from' => $services->firstItem(),
            'to' => $services->lastItem()
        ]);
    }
    
    /**
     * Store a newly created service in storage
     * Requires Service_create permission
     */
    public function store(Request $request)
    {
        if (!$this->hasPermission('Settings_create')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to create services.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:100',
                'regex:/^[\p{L} \'\x{2019}.\-\x{2013}\x{2014}]+$/u',
                Rule::unique('services', 'name'),
            ],
            'code' => [
                'nullable',
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9\-]+$/',
                Rule::unique('services', 'code'),
            ],
        ], [
            'name.required' => 'Service name is required.',
            'name.string' => 'Service name must be a string.',
            'name.max' => 'Service name may not be greater than 100 characters.',
            'name.regex' => 'Service name must only contain letters, spaces, hyphens, apostrophes, and periods.',
            'name.unique' => 'This service name already exists.',
            'code.string' => 'Service code must be a string.',
            'code.max' => 'Service code may not be greater than 50 characters.',
            'code.regex' => 'Service code must only contain letters, numbers, and hyphens.',
            'code.unique' => 'This service code already exists.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $service = Services::create($validator->validated());
            return response()->json([
                'success' => true,
                'message' => 'Service created successfully',
                'data' => $service
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create service',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Display the specified service
     * Requires Service_read_one permission
     */
    public function show($id)
    {
        if (!$this->hasPermission('Settings_read_one')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view service details.'
            ], 403);
        }

        try {
            $service = Services::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $service
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    
    /**
     * Update the specified service in storage
     * Requires Service_update permission
     */
    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('Settings_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update services.'
            ], 403);
        }

        try {
            $service = Services::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:100',
                    'regex:/^[\p{L} \'\x{2019}.\-\x{2013}\x{2014}]+$/u',
                    Rule::unique('services', 'name')->ignore($id),
                ],
                'code' => [
                    'nullable',
                    'string',
                    'max:50',
                    'regex:/^[a-zA-Z0-9\-]+$/',
                    Rule::unique('services', 'code')->ignore($id),
                ],
            ], [
                'name.required' => 'Service name is required.',
                'name.string' => 'Service name must be a string.',
                'name.max' => 'Service name may not be greater than 100 characters.',
                'name.regex' => 'Service name must only contain letters, spaces, hyphens, apostrophes, and periods.',
                'name.unique' => 'This service name already exists.',
                'code.string' => 'Service code must be a string.',
                'code.max' => 'Service code may not be greater than 50 characters.',
                'code.regex' => 'Service code must only contain letters, numbers, and hyphens.',
                'code.unique' => 'This service code already exists.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            $service->update($validator->validated());
            return response()->json([
                'success' => true,
                'message' => 'Service updated successfully',
                'data' => $service
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update service',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Remove the specified service from storage
     * Requires Service_delete permission
     */
    public function destroy($id)
    {
        if (!$this->hasPermission('Settings_delete')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to delete services.'
            ], 403);
        }

        try {
            $service = Services::findOrFail($id);
            $service->delete();
            return response()->json([
                'success' => true,
                'message' => 'Service deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete service',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}