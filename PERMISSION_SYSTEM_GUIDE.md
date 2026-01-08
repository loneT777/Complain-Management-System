# Role-Based Permission System - Implementation Complete

## Overview
A complete role-based permission system has been implemented for the Complaint Management System. This system controls access to features at both the backend (Laravel API) and frontend (React) levels.

## Backend Implementation

### 1. Permission Structure
Permissions are organized by module with CRUD operations:
- **Dashboard**: `dashboard.view`
- **Security**: `security.read`, `security.create`, `security.update`, `security.delete`
- **Users**: `user.read`, `user.create`, `user.update`, `user.delete`
- **Roles**: `role.read`, `role.create`, `role.update`, `role.delete`
- **Permissions**: `permission.read`, `permission.create`, `permission.update`, `permission.delete`
- **Complaints**: `complaint.read`, `complaint.create`, `complaint.update`, `complaint.delete`
- **Complaint Assignments**: `complaint.assign.view`, `complaint.assign.process`
- **Categories**: `category.read`, `category.create`, `category.update`, `category.delete`
- **Divisions**: `division.read`, `division.create`, `division.update`, `division.delete`
- **Persons**: `person.read`, `person.create`, `person.update`, `person.delete`
- **Attachments**: `attachment.read`, `attachment.create`, `attachment.update`, `attachment.delete`
- **Messages**: `message.read`, `message.create`, `message.update`, `message.delete`
- **Logs**: `log.view`, `log.process`

### 2. Middleware Protection
All API routes are protected with the `permission` middleware:
```php
// Example route with permission
Route::get('complaints', [ComplaintController::class, 'index'])
    ->middleware('permission:complaint.read');
```

### 3. User Model Enhancement
The `User` model now includes the `HasPermissions` trait with methods:
- `hasPermission($permissionCode)` - Check single permission
- `hasAnyPermission($permissions)` - Check if user has any of the given permissions
- `hasAllPermissions($permissions)` - Check if user has all given permissions
- `getAllPermissions()` - Get all permissions for the user
- `getPermissionCodes()` - Get array of permission codes

### 4. Seeding Permissions
Run these seeders to set up the system:
```bash
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=DefaultRolePermissionSeeder
```

## Frontend Implementation

### 1. Authentication Context
Located at `react/src/contexts/AuthContext.jsx`

Provides:
- User authentication state
- Permission checking methods
- Login/logout functionality

### 2. Permission Components

#### Can Component
Show/hide content based on permissions:
```jsx
import { Can } from '../components/PermissionComponents';

<Can permission="complaint.create">
  <button>Add Complaint</button>
</Can>

// Check multiple permissions (any)
<Can anyPermissions={['complaint.update', 'complaint.delete']}>
  <button>Edit</button>
</Can>

// Check multiple permissions (all required)
<Can allPermissions={['complaint.read', 'complaint.update']}>
  <button>Edit Details</button>
</Can>
```

#### PermissionGuard Component
Protect entire page sections:
```jsx
import PermissionGuard from '../components/PermissionGuard';

<PermissionGuard permission="complaint.read">
  <ComplaintsList />
</PermissionGuard>
```

#### ProtectedRoute Component
Protect routes in routing configuration:
```jsx
import ProtectedRoute from '../components/ProtectedRoute';

{
  path: 'complaints',
  element: (
    <ProtectedRoute permission="complaint.read">
      <Complaints />
    </ProtectedRoute>
  )
}
```

### 3. Permission Hooks

#### usePermission Hook
```jsx
import { usePermission } from '../hooks/usePermissions';

const canCreate = usePermission('complaint.create');

if (canCreate) {
  // Show create button
}
```

#### useAuth Hook
```jsx
import { useAuth } from '../contexts/AuthContext';

const { hasPermission, hasAnyPermission, hasAllPermissions, user } = useAuth();

if (hasPermission('complaint.update')) {
  // Allow edit
}
```

### 4. Navigation Menu
Menu items are automatically filtered based on user permissions. Add `permission` property to menu items in `menu-items.js`:

```javascript
{
  id: 'complaints',
  title: 'Complaints',
  url: '/complaints',
  permission: 'complaint.read'
}
```

## Usage Examples in Components

### Example 1: Hiding Action Buttons
```jsx
import { Can } from './PermissionComponents';

function ComplaintTable({ complaints }) {
  return (
    <table>
      {complaints.map(complaint => (
        <tr key={complaint.id}>
          <td>{complaint.title}</td>
          <td>
            <Can permission="complaint.update">
              <button onClick={() => edit(complaint.id)}>Edit</button>
            </Can>
            <Can permission="complaint.delete">
              <button onClick={() => delete(complaint.id)}>Delete</button>
            </Can>
          </td>
        </tr>
      ))}
    </table>
  );
}
```

### Example 2: Conditional Rendering with Hooks
```jsx
import { usePermission } from '../hooks/usePermissions';

function ComplaintActions() {
  const canCreate = usePermission('complaint.create');
  const canUpdate = usePermission('complaint.update');
  const canDelete = usePermission('complaint.delete');

  return (
    <div className="actions">
      {canCreate && <button>New Complaint</button>}
      {canUpdate && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
    </div>
  );
}
```

### Example 3: Complex Permission Checks
```jsx
import { useAuth } from '../contexts/AuthContext';

function ComplaintForm() {
  const { hasAnyPermission, hasAllPermissions } = useAuth();

  // User needs either create OR update permission
  const canModify = hasAnyPermission(['complaint.create', 'complaint.update']);

  // User needs ALL these permissions
  const canAssignAndProcess = hasAllPermissions([
    'complaint.assign.view',
    'complaint.assign.process'
  ]);

  return (
    <form>
      {canModify && <input name="title" />}
      {canAssignAndProcess && <AssignmentSection />}
    </form>
  );
}
```

## Default Role Permissions

### Super Admin
- Has ALL permissions (bypasses all checks)

### Admin
- Dashboard view
- Full complaint management
- Category CRUD
- Division CRUD (except delete)
- Person CRUD (except delete)
- Logs view and process
- Attachment management
- Message management
- User read
- Role read

### Engineer
- Dashboard view
- Complaint read and update
- View assignments
- Category read
- Division read
- Person read
- Log view and process
- Attachment read and create
- Message read and create

### User
- Dashboard view
- Complaint read and create
- Category read
- Division read
- Attachment read and create
- Message read and create

## Testing the System

1. **Seed the database**:
```bash
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=DefaultRolePermissionSeeder
```

2. **Login with different roles** and verify:
   - Navigation menu shows only permitted items
   - Routes redirect if access denied
   - Buttons/actions are hidden without permission
   - API calls return 403 Forbidden if unauthorized

3. **Test API endpoints** with different role tokens:
```bash
# Get user permissions
curl -H "Authorization: Bearer TOKEN" http://localhost/api/me

# Try accessing without permission (should return 403)
curl -H "Authorization: Bearer TOKEN" http://localhost/api/users
```

## Customization

### Adding New Permissions
1. Add to `database/seeders/PermissionSeeder.php`
2. Run seeder: `php artisan db:seed --class=PermissionSeeder`
3. Assign to roles in `DefaultRolePermissionSeeder.php`

### Protecting New Routes
Backend:
```php
Route::get('new-feature', [Controller::class, 'method'])
    ->middleware('permission:feature.read');
```

Frontend:
```jsx
{
  path: 'new-feature',
  element: (
    <ProtectedRoute permission="feature.read">
      <NewFeature />
    </ProtectedRoute>
  )
}
```

### Adding Menu Items with Permissions
In `menu-items.js`:
```javascript
{
  id: 'new-feature',
  title: 'New Feature',
  url: '/new-feature',
  permission: 'feature.read'
}
```

## Security Notes

1. **Super Admin Bypass**: Users with role code `super_admin` automatically have all permissions
2. **Frontend Protection**: UI protection is for UX only; backend always validates
3. **API Security**: All routes require authentication + permission check
4. **Token-Based**: Uses Laravel Sanctum for API authentication
5. **Permission Caching**: Permissions are loaded on login and stored in context

## Troubleshooting

1. **Menu items not showing**: Check permission exists in database and is assigned to user's role
2. **403 Forbidden**: User lacks required permission; check role_permissions table
3. **Login doesn't store permissions**: Verify AuthContext is wrapping the app in index.jsx
4. **Can't access protected routes**: Ensure ProtectedRoute is imported and used correctly

## Files Modified/Created

### Backend
- ✅ `app/Http/Kernel.php` - Registered permission middleware
- ✅ `app/Traits/HasPermissions.php` - Permission checking trait
- ✅ `app/Models/User.php` - Added HasPermissions trait
- ✅ `app/Http/Controllers/Auth/AuthController.php` - Returns permissions on login
- ✅ `database/seeders/PermissionSeeder.php` - Updated with all permissions
- ✅ `database/seeders/DefaultRolePermissionSeeder.php` - Default role permissions
- ✅ `routes/api.php` - Protected all routes with permissions

### Frontend
- ✅ `react/src/contexts/AuthContext.jsx` - Authentication and permission context
- ✅ `react/src/hooks/usePermissions.js` - Permission checking hooks
- ✅ `react/src/components/PermissionGuard.jsx` - Page-level permission guard
- ✅ `react/src/components/PermissionComponents.jsx` - Can/Cannot components
- ✅ `react/src/components/ProtectedRoute.jsx` - Enhanced route protection
- ✅ `react/src/views/auth/login.jsx` - Updated to use AuthContext
- ✅ `react/src/index.jsx` - Wrapped with AuthProvider
- ✅ `react/src/routes/MainRoutes.jsx` - Added permission requirements
- ✅ `react/src/menu-items.js` - Added permission properties
- ✅ `react/src/layouts/AdminLayout/Navigation/NavContent/NavGroup/index.jsx` - Filter menu by permissions
- ✅ `react/src/layouts/AdminLayout/Navigation/NavContent/NavCollapse/index.jsx` - Filter submenu by permissions

## Next Steps

To complete the system:
1. Update all existing components to hide/show actions based on permissions
2. Test with different user roles
3. Add permission checks to form submissions
4. Document specific permissions needed for each feature
