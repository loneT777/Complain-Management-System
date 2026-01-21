# Frontend Migration Guide - Server-Side Search

## Overview
This guide helps you update your React frontend components to use the new server-side search functionality instead of client-side filtering.

## Benefits of Server-Side Search
- ✅ Faster performance (no need to load all data)
- ✅ Reduced memory usage on client
- ✅ Better scalability for large datasets
- ✅ Reduced API payload sizes
- ✅ Real-time search across all records (not just loaded ones)

## Migration Steps

### Step 1: Update API Calls

**Before (Client-Side):**
```javascript
// Fetching all data
const response = await fetch('/api/users');
const data = await response.json();
setUsers(data.data);

// Filtering in frontend
const filtered = users.filter(user => 
  user.username.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**After (Server-Side):**
```javascript
// Fetching filtered data
const response = await fetch(`/api/users?search=${searchTerm}&per_page=10&page=${currentPage}`);
const result = await response.json();
setUsers(result.data);
setPagination(result.pagination);
```

### Step 2: Update State Management

**Before:**
```javascript
const [users, setUsers] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [filteredUsers, setFilteredUsers] = useState([]);

// Client-side filtering
useEffect(() => {
  const filtered = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  setFilteredUsers(filtered);
}, [searchTerm, users]);
```

**After:**
```javascript
const [users, setUsers] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [pagination, setPagination] = useState({});
const [loading, setLoading] = useState(false);

// Server-side search with debounce
useEffect(() => {
  const delayDebounce = setTimeout(() => {
    fetchUsers();
  }, 500); // Wait 500ms after user stops typing

  return () => clearTimeout(delayDebounce);
}, [searchTerm, currentPage]);

const fetchUsers = async () => {
  setLoading(true);
  try {
    const response = await fetch(
      `/api/users?search=${searchTerm}&per_page=10&page=${currentPage}`
    );
    const result = await response.json();
    setUsers(result.data);
    setPagination(result.pagination);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    setLoading(false);
  }
};
```

### Step 3: Update Search Input Handler

**Before:**
```javascript
<input 
  type="text" 
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search..."
/>
```

**After (Same, but triggers server-side search):**
```javascript
<input 
  type="text" 
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  }}
  placeholder="Search..."
/>
{loading && <span>Searching...</span>}
```

### Step 4: Update Pagination

**Before (Client-Side):**
```javascript
const totalPages = Math.ceil(filteredUsers.length / perPage);
const startIndex = (currentPage - 1) * perPage;
const endIndex = startIndex + perPage;
const displayedUsers = filteredUsers.slice(startIndex, endIndex);
```

**After (Server-Side):**
```javascript
// Data already paginated from server
const displayedUsers = users; // No slicing needed

// Pagination info from server
const { current_page, last_page, total, from, to } = pagination;
```

### Step 5: Reusable Search Hook

Create a custom hook for search functionality:

```javascript
// hooks/useServerSearch.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useServerSearch = (endpoint, initialPerPage = 10) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentPage, perPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(endpoint, {
        params: {
          search: searchTerm,
          per_page: perPage,
          page: currentPage
        }
      });

      if (response.data.success) {
        setData(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    pagination,
    refresh
  };
};
```

**Usage:**
```javascript
import { useServerSearch } from './hooks/useServerSearch';

function UsersPage() {
  const {
    data: users,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pagination,
    refresh
  } = useServerSearch('/api/users', 20);

  return (
    <div>
      <input 
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // Reset to page 1
        }}
        placeholder="Search users..."
      />
      
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.person?.full_name}</td>
              <td>{user.role?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Pagination 
        currentPage={currentPage}
        lastPage={pagination.last_page}
        onPageChange={setCurrentPage}
      />
      
      <div>
        Showing {pagination.from} to {pagination.to} of {pagination.total} results
      </div>
    </div>
  );
}
```

## Component-Specific Migration Examples

### Example 1: Users Component

**File:** `react/src/views/security/Users.jsx`

```javascript
// Add these imports
import { useState, useEffect } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const perPage = 10;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users', {
        params: { search: searchTerm, per_page: perPage, page: currentPage }
      });
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />
      {/* Display users and pagination */}
    </div>
  );
}
```

### Example 2: Permissions Component

**File:** `react/src/views/security/Permissions.jsx`

Remove client-side filtering logic and replace with server-side search:

```javascript
// REMOVE this client-side filtering:
const filtered = permissions.filter(permission => 
  permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  permission.code.toLowerCase().includes(searchTerm.toLowerCase())
);

// REPLACE with server-side API call:
useEffect(() => {
  const fetchPermissions = async () => {
    const response = await axios.get('/api/permissions', {
      params: { search: searchTerm, per_page: 10, page: currentPage }
    });
    setPermissions(response.data.data);
    setPagination(response.data.pagination);
  };
  fetchPermissions();
}, [searchTerm, currentPage]);
```

### Example 3: Categories Component

Categories already support search, ensure you're using it properly:

```javascript
const fetchCategories = async () => {
  const response = await axios.get('/api/categories', {
    params: { 
      search: searchTerm, 
      per_page: perPage, 
      page: currentPage 
    }
  });
  setCategories(response.data.data);
  setPagination(response.data.pagination);
};
```

## Performance Optimization Tips

### 1. Debouncing
Always debounce search input to avoid excessive API calls:

```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce((term) => {
  setSearchTerm(term);
  setCurrentPage(1);
}, 500);

<input onChange={(e) => debouncedSearch(e.target.value)} />
```

### 2. Loading States
Show loading indicators during search:

```javascript
{loading ? (
  <div className="spinner">Loading...</div>
) : (
  <table>{/* Your data */}</table>
)}
```

### 3. Empty States
Handle no results gracefully:

```javascript
{!loading && users.length === 0 && (
  <div>
    {searchTerm ? 
      `No results found for "${searchTerm}"` : 
      'No users available'
    }
  </div>
)}
```

### 4. Error Handling
Display errors to users:

```javascript
{error && (
  <div className="alert alert-danger">
    Error loading data: {error}
  </div>
)}
```

## Testing Checklist

- [ ] Search input triggers API call
- [ ] Results update after typing stops (debounced)
- [ ] Pagination works correctly
- [ ] Loading states display properly
- [ ] Empty search shows all results
- [ ] Error states are handled
- [ ] Page resets to 1 when search term changes
- [ ] Per-page selector works (if implemented)
- [ ] Search works across all searchable fields
- [ ] Results match backend search logic

## Common Issues & Solutions

### Issue 1: Too Many API Calls
**Problem:** API called on every keystroke
**Solution:** Implement debouncing (see examples above)

### Issue 2: Old Data Showing
**Problem:** Cached data from previous search
**Solution:** Clear data before fetching:
```javascript
const fetchData = async () => {
  setData([]); // Clear old data
  setLoading(true);
  // ... fetch new data
};
```

### Issue 3: Pagination Not Resetting
**Problem:** Still on page 5 when searching
**Solution:** Reset page to 1 when search changes:
```javascript
const handleSearchChange = (e) => {
  setSearchTerm(e.target.value);
  setCurrentPage(1); // Reset pagination
};
```

## Next Steps

1. Update each component one at a time
2. Test thoroughly after each change
3. Remove old client-side filtering code
4. Update tests to use server-side search
5. Monitor API performance
6. Consider adding search analytics

## Reference

See [SERVER_SIDE_SEARCH.md](SERVER_SIDE_SEARCH.md) for complete API documentation.
