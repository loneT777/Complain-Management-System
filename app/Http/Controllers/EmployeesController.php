<?php
namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class EmployeesController extends Controller
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
     * Get all employees with search functionality
     * Requires Employee_read_all permission
     */
    public function index(Request $request)
    {
        if (!$this->hasPermission('Employee_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view all employees.'
            ], 403);
        }

        $perPage = 10;
        $query = Employee::with(['organization', 'designation', 'services', 'session']);

        // Search functionality from main branch
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'LIKE', "%{$search}%")
                    ->orWhere('last_name', 'LIKE', "%{$search}%")
                    ->orWhere('nic_no', 'LIKE', "%{$search}%")
                    ->orWhere('passport_no', 'LIKE', "%{$search}%")
                    ->orWhere('phone_no', 'LIKE', "%{$search}%")
                    ->orWhere('whatsapp_no', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $employees = $query
            ->orderBy('employees.id', 'desc')
            ->paginate(perPage: $perPage);

        return response()->json([
            'data' => $employees->items(),
            'current_page' => $employees->currentPage(),
            'last_page' => $employees->lastPage(),
            'per_page' => $employees->perPage(),
            'total' => $employees->total(),
            'from' => $employees->firstItem(),
            'to' => $employees->lastItem()
        ]);
    }

    /**
     * Get employee by NIC number.
     * Requires Employee_read_one permission
     */
    public function getByNIC($nic)
    {
        if (!$this->hasPermission('Employee_read_one')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view employee details.'
            ], 403);
        }

        try {
            $employee = Employee::with(['organization', 'designation', 'services', 'session'])
                ->where('nic_no', $nic)
                ->first();

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $employee
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created employee in storage.
     * Requires Employee_create permission
     */
    public function store(Request $request)
    {
        if (!$this->hasPermission('Employee_create')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to create employees.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|in:Mr,Mrs,Ms,Miss,Dr,Prof',
            'first_name' => 'required|string|max:100|regex:/^[\p{L} \'-]+$/u',
            'last_name' => 'required|string|max:100|regex:/^[\p{L} \'-]+$/u',
            'gender' => 'required|in:Male,Female,Other',
            'nic_no' => 'required|string|min:10|max:12|regex:/^[0-9V]+$/|unique:employees,nic_no',
            'passport_no' => 'nullable|string|min:8|max:10|regex:/^[a-zA-Z0-9]+$/|unique:employees,passport_no',
            'birthday' => 'required|date|date_format:Y-m-d|before:today',
            'phone_no' => 'nullable|string|size:10|regex:/^07\d{8}$/|unique:employees,phone_no',
            'whatsapp_no' => 'nullable|string|size:10|regex:/^07\d{8}$/|unique:employees,whatsapp_no',
            'email' => 'nullable|email|max:150|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/|unique:employees,email',
            'organization_id' => 'required|exists:organizations,id',
            'designation_id' => 'required|exists:designations,id', // Changed from nullable to required
            'service_id' => 'nullable|exists:services,id',
        ], [
            'title.required' => 'Title is required.',
            'title.in' => 'Title must be Mr, Mrs, Ms, Miss, Dr, or Prof.',
            'first_name.required' => 'First name is required.',
            'first_name.regex' => 'The first name must only contain letters, spaces, hyphens, and apostrophes.',
            'last_name.required' => 'Last name is required.',
            'last_name.regex' => 'The last name must only contain letters, spaces, hyphens, and apostrophes.',
            'gender.required' => 'Gender is required.',
            'gender.in' => 'Gender must be Male, Female, or Other.',
            'nic_no.required' => 'NIC number is required.',
            'nic_no.regex' => 'The NIC number must only contain numbers and the letter V.',
            'nic_no.min' => 'The NIC number must be at least 10 characters.',
            'nic_no.max' => 'The NIC number must not exceed 12 characters.',
            'nic_no.unique' => 'The NIC number has already been registered.',
            'passport_no.required' => 'Passport number is required.',
            'passport_no.min' => 'The passport number must be at least 8 characters.',
            'passport_no.max' => 'The passport number must not exceed 10 characters.',
            'passport_no.regex' => 'The passport number must contain only letters and numbers.',
            'passport_no.unique' => 'The passport number has already been taken.',
            'birthday.required' => 'Birthday is required.',
            'birthday.before' => 'The birthday must be a date before today.',
            'phone_no.size' => 'The phone number must be exactly 10 digits.',
            'phone_no.regex' => 'The phone number must start with 07 followed by 8 digits (e.g., 0712345678).',
            'phone_no.unique' => 'The phone number has already been registered.',
            'whatsapp_no.size' => 'The WhatsApp number must be exactly 10 digits.',
            'whatsapp_no.regex' => 'The WhatsApp number must start with 07 followed by 8 digits (e.g., 0712345678).',
            'whatsapp_no.unique' => 'The WhatsApp number has already been registered.',
            'email.email' => 'The email must be a valid email address.',
            'email.regex' => 'The email must be in a valid format (e.g., user@example.com).',
            'email.max' => 'The email may not be greater than 150 characters.',
            'email.unique' => 'The email address has already been taken.',
            'organization_id.required' => 'Organization is required.',
            'designation_id.required' => 'Designation is required.', // Added error message
            // Removed error messages for nullable fields
        ]);

        // Custom validation for full name uniqueness
        $validator->after(function ($validator) use ($request) {
            $exists = Employee::where('first_name', $request->first_name)
                ->where('last_name', $request->last_name)
                ->exists();

            if ($exists) {
                $validator->errors()->add('full_name', 'An officer with this name already exists.');
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get the validated data
            $employeeData = $validator->validated();

            // Auto-assign the current user's active login session
            $currentUser = auth()->user();
            if ($currentUser) {
                // Find the current user's most recent active login session (where logout_time is null)
                $activeSession = \App\Models\LoginSession::where('user_id', $currentUser->id)
                    ->whereNull('logout_time')
                    ->orderBy('login_time', 'desc')
                    ->first();

                if ($activeSession) {
                    $employeeData['session_id'] = $activeSession->id;
                }
            }

            $employee = Employee::create($employeeData);
            $employee->load(['organization', 'designation', 'services', 'session']);
            return response()->json([
                'success' => true,
                'message' => 'Employee created successfully',
                'data' => $employee
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified employee.
     * Requires Employee_read_one permission
     */
    public function show(Employee $employee)
    {
        if (!$this->hasPermission('Employee_read_one')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view employee details.'
            ], 403);
        }

        $employee->load(['organization', 'designation', 'services', 'session']);

        return response()->json([
            'success' => true,
            'data' => $employee
        ]);
    }

    /**
     * Update the specified employee in storage.
     * Requires Employee_update permission
     */
    public function update(Request $request, Employee $employee)
    {
        if (!$this->hasPermission('Employee_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update employees.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|in:Mr,Mrs,Ms,Miss,Dr,Prof',
            'first_name' => 'sometimes|required|string|max:100|regex:/^[\p{L} \'-]+$/u',
            'last_name' => 'sometimes|required|string|max:100|regex:/^[\p{L} \'-]+$/u',
            'gender' => 'required|in:Male,Female,Other',
            'nic_no' => [
                'sometimes',
                'required',
                'string',
                'min:10',
                'max:12',
                'regex:/^[0-9V]+$/',
                Rule::unique('employees', 'nic_no')->ignore($employee->id),
            ],
            'passport_no' => [
                'nullable',
                'string',
                'min:8',
                'max:10',
                'regex:/^[a-zA-Z0-9]+$/',
                Rule::unique('employees', 'passport_no')->ignore($employee->id),
            ],
            'birthday' => 'required|date|date_format:Y-m-d|before:today',
            'phone_no' => [
                'nullable',
                'string',
                'size:10',
                'regex:/^07\d{8}$/',
                Rule::unique('employees', 'phone_no')->ignore($employee->id),
            ],
            'whatsapp_no' => [
                'nullable',
                'string',
                'size:10',
                'regex:/^07\d{8}$/',
                Rule::unique('employees', 'whatsapp_no')->ignore($employee->id),
            ],
            'email' => [
                'nullable',
                'email',
                'max:150',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
                Rule::unique('employees', 'email')->ignore($employee->id),
            ],
            'organization_id' => 'sometimes|required|exists:organizations,id',
            'designation_id' => 'required|exists:designations,id', // Changed from nullable to required
            'service_id' => 'nullable|exists:services,id',
        ], [
            'title.required' => 'Title is required.',
            'title.in' => 'Title must be Mr, Mrs, Ms, Miss, Dr, or Prof.',
            'first_name.required' => 'First name is required.',
            'first_name.regex' => 'The first name must only contain letters, spaces, hyphens, and apostrophes.',
            'last_name.required' => 'Last name is required.',
            'last_name.regex' => 'The last name must only contain letters, spaces, hyphens, and apostrophes.',
            'gender.required' => 'Gender is required.',
            'gender.in' => 'Gender must be Male, Female, or Other.',
            'nic_no.required' => 'NIC number is required.',
            'nic_no.regex' => 'The NIC number must only contain numbers and the letter V.',
            'nic_no.min' => 'The NIC number must be at least 10 characters.',
            'nic_no.max' => 'The NIC number must not exceed 12 characters.',
            'nic_no.unique' => 'The NIC number has already been registered.',
            'passport_no.min' => 'The passport number must be at least 8 characters.',
            'passport_no.max' => 'The passport number must not exceed 10 characters.',
            'passport_no.regex' => 'The passport number must contain only letters and numbers.',
            'passport_no.unique' => 'The passport number has already been taken.',
            'birthday.required' => 'Birthday is required.',
            'birthday.before' => 'The birthday must be a date before today.',
            'phone_no.size' => 'The phone number must be exactly 10 digits.',
            'phone_no.regex' => 'The phone number must start with 07 followed by 8 digits (e.g., 0712345678).',
            'phone_no.unique' => 'The phone number has already been registered.',
            'whatsapp_no.size' => 'The WhatsApp number must be exactly 10 digits.',
            'whatsapp_no.regex' => 'The WhatsApp number must start with 07 followed by 8 digits (e.g., 0712345678).',
            'whatsapp_no.unique' => 'The WhatsApp number has already been registered.',
            'email.email' => 'The email must be a valid email address.',
            'email.regex' => 'The email must be in a valid format (e.g., user@example.com).',
            'email.max' => 'The email may not be greater than 150 characters.',
            'email.unique' => 'The email address has already been taken.',
            'organization_id.required' => 'Organization is required.',
            'designation_id.required' => 'Designation is required.', // Added error message
            // Removed error messages for nullable fields
        ]);

        // Custom validation for full name uniqueness
        $validator->after(function ($validator) use ($request, $employee) {
            $exists = Employee::where('first_name', $request->first_name)
                ->where('last_name', $request->last_name)
                ->where('id', '!=', $employee->id)
                ->exists();

            if ($exists) {
                $validator->errors()->add('full_name', 'An officer with this name already exists.');
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get the validated data
            $employeeData = $validator->validated();

            // Auto-assign the current user's active login session if not provided
            $currentUser = auth()->user();
            if ($currentUser && !isset($employeeData['session_id'])) {
                // Find the current user's most recent active login session (where logout_time is null)
                $activeSession = \App\Models\LoginSession::where('user_id', $currentUser->id)
                    ->whereNull('logout_time')
                    ->orderBy('login_time', 'desc')
                    ->first();

                if ($activeSession) {
                    $employeeData['session_id'] = $activeSession->id;
                }
            }

            $employee->update($employeeData);
            $employee->load(['organization', 'designation', 'services', 'session']);
            return response()->json([
                'success' => true,
                'message' => 'Employee updated successfully',
                'data' => $employee
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deactivate the specified employee (soft delete).
     * Requires Employee_deactivate permission
     */
    public function deactivate(Employee $employee)
    {
        if (!$this->hasPermission('Employee_deactivate')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to deactivate employees.'
            ], 403);
        }

        try {
            $employee->is_active = false;
            $employee->save();
            return response()->json([
                'success' => true,
                'message' => 'Employee deactivated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}