# Server-Side Search Implementation

## Overview
This document describes the comprehensive server-side search functionality implemented across all pages in the Complaint Management System.

## Implemented Search Endpoints

All search endpoints support the following query parameters:
- `search` - Search term to filter results
- `per_page` - Number of results per page (default: 10)
- `page` - Current page number (default: 1)

### 1. Complaints Search
**Endpoint:** `GET /api/complaints?search={term}&per_page=10&page=1`

**Searchable Fields:**
- Title
- Reference number
- Complainant name
- Complainant phone
- Complainant details (via relationship)

**Example:**
```javascript
fetch('/api/complaints?search=water&per_page=15')
```

---

### 2. Users Search
**Endpoint:** `GET /api/users?search={term}&per_page=10&page=1`

**Searchable Fields:**
- Username (email)
- Designation
- Person full name (via relationship)
- Person email (via relationship)
- Person NIC (via relationship)
- Role name (via relationship)
- Division name (via relationship)

**Example:**
```javascript
fetch('/api/users?search=john&per_page=20')
```

---

### 3. Categories Search
**Endpoint:** `GET /api/categories?search={term}&per_page=10&page=1`

**Searchable Fields:**
- Category name
- Code
- Description

**Example:**
```javascript
fetch('/api/categories?search=electrical')
```

---

### 4. Roles Search
**Endpoint:** `GET /api/roles?search={term}&per_page=10&page=1`

**Searchable Fields:**
- Role name
- Description

**Example:**
```javascript
fetch('/api/roles?search=manager')
```

---

### 5. Divisions Search
**Endpoint:** `GET /api/divisions?search={term}&per_page=10&page=1`

**Searchable Fields:**
- Division name
- Code
- Location
- Officer in charge

**Example:**
```javascript
fetch('/api/divisions?search=engineering')
```

---

### 6. Persons Search
**Endpoint:** `GET /api/persons?search={term}&per_page=10&page=1`

**Searchable Fields:**
- Full name
- NIC
- Email
- Office phone
- WhatsApp
- Designation
- Code

**Additional Filters:**
- `division_id` - Filter by division

**Example:**
```javascript
fetch('/api/persons?search=jane&division_id=5')
```

---

### 7. Messages Search
**Endpoint:** `GET /api/messages?search={term}&per_page=10&page=1`

**Searchable Fields:**
- Message content
- Message type
- Complaint reference number (via relationship)
- Complaint title (via relationship)

**Role-Based Filtering:**
- Super Admin & Complaint Manager: All messages
- Complainant: Only their complaint messages
- Division User: Division complaint messages
- Regular User: Accessible complaint messages

**Example:**
```javascript
fetch('/api/messages?search=urgent')
```

---

### 8. Attachments Search
**Endpoint:** `GET /api/attachments?search={term}&per_page=10&page=1`

**Searchable Fields:**
- Complaint reference number
- Complaint title
- File name
- Description

**Example:**
```javascript
fetch('/api/attachments?search=report.pdf')
```

---

### 9. Complaint Assignments Search
**Endpoint:** `GET /api/complaint_assignments?search={term}&per_page=10&page=1`

**Searchable Fields:**
- Remark
- Complaint reference number (via relationship)
- Complaint title (via relationship)
- Assignee division name (via relationship)
- Assignee user full name (via relationship)

**Additional Filters:**
- `complaint_id` - Filter by specific complaint

**Example:**
```javascript
fetch('/api/complaint_assignments?search=urgent&complaint_id=123')
```

---

### 10. Complaint Logs Search
**Endpoint:** `GET /api/complaint_logs?search={term}&per_page=10&page=1`

**Searchable Fields:**
- Action
- Remark
- Complaint reference number (via relationship)
- Complaint title (via relationship)
- Assignee full name (via relationship)
- Status name (via relationship)

**Additional Filters:**
- `complaint_id` - Filter by specific complaint

**Example:**
```javascript
fetch('/api/complaint_logs?search=assigned')
```

---

### 11. Permissions Search
**Endpoint:** `GET /api/permissions?search={term}&per_page=10&page=1`

**Searchable Fields:**
- Permission name
- Code
- Module
- Description

**Example:**
```javascript
fetch('/api/permissions?search=complaint.create')
```

---

### 12. Role Permissions Search
**Endpoint:** `GET /api/roles-with-permissions?search={term}&per_page=10&page=1`

**Searchable Fields:**
- Role name
- Role description
- Permission name (via relationship)
- Permission code (via relationship)

**Example:**
```javascript
fetch('/api/roles-with-permissions?search=engineer')
```

---

## Response Format

All search endpoints return a standardized response format:

```json
{
  "success": true,
  "data": [
    // Array of results
  ],
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

## Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (if debug mode enabled)"
}
```

## Implementation Details

### 1. Search Logic
- Case-insensitive search using `LIKE` operator
- Searches across multiple fields simultaneously
- Supports relationship searches (e.g., searching user by role name)
- Uses `OR` conditions between different fields

### 2. Pagination
- Server-side pagination to reduce data transfer
- Configurable page size via `per_page` parameter
- Default page size: 10 items
- Returns complete pagination metadata

### 3. Performance Optimizations
- Eager loading of relationships to avoid N+1 queries
- Indexed database columns for faster searches
- Limited result sets with pagination

### 4. Security
- All endpoints protected by authentication middleware (`auth:sanctum`)
- Role-based access control enforced
- Permission checks before data access

## Usage Examples

### React/JavaScript Integration

```javascript
// Example hook for search functionality
const useServerSearch = (endpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  
  const search = async (searchTerm, page = 1, perPage = 10) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${endpoint}?search=${searchTerm}&per_page=${perPage}&page=${page}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { data, loading, pagination, search };
};

// Usage
const { data, loading, pagination, search } = useServerSearch('/api/users');
search('john', 1, 20);
```

### Axios Integration

```javascript
import axios from 'axios';

const searchData = async (endpoint, searchTerm, page = 1, perPage = 10) => {
  try {
    const response = await axios.get(endpoint, {
      params: {
        search: searchTerm,
        per_page: perPage,
        page: page
      }
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

// Usage
const results = await searchData('/api/complaints', 'water leak', 1, 15);
```

## Reusable Search Trait

A `Searchable` trait has been created in `app/Traits/Searchable.php` for future enhancements:

```php
use App\Traits\Searchable;

class NewController extends Controller
{
    use Searchable;
    
    public function index(Request $request)
    {
        $query = Model::query();
        
        // Apply search
        $query->search($request->input('search', ''), [
            'field1',
            'field2',
            'relation.field'
        ]);
        
        // Get paginated results
        $items = $query->paginate($request->input('per_page', 10));
        
        // Return standardized response
        return response()->json($this->paginatedResponse($items));
    }
}
```

## Testing

Test search functionality using:

1. **Browser/Postman:**
```
GET http://localhost:8000/api/users?search=john&per_page=10
Authorization: Bearer {your_token}
```

2. **cURL:**
```bash
curl -X GET "http://localhost:8000/api/users?search=john&per_page=10" \
  -H "Authorization: Bearer {your_token}" \
  -H "Accept: application/json"
```

## Maintenance

When adding new searchable fields:
1. Update the controller's index method
2. Add the field to the search query
3. Test the search functionality
4. Update this documentation

## Notes

- All searches are performed on the server-side for security and performance
- Empty search terms return all results (paginated)
- Search is case-insensitive
- Results are ordered by creation date (newest first) unless specified otherwise
- All endpoints maintain backward compatibility with existing frontend code
