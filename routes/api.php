<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\CategoryController;

// CSRF Cookie
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Public routes
Route::get('/public/roles', [RoleController::class, 'publicIndex']);
Route::get('/public/divisions', [DivisionController::class, 'publicIndex']);
Route::get('/public/categories', [CategoryController::class, 'publicIndex']);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// CRUD Routes
Route::apiResource('roles', RoleController::class);
Route::apiResource('divisions', DivisionController::class);
Route::apiResource('persons', PersonController::class);
Route::apiResource('categories', CategoryController::class);
=======
=======
>>>>>>> Stashed changes
// Public CRUD for Complaints (for development)
Route::get('/complaints', [ComplaintController::class, 'index']);
Route::post('/complaints', [ComplaintController::class, 'store']);
Route::get('/complaints/{id}', [ComplaintController::class, 'show']);
Route::put('/complaints/{id}', [ComplaintController::class, 'update']);
Route::delete('/complaints/{id}', [ComplaintController::class, 'destroy']);

Route::get('/complaint_assignments', [ComplaintAssignmentController::class, 'index']);
Route::post('/complaint_assignments', [ComplaintAssignmentController::class, 'store']);
Route::get('/complaint_assignments/{id}', [ComplaintAssignmentController::class, 'show']);
Route::put('/complaint_assignments/{id}', [ComplaintAssignmentController::class, 'update']);
Route::delete('/complaint_assignments/{id}', [ComplaintAssignmentController::class, 'destroy']);

// Public CRUD for Designations (for development)
//Route::get('/designations', [DesignationController::class, 'index']);
//Route::post('/designations', [DesignationController::class, 'store']);
//Route::get('/designations/{id}', [DesignationController::class, 'show']);
//Route::put('/designations/{id}', [DesignationController::class, 'update']);
//Route::delete('/designations/{id}', [DesignationController::class, 'destroy']);
>>>>>>> Stashed changes

// Protected routes with authentication
Route::middleware('auth:sanctum')->group(function () {
    // Role-Permissions Management
    Route::get('/role-permissions', [RoleController::class, 'getRolePermissions']);
    Route::post('/role-permissions/sync', [RoleController::class, 'syncRolePermissions']);
    Route::post('/role-permissions/sync-role', [RoleController::class, 'syncSingleRolePermissions']);
});