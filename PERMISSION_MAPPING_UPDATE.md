# Frontend Permission Mapping - Updated

## Changes Made

All frontend code has been updated to use only the 18 valid permissions:

### Permission Mapping (Old → New)

| Old Permission | New Permission | Used For |
|----------------|----------------|----------|
| `dashboard.view` | ❌ Removed | Dashboard (no permission required - accessible to all authenticated users) |
| `person.read` | `setting.read` | Persons management |
| `division.read` | `setting.read` | Divisions management |
| `category.read` | `setting.read` | Categories management |
| `role.read` | `security.read` | Roles management |
| `user.read` | `security.read` | Users management |
| `user.create` | `security.create` | Create users |
| `user.update` | `security.update` | Update users |
| `message.read` | `messages` | Messages access |
| `attachment.read` | `attachment` | Attachments access |
| `complaint.read` | ✅ `complaint.read` | No change |
| `complaint.create` | ✅ `complaint.create` | No change |
| `complaint.update` | ✅ `complaint.update` | No change |
| `complaint.delete` | ✅ `complaint.delete` | No change |
| `complaint.assign.view` | ✅ `complaint.assign.view` | No change |
| `complaint.assign.process` | ✅ `complaint.assign.process` | No change |

## Valid 18 Permissions

1. **Security Module (4)**
   - `security.read`
   - `security.create`
   - `security.update`
   - `security.delete`

2. **Setting Module (4)**
   - `setting.read`
   - `setting.create`
   - `setting.update`
   - `setting.delete`

3. **Complaint Module (6)**
   - `complaint.read`
   - `complaint.create`
   - `complaint.update`
   - `complaint.delete`
   - `complaint.assign.process`
   - `complaint.assign.view`

4. **Log Module (2)**
   - `log.process`
   - `log.view`

5. **Attachment (1)**
   - `attachment`

6. **Messages (1)**
   - `messages`

## Files Updated

### 1. menu-items.js
- Dashboard: Removed `dashboard.view` permission (accessible to all)
- Persons: Changed to `setting.read`
- Divisions: Changed to `setting.read`
- Roles: Changed to `security.read`
- Categories: Changed to `setting.read`
- Complaints: Already using correct permissions ✓
- Security menu: Already using correct permissions ✓

### 2. MainRoutes.jsx
- Dashboard routes: Removed `dashboard.view` permission
- Persons route: Changed to `setting.read`
- Divisions route: Changed to `setting.read`
- Roles route: Changed to `security.read`
- Categories route: Changed to `setting.read`
- Messages route: Changed to `messages`
- Attachments route: Changed to `attachment`
- Complaint routes: Already using correct permissions ✓
- Security routes: Already using correct permissions ✓

## Role Access Matrix

| Page/Feature | Super Admin | Division Manager | Complaint Manager | Engineer | Normal User |
|--------------|-------------|------------------|-------------------|----------|-------------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Complaints (View) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Complaints (Create) | ✓ | ✓ | ✓ | ✗ | ✓ |
| Complaints (Update) | ✓ | ✓ | ✓ | ✓ | ✗ |
| Complaints (Delete) | ✓ | ✗ | ✓ | ✗ | ✗ |
| Complaint Assignments | ✓ | ✓ | ✓ | ✓ | ✗ |
| Persons | ✓ | ✓ | ✓ | ✗ | ✗ |
| Divisions | ✓ | ✓ | ✓ | ✗ | ✗ |
| Categories | ✓ | ✓ | ✓ | ✗ | ✗ |
| Roles | ✓ | ✓ | ✗ | ✗ | ✗ |
| Security/Users | ✓ | ✓ | ✗ | ✗ | ✗ |
| Security/Permissions | ✓ | ✓ | ✗ | ✗ | ✗ |
| Messages | ✓ | ✓ | ✓ | ✓ | ✓ |
| Attachments | ✓ | ✓ | ✓ | ✓ | ✓ |
| Logs | ✓ | ✓ (view) | ✓ | ✓ | ✓ (view) |

## Testing

To test the permission system:

1. Login with different roles
2. Check that menu items appear/disappear based on permissions
3. Try accessing protected routes directly - should redirect to access denied
4. Check that action buttons (Edit, Delete, Assign) show/hide correctly

## Backend API Protection

All API routes are protected with middleware:
```php
Route::middleware(['auth:sanctum', 'permission:complaint.read'])->get('/complaints', ...);
```

The backend will verify permissions even if frontend checks are bypassed.
