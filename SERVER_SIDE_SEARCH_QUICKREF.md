# Server-Side Search Quick Reference

## All Search Endpoints

| Module | Endpoint | Searchable Fields |
|--------|----------|------------------|
| **Complaints** | `GET /api/complaints` | title, reference_no, complainant_name, complainant_phone, complainant.full_name |
| **Users** | `GET /api/users` | username, designation, person.full_name, person.email, person.nic, role.name, division.name |
| **Categories** | `GET /api/categories` | category_name, code, description |
| **Roles** | `GET /api/roles` | name, description |
| **Divisions** | `GET /api/divisions` | name, code, location, officer_in_charge |
| **Persons** | `GET /api/persons` | full_name, nic, email, office_phone, whatsapp, designation, code |
| **Messages** | `GET /api/messages` | message, type, complaint.reference_no, complaint.title |
| **Attachments** | `GET /api/attachments` | complaint.reference_no, complaint.title, file_name, description |
| **Assignments** | `GET /api/complaint_assignments` | remark, complaint.reference_no, complaint.title, assigneeDivision.name, assigneeUser.person.full_name |
| **Logs** | `GET /api/complaint_logs` | action, remark, complaint.reference_no, complaint.title, assignee.full_name, status.name |
| **Permissions** | `GET /api/permissions` | name, code, module, description |
| **Role Permissions** | `GET /api/roles-with-permissions` | role.name, role.description, permissions.name, permissions.code |

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | '' | Search term |
| `per_page` | integer | 10 | Items per page |
| `page` | integer | 1 | Current page number |

## Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 47,
    "from": 1,
    "to": 10
  }
}
```

## Example Usage

### JavaScript/Fetch
```javascript
const searchTerm = 'john';
const response = await fetch(`/api/users?search=${searchTerm}&per_page=20`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
});
const data = await response.json();
```

### Axios
```javascript
const data = await axios.get('/api/users', {
  params: { search: 'john', per_page: 20 }
});
```

### React Hook Example
```javascript
const [searchTerm, setSearchTerm] = useState('');
const [page, setPage] = useState(1);

useEffect(() => {
  const fetchData = async () => {
    const response = await fetch(
      `/api/users?search=${searchTerm}&per_page=10&page=${page}`
    );
    const result = await response.json();
    setData(result.data);
    setPagination(result.pagination);
  };
  fetchData();
}, [searchTerm, page]);
```

## Implementation Status

✅ **Implemented Controllers:**
- ComplaintController - Already had search
- CategoryController - Already had search  
- RoleController - Already had search
- DivisionController - Already had search
- MessageController - Already had search
- AttachmentController - Already had search
- UserController - ✨ **NEW** - Enhanced with full search
- PersonController - ✨ **NEW** - Enhanced with full search and pagination
- PermissionController - ✨ **NEW** - Enhanced with full search and pagination
- ComplaintAssignmentController - ✨ **NEW** - Enhanced with full search and pagination
- ComplaintLogController - ✨ **NEW** - Enhanced with full search and pagination
- RolePermissionController - ✨ **NEW** - Enhanced with full search and pagination

## Features

- ✅ Case-insensitive search
- ✅ Multi-field search
- ✅ Relationship field search
- ✅ Server-side pagination
- ✅ Role-based filtering
- ✅ Standardized response format
- ✅ Error handling
- ✅ Performance optimized with eager loading
- ✅ Reusable Searchable trait created

## Files Modified/Created

### Modified Controllers:
1. `app/Http/Controllers/UserController.php`
2. `app/Http/Controllers/PersonController.php`
3. `app/Http/Controllers/PermissionController.php`
4. `app/Http/Controllers/ComplaintAssignmentController.php`
5. `app/Http/Controllers/ComplaintLogController.php`
6. `app/Http/Controllers/RolePermissionController.php`

### Created Files:
1. `app/Traits/Searchable.php` - Reusable search trait
2. `SERVER_SIDE_SEARCH.md` - Comprehensive documentation
3. `SERVER_SIDE_SEARCH_QUICKREF.md` - This quick reference

## Notes

- All endpoints require authentication (`auth:sanctum` middleware)
- Role-based access control is enforced
- Empty search returns all results (paginated)
- Results ordered by creation date (newest first)
- All changes are backward compatible
