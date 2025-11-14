import { useState, useEffect, Fragment, useCallback, useRef } from 'react';
import MainCard from 'components/Card/MainCard';
import { Table, Button, Alert, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { Save, Loader2 } from 'lucide-react';
import Pagination from './Pagination';
const API_URL = import.meta.env.VITE_API_URL;

export default function RolePermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [originalRolePermissions, setOriginalRolePermissions] = useState({}); // Store original state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({}); // Track saving state per role
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [noResults, setNoResults] = useState(false); // New state for no results
  
  // Permission state
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 5;

  // Permissions pagination state
  const [currentPermissionPage, setCurrentPermissionPage] = useState(1);
  const [totalPermissionPages, setTotalPermissionPages] = useState(1);
  const [permissionSearch, setPermissionSearch] = useState(''); // New state for permission search
  
  // Refs for tracking component state and abort controllers
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const isFetchingRef = useRef(false); // Track if we're currently fetching

  // --- Get auth token ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  };

  // --- Fetch user permissions ---
  const fetchUserPermissions = useCallback(() => {
    try {
      const permissionsString = localStorage.getItem('permissions');
      console.log("Permissions from localStorage:", permissionsString);
      
      if (permissionsString) {
        try {
          const permissions = JSON.parse(permissionsString);
          if (Array.isArray(permissions)) {
            setUserPermissions(permissions);
            console.log("Set user permissions:", permissions);
          } else {
            console.warn("Permissions from localStorage is not an array:", permissions);
            setUserPermissions([]);
          }
        } catch (e) {
          console.error("Error parsing permissions from localStorage:", e);
          setUserPermissions([]);
        }
      } else {
        console.warn("No permissions found in localStorage");
        setUserPermissions([]);
      }
    } catch (error) {
      console.error("Error fetching permissions from localStorage:", error);
      setUserPermissions([]);
    } finally {
      if (isMountedRef.current) {
        setPermissionsLoaded(true);
        console.log("Permissions loading completed");
      }
    }
  }, []);

  // --- Check user permissions ---
  const hasPermission = useCallback((permissionName) => {
    return userPermissions.includes(permissionName);
  }, [userPermissions]);

  // Fetch data on component mount
  useEffect(() => {
    fetchUserPermissions();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Separate useEffect for initial data load
  useEffect(() => {
    if (permissionsLoaded && hasPermission('Security_read_all')) {
      fetchRoles(currentPage, search);
      fetchPermissions(currentPermissionPage, permissionSearch);
      fetchRolePermissions();
    }
  }, [permissionsLoaded]); // Only depend on permissionsLoaded for initial load

  // Separate useEffect for page changes
  useEffect(() => {
    if (permissionsLoaded && hasPermission('Security_read_all')) {
      fetchRoles(currentPage, search);
    }
  }, [currentPage, search]); // Only depend on currentPage and search

  // Separate useEffect for permission page changes
  useEffect(() => {
    if (permissionsLoaded && hasPermission('Security_read_all')) {
      fetchPermissions(currentPermissionPage, permissionSearch);
    }
  }, [currentPermissionPage]); // Only depend on currentPermissionPage

  // Fetch roles with pagination (matching Designations example)
  const fetchRoles = (page = 1, search = null) => {
    if (!hasPermission('Security_read_all') || !isMountedRef.current || isFetchingRef.current) return;
    
    if (search && search.length < 3) {
      //minimum 3 characters should be there
      return;
    }
    var searchTxt = search ? search : '';
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    isFetchingRef.current = true;
    setLoading(true);
    setError('');
    setNoResults(false);
    
    axios
      .get(`${API_URL}/roles?page=${page}${searchTxt ? `&search=${searchTxt}` : ''}`, {
        headers: getAuthHeaders(),
        signal: abortControllerRef.current.signal
      })
      .then((res) => {
        if (!isMountedRef.current) return;
        
        console.log("Roles API response:", res.data); // Debug log
        
        // Handle both array response (old) and paginated response (new)
        if (Array.isArray(res.data)) {
          setRoles(res.data);
          setTotalPages(1);
        } else if (res.data && Array.isArray(res.data.data)) {
          setRoles(res.data.data);
          setTotalPages(res.data.last_page || 1);
          // Only update current page if it's different from what we requested
          if (res.data.current_page && res.data.current_page !== page) {
            setCurrentPage(res.data.current_page);
          }
        } else {
          setRoles([]);
          setTotalPages(1);
        }
        
        // Check if no results found
        if (searchTxt && (Array.isArray(res.data) ? res.data.length === 0 : 
            (res.data && res.data.data && res.data.data.length === 0))) {
          setNoResults(true);
        }
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        
        // Don't show error if request was aborted
        if (axios.isCancel(err)) {
          console.log('Request canceled:', err.message);
          return;
        }
        
        console.error(err);
        setError("Failed to fetch roles. Please try again.");
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('user');
          localStorage.removeItem('userPermissions');
          window.location.href = "/login";
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setLoading(false);
          isFetchingRef.current = false;
        }
      });
  };

  // Fetch permissions with pagination and search
  const fetchPermissions = (page = 1, search = '') => {
    if (!hasPermission('Security_read_all') || !isMountedRef.current) return;
    
    if (search && search.length < 3) {
      //minimum 3 characters should be there
      return;
    }
    var searchTxt = search ? search : '';
    
    // Don't set loading to true for permission search to avoid UI flicker
    setError('');
    setNoResults(false);
    
    // Create a new AbortController for this request
    const permissionAbortController = new AbortController();
    
    axios
      .get(`${API_URL}/permissions?page=${page}&per_page=10${searchTxt ? `&search=${searchTxt}` : ''}`, {
        headers: getAuthHeaders(),
        signal: permissionAbortController.signal
      })
      .then((res) => {
        if (!isMountedRef.current) return;
        
        if (Array.isArray(res.data)) {
          setPermissions(res.data);
          setTotalPermissionPages(1);
        } else if (res.data && Array.isArray(res.data.data)) {
          setPermissions(res.data.data);
          setTotalPermissionPages(res.data.last_page || 1);
          // Only update current page if it's different from what we requested
          if (res.data.current_page && res.data.current_page !== page) {
            setCurrentPermissionPage(res.data.current_page);
          }
        } else {
          setPermissions([]);
          setTotalPermissionPages(1);
        }
        
        // Check if no results found
        if (searchTxt && (Array.isArray(res.data) ? res.data.length === 0 : 
            (res.data && res.data.data && res.data.data.length === 0))) {
          setNoResults(true);
        }
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        
        // Don't show error if request was aborted
        if (axios.isCancel(err)) {
          console.log('Permission request canceled:', err.message);
          return;
        }
        
        console.error(err);
        setError("Failed to fetch permissions. Please try again.");
      });
  };

  // Fetch role permissions (no pagination needed)
  const fetchRolePermissions = () => {
    if (!hasPermission('Security_read_all') || !isMountedRef.current) return;
    
    // Create a new AbortController for this request
    const rolePermAbortController = new AbortController();
    
    axios
      .get(`${API_URL}/role-permissions`, {
        headers: getAuthHeaders(),
        signal: rolePermAbortController.signal
      })
      .then((res) => {
        if (!isMountedRef.current) return;
        
        const permissionsMap = {};
        if (Array.isArray(res.data)) {
          res.data.forEach(rp => {
            if (!permissionsMap[rp.role_id]) {
              permissionsMap[rp.role_id] = [];
            }
            permissionsMap[rp.role_id].push(rp.permission_id);
          });
        }
        
        setRolePermissions(permissionsMap);
        setOriginalRolePermissions(JSON.parse(JSON.stringify(permissionsMap))); // Deep copy for comparison
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        
        // Don't show error if request was aborted
        if (axios.isCancel(err)) {
          console.log('Role permissions request canceled:', err.message);
          return;
        }
        
        console.error(err);
        setError("Failed to fetch role permissions. Please try again.");
      });
  };

  // Handle checkbox change
  const handlePermissionChange = (roleId, permissionId, isChecked) => {
    if (!hasPermission('Security_update')) {
      setError("You don't have permission to update role permissions");
      return;
    }
    
    setRolePermissions(prev => {
      const newRolePermissions = { ...prev };
      if (!newRolePermissions[roleId]) {
        newRolePermissions[roleId] = [];
      }

      if (isChecked) {
        if (!newRolePermissions[roleId].includes(permissionId)) {
          newRolePermissions[roleId] = [...newRolePermissions[roleId], permissionId];
        }
      } else {
        newRolePermissions[roleId] = newRolePermissions[roleId].filter(id => id !== permissionId);
      }

      return newRolePermissions;
    });
  };

  // Check if a role has unsaved changes
  const hasUnsavedChanges = (roleId) => {
    const currentPerms = rolePermissions[roleId] || [];
    const originalPerms = originalRolePermissions[roleId] || [];
    
    // Check if arrays are different (order doesn't matter)
    if (currentPerms.length !== originalPerms.length) return true;
    
    const sortedCurrent = [...currentPerms].sort();
    const sortedOriginal = [...originalPerms].sort();
    
    return !sortedCurrent.every((val, index) => val === sortedOriginal[index]);
  };

  // Save assignments for a specific role
  const saveRolePermissions = async (roleId) => {
    if (!hasPermission('Security_update')) {
      setError("You don't have permission to update role permissions");
      return;
    }
    
    setSaving(prev => ({ ...prev, [roleId]: true }));
    setError('');
    setSuccess('');
    
    try {
      const rolePerms = rolePermissions[roleId] || [];
      
      const response = await axios.post(`${API_URL}/role-permissions/sync-role`, {
        role_id: roleId,
        permission_ids: rolePerms
      }, {
        headers: getAuthHeaders()
      });
      
      // Update original permissions after successful save
      setOriginalRolePermissions(prev => ({
        ...prev,
        [roleId]: [...(rolePermissions[roleId] || [])]
      }));
      
      setSuccess(`Permissions updated successfully for ${getRoleName(roleId)}!`);
    } catch (err) {
      console.error('Save error details:', err);
      setError('Failed to save permissions. ' + (err.response?.data?.message || ''));
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        localStorage.removeItem('userPermissions');
        window.location.href = "/login";
      }
    } finally {
      setSaving(prev => ({ ...prev, [roleId]: false }));
    }
  };

  // Format role name for display
  const formatRoleName = (name) => {
    if (!name) return 'Unknown Role';
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get role name by ID
  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? formatRoleName(role.name) : 'Unknown Role';
  };

  // Group permissions by category
  const groupPermissionsByCategory = () => {
    const groups = {};
    permissions.forEach(perm => {
      if (!perm.name) return;
      
      const [category, ...actionParts] = perm.name.split(':');
      const action = actionParts.join(':').trim();

      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push({ ...perm, action });
    });
    return groups;
  };

  const permissionGroups = groupPermissionsByCategory();

  // Determine if any action permissions exist
  const hasActionPermission = hasPermission('Security_update');

  // Debounced search handler with proper cleanup
  const handlePermissionSearchChange = useCallback((e) => {
    const value = e.target.value;
    setPermissionSearch(value);
    
    // Clear the previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set a new timeout
    searchTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && (value.length === 0 || value.length >= 3)) {
        // Reset to page 1 when searching
        setCurrentPermissionPage(1);
        fetchPermissions(1, value);
      }
    }, 500); // 500ms delay
  }, []);

  // Handle pagination change
  const handlePermissionPageChange = useCallback((page) => {
    if (page !== currentPermissionPage && isMountedRef.current) {
      console.log("Permission page change to:", page);
      setCurrentPermissionPage(page);
      // Don't call fetchPermissions here - let the useEffect handle it
    }
  }, [currentPermissionPage]);

  // Permission-based rendering
  if (!permissionsLoaded) {
    return (
      <MainCard cardClass="mt-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading permissions...</p>
        </div>
      </MainCard>
    );
  }

  if (!hasPermission('Security_read_all')) {
    return (
      <MainCard cardClass="mt-4">
        <Alert variant="danger" className="text-center py-4">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You don't have permission to view role permissions.</p>
          <p className="mb-0">Please contact your administrator for access.</p>
        </Alert>
      </MainCard>
    );
  }

  return (
    <MainCard cardClass="mt-0.9">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {noResults && <Alert variant="info">No permissions found matching your search criteria.</Alert>}

      {/* Header with title and search - title on left, search centered */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="mb-0">Role Permissions</h4>
        <div className="flex-grow-1 d-flex justify-content-center">
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Form.Control
              type="text"
              placeholder="Search Permissions: Min 3 characters"
              value={permissionSearch || ''}
              onChange={handlePermissionSearchChange}
              style={{
                paddingLeft: '35px',
                backgroundColor: '#f0f2f8',
                border: 'none',
                width: '400px'
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#888',
                pointerEvents: 'none'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.442 1.398a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
              </svg>
            </span>
          </div>
        </div>
        <div style={{ width: '250px' }}></div> {/* Empty div to balance the layout */}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <Table responsive className="mb-0 mt-2">
          <thead>
            <tr className="border-bottom">
              <th style={{ minWidth: '250px' }} className="py-2">Permission</th>
              {roles.map(role => (
                <th key={role.id} className="text-center py-2">
                  {formatRoleName(role.name)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={roles.length + 1} className="text-center py-4">
                  <Spinner animation="border" size="sm" /> Loading permissions and roles...
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={roles.length + 1} className="text-center py-4">
                  No roles found
                </td>
              </tr>
            ) : (
              <>
                {Object.entries(permissionGroups).map(([category, perms]) => (
                  <Fragment key={category}>
                    {/* Category Header */}
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <td colSpan={roles.length + 1}>
                        <strong>{category}</strong>
                      </td>
                    </tr>
                    {/* Permission Rows */}
                    {perms.map(perm => (
                      <tr key={perm.id}>
                        <td>{perm.action}</td>
                        {roles.map(role => (
                          <td key={`${role.id}-${perm.id}`} className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={rolePermissions[role.id]?.includes(perm.id) || false}
                              onChange={(e) => 
                                handlePermissionChange(role.id, perm.id, e.target.checked)
                              }
                              disabled={!hasPermission('Security_update')}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
                {hasActionPermission && (
                  <tr style={{ backgroundColor: '#f0f8ff' }}>
                    <td>
                      <strong>Save Changes</strong>
                    </td>
                    {roles.map(role => (
                      <td key={`save-${role.id}`} className="text-center">
                        {hasUnsavedChanges(role.id) && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => saveRolePermissions(role.id)}
                            disabled={saving[role.id]}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '5px',
                              justifyContent: 'center'
                            }}
                          >
                            {saving[role.id] ? (
                              <>
                                <Loader2 className="animate-spin" size={14} /> Saving...
                              </>
                            ) : (
                              <>
                                <Save size={14} /> Save
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>
      </div>
      
      <div className="mt-4">
        <div className="d-flex justify-content-center">
          <Pagination
            currentPage={currentPermissionPage}
            totalPages={totalPermissionPages}
            onPageChange={handlePermissionPageChange}
          />
        </div>
      </div>
    </MainCard>
  );
}