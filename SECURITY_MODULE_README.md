# Security Module Setup Guide

## Overview
This document explains the newly implemented Security module for Role-Based Access Control (RBAC) in the Complaint Management System.

## Features Added

### 1. **Users Management** (`/security/users`)
- Create and manage system users
- Link users to persons
- Assign roles to users
- Enable/disable user accounts
- Password management

### 2. **Roles Management** (`/security/roles`)
- Create and manage user roles
- Define role names, codes, and descriptions
- View all users assigned to each role

### 3. **Permissions Management** (`/security/permissions`)
- Create and manage system permissions
- Organize permissions by module
- Define permission codes and descriptions
- Pre-seeded with comprehensive permission set

### 4. **Role Permissions** (`/security/role-permissions`)
- Assign permissions to roles
- Visual permission matrix
- Bulk permission assignment
- Module-based grouping for easy management

## Database Schema

### New Tables

#### `permissions`
```sql
- id (primary key)
- name (string)
- code (string, unique) - e.g., 'users.view', 'complaints.create'
- module (string) - e.g., 'Users', 'Complaints', 'Reports'
- description (text, nullable)
- created_at, updated_at
```

#### `role_permissions`
```sql
- id (primary key)
- role_id (foreign key -> roles)
- permission_id (foreign key -> permissions)
- unique(role_id, permission_id)
```

#### `users` (updated)
```sql
- Added: email (string, unique)
- Added: is_active (boolean, default true)
```

## Installation Steps

### 1. Run Migrations
```bash
php artisan migrate
```

This will create:
- `permissions` table
- `role_permissions` table
- Add `email` and `is_active` columns to `users` table

### 2. Seed Permissions
```bash
php artisan db:seed --class=PermissionSeeder
```

This populates the permissions table with 46+ predefined permissions covering:
- Users, Roles, Permissions management
- Complaints and Assignments
- Persons, Divisions, Categories
- Messages, Attachments
- Reports and Dashboard

## API Endpoints

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Permissions
- `GET /api/permissions` - List all permissions
- `POST /api/permissions` - Create new permission
- `GET /api/permissions/{id}` - Get permission details
- `PUT /api/permissions/{id}` - Update permission
- `DELETE /api/permissions/{id}` - Delete permission

### Role Permissions
- `GET /api/role-permissions/{roleId}` - Get permissions for a role
- `POST /api/role-permissions` - Assign permissions to role
- `GET /api/roles-with-permissions` - Get all roles with their permissions

## Frontend Routes

### Navigation Menu
The Security section is available in the sidebar with:
- Users
- Roles
- Permissions
- Role Permissions

### Routes
- `/security/users` - Users management page
- `/security/roles` - Roles management page
- `/security/permissions` - Permissions management page
- `/security/role-permissions` - Role permissions assignment page

## Pre-seeded Permissions

### Modules and Permission Counts
- **Users** (4): view, create, edit, delete
- **Roles** (4): view, create, edit, delete
- **Permissions** (4): view, create, edit, delete
- **Role Permissions** (1): manage
- **Complaints** (5): view, create, edit, delete, view-all
- **Assignments** (4): view, create, edit, delete
- **Persons** (4): view, create, edit, delete
- **Divisions** (4): view, create, edit, delete
- **Categories** (4): view, create, edit, delete
- **Messages** (3): view, create, delete
- **Attachments** (3): view, upload, delete
- **Reports** (2): view, export
- **Dashboard** (2): view, statistics

## Usage Examples

### Creating a New User
1. Navigate to `/security/users`
2. Click "Add User"
3. Select person, enter username, email, password
4. Assign role
5. Set active status
6. Submit

### Assigning Permissions to Role
1. Navigate to `/security/role-permissions`
2. Select a role from dropdown
3. Check/uncheck permissions by module
4. Use "Select All" for entire modules
5. Click "Save Permissions"

### Creating Custom Permission
1. Navigate to `/security/permissions`
2. Click "Add Permission"
3. Enter name (e.g., "Export Financial Reports")
4. Enter code (e.g., "reports.export-financial")
5. Select/enter module (e.g., "Reports")
6. Add description
7. Submit

## Models and Relationships

### User Model
- `belongsTo(Person)` - person
- `belongsTo(Role)` - role
- `belongsTo(Division)` - division

### Role Model
- `hasMany(User)` - users
- `belongsToMany(Permission)` - permissions (through role_permissions)

### Permission Model
- `belongsToMany(Role)` - roles (through role_permissions)

### RolePermission Model
- `belongsTo(Role)` - role
- `belongsTo(Permission)` - permission

## Security Notes

1. **Password Hashing**: All passwords are hashed using Laravel's `Hash::make()`
2. **Unique Constraints**: Usernames, emails, and permission codes are unique
3. **Cascade Deletes**: Deleting a role or permission removes associated role_permissions
4. **Active Status**: Users can be deactivated without deletion

## Next Steps

### Recommended Enhancements
1. **Middleware**: Create permission-checking middleware
2. **Helper Functions**: Add `can()` methods to User model
3. **Audit Logging**: Track permission changes
4. **UI Authorization**: Show/hide UI elements based on permissions
5. **API Authorization**: Protect routes with permission checks

### Example Middleware Implementation
```php
// app/Http/Middleware/CheckPermission.php
public function handle($request, Closure $next, $permission)
{
    if (!auth()->user()->hasPermission($permission)) {
        abort(403, 'Unauthorized');
    }
    return $next($request);
}
```

## Testing

### Test User Creation
```bash
POST /api/users
{
  "person_id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "role_id": 1,
  "is_active": true
}
```

### Test Role Permission Assignment
```bash
POST /api/role-permissions
{
  "role_id": 1,
  "permission_ids": [1, 2, 3, 4, 5]
}
```

## Troubleshooting

### Common Issues

1. **Migration fails**: Check if tables already exist
2. **Foreign key errors**: Ensure roles and persons tables are populated
3. **Seeder fails**: Verify Permission model namespace is correct
4. **Frontend shows errors**: Check API endpoint URLs match backend routes

## Support

For issues or questions, refer to:
- Laravel Documentation: https://laravel.com/docs
- React Bootstrap: https://react-bootstrap.github.io/
- Material-UI Icons: https://mui.com/material-ui/material-icons/
