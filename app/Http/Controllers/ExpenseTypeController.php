<?php
namespace App\Http\Controllers;

use App\Models\ExpenseType;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class ExpenseTypeController extends Controller
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
     * Get all expense types
     * Requires ExpenseType_read_all permission
     */
    public function index(Request $request)
    {
        if (!$this->hasPermission('Settings_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view expense types.'
            ], 403);
        }

        $perPage = 10;
        $query = ExpenseType::query();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%");
            });
        }

         $expenseTypes = $query->paginate($perPage);
        // $expenseTypes = $query
        //     ->orderBy('expenseTypes.id', 'desc')
        //     ->paginate(perPage: $perPage);

        return response()->json([
            'data' => $expenseTypes->items(),
            'current_page' => $expenseTypes->currentPage(),
            'last_page' => $expenseTypes->lastPage(),
            'per_page' => $expenseTypes->perPage(),
            'total' => $expenseTypes->total(),
            'from' => $expenseTypes->firstItem(),
            'to' => $expenseTypes->lastItem()
        ]);
    }
    
    /**
     * Get all expense types without pagination (for dropdowns)
     * Requires ExpenseType_read_all permission
     */
    public function getAll()
    {
        if (!$this->hasPermission('Settings_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view expense types.'
            ], 403);
        }

        $expenseTypes = ExpenseType::all();
        return response()->json($expenseTypes);
    }
    
    /**
     * Get a specific expense type
     * Requires ExpenseType_read_one permission
     */
    public function show($id)
    {
        if (!$this->hasPermission('Settings_read_one')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view expense type details.'
            ], 403);
        }

        try {
            $expenseType = ExpenseType::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $expenseType
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Expense type not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    
    /**
     * Store new expense type
     * Requires ExpenseType_create permission
     */
    public function store(Request $request)
    {
        if (!$this->hasPermission('Settings_create')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to create expense types.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:100',
                'regex:/^[A-Za-z\s\.\']+$/', // Only letters, spaces, periods, and apostrophes
                Rule::unique('expenses_types', 'name'), // Changed table name from expense_types to expenses_types
            ],
        ], [
            'name.required' => 'Expense type name is required.',
            'name.string' => 'Expense type name must be a string.',
            'name.max' => 'Expense type name may not be greater than 100 characters.',
            'name.regex' => 'Expense type name may only contain letters, spaces, periods, and apostrophes.',
            'name.unique' => 'This expense type name already exists.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $expenseType = ExpenseType::create($validator->validated());
            return response()->json([
                'success' => true,
                'message' => 'Expense type created successfully',
                'data' => $expenseType
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create expense type',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update an existing expense type
     * Requires ExpenseType_update permission
     */
    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('Settings_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update expense types.'
            ], 403);
        }

        try {
            $expenseType = ExpenseType::findOrFail($id);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Expense type not found',
                'error' => $e->getMessage()
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                'regex:/^[A-Za-z\s\.\']+$/', // Only letters, spaces, periods, and apostrophes
                Rule::unique('expenses_types', 'name')->ignore($id), // Changed table name from expense_types to expenses_types
            ],
        ], [
            'name.required' => 'Expense type name is required.',
            'name.string' => 'Expense type name must be a string.',
            'name.max' => 'Expense type name may not be greater than 100 characters.',
            'name.regex' => 'Expense type name may only contain letters, spaces, periods, and apostrophes.',
            'name.unique' => 'This expense type name already exists.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $expenseType->update($validator->validated());
            return response()->json([
                'success' => true,
                'message' => 'Expense type updated successfully',
                'data' => $expenseType
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update expense type',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete an expense type
     * Requires ExpenseType_delete permission
     */
    public function destroy($id)
    {
        if (!$this->hasPermission('Settings_delete')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to delete expense types.'
            ], 403);
        }

        try {
            $expenseType = ExpenseType::findOrFail($id);
            $expenseType->delete();
            return response()->json([
                'success' => true,
                'message' => 'Expense type deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete expense type',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}