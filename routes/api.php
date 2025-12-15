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
Route::get('/complaints/{complaintId}/messages', [MessageController::class, 'getByComplaint']);
Route::get('/categories/{categoryId}/complaints', [CategoryController::class, 'getComplaints']);

// Public attachment routes (for development/testing)
Route::get('/public/attachments', [AttachmentController::class, 'index']);
Route::post('/public/attachments', [AttachmentController::class, 'store']);
Route::get('/public/attachments/{id}', [AttachmentController::class, 'show']);
Route::put('/public/attachments/{id}', [AttachmentController::class, 'update']);
Route::post('/public/attachments/{id}', [AttachmentController::class, 'update']); // For FormData with _method
Route::delete('/public/attachments/{id}', [AttachmentController::class, 'destroy']);
Route::get('/public/attachments/{id}/download', [AttachmentController::class, 'download']);
Route::get('/public/attachments/{id}/view', [AttachmentController::class, 'view']);


// -----------------
// Protected Routes - TEMPORARILY DISABLED FOR DEVELOPMENT
// -----------------
// All routes within this group require a valid authentication token (Sanctum).
// This protects sensitive operations like creating, updating, and deleting data.

// Route::middleware('auth:sanctum')->group(function () {

    // --- Full CRUD Resource Routes ---
    // These lines handle index, store, show, update, and destroy for each resource.
    // Route::apiResource('roles', RoleController::class);
    // Route::apiResource('divisions', DivisionController::class);
    // Route::apiResource('persons', PersonController::class);
    // Route::apiResource('categories', CategoryController::class);
    // Route::apiResource('messages', MessageController::class);
    // Route::apiResource('complaints', ComplaintController::class);
    // Route::apiResource('attachments', AttachmentController::class);
    // Route::apiResource('complaint_assignments', ComplaintAssignmentController::class);

    // --- Additional Specific Routes ---
    // These routes handle specific relationships or custom actions.

    // Get messages related to a specific complaint
    // Route::get('/complaints/{complaintId}/messages', [MessageController::class, 'getByComplaint']);

    // Get complaints belonging to a specific category
    // Route::get('/categories/{categoryId}/complaints', [CategoryController::class, 'getComplaints']);

    // Get attachments for a specific complaint
    // Route::get('/complaints/{complaintId}/attachments', [AttachmentController::class, 'getAttachmentsByComplaint']);
    
    // Download or view a specific attachment
    // Route::get('/attachments/{id}/download', [AttachmentController::class, 'download']);
    // Route::get('/attachments/{id}/view', [AttachmentController::class, 'view']);

    // --- Role-Permissions Management ---
    // Routes for managing user roles and their associated permissions.
    // Route::get('/role-permissions', [RoleController::class, 'getRolePermissions']);
    // Route::post('/role-permissions/sync', [RoleController::class, 'syncRolePermissions']);
    // Route::post('/role-permissions/sync-role', [RoleController::class, 'syncSingleRolePermissions']);

// });