# Quick Reference: Using Permissions in Components

## Import Required Components/Hooks

```jsx
// For hiding/showing UI elements
import { Can } from './PermissionComponents';

// For checking permissions in logic
import { usePermission, useAnyPermission, useAllPermissions } from '../hooks/usePermissions';

// For accessing full auth context
import { useAuth } from '../contexts/AuthContext';
```

## Hide/Show Buttons Based on Permission

### Single Permission Check
```jsx
import { Can } from './PermissionComponents';

<Can permission="complaint.create">
  <button>Add Complaint</button>
</Can>
```

### Multiple Permissions (OR - user needs ANY)
```jsx
<Can anyPermissions={['complaint.update', 'complaint.delete']}>
  <button>Modify</button>
</Can>
```

### Multiple Permissions (AND - user needs ALL)
```jsx
<Can allPermissions={['complaint.read', 'complaint.update']}>
  <button>Edit Details</button>
</Can>
```

### With Fallback Content
```jsx
<Can permission="complaint.create" fallback={<p>You cannot create complaints</p>}>
  <button>Add Complaint</button>
</Can>
```

## Use Permissions in Component Logic

### Check Single Permission
```jsx
import { usePermission } from '../hooks/usePermissions';

function MyComponent() {
  const canCreate = usePermission('complaint.create');
  const canUpdate = usePermission('complaint.update');
  const canDelete = usePermission('complaint.delete');

  const handleSubmit = () => {
    if (!canCreate) {
      alert('You do not have permission to create');
      return;
    }
    // Proceed with creation
  };

  return (
    <div>
      {canCreate && <button onClick={handleAdd}>Add</button>}
      {canUpdate && <button onClick={handleEdit}>Edit</button>}
      {canDelete && <button onClick={handleDelete}>Delete</button>}
    </div>
  );
}
```

### Check Multiple Permissions
```jsx
import { useAnyPermission, useAllPermissions } from '../hooks/usePermissions';

function MyComponent() {
  // User needs ANY of these
  const canModify = useAnyPermission(['complaint.create', 'complaint.update']);

  // User needs ALL of these
  const canFullAccess = useAllPermissions([
    'complaint.read',
    'complaint.update',
    'complaint.delete'
  ]);

  return (
    <div>
      {canModify && <button>Modify</button>}
      {canFullAccess && <button>Full Access</button>}
    </div>
  );
}
```

### Access Full Auth Context
```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, permissions, hasPermission, hasAnyPermission } = useAuth();

  console.log('User:', user);
  console.log('All permissions:', permissions);

  if (hasPermission('complaint.update')) {
    // Do something
  }

  return (
    <div>
      <p>Welcome {user?.full_name}</p>
      <p>Role: {user?.role?.name}</p>
    </div>
  );
}
```

## Common Patterns

### Table with Action Buttons
```jsx
import { Can } from './PermissionComponents';

function ComplaintTable({ complaints }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {complaints.map(complaint => (
          <tr key={complaint.id}>
            <td>{complaint.title}</td>
            <td>
              <Can permission="complaint.read">
                <button onClick={() => view(complaint.id)}>View</button>
              </Can>
              <Can permission="complaint.update">
                <button onClick={() => edit(complaint.id)}>Edit</button>
              </Can>
              <Can permission="complaint.delete">
                <button onClick={() => remove(complaint.id)}>Delete</button>
              </Can>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Form with Conditional Fields
```jsx
import { Can } from './PermissionComponents';
import { usePermission } from '../hooks/usePermissions';

function ComplaintForm() {
  const canAssign = usePermission('complaint.assign.process');

  return (
    <form>
      <input name="title" />
      <input name="description" />
      
      {/* Only show if user has permission */}
      <Can permission="complaint.update">
        <select name="status">
          <option>Pending</option>
          <option>Completed</option>
        </select>
      </Can>

      {/* Alternative using hook */}
      {canAssign && (
        <div>
          <label>Assign To:</label>
          <select name="assignee">
            {/* ... */}
          </select>
        </div>
      )}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Header with Add Button
```jsx
import { Can } from './PermissionComponents';

function ComplaintsHeader() {
  return (
    <div className="d-flex justify-content-between">
      <h1>Complaints</h1>
      <Can permission="complaint.create">
        <button onClick={handleAdd}>Add New</button>
      </Can>
    </div>
  );
}
```

### Conditional Rendering Complex Logic
```jsx
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user, hasAnyPermission } = useAuth();

  // Super admin sees everything
  if (user?.role?.code === 'super_admin') {
    return <FullDashboard />;
  }

  // Admin/Manager dashboard
  if (hasAnyPermission(['security.read', 'user.read'])) {
    return <AdminDashboard />;
  }

  // Regular user dashboard
  return <UserDashboard />;
}
```

### Disable Form Elements
```jsx
import { usePermission } from '../hooks/usePermissions';

function ComplaintForm({ complaint }) {
  const canUpdate = usePermission('complaint.update');

  return (
    <form>
      <input 
        name="title" 
        value={complaint.title}
        disabled={!canUpdate}
      />
      <input 
        name="description" 
        value={complaint.description}
        disabled={!canUpdate}
      />
      <button type="submit" disabled={!canUpdate}>
        Save
      </button>
    </form>
  );
}
```

### Multiple Permission Checks in One Component
```jsx
import { Can } from './PermissionComponents';

function ComplaintActions({ complaint }) {
  return (
    <div className="actions">
      <Can permission="complaint.read">
        <button>View</button>
      </Can>
      
      <Can permission="complaint.update">
        <button>Edit</button>
      </Can>
      
      <Can permission="complaint.delete">
        <button>Delete</button>
      </Can>
      
      <Can permission="complaint.assign.process">
        <button>Assign</button>
      </Can>
      
      {/* Show if user has EITHER permission */}
      <Can anyPermissions={['log.view', 'log.process']}>
        <button>View Logs</button>
      </Can>
      
      {/* Show only if user has BOTH permissions */}
      <Can allPermissions={['complaint.update', 'complaint.assign.process']}>
        <button>Edit & Reassign</button>
      </Can>
    </div>
  );
}
```

## All Available Permissions

### Dashboard
- `dashboard.view`

### Security Module
- `security.read`
- `security.create`
- `security.update`
- `security.delete`

### Users
- `user.read`
- `user.create`
- `user.update`
- `user.delete`

### Roles
- `role.read`
- `role.create`
- `role.update`
- `role.delete`

### Permissions
- `permission.read`
- `permission.create`
- `permission.update`
- `permission.delete`

### Complaints
- `complaint.read`
- `complaint.create`
- `complaint.update`
- `complaint.delete`
- `complaint.assign.view`
- `complaint.assign.process`

### Categories
- `category.read`
- `category.create`
- `category.update`
- `category.delete`

### Divisions
- `division.read`
- `division.create`
- `division.update`
- `division.delete`

### Persons
- `person.read`
- `person.create`
- `person.update`
- `person.delete`

### Attachments
- `attachment.read`
- `attachment.create`
- `attachment.update`
- `attachment.delete`

### Messages
- `message.read`
- `message.create`
- `message.update`
- `message.delete`

### Logs
- `log.view`
- `log.process`

## Tips

1. **Super Admin Bypass**: Users with role code `super_admin` automatically have all permissions
2. **Use Can for UI**: Use `<Can>` component for showing/hiding UI elements
3. **Use Hooks for Logic**: Use hooks (`usePermission`) for conditional logic
4. **Backend Always Validates**: Frontend checks are for UX only; backend validates all requests
5. **Permission Naming**: Format is `module.action` (e.g., `complaint.create`)
6. **Multiple Checks**: Use `anyPermissions` for OR logic, `allPermissions` for AND logic
