<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\ComplaintAssignmentController;
use App\Http\Controllers\ComplaintLogController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\TestHashController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RolePermissionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// NOTE: Laravel Sanctum typically handles this route automatically. This manual definition is often redundant.
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json(['message' => 'CSRF cookie set']);
});

// -----------------
// PUBLIC AUTH ROUTES
// -----------------
Route::post('/login', [AuthController::class, 'login']);

// Public routes that don't require authentication
Route::get('/public/attachments', [AttachmentController::class, 'index']);
Route::post('/public/attachments', [AttachmentController::class, 'store']);
Route::get('/public/attachments/{id}', [AttachmentController::class, 'show']);
Route::put('/public/attachments/{id}', [AttachmentController::class, 'update']);
Route::post('/public/attachments/{id}', [AttachmentController::class, 'update']); // For FormData with _method
Route::delete('/public/attachments/{id}', [AttachmentController::class, 'destroy']);
Route::get('/public/attachments/{id}/download', [AttachmentController::class, 'download']);
Route::get('/public/attachments/{id}/view', [AttachmentController::class, 'view']);
Route::get('/public/categories', [CategoryController::class, 'index']);
Route::get('/public/divisions', [DivisionController::class, 'index']);

// -----------------
// PROTECTED ROUTES - With Authentication
// -----------------
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes (no permission required)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/login-history', [AuthController::class, 'loginHistory']);
    
    // Dashboard (requires dashboard.view)
    Route::middleware('permission:dashboard.view')->group(function () {
        Route::get('/dashboard-stats', [ComplaintController::class, 'getDashboardStats']);
        Route::get('/complaint-statuses', [ComplaintController::class, 'getStatuses']);
        Route::get('/complaint-priorities', [ComplaintController::class, 'getPriorities']);
    });

    // Complaints Module
    Route::middleware('permission:complaint.read')->group(function () {
        Route::get('complaints', [ComplaintController::class, 'index']);
        Route::get('complaints/{id}', [ComplaintController::class, 'show']);
        Route::get('/complaints/{complaintId}/messages', [MessageController::class, 'getByComplaint']);
        Route::get('/complaints/{complaintId}/assignments', [ComplaintAssignmentController::class, 'getByComplaint']);
        Route::get('/complaints/{complaintId}/logs', [ComplaintLogController::class, 'getByComplaint']);
        Route::get('/complaints/{complaintId}/attachments', [AttachmentController::class, 'getAttachmentsByComplaint']);
    });
    
    Route::post('complaints', [ComplaintController::class, 'store'])->middleware('permission:complaint.create');
    Route::put('complaints/{id}', [ComplaintController::class, 'update'])->middleware('permission:complaint.update');
    Route::patch('complaints/{id}', [ComplaintController::class, 'update'])->middleware('permission:complaint.update');
    Route::delete('complaints/{id}', [ComplaintController::class, 'destroy'])->middleware('permission:complaint.delete');
    Route::put('/complaints/{id}/status', [ComplaintController::class, 'updateStatus'])->middleware('permission:complaint.update');
    Route::put('/complaints/{id}/priority', [ComplaintController::class, 'updatePriority'])->middleware('permission:complaint.update');

    // Messages Module
    Route::middleware('permission:message.read')->group(function () {
        Route::get('messages', [MessageController::class, 'index']);
        Route::get('messages/{id}', [MessageController::class, 'show']);
    });
    Route::post('messages', [MessageController::class, 'store'])->middleware('permission:message.create');
    Route::put('messages/{id}', [MessageController::class, 'update'])->middleware('permission:message.update');
    Route::patch('messages/{id}', [MessageController::class, 'update'])->middleware('permission:message.update');
    Route::delete('messages/{id}', [MessageController::class, 'destroy'])->middleware('permission:message.delete');

    // Categories Module
    Route::middleware('permission:category.read')->group(function () {
        Route::get('categories', [CategoryController::class, 'index']);
        Route::get('categories/{id}', [CategoryController::class, 'show']);
        Route::get('/categories/{categoryId}/complaints', [CategoryController::class, 'getComplaints']);
    });
    Route::post('categories', [CategoryController::class, 'store'])->middleware('permission:category.create');
    Route::put('categories/{id}', [CategoryController::class, 'update'])->middleware('permission:category.update');
    Route::patch('categories/{id}', [CategoryController::class, 'update'])->middleware('permission:category.update');
    Route::delete('categories/{id}', [CategoryController::class, 'destroy'])->middleware('permission:category.delete');

    // Roles Module
    Route::middleware('permission:role.read')->group(function () {
        Route::get('roles', [RoleController::class, 'index']);
        Route::get('roles/{id}', [RoleController::class, 'show']);
    });
    Route::post('roles', [RoleController::class, 'store'])->middleware('permission:role.create');
    Route::put('roles/{id}', [RoleController::class, 'update'])->middleware('permission:role.update');
    Route::patch('roles/{id}', [RoleController::class, 'update'])->middleware('permission:role.update');
    Route::delete('roles/{id}', [RoleController::class, 'destroy'])->middleware('permission:role.delete');

    // Divisions Module
    Route::middleware('permission:division.read')->group(function () {
        Route::get('divisions', [DivisionController::class, 'index']);
        Route::get('divisions/{id}', [DivisionController::class, 'show']);
    });
    Route::post('divisions', [DivisionController::class, 'store'])->middleware('permission:division.create');
    Route::put('divisions/{id}', [DivisionController::class, 'update'])->middleware('permission:division.update');
    Route::patch('divisions/{id}', [DivisionController::class, 'update'])->middleware('permission:division.update');
    Route::delete('divisions/{id}', [DivisionController::class, 'destroy'])->middleware('permission:division.delete');

    // Persons Module
    Route::middleware('permission:person.read')->group(function () {
        Route::get('persons', [PersonController::class, 'index']);
        Route::get('persons/{id}', [PersonController::class, 'show']);
    });
    Route::post('persons', [PersonController::class, 'store'])->middleware('permission:person.create');
    Route::put('persons/{id}', [PersonController::class, 'update'])->middleware('permission:person.update');
    Route::patch('persons/{id}', [PersonController::class, 'update'])->middleware('permission:person.update');
    Route::delete('persons/{id}', [PersonController::class, 'destroy'])->middleware('permission:person.delete');

    // Attachments Module
    Route::middleware('permission:attachment.read')->group(function () {
        Route::get('attachments', [AttachmentController::class, 'index']);
        Route::get('attachments/{id}', [AttachmentController::class, 'show']);
        Route::get('/attachments/{id}/download', [AttachmentController::class, 'download']);
        Route::get('/attachments/{id}/view', [AttachmentController::class, 'view']);
    });
    Route::post('attachments', [AttachmentController::class, 'store'])->middleware('permission:attachment.create');
    Route::put('attachments/{id}', [AttachmentController::class, 'update'])->middleware('permission:attachment.update');
    Route::patch('attachments/{id}', [AttachmentController::class, 'update'])->middleware('permission:attachment.update');
    Route::delete('attachments/{id}', [AttachmentController::class, 'destroy'])->middleware('permission:attachment.delete');

    // Complaint Assignments
    Route::middleware('permission:complaint.assign.view')->group(function () {
        Route::get('complaint_assignments', [ComplaintAssignmentController::class, 'index']);
        Route::get('complaint_assignments/{id}', [ComplaintAssignmentController::class, 'show']);
        Route::get('/complaint_assignments/sla/{complaintId}', [ComplaintAssignmentController::class, 'getComplaintSLA']);
    });
    Route::post('complaint_assignments', [ComplaintAssignmentController::class, 'store'])->middleware('permission:complaint.assign.process');
    Route::put('complaint_assignments/{id}', [ComplaintAssignmentController::class, 'update'])->middleware('permission:complaint.assign.process');
    Route::patch('complaint_assignments/{id}', [ComplaintAssignmentController::class, 'update'])->middleware('permission:complaint.assign.process');
    Route::delete('complaint_assignments/{id}', [ComplaintAssignmentController::class, 'destroy'])->middleware('permission:complaint.assign.process');

    // Complaint Logs
    Route::get('complaint_logs', [ComplaintLogController::class, 'index'])->middleware('permission:log.view');
    Route::get('complaint_logs/{id}', [ComplaintLogController::class, 'show'])->middleware('permission:log.view');
    Route::post('complaint_logs', [ComplaintLogController::class, 'store'])->middleware('permission:log.process');
    Route::put('complaint_logs/{id}', [ComplaintLogController::class, 'update'])->middleware('permission:log.process');
    Route::patch('complaint_logs/{id}', [ComplaintLogController::class, 'update'])->middleware('permission:log.process');
    Route::delete('complaint_logs/{id}', [ComplaintLogController::class, 'destroy'])->middleware('permission:log.process');

    // Security Management Routes
    Route::middleware('permission:security.read')->group(function () {
        Route::get('users', [UserController::class, 'index']);
        Route::get('users/{id}', [UserController::class, 'show']);
        Route::get('permissions', [PermissionController::class, 'index']);
        Route::get('permissions/{id}', [PermissionController::class, 'show']);
        Route::get('role-permissions/{roleId}', [RolePermissionController::class, 'show']);
        Route::get('roles-with-permissions', [RolePermissionController::class, 'index']);
    });
    
    Route::post('users', [UserController::class, 'store'])->middleware('permission:security.create');
    Route::put('users/{id}', [UserController::class, 'update'])->middleware('permission:security.update');
    Route::patch('users/{id}', [UserController::class, 'update'])->middleware('permission:security.update');
    Route::delete('users/{id}', [UserController::class, 'destroy'])->middleware('permission:security.delete');
    
    Route::post('permissions', [PermissionController::class, 'store'])->middleware('permission:security.create');
    Route::put('permissions/{id}', [PermissionController::class, 'update'])->middleware('permission:security.update');
    Route::patch('permissions/{id}', [PermissionController::class, 'update'])->middleware('permission:security.update');
    Route::delete('permissions/{id}', [PermissionController::class, 'destroy'])->middleware('permission:security.delete');
    
    Route::post('role-permissions', [RolePermissionController::class, 'store'])->middleware('permission:security.update');
});

// -----------------
// PROTECTED ROUTES - TEMPORARILY DISABLED FOR DEVELOPMENT
// -----------------
// Uncomment this section when you're ready to enable authentication

// Route::middleware('auth:sanctum')->group(function () {
    // Route::apiResource('roles', RoleController::class);
    // Route::apiResource('divisions', DivisionController::class);
    // Route::apiResource('persons', PersonController::class);
    // Route::apiResource('categories', CategoryController::class);
    // Route::apiResource('messages', MessageController::class);
    // Route::apiResource('complaints', ComplaintController::class);
    // Route::apiResource('attachments', AttachmentController::class);
    // Route::apiResource('complaint_assignments', ComplaintAssignmentController::class);
    
    // Route::get('/complaints/{complaintId}/messages', [MessageController::class, 'getByComplaint']);
    // Route::get('/categories/{categoryId}/complaints', [CategoryController::class, 'getComplaints']);
    // Route::get('/complaints/{complaintId}/attachments', [AttachmentController::class, 'getAttachmentsByComplaint']);
    // Route::get('/attachments/{id}/download', [AttachmentController::class, 'download']);
    // Route::get('/attachments/{id}/view', [AttachmentController::class, 'view']);
    
    // Role-Permissions Management
    // Route::get('/role-permissions', [RoleController::class, 'getRolePermissions']);
    // Route::post('/role-permissions/sync', [RoleController::class, 'syncRolePermissions']);
    // Route::post('/role-permissions/sync-role', [RoleController::class, 'syncSingleRolePermissions']);
// });