<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\RoleController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\ComplaintAssignmentController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\CategoryController;
// use App\Http\Controllers\TestController;
// use App\Http\Controllers\UserController;
// use App\Http\Controllers\ServicesController;
// use App\Http\Controllers\Auth\AuthController;
// use App\Http\Controllers\PermissionController;
// use App\Http\Controllers\DesignationController;
// use App\Http\Controllers\OrganizationController;
// use App\Http\Controllers\ExpenseTypeController;
// use App\Http\Controllers\EmployeesController;
// use App\Http\Controllers\LoginSessionController;
// use App\Http\Controllers\GoslFundTypeController;
// use App\Http\Controllers\ApplicationController;
// use App\Http\Controllers\ParlimentApplicationController;
// use App\Http\Controllers\ParliamentMemberController;
// use App\Http\Controllers\PdfController;
// use App\Http\Controllers\ParlimentPdfController;
// use App\Http\Controllers\DashboardController;

// CSRF Cookie
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Test Routes
// Route::get('/generate_hash', [TestController::class, 'generateHash']);

// Authentication
// Route::post('/login', [AuthController::class, 'login']);
// Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
// Route::get('/user-sessions/{user_id}', [AuthController::class, 'getUserSessions'])->middleware('auth:sanctum');
// Route::get('/login-sessions', [LoginSessionController::class, 'index'])->middleware('auth:sanctum');

// Public routes for dropdowns (without authentication)
//Route::get('/public/organizations', [OrganizationController::class, 'publicIndex']);
//Route::get('/public/designations', [DesignationController::class, 'publicIndex']);
// Route::get('/public/services', [ServicesController::class, 'publicIndex']);
Route::get('/public/roles', [RoleController::class, 'publicIndex']);

// Public CRUD for Roles (for development)
Route::get('/roles', [RoleController::class, 'index']);
Route::post('/roles', [RoleController::class, 'store']);
Route::get('/roles/{id}', [RoleController::class, 'show']);
Route::put('/roles/{id}', [RoleController::class, 'update']);
Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

// Public CRUD for Divisions (for development)
Route::get('/divisions', [DivisionController::class, 'index']);
Route::post('/divisions', [DivisionController::class, 'store']);
Route::get('/divisions/{id}', [DivisionController::class, 'show']);
Route::put('/divisions/{id}', [DivisionController::class, 'update']);
Route::delete('/divisions/{id}', [DivisionController::class, 'destroy']);
Route::get('/public/divisions', [DivisionController::class, 'publicIndex']);

// Public CRUD for Persons (for development)
Route::get('/persons', [PersonController::class, 'index']);
Route::post('/persons', [PersonController::class, 'store']);
Route::get('/persons/{id}', [PersonController::class, 'show']);
Route::put('/persons/{id}', [PersonController::class, 'update']);
Route::delete('/persons/{id}', [PersonController::class, 'destroy']);

// Public CRUD for Categories (for development)
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
Route::get('/public/categories', [CategoryController::class, 'publicIndex']);

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

// Protected routes with authentication
Route::middleware('auth:sanctum')->group(function () {
    // User permissions

    // Route::post('/complaint_assignments', [\App\Http\Controllers\ComplaintAssignmentController::class, 'store']);
    // Route::get('/complaint_assignments', [\App\Http\Controllers\ComplaintAssignmentController::class, 'index']);
    // Route::get('/user/permissions', [UserController::class, 'permissions']);

    // Employees CRUD
    //Route::get('employees', [EmployeesController::class, 'index']);
    //Route::get('employees/nic/{nic}', [EmployeesController::class, 'getByNIC']);
    //Route::post('employees', [EmployeesController::class, 'store']);
    //Route::get('employees/{employee}', [EmployeesController::class, 'show']);
    //Route::put('employees/{employee}', [EmployeesController::class, 'update']);
    //Route::delete('employees/{employee}', [EmployeesController::class, 'destroy']);

    // Organizations CRUD
    //Route::get('/organizations', [OrganizationController::class, 'index']);
    //Route::post('/organizations', [OrganizationController::class, 'store']);
    //Route::get('/organizations/{organization}', [OrganizationController::class, 'show']);
    //Route::put('/organizations/{organization}', [OrganizationController::class, 'update']);
    //Route::delete('/organizations/{organization}', [OrganizationController::class, 'destroy']);

    // Services CRUD
    // Route::get('services', [ServicesController::class, 'index']);
    // Route::post('services', [ServicesController::class, 'store']);
    // Route::get('services/{service}', [ServicesController::class, 'show']);
    // Route::put('services/{service}', [ServicesController::class, 'update']);
    // Route::delete('services/{service}', [ServicesController::class, 'destroy']);

    // Designations CRUD
    // Route::get('/designations', [DesignationController::class, 'index']);
    // Route::post('/designations', [DesignationController::class, 'store']);
    // Route::put('/designations/{id}', [DesignationController::class, 'update']);
    // Route::delete('/designations/{id}', [DesignationController::class, 'destroy']);

    // Expense Types CRUD
    // Route::get('/expense-types', [ExpenseTypeController::class, 'index']);
    // Route::get('/expense-types-all', [ExpenseTypeController::class, 'getAll']);
    // Route::post('/expense-types', [ExpenseTypeController::class, 'store']);
    // Route::put('/expense-types/{id}', [ExpenseTypeController::class, 'update']);
    // Route::delete('/expense-types/{id}', [ExpenseTypeController::class, 'destroy']);

    // Users
    // Route::get('/users', [UserController::class, 'index']);
    // Route::post('/users', [UserController::class, 'store']);
    // Route::put('/users/{id}', [UserController::class, 'update']);
    // Route::delete('/users/{id}', [UserController::class, 'destroy']);
    // Route::put('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    // Route::get('/users/roles', [UserController::class, 'getRoles']);

    // Permissions CRUD
    // Route::get('/permissions', [PermissionController::class, 'index']);
    // Route::post('/permissions', [PermissionController::class, 'store']);
    // Route::put('/permissions/{id}', [PermissionController::class, 'update']);
    // Route::delete('/permissions/{id}', [PermissionController::class, 'destroy']);

    // Role-Permissions Management
    Route::get('/role-permissions', [RoleController::class, 'getRolePermissions']);
    Route::post('/role-permissions/sync', [RoleController::class, 'syncRolePermissions']);
    Route::post('/role-permissions/sync-role', [RoleController::class, 'syncSingleRolePermissions']);

    // GOSL Fund Types
    // Route::get('/gosl-fund-types', [GoslFundTypeController::class, 'index']);
    // Route::get('/gosl-fund-types-all', [GoslFundTypeController::class, 'getAll']);
    // Route::post('/gosl-fund-types', [GoslFundTypeController::class, 'store']);
    // Route::put('/gosl-fund-types/{id}', [GoslFundTypeController::class, 'update']);
    // Route::delete('/gosl-fund-types/{id}', [GoslFundTypeController::class, 'destroy']);

    // Applications
    // Route::get('application', [ApplicationController::class, 'index']);
    // Route::get('application/employee/{employeeId}/travel-history', [ApplicationController::class, 'getEmployeeTravelHistory']);
    // Route::get('application/{id}', [ApplicationController::class, 'show']);
    // Route::post('application', [ApplicationController::class, 'store']);
    // Route::put('application/{id}', [ApplicationController::class, 'update']);
    // Route::post('application/{id}/status', [ApplicationController::class, 'updateStatus']);
    // Route::delete('application/{id}', [ApplicationController::class, 'destroy']);
    // PDF generation route
    // Route::get('pdf/application/{id}', [PdfController::class, 'generateApplicationPdf']);

    // Application File Management
    // Route::get('application/{id}/files', [ApplicationController::class, 'getFiles']);
    // Route::get('application-files/{fileId}/download', [ApplicationController::class, 'downloadFile']);
    // Route::delete('application-files/{fileId}', [ApplicationController::class, 'deleteFile']);

    // Parliament Members CRUD
    // Route::get('/parliament-members', [ParliamentMemberController::class, 'index']);
    // Route::post('/parliament-members', [ParliamentMemberController::class, 'store']);
    // Route::get('/parliament-members/{id}', [ParliamentMemberController::class, 'show']);
    // Route::put('/parliament-members/{id}', [ParliamentMemberController::class, 'update']);
    // Route::delete('/parliament-members/{id}', [ParliamentMemberController::class, 'destroy']);

    // Parliament Applications (PM Applications)
    // Route::get('/parliament-applications', [ParlimentApplicationController::class, 'index']);
    // Route::post('/parliament-applications', [ParlimentApplicationController::class, 'store']);
    // Route::get('/parliament-applications/{id}', [ParlimentApplicationController::class, 'show']);
    // Route::put('/parliament-applications/{id}', [ParlimentApplicationController::class, 'update']);
    // Route::post('/parliament-applications/{id}/status', [ParlimentApplicationController::class, 'updateStatus']);
    // Route::delete('/parliament-applications/{id}', [ParlimentApplicationController::class, 'destroy']);
    // Parliament Application PDF Download
    // Route::get('pdf/parliament-application/{id}', [ParlimentPdfController::class, 'generatePdf']);

    // Parliament Application File Management
    // Route::get('/parliament-applications/{id}/files', [ParlimentApplicationController::class, 'getFiles']);
    // Route::get('/parliament-application-files/{fileId}/download', [ParlimentApplicationController::class, 'downloadFile']);
    // Route::delete('/parliament-application-files/{fileId}', [ParlimentApplicationController::class, 'deleteFile']);

    // Dashboard stats
    // Route::get('dashboard/stats', [DashboardController::class, 'getStats']);
});

Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    // Super admin specific routes
});

Route::middleware(['auth:sanctum', 'role:privilege_officer'])->group(function () {
    // Privilege officer specific routes
});

Route::middleware(['auth:sanctum', 'role:executive_officer'])->group(function () {
    // Executive officer specific routes
});

Route::middleware(['auth:sanctum', 'role:administrative_officer'])->group(function () {
    // Administrative officer specific routes
});

Route::middleware(['auth:sanctum', 'role:subject_officer'])->group(function () {
    // Subject officer specific routes
});
