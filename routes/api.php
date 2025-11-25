<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MessageController;

// CSRF Cookie
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Public routes
Route::get('/public/roles', [RoleController::class, 'publicIndex']);
Route::get('/public/divisions', [DivisionController::class, 'publicIndex']);
Route::get('/public/categories', [CategoryController::class, 'publicIndex']);
Route::get('/public/messages', [MessageController::class, 'publicIndex']);

// CRUD Routes
Route::apiResource('roles', RoleController::class);
Route::apiResource('divisions', DivisionController::class);
Route::apiResource('persons', PersonController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('messages', MessageController::class);

// Additional message routes
Route::get('/complaints/{complaintId}/messages', [MessageController::class, 'getByComplaint']);

// Protected routes with authentication
Route::middleware('auth:sanctum')->group(function () {
    // Role-Permissions Management
    Route::get('/role-permissions', [RoleController::class, 'getRolePermissions']);
    Route::post('/role-permissions/sync', [RoleController::class, 'syncRolePermissions']);
    Route::post('/role-permissions/sync-role', [RoleController::class, 'syncSingleRolePermissions']);
});