# Permission System Setup Guide

## Step 1: Run Database Seeders

Open your terminal in the project root and run:

```bash
# Seed all permissions
php artisan db:seed --class=PermissionSeeder

# Seed default role-permission assignments
php artisan db:seed --class=DefaultRolePermissionSeeder
```

## Step 2: Verify Database

Check that permissions and role_permissions tables are populated:

```sql
-- Check permissions
SELECT * FROM permissions;

-- Check role_permissions
SELECT r.name as role_name, p.name as permission_name, p.code
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.module, p.name;
```

## Step 3: Test Login

1. Login with different user roles
2. Check browser console for permissions:
   ```javascript
   // In browser console
   console.log(JSON.parse(localStorage.getItem('userPermissions')));
   ```

## Step 4: Verify Navigation

After login, the navigation menu should only show items you have permission for:
- Super Admin: sees all menu items
- Admin: sees most items except some security features
- Engineer: sees complaints and limited features
- User: sees basic complaint features

## Step 5: Test Route Protection

Try accessing routes you don't have permission for:
- Should show "Access Denied" message
- Should not allow access to protected features

## Step 6: Test API Protection

Use browser dev tools Network tab:
1. Try to access an endpoint you don't have permission for
2. Should receive 403 Forbidden response
3. Should see error message: "Forbidden - You do not have permission to perform this action"

## Troubleshooting

### Issue: Menu items not hiding
**Solution**: Clear browser cache and localStorage, then login again

### Issue: Still can access restricted routes
**Solution**: Check that ProtectedRoute wrapper is applied to the route in MainRoutes.jsx

### Issue: API returns 403 for all requests
**Solution**: 
1. Check token is being sent: `localStorage.getItem('authToken')`
2. Verify permissions are assigned to your role in database
3. Check user's role_id matches a role with permissions

### Issue: Super admin still restricted
**Solution**: 
1. Verify role has code field set to 'super_admin'
2. Check Role model has the 'code' column
3. Run migrations if needed

### Issue: Permissions not loading
**Solution**:
1. Check AuthContext is wrapping App in index.jsx
2. Verify login API returns permissions array
3. Check browser console for errors

## Testing Different Roles

Create test users with different roles:

```sql
-- Update user role
UPDATE users SET role_id = 1 WHERE id = 1; -- Super Admin
UPDATE users SET role_id = 2 WHERE id = 2; -- Admin
UPDATE users SET role_id = 3 WHERE id = 3; -- Engineer
UPDATE users SET role_id = 4 WHERE id = 4; -- User
```

## Verifying Permissions

### Check User Permissions via API
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost/api/me
```

### Check in Database
```sql
-- Get all permissions for a user
SELECT p.name, p.code, p.module
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.id = 1;
```

## Common Permission Patterns

### Super Admin
- Should have ALL permissions
- Can access everything
- Bypasses all permission checks

### Admin
- Most permissions except user/role management
- Can manage complaints, categories, divisions
- Can view security settings but not modify

### Engineer
- Complaint handling permissions
- Can update complaints and view assignments
- Limited create permissions

### User
- Basic read permissions
- Can create complaints
- Can view own data
- Limited modification permissions

## Next Steps

1. Update remaining components to use `<Can>` component for action buttons
2. Test each role thoroughly
3. Adjust role permissions as needed in DefaultRolePermissionSeeder
4. Document any custom permissions added
5. Train users on their role capabilities

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Laravel logs: `storage/logs/laravel.log`
3. Verify database tables are properly seeded
4. Test API endpoints directly with curl or Postman
5. Review PERMISSION_SYSTEM_GUIDE.md for detailed implementation
