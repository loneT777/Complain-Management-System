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
// Public Routes
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

// Complaint-specific routes
Route::get('/complaints/{complaintId}/messages', [MessageController::class, 'getByComplaint']);
Route::get('/categories/{categoryId}/complaints', [CategoryController::class, 'getComplaints']);
Route::get('/complaints/{complaintId}/attachments', [AttachmentController::class, 'getAttachmentsByComplaint']);

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
// Protected Routes - TEMPORARILY DISABLED FOR DEVELOPMENT
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