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

// -----------------
// PUBLIC ROUTES
// -----------------
// These routes are accessible without authentication and are intended for public data access.

Route::get('/public/roles', [RoleController::class, 'publicIndex']);
Route::get('/public/divisions', [DivisionController::class, 'publicIndex']);
Route::get('/public/categories', [CategoryController::class, 'publicIndex']);
Route::get('/public/messages', [MessageController::class, 'publicIndex']);
Route::get('/public/complaints', [ComplaintController::class, 'publicIndex']);

// Temporarily make all routes public for development/testing
Route::apiResource('messages', MessageController::class);
Route::apiResource('complaints', ComplaintController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('roles', RoleController::class);
Route::apiResource('divisions', DivisionController::class);
Route::apiResource('persons', PersonController::class);
Route::apiResource('attachments', AttachmentController::class);
Route::apiResource('complaint_assignments', ComplaintAssignmentController::class);
Route::apiResource('complaint_logs', ComplaintLogController::class);

// Complaint-specific routes
Route::get('/complaints/{complaintId}/messages', [MessageController::class, 'getByComplaint']);
Route::get('/complaints/{complaintId}/assignments', [ComplaintAssignmentController::class, 'getByComplaint']);
Route::get('/complaints/{complaintId}/logs', [ComplaintLogController::class, 'getByComplaint']);
Route::get('/categories/{categoryId}/complaints', [CategoryController::class, 'getComplaints']);
Route::get('/complaints/{complaintId}/attachments', [AttachmentController::class, 'getAttachmentsByComplaint']);

<<<<<<< HEAD
// Status and Priority routes
Route::get('/complaint-statuses', [ComplaintController::class, 'getStatuses']);
Route::get('/complaint-priorities', [ComplaintController::class, 'getPriorities']);
Route::get('/dashboard-stats', [ComplaintController::class, 'getDashboardStats']);
Route::put('/complaints/{id}/status', [ComplaintController::class, 'updateStatus']);
Route::put('/complaints/{id}/priority', [ComplaintController::class, 'updatePriority']);
=======
// Complaint Assignment SLA route
Route::get('/complaint_assignments/sla/{complaintId}', [ComplaintAssignmentController::class, 'getComplaintSLA']);

// Test Hash Routes (for password hashing - REMOVE IN PRODUCTION)
Route::get('/test/hash', [TestHashController::class, 'hashPassword']);
Route::post('/test/verify', [TestHashController::class, 'verifyPassword']);
>>>>>>> c3e1369f2d41314978e4e1cd7a6db9ec5aba9b33

// Public attachment routes (for development/testing)
Route::get('/public/attachments', [AttachmentController::class, 'index']);
Route::post('/public/attachments', [AttachmentController::class, 'store']);
Route::get('/public/attachments/{id}', [AttachmentController::class, 'show']);
Route::put('/public/attachments/{id}', [AttachmentController::class, 'update']);
Route::post('/public/attachments/{id}', [AttachmentController::class, 'update']); // For FormData with _method
Route::delete('/public/attachments/{id}', [AttachmentController::class, 'destroy']);
Route::get('/public/attachments/{id}/download', [AttachmentController::class, 'download']);
Route::get('/public/attachments/{id}/view', [AttachmentController::class, 'view']);

// Attachment download and view
Route::get('/attachments/{id}/download', [AttachmentController::class, 'download']);
Route::get('/attachments/{id}/view', [AttachmentController::class, 'view']);

// -----------------
// PROTECTED ROUTES - With Authentication
// -----------------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/login-history', [AuthController::class, 'loginHistory']);
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