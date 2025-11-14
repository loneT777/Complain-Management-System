<?php

namespace App\Http\Controllers;

use App\Models\ParlimentApplication as Application;
use App\Models\ApplicationFile;
use App\Models\Status;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ParlimentApplicationController extends Controller
{
    /**
     * Parliament organization ID (default = 1)
     */
    private $parliamentOrganizationId = 1;

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
     * Display a listing of parliament applications with pagination and search.
     * Requires Application_read_all permission
     */
    public function index(Request $request)
    {
        if (!$this->hasPermission('Application_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view all parliament applications.'
            ], 403);
        }

        $perPage = 10; // Set to 10 items per page
        $query = Application::with(['parliamentMember', 'statuses'])
            ->select('applications.*')
            ->selectRaw("CONCAT(parliament_members.title, ' ', parliament_members.name) as parliament_member_full_name")
            ->join('parliament_members', 'applications.parliament_member_id', '=', 'parliament_members.id')
            ->where('application_type', '2'); // Filter for application_type = 2

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('parliament_members.name', 'LIKE', "%{$search}%")
                ->orWhere('parliament_members.title', 'LIKE', "%{$search}%")
                ->orWhere('applications.countries_visited', 'LIKE', "%{$search}%")
                ->orWhere('applications.nature_of_travel', 'LIKE', "%{$search}%")
                ->orWhere('applications.purpose_of_travel', 'LIKE', "%{$search}%");
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
                    ORDER BY id DESC
                    LIMIT 1
                )');
                
                // Match by status ID or name
                $q->where(function($query) use ($statusFilter) {
                    $query->where('statuses.id', $statusFilter)
                          ->orWhereRaw('LOWER(statuses.name) = ?', [strtolower($statusFilter)])
                          ->orWhereRaw('LOWER(statuses.code) = ?', [strtolower($statusFilter)]);
                });
            });
        }

        // $applications = $query->paginate($perPage);
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
     * Display the specified parliament application.
     * Requires Application_read_all permission
     */
    public function show($id)
    {
        if (!$this->hasPermission('Application_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view this parliament application.'
            ], 403);
        }

        $application = Application::with(['parliamentMember', 'statuses', 'files'])
            ->find($id);

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Parliament application not found'
            ], 404);
        }

        // Get the last status
        $lastStatus = $application->statuses()->orderByPivot('created_date', 'desc')->first();
        $application->last_status = $lastStatus ? $lastStatus->name : 'Pending';
        $application->last_status_remark = $lastStatus ? $lastStatus->pivot->remark : null;
        
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
        $application->attachments = $application->files;

        return response()->json([
            'success' => true,
            'data' => $application
        ]);
    }

    /**
     * Store a newly created parliament application in storage.
     */
    public function store(Request $request)
    {
        if (!$this->hasPermission('Application_create')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to create parliament applications.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'parliament_member_id' => 'required|exists:parliament_members,id',
            'countries_visited' => 'required|string|max:150',
            'nature_of_travel' => 'required|string|in:Official,Private',
            'purpose_of_travel' => 'required|string|min:10|max:1000',
            'departure_date' => 'required|date|date_format:Y-m-d|after_or_equal:today',
            'arrival_date' => 'required|date|date_format:Y-m-d|after:departure_date',
            'application_type' => 'required|in:2',
            'session_id' => 'nullable|exists:login_sessions,id',
            'attachments.*' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120', // 5MB max per file
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $data = $request->all();

            // Always assign Parliament organization
            $data['organization_id'] = $this->parliamentOrganizationId;

            // Fallback for session_id
            $data['session_id'] = $request->session_id ?? (auth()->user()->session_id ?? 1);

            $application = Application::create($data);
            $application->load('parliamentMember');

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

            // Default status: pending
            $pendingStatus = Status::firstOrCreate(['name' => 'pending'], ['code' => 'pending']);
            $application->statuses()->attach($pendingStatus->id, [
                'session_id' => $data['session_id'],
                'remark' => null,
                'created_date' => now()
            ]);

            // Reload application with files
            $application->load('files');
            // Alias files as attachments for frontend compatibility
            $application->attachments = $application->files;

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Parliament application created successfully',
                'data' => $application
            ], 201);
        } catch (\Exception $e) {
            DB::rollback();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create parliament application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified parliament application in storage.
     */
    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('Application_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update parliament applications.'
            ], 403);
        }

        $application = Application::find($id);

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Parliament application not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'parliament_member_id' => 'sometimes|required|exists:parliament_members,id',
            'countries_visited' => 'sometimes|required|string|max:150',
            'nature_of_travel' => 'sometimes|required|string|in:Official,Private',
            'purpose_of_travel' => 'sometimes|required|string|min:10|max:1000',
            'departure_date' => 'sometimes|required|date|date_format:Y-m-d|after_or_equal:today',
            'arrival_date' => 'sometimes|required|date|date_format:Y-m-d|after:departure_date',
            'application_type' => 'sometimes|required|in:2',
            'session_id' => 'nullable|exists:login_sessions,id',
            'attachments.*' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120', // 5MB max per file
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Always ensure Parliament organization ID is maintained
            $data = $request->all();
            $data['organization_id'] = $this->parliamentOrganizationId;

            $application->update($data);
            $application->load('parliamentMember');

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

            // Reload application with files
            $application->load('files');
            // Alias files as attachments for frontend compatibility
            $application->attachments = $application->files;

            return response()->json([
                'success' => true,
                'message' => 'Parliament application updated successfully',
                'data' => $application
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update parliament application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the status of the specified parliament application.
     * Different permissions required based on the status being set
     */
    public function updateStatus(Request $request, $id)
    {
        $application = Application::find($id);

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Parliament application not found'
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
                $permissionMessage = 'Unauthorized access. You do not have permission to check parliament applications.';
                break;
            case 'recommended':
            case 'not recommended':
                $hasPermission = $this->hasPermission('Application_recommending_notrecommending');
                $permissionMessage = 'Unauthorized access. You do not have permission to recommend parliament applications.';
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
                $permissionMessage = 'Unauthorized access. You do not have permission to approve or reject parliament applications.';
                break;
            case 'Resubmit Pending':
                $hasPermission = $this->hasPermission('Application_update');
                $permissionMessage = 'Unauthorized access. You do not have permission to resubmit parliament applications.';
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
                    'message' => 'Status not found',
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
                'message' => 'Parliament application status updated successfully',
                'data' => [
                    'status' => $status,
                    'remark' => $request->remark ?? null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update parliament application status',
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