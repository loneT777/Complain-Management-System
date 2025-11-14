<?php
namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\ApplicationFile;
use App\Models\Employee;
use App\Models\ExpenseType;
use App\Models\GoslFundType;
use App\Models\ApplicationGoslFund;
use App\Models\Status;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class ApplicationController extends Controller
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
     * Display a listing of applications with pagination and search.
     * Requires Application_read_all permission
     */
    public function index(Request $request)
    {
        if (!$this->hasPermission('Application_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view all applications.'
            ], 403);
        }

        $perPage = 10;
        $query = Application::with([
            'employee', 
            'organization', 
            'department',
            'expenseTypes',
            'goslFunds.goslFundType',
            'travellingHistories',  // Load ALL travel histories including auto-saved ones
            'statuses'
        ])->where('application_type', '1'); // Filter for application_type = 1 in the query

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('employee', function ($query) use ($search) {
                    $query->where('first_name', 'LIKE', "%{$search}%")
                          ->orWhere('last_name', 'LIKE', "%{$search}%")
                          ->orWhere('nic_no', 'LIKE', "%{$search}%");
                })
                ->orWhereHas('organization', function ($query) use ($search) {
                    $query->where('name', 'LIKE', "%{$search}%");
                })
                ->orWhere('purpose_of_travel', 'LIKE', "%{$search}%")
                ->orWhere('countries_visited', 'LIKE', "%{$search}%");
            });
        }

        // Filter by status if provided
        if ($request->has('status') && $request->status != '') {
            $statusFilter = $request->status;
            $query->whereHas('statuses', function ($q) use ($statusFilter) {
                // Get the latest status for each application
                $q->whereRaw('application_statuses.id = (
                    SELECT id 
                    FROM application_statuses 
                    WHERE application_statuses.application_id = applications.id
                    ORDER BY application_statuses.id DESC
                    LIMIT 1
                )');
                
                // Match by status ID or name or code
                $q->where(function($query) use ($statusFilter) {
                    $query->where('statuses.id', $statusFilter)
                          ->orWhereRaw('LOWER(statuses.name) = ?', [strtolower($statusFilter)])
                          ->orWhereRaw('LOWER(statuses.code) = ?', [strtolower($statusFilter)]);
                });
            });
        }

        // $applications 
        $applications = $query
            ->orderBy('applications.id', 'desc')
            ->paginate(perPage: $perPage);
        
        foreach ($applications->items() as $app) {
            $lastStatus = $app->statuses()->orderByPivot('created_date', 'desc')->first();
            $app->last_status = $lastStatus ? $lastStatus->name : 'Pending';
            $app->last_status_remark = $lastStatus ? $lastStatus->pivot->remark : null;
            
            // Get user who updated the status
            if ($lastStatus && $lastStatus->pivot->session_id) {
                $loginSession = \App\Models\LoginSession::with('user.role')->find($lastStatus->pivot->session_id);
                if ($loginSession && $loginSession->user) {
                    $roleName = $loginSession->user->role ? $loginSession->user->role->name : '';
                    $app->last_status_updated_by = $loginSession->user->full_name . ($roleName ? ' (' . $roleName . ')' : '');
                } else {
                    $app->last_status_updated_by = null;
                }
            } else {
                $app->last_status_updated_by = null;
            }

            // Load files for the application
            $app->load('files');
            // Alias files as attachments for frontend compatibility
            $app->attachments = $app->files;
        }
        
        return response()->json([
            'data' => $applications->items(),
            'current_page' => $applications->currentPage(),
            'last_page' => $applications->lastPage(),
            'per_page' => $applications->perPage(),
            'total' => $applications->total(),
            'from' => $applications->firstItem(),
            'to' => $applications->lastItem()
        ]);
    }
    
    /**
     * Display the specified application.
     * Requires Application_read_one permission
     */
    public function show($id)
    {
        if (!$this->hasPermission('Application_read_one')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view application details.'
            ], 403);
        }

        try {
            $application = Application::with([
                'employee', 
                'organization', 
                'department',
                'expenseTypes',
                'goslFunds.goslFundType',
                'travellingHistories',  // Load ALL travel histories including auto-saved ones
                'statuses'
            ])->find($id);
            
            if (!$application) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found'
                ], 404);
            }
            
            $lastStatus = $application->statuses()->orderByPivot('created_date', 'desc')->first();
            $application->last_status = $lastStatus ? $lastStatus->name : 'Pending';
            
            // Get user who updated the status
            if ($lastStatus && $lastStatus->pivot->session_id) {
                $loginSession = \App\Models\LoginSession::with('user.role')->find($lastStatus->pivot->session_id);
                if ($loginSession && $loginSession->user) {
                    $roleName = $loginSession->user->role ? $loginSession->user->role->name : '';
                    $application->last_status_updated_by = $loginSession->user->full_name . ($roleName ? ' (' . $roleName . ')' : '');
                } else {
                    $application->last_status_updated_by = null;
                }
            } else {
                $application->last_status_updated_by = null;
            }

            // Alias files as attachments for frontend compatibility
            $application->load('files');
            $application->attachments = $application->files;
            
            return response()->json([
                'success' => true,
                'data' => $application
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch application',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Store a newly created application in storage.
     * Requires Application_create permission
     */
    public function store(Request $request)
    {
        if (!$this->hasPermission('Application_create')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to create applications.'
            ], 403);
        }

        // Enhanced validation with date comparisons
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|exists:login_sessions,id',
            'employee_id' => 'required|exists:employees,id',
            'organization_id' => 'required|exists:organizations,id',
            'awarding_agency' => 'nullable|string|max:100',
            'countries_visited' => 'required|string|max:150',
            'purpose_of_travel' => 'required|string',
            'departure_date' => [
                'required',
                'date',
                'date_format:Y-m-d'
            ],
            'arrival_date' => [
                'required',
                'date', 
                'date_format:Y-m-d',
                'after:departure_date'
            ],
            'previous_report_submitted' => 'required|boolean',
            'application_type' => 'required|in:1,2',
            'loan_particulars' => 'nullable|string',
            'commencement_date' => [
                'required',
                'date',
                'date_format:Y-m-d',
                'after:departure_date',
                'before:completion_date'
            ],
            'completion_date' => [
                'required', 
                'date',
                'date_format:Y-m-d',
                'after:commencement_date',
                'before:arrival_date'
            ],
            'foreign_contact_data' => 'required|string',
            'coverup_duty' => 'required|string|max:200',
            'expenses_met' => 'required|array|min:1',
            'expenses_met.*.expenses_type_id' => 'required_with:expenses_met|exists:expenses_types,id',
            'expenses_met.*.is_checked' => 'required_with:expenses_met|boolean',
            'gosl_funds' => 'nullable|array',
            'gosl_funds.*.gosl_fund_type_id' => 'required_with:gosl_funds|exists:gosl_fund_types,id',
            // Amount should only be required when the fund is selected (is_selected = true).
            // We'll validate amount presence/positivity in the after() callback below.
            'gosl_funds.*.amount' => 'nullable|numeric|min:0',
            'travelling_histories' => 'nullable|array',
            'travelling_histories.*.year' => 'required_with:travelling_histories|integer|min:1900|max:' . (date('Y') + 1),
            'travelling_histories.*.purpose_of_travel' => 'required_with:travelling_histories.*.year|string|max:255',
            'travelling_histories.*.travelling_start_date' => [
                'required_with:travelling_histories.*.year',
                'date',
                'date_format:Y-m-d',
                'before:travelling_histories.*.travelling_end_date'
            ],
            'travelling_histories.*.travelling_end_date' => [
                'required_with:travelling_histories.*.travelling_start_date',
                'date',
                'date_format:Y-m-d',
                'after:travelling_histories.*.travelling_start_date'
            ],
            'travelling_histories.*.country' => 'required_with:travelling_histories.*.year|string|max:100'
        ], [
            'arrival_date.after' => 'Return date must be after departure date',
            'commencement_date.after' => 'Course commencement date must be after departure date',
            'commencement_date.before' => 'Course commencement date must be before completion date',
            'completion_date.after' => 'Course completion date must be after commencement date',
            'completion_date.before' => 'Course completion date must be before return date',
            'travelling_histories.*.travelling_end_date.after' => 'Travel end date must be after start date',
            'session_id.required' => 'Session is required.',
            'employee_id.required' => 'Employee is required.',
            'organization_id.required' => 'Organization is required.',
            'countries_visited.required' => 'Countries visited is required.',
            'purpose_of_travel.required' => 'Purpose of travel is required.',
            'departure_date.required' => 'Departure date is required.',
            'arrival_date.required' => 'Arrival date is required.',
            'previous_report_submitted.required' => 'Previous report submission status is required.',
            'application_type.required' => 'Application type is required.',
            'commencement_date.required' => 'Course commencement date is required.',
            'completion_date.required' => 'Course completion date is required.',
            'foreign_contact_data.required' => 'Foreign contact data is required.',
            'coverup_duty.required' => 'Coverup duty arrangements are required.',
            'expenses_met.required' => 'At least one expense type must be selected.',
            'expenses_met.min' => 'At least one expense type must be selected.',
            'travelling_histories.*.year.required_with' => 'Year is required for travel history',
            'travelling_histories.*.purpose_of_travel.required_with' => 'Purpose is required for travel history',
            'travelling_histories.*.travelling_start_date.required_with' => 'Start date is required for travel history',
            'travelling_histories.*.travelling_end_date.required_with' => 'End date is required for travel history',
            'travelling_histories.*.country.required_with' => 'Country is required for travel history'
        ]);

            // Custom validation for at least one expense type checked
            $validator->after(function ($validator) use ($request) {
            if ($request->has('expenses_met') && is_array($request->expenses_met)) {
                $hasCheckedExpense = false;
                foreach ($request->expenses_met as $expense) {
                    if (isset($expense['is_checked']) && ($expense['is_checked'] === true || $expense['is_checked'] === '1' || $expense['is_checked'] === 1)) {
                        $hasCheckedExpense = true;
                        break;
                    }
                }
                if (!$hasCheckedExpense) {
                    $validator->errors()->add('expenses_met', 'At least one expense type must be selected.');
                }
            }

                // Custom validation: if a GOSL fund row is selected (is_selected), amount is required and must be > 0
                if ($request->has('gosl_funds') && is_array($request->gosl_funds)) {
                    foreach ($request->gosl_funds as $index => $fund) {
                        if (isset($fund['is_selected']) && ($fund['is_selected'] === true || $fund['is_selected'] === 1 || $fund['is_selected'] === '1')) {
                            if (!isset($fund['amount']) || $fund['amount'] === '' || !is_numeric($fund['amount']) || floatval($fund['amount']) <= 0) {
                                $validator->errors()->add(
                                    "gosl_funds.$index.amount",
                                    "Amount is required and must be greater than 0 for selected GOSL fund at row " . ($index + 1)
                                );
                            }
                        }
                    }
                }

            // Custom validation for complete travel history records
            if ($request->has('travelling_histories') && is_array($request->travelling_histories)) {
                foreach ($request->travelling_histories as $index => $history) {
                    $hasPartialData = !empty($history['year']) || !empty($history['purpose_of_travel']) || 
                                     !empty($history['travelling_start_date']) || !empty($history['travelling_end_date']) || 
                                     !empty($history['country']);
                    
                    $hasAllData = !empty($history['year']) && !empty($history['purpose_of_travel']) && 
                                 !empty($history['travelling_start_date']) && !empty($history['travelling_end_date']) && 
                                 !empty($history['country']);
                    
                    if ($hasPartialData && !$hasAllData) {
                        $validator->errors()->add(
                            "travelling_histories.$index", 
                            "All fields must be filled for travel history record " . ($index + 1)
                        );
                    }
                }
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Prepare data for application creation
            $applicationData = $request->except(['expense_types', 'gosl_funds', 'expenses_met', 'travelling_histories']);
            
            // Create the application
            $application = Application::create($applicationData);
            
            // Set default status to pending
            $pendingStatus = Status::firstOrCreate(['name' => 'pending'], ['code' => 'pending']);
            $application->statuses()->attach($pendingStatus->id, [
                'session_id' => $applicationData['session_id'],
                'remark' => null,
                'created_date' => now()
            ]);

            // Handle file attachments
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    // Get original name and extension
                    $originalName = $file->getClientOriginalName();
                    $extension = $file->getClientOriginalExtension();
                    
                    // Remove extension from original name
                    $nameWithoutExt = pathinfo($originalName, PATHINFO_FILENAME);
                    
                    // Generate unique filename WITHOUT extension
                    $filename = time() . '_' . uniqid() . '_' . $nameWithoutExt;
                    
                    // Store file in storage/app/public/application_files WITH extension
                    $path = $file->storeAs('application_files', $filename . '.' . $extension, 'public');
                    
                    // Save file record in database (filename without extension, extension separate)
                    ApplicationFile::create([
                        'application_id' => $application->id,
                        'file_name' => $filename,
                        'extension' => $extension,
                    ]);
                }
            }
            
            // Handle expense types - support both formats
            if ($request->has('expense_types') && is_array($request->expense_types)) {
                $application->syncExpenseTypes($request->expense_types);
            } elseif ($request->has('expenses_met') && is_array($request->expenses_met)) {
                // Handle the expenses_met format from frontend
                $selectedExpenseTypes = [];
                foreach ($request->expenses_met as $expense) {
                    if (isset($expense['is_checked']) && $expense['is_checked'] && isset($expense['expenses_type_id'])) {
                        $selectedExpenseTypes[] = $expense['expenses_type_id'];
                    }
                }
                if (!empty($selectedExpenseTypes)) {
                    $application->syncExpenseTypes($selectedExpenseTypes);
                }
            }
            
            // Handle GOSL funds if provided
            if ($request->has('gosl_funds') && is_array($request->gosl_funds)) {
                $goslFundsToSave = [];
                foreach ($request->gosl_funds as $fund) {
                    if (isset($fund['is_selected']) && $fund['is_selected'] && isset($fund['amount']) && $fund['amount'] > 0) {
                        $goslFundsToSave[] = [
                            'gosl_fund_type_id' => $fund['gosl_fund_type_id'],
                            'amount' => $fund['amount']
                        ];
                    }
                }
                if (!empty($goslFundsToSave)) {
                    $application->syncGoslFunds($goslFundsToSave);
                }
            }
            
            // Save travelling histories (Section 7) - only if all fields are filled
            if ($request->has('travelling_histories') && is_array($request->travelling_histories)) {
                foreach ($request->travelling_histories as $history) {
                    $hasAllData = !empty($history['year']) && !empty($history['purpose_of_travel']) && 
                                 !empty($history['travelling_start_date']) && !empty($history['travelling_end_date']) && 
                                 !empty($history['country']);
                    
                    if ($hasAllData) {
                        $application->travellingHistories()->create([
                            'year' => $history['year'],
                            'purpose_of_travel' => $history['purpose_of_travel'],
                            'travelling_start_date' => $history['travelling_start_date'],
                            'travelling_end_date' => $history['travelling_end_date'],
                            'country' => $history['country'],
                            'is_auto_saved' => false  // Manual entry from Section 7
                        ]);
                    }
                }
            }
            
            // Automatically save current application details to travelling_histories table
            $year = date('Y', strtotime($request->departure_date));
            DB::insert(
                'INSERT INTO travelling_histories (application_id, year, purpose_of_travel, travelling_start_date, travelling_end_date, country, is_auto_saved) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    $application->id,
                    $year,
                    $request->purpose_of_travel,
                    $request->departure_date,
                    $request->arrival_date,
                    $request->countries_visited,
                    1  // Mark as auto-saved
                ]
            );
            
            // Load relationships for response - only load manual travel histories (not auto-saved)
            $application->load([
                'employee', 
                'organization', 
                'department', 
                'expenseTypes', 
                'goslFunds.goslFundType', 
                'statuses',
                'travellingHistories',  // Load ALL travel histories including auto-saved ones
                'files'
            ]);

            // Alias files as attachments for frontend compatibility
            $application->attachments = $application->files;
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Application created successfully',
                'data' => $application
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create application',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update the specified application in storage.
     * Requires Application_update permission
     */
    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('Application_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update applications.'
            ], 403);
        }
        
        $application = Application::find($id);
        
        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found'
            ], 404);
        }
        
        // Enhanced validation with date comparisons
        $validator = Validator::make($request->all(), [
            'session_id' => 'sometimes|required|exists:login_sessions,id',
            'employee_id' => 'sometimes|required|exists:employees,id',
            'organization_id' => 'sometimes|required|exists:organizations,id',
            'awarding_agency' => 'nullable|string|max:100',
            'countries_visited' => 'sometimes|required|string|max:150',
            'purpose_of_travel' => 'sometimes|required|string',
            'departure_date' => [
                'sometimes',
                'required',
                'date',
                'date_format:Y-m-d'
            ],
            'arrival_date' => [
                'sometimes',
                'required',
                'date',
                'date_format:Y-m-d',
                'after:departure_date'
            ],
            'previous_report_submitted' => 'sometimes|required|boolean',
            'application_type' => 'sometimes|required|in:1,2',
            'loan_particulars' => 'nullable|string',
            'commencement_date' => [
                'sometimes',
                'required',
                'date',
                'date_format:Y-m-d',
                'after:departure_date',
                'before:completion_date'
            ],
            'completion_date' => [
                'sometimes',
                'required',
                'date',
                'date_format:Y-m-d',
                'after:commencement_date',
                'before:arrival_date'
            ],
            'foreign_contact_data' => 'sometimes|required|string',
            'coverup_duty' => 'sometimes|required|string|max:200',
            'expenses_met' => 'sometimes|required|array|min:1',
            'expenses_met.*.expenses_type_id' => 'required_with:expenses_met|exists:expenses_types,id',
            'expenses_met.*.is_checked' => 'required_with:expenses_met|boolean',
            'gosl_funds' => 'nullable|array',
            'gosl_funds.*.gosl_fund_type_id' => 'required_with:gosl_funds|exists:gosl_fund_types,id',
            // Amount should only be required when the fund row is selected (is_selected = true).
            // We'll validate presence and positivity in the after() callback below.
            'gosl_funds.*.amount' => 'nullable|numeric|min:0',
            'travelling_histories' => 'nullable|array',
            'travelling_histories.*.year' => 'required_with:travelling_histories|integer|min:1900|max:' . (date('Y') + 1),
            'travelling_histories.*.purpose_of_travel' => 'required_with:travelling_histories.*.year|string|max:255',
            'travelling_histories.*.travelling_start_date' => [
                'required_with:travelling_histories.*.year',
                'date',
                'date_format:Y-m-d',
                'before:travelling_histories.*.travelling_end_date'
            ],
            'travelling_histories.*.travelling_end_date' => [
                'required_with:travelling_histories.*.travelling_start_date',
                'date',
                'date_format:Y-m-d',
                'after:travelling_histories.*.travelling_start_date'
            ],
            'travelling_histories.*.country' => 'required_with:travelling_histories.*.year|string|max:100',
            'attachments.*' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120', // 5MB max per file
            'files_to_delete' => 'nullable|array',
            'files_to_delete.*' => 'nullable|integer|exists:application_files,id'
        ], [
            'arrival_date.after' => 'Return date must be after departure date',
            'commencement_date.after' => 'Course commencement date must be after departure date',
            'commencement_date.before' => 'Course commencement date must be before completion date',
            'completion_date.after' => 'Course completion date must be after commencement date',
            'completion_date.before' => 'Course completion date must be before return date',
            'travelling_histories.*.travelling_end_date.after' => 'Travel end date must be after start date',
            'session_id.required' => 'Session is required.',
            'employee_id.required' => 'Employee is required.',
            'organization_id.required' => 'Organization is required.',
            'countries_visited.required' => 'Countries visited is required.',
            'purpose_of_travel.required' => 'Purpose of travel is required.',
            'departure_date.required' => 'Departure date is required.',
            'arrival_date.required' => 'Arrival date is required.',
            'previous_report_submitted.required' => 'Previous report submission status is required.',
            'application_type.required' => 'Application type is required.',
            'commencement_date.required' => 'Course commencement date is required.',
            'completion_date.required' => 'Course completion date is required.'
        ]);

        // Custom validation for at least one expense type checked
        $validator->after(function ($validator) use ($request) {
            if ($request->has('expenses_met') && is_array($request->expenses_met)) {
                $hasCheckedExpense = false;
                foreach ($request->expenses_met as $expense) {
                    if (isset($expense['is_checked']) && ($expense['is_checked'] === true || $expense['is_checked'] === '1' || $expense['is_checked'] === 1)) {
                        $hasCheckedExpense = true;
                        break;
                    }
                }
                if (!$hasCheckedExpense) {
                    $validator->errors()->add('expenses_met', 'At least one expense type must be selected.');
                }
            }

            // If a GOSL fund row is selected (is_selected), the amount must be provided and > 0
            if ($request->has('gosl_funds') && is_array($request->gosl_funds)) {
                foreach ($request->gosl_funds as $index => $fund) {
                    if (isset($fund['is_selected']) && ($fund['is_selected'] === true || $fund['is_selected'] === 1 || $fund['is_selected'] === '1')) {
                        if (!isset($fund['amount']) || $fund['amount'] === '' || !is_numeric($fund['amount']) || floatval($fund['amount']) <= 0) {
                            $validator->errors()->add(
                                "gosl_funds.$index.amount",
                                "Amount is required and must be greater than 0 for selected GOSL fund at row " . ($index + 1)
                            );
                        }
                    }
                }
            }

            // Custom validation for complete travel history records
            if ($request->has('travelling_histories') && is_array($request->travelling_histories)) {
                foreach ($request->travelling_histories as $index => $history) {
                    $hasPartialData = !empty($history['year']) || !empty($history['purpose_of_travel']) || 
                                     !empty($history['travelling_start_date']) || !empty($history['travelling_end_date']) || 
                                     !empty($history['country']);
                    
                    $hasAllData = !empty($history['year']) && !empty($history['purpose_of_travel']) && 
                                 !empty($history['travelling_start_date']) && !empty($history['travelling_end_date']) && 
                                 !empty($history['country']);
                    
                    if ($hasPartialData && !$hasAllData) {
                        $validator->errors()->add(
                            "travelling_histories.$index", 
                            "All fields must be filled for travel history record " . ($index + 1)
                        );
                    }
                }
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            DB::beginTransaction();
            
            // Prepare data for application update
            $applicationData = $request->except(['expense_types', 'gosl_funds', 'expenses_met', 'travelling_histories']);
            
            // Update the application
            $application->update($applicationData);

            // Handle file deletions
            if ($request->has('files_to_delete')) {
                $filesToDelete = $request->input('files_to_delete', []);
                foreach ($filesToDelete as $fileId) {
                    $file = ApplicationFile::where('id', $fileId)
                        ->where('application_id', $application->id)
                        ->first();
                    
                    if ($file) {
                        // Delete physical file from storage (reconstruct full filename with extension)
                        $fullFilename = $file->file_name . '.' . $file->extension;
                        $filePath = storage_path('app/public/application_files/' . $fullFilename);
                        if (file_exists($filePath)) {
                            unlink($filePath);
                        }
                        
                        // Delete database record
                        $file->delete();
                    }
                }
            }

            // Handle file attachments
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    // Get original name and extension
                    $originalName = $file->getClientOriginalName();
                    $extension = $file->getClientOriginalExtension();
                    
                    // Remove extension from original name
                    $nameWithoutExt = pathinfo($originalName, PATHINFO_FILENAME);
                    
                    // Generate unique filename WITHOUT extension
                    $filename = time() . '_' . uniqid() . '_' . $nameWithoutExt;
                    
                    // Store file in storage/app/public/application_files WITH extension
                    $path = $file->storeAs('application_files', $filename . '.' . $extension, 'public');
                    
                    // Save file record in database (filename without extension, extension separate)
                    ApplicationFile::create([
                        'application_id' => $application->id,
                        'file_name' => $filename,
                        'extension' => $extension,
                    ]);
                }
            }
            
            // Handle expense types - support both formats
            
            // Handle expense types - support both formats
            if ($request->has('expenses_met') && is_array($request->expenses_met)) {
                // Handle the expenses_met format from frontend
                $selectedExpenseTypes = [];
                foreach ($request->expenses_met as $expense) {
                    if (isset($expense['is_checked']) && $expense['is_checked'] && isset($expense['expenses_type_id'])) {
                        $selectedExpenseTypes[] = $expense['expenses_type_id'];
                    }
                }
                $application->syncExpenseTypes($selectedExpenseTypes);
            }
            
            // Handle GOSL funds if provided
            if ($request->has('gosl_funds') && is_array($request->gosl_funds)) {
                $goslFundsToSave = [];
                foreach ($request->gosl_funds as $fund) {
                    if (isset($fund['is_selected']) && $fund['is_selected'] && isset($fund['amount']) && $fund['amount'] > 0) {
                        $goslFundsToSave[] = [
                            'gosl_fund_type_id' => $fund['gosl_fund_type_id'],
                            'amount' => $fund['amount']
                        ];
                    }
                }
                $application->syncGoslFunds($goslFundsToSave);
            }
            
            // Update travelling histories (Section 7) - only complete records
            if ($request->has('travelling_histories') && is_array($request->travelling_histories)) {
                // Delete ALL old histories (including auto-saved ones) - user can edit everything in Section 7
                $application->travellingHistories()->delete();
                
                // Add new/updated histories - only if all fields are filled
                foreach ($request->travelling_histories as $history) {
                    $hasAllData = !empty($history['year']) && !empty($history['purpose_of_travel']) && 
                                 !empty($history['travelling_start_date']) && !empty($history['travelling_end_date']) && 
                                 !empty($history['country']);
                    
                    if ($hasAllData) {
                        // Check if this matches current application (to preserve is_auto_saved flag)
                        $isCurrentApplication = false;
                        if ($request->has('departure_date') && $request->has('arrival_date')) {
                            $isCurrentApplication = (
                                $history['travelling_start_date'] === $request->departure_date &&
                                $history['travelling_end_date'] === $request->arrival_date &&
                                $history['purpose_of_travel'] === $request->purpose_of_travel &&
                                $history['country'] === $request->countries_visited
                            );
                        }
                        
                        $application->travellingHistories()->create([
                            'year' => $history['year'],
                            'purpose_of_travel' => $history['purpose_of_travel'],
                            'travelling_start_date' => $history['travelling_start_date'],
                            'travelling_end_date' => $history['travelling_end_date'],
                            'country' => $history['country'],
                            'is_auto_saved' => $isCurrentApplication  // Mark as auto-saved if it matches current application
                        ]);
                    }
                }
            } else {
                // If no travelling_histories provided, just update the auto-saved record with current application details
                if ($request->has('departure_date') && $request->has('arrival_date') && $request->has('purpose_of_travel') && $request->has('countries_visited')) {
                    $year = date('Y', strtotime($request->departure_date));
                    
                    // Find existing auto-saved record
                    $autoSavedHistory = $application->travellingHistories()->where('is_auto_saved', true)->first();
                    
                    if ($autoSavedHistory) {
                        // Update existing auto-saved record
                        $autoSavedHistory->update([
                            'year' => $year,
                            'purpose_of_travel' => $request->purpose_of_travel,
                            'travelling_start_date' => $request->departure_date,
                            'travelling_end_date' => $request->arrival_date,
                            'country' => $request->countries_visited
                        ]);
                    } else {
                        // Create new auto-saved record if it doesn't exist
                        $application->travellingHistories()->create([
                            'year' => $year,
                            'purpose_of_travel' => $request->purpose_of_travel,
                            'travelling_start_date' => $request->departure_date,
                            'travelling_end_date' => $request->arrival_date,
                            'country' => $request->countries_visited,
                            'is_auto_saved' => true
                        ]);
                    }
                }
            }
            
            // Load relationships for response
            $application->load([
                'employee', 
                'organization', 
                'department', 
                'expenseTypes', 
                'goslFunds.goslFundType', 
                'statuses',
                'travellingHistories',  // Load ALL travel histories including auto-saved ones
                'files'
            ]);

            // Alias files as attachments for frontend compatibility
            $application->attachments = $application->files;
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Application updated successfully',
                'data' => $application
            ]);
            
        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update application',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update the status of the specified application.
     * Different permissions required based on the status being set
     */
    public function updateStatus(Request $request, $id)
    {
        $application = Application::find($id);

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pending,checked,recommended,not recommended,approved,rejected,resubmit required,Resubmit Pending',
            'remark' => 'nullable|string',
            'session_id' => 'nullable|exists:login_sessions,id'
        ], [
            'status.required' => 'Status is required.',
            'status.in' => 'The selected status is invalid.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check permissions based on the status being set
        $requestedStatus = $request->status;
        $currentStatus = strtolower(trim($application->last_status ?? 'pending'));
        $hasPermission = false;
        $permissionMessage = '';

        switch ($requestedStatus) {
            case 'checked':
                $hasPermission = $this->hasPermission('Application_checking');
                $permissionMessage = 'Unauthorized access. You do not have permission to check applications.';
                break;
            case 'recommended':
            case 'not recommended':
                $hasPermission = $this->hasPermission('Application_recommending_notrecommending');
                $permissionMessage = 'Unauthorized access. You do not have permission to recommend applications.';
                break;
            case 'resubmit required':
                // Require resubmit can be used by users who can perform actions at the current stage
                if (in_array($currentStatus, ['checked', 'check'])) {
                    $hasPermission = $this->hasPermission('Application_recommending_notrecommending');
                    $permissionMessage = 'Unauthorized access. You do not have permission to require resubmit at this stage.';
                } elseif (in_array($currentStatus, ['recommended', 'recommend'])) {
                    $hasPermission = $this->hasPermission('Application_approving_reject');
                    $permissionMessage = 'Unauthorized access. You do not have permission to require resubmit at this stage.';
                } else {
                    $hasPermission = $this->hasPermission('Application_require_resubmit');
                    $permissionMessage = 'Unauthorized access. You do not have permission to require resubmit.';
                }
                break;
            case 'approved':
            case 'rejected':
                $hasPermission = $this->hasPermission('Application_approving_reject');
                $permissionMessage = 'Unauthorized access. You do not have permission to approve or reject applications.';
                break;
            case 'Resubmit Pending':
                $hasPermission = $this->hasPermission('Application_update');
                $permissionMessage = 'Unauthorized access. You do not have permission to resubmit applications.';
                break;
            default:
                $hasPermission = false;
                $permissionMessage = 'Unauthorized access. Unknown status operation.';
                break;
        }

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => $permissionMessage
            ], 403);
        }

        try {
            $status = Status::where('name', $requestedStatus)->first();

            if (!$status) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid status provided',
                    'errors' => ['status' => ['The selected status is invalid.']]
                ], 422);
            }

            // Get session_id from request or fallback to user session_id
            $sessionId = $request->input('session_id');
            if (!$sessionId && auth()->user()) {
                $sessionId = auth()->user()->session_id;
            }
            if (!$sessionId) {
                // Try to get from application if available
                $sessionId = $application->session_id ?? null;
            }
            if (!$sessionId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to determine current session'
                ], 500);
            }

            $application->statuses()->attach($status->id, [
                'session_id' => $sessionId,
                'remark' => $request->remark ?? null,
                'created_date' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data' => [
                    'status' => $status,
                    'remark' => $request->remark ?? null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Remove the specified application from storage.
     * Requires Application_update permission
     */
    public function destroy($id)
    {
        // Check if user has permission to delete applications
        // Using Application_update permission for delete operations
        if (!$this->hasPermission('Application_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to delete applications.'
            ], 403);
        }
        
        $application = Application::find($id);
        
        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found'
            ], 404);
        }
        
        try {
            DB::beginTransaction();
            
            // Delete related records first
            $application->expenseTypes()->detach();
            $application->goslFunds()->delete();
            $application->travellingHistories()->delete();
            $application->statuses()->detach();
            
            // Delete the application
            $application->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Application deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete application',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get expense types for dropdown.
     * Requires Application_read_all permission
     */
    public function getExpenseTypes()
    {
        if (!$this->hasPermission('Application_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view application data.'
            ], 403);
        }
        
        try {
            $expenseTypes = ExpenseType::all();
            
            return response()->json([
                'success' => true,
                'data' => $expenseTypes
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch expense types',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get GOSL fund types for dropdown.
     * Requires Application_read_all permission
     */
    public function getGoslFundTypes()
    {
        if (!$this->hasPermission('Application_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view application data.'
            ], 403);
        }
        
        try {
            $goslFundTypes = GoslFundType::all();
            
            return response()->json([
                'success' => true,
                'data' => $goslFundTypes
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch GOSL fund types',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getEmployeeTravelHistory($employeeId)
    {
        try {
            // Calculate current year and the year 3 years ago
            $currentYear = date('Y');
            $threeYearsAgo = $currentYear - 3;
            
            // Raw SQL query to fetch travel histories for current year and preceding 3 years
            $travelHistories = DB::select(
                'SELECT th.year, th.purpose_of_travel as purpose, th.travelling_start_date, th.travelling_end_date, th.country
                 FROM travelling_histories th
                 INNER JOIN applications a ON th.application_id = a.id
                 WHERE a.employee_id = ?
                 AND th.year >= ?
                 AND th.year <= ?
                 ORDER BY th.travelling_start_date DESC',
                [$employeeId, $threeYearsAgo, $currentYear]
            );

            // Format the response
            $formattedHistories = array_map(function($history) {
                return [
                    'year' => $history->year,
                    'purpose' => $history->purpose,
                    'travelling_start_date' => $history->travelling_start_date,
                    'travelling_end_date' => $history->travelling_end_date,
                    'country' => $history->country
                ];
            }, $travelHistories);

            return response()->json([
                'success' => true,
                'data' => $formattedHistories
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch travel history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all files for a specific application
     */
    public function getFiles($id)
    {
        if (!$this->hasPermission('Application_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view application files.'
            ], 403);
        }

        $application = Application::find($id);

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found'
            ], 404);
        }

        $files = $application->files;

        return response()->json([
            'success' => true,
            'data' => $files
        ]);
    }

    /**
     * Download a specific file
     */
    public function downloadFile($fileId)
    {
        if (!$this->hasPermission('Application_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to download application files.'
            ], 403);
        }

        $file = ApplicationFile::find($fileId);

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        // Reconstruct full filename with extension
        $fullFilename = $file->file_name . '.' . $file->extension;
        $filePath = storage_path('app/public/application_files/' . $fullFilename);

        if (!file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found on server'
            ], 404);
        }

        return response()->download($filePath, $fullFilename);
    }

    /**
     * Delete a specific file
     */
    public function deleteFile($fileId)
    {
        if (!$this->hasPermission('Application_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to delete application files.'
            ], 403);
        }

        $file = ApplicationFile::find($fileId);

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        try {
            // Delete file from storage (reconstruct full filename with extension)
            $fullFilename = $file->file_name . '.' . $file->extension;
            $filePath = 'application_files/' . $fullFilename;
            if (Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            // Delete file record from database
            $file->delete();

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}