<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\CategoryController;
// FIX 1: Added missing imports for controllers used in the routes
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\ComplaintAssignmentController;

// CSRF Cookie
// NOTE: Laravel Sanctum typically handles this route automatically. This manual definition is often redundant.
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Public routes
Route::get('/public/roles', [RoleController::class, 'publicIndex']);
Route::get('/public/divisions', [DivisionController::class, 'publicIndex']);
Route::get('/public/categories', [CategoryController::class, 'publicIndex']);

// FIX 2: Resolved Git merge conflict by combining both sets of routes.
// The original CRUD routes using apiResource are kept.
Route::apiResource('roles', RoleController::class);
Route::apiResource('divisions', DivisionController::class);
Route::apiResource('persons', PersonController::class);
Route::apiResource('categories', CategoryController::class);


// ===================================================================
// SECURITY WARNING: The routes below are publicly accessible.
// They expose full Create, Read, Update, Delete (CRUD) functionality
// without any authentication. This is highly insecure for a production
// environment and should only be used for local development.
// ===================================================================

// Public CRUD for Complaints (for development)
Route::apiResource('complaints', ComplaintController::class);
// The above line is a cleaner way to write all these routes:
// Route::get('/complaints', [ComplaintController::class, 'index']);
// Route::post('/complaints', [ComplaintController::class, 'store']);
// Route::get('/complaints/{id}', [ComplaintController::class, 'show']);
// Route::put('/complaints/{id}', [ComplaintController::class, 'update']);
// Route::delete('/complaints/{id}', [ComplaintController::class, 'destroy']);

Route::apiResource('complaint_assignments', ComplaintAssignmentController::class);
// The above line is a cleaner way to write all these routes:
// Route::get('/complaint_assignments', [ComplaintAssignmentController::class, 'index']);
// Route::post('/complaint_assignments', [ComplaintAssignmentController::class, 'store']);
// Route::get('/complaint_assignments/{id}', [ComplaintAssignmentController::class, 'show']);
// Route::put('/complaint_assignments/{id}', [ComplaintAssignmentController::class, 'update']);
// Route::delete('/complaint_assignments/{id}', [ComplaintAssignmentController::class, 'destroy']);


// Protected routes with authentication
Route::middleware('auth:sanctum')->group(function () {
    // Role-Permissions Management
    Route::get('/role-permissions', [RoleController::class, 'getRolePermissions']);
    Route::post('/role-permissions/sync', [RoleController::class, 'syncRolePermissions']);
    Route::post('/role-permissions/sync-role', [RoleController::class, 'syncSingleRolePermissions']);

    // TODO: Move the complaint and complaint_assignment routes here for production security
});