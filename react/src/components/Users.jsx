import { useState, useEffect } from 'react';
import MainCard from 'components/Card/MainCard';
import { Table, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { Pencil, Plus, Save, X, Loader2, UserPlus, Lock, UserCog, ShieldAlert, ShieldCheck } from 'lucide-react';
import Pagination from './Pagination';
const API_URL = import.meta.env.VITE_API_URL;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [user, setUser] = useState({
    username: '',
    full_name: '',
    password: '',
    role_id: '',
    designation_id: ''
  });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Permission state
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // --- Get auth token ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  };

  // --- Check user permissions ---
  const hasPermission = (permissionName) => {
    // First check local storage for permissions
    const storedPermissions = localStorage.getItem('userPermissions');
    if (storedPermissions) {
      try {
        const parsedPermissions = JSON.parse(storedPermissions);
        if (Array.isArray(parsedPermissions) && parsedPermissions.includes(permissionName)) {
          return true;
        }
      } catch (error) {
        console.error("Error parsing stored permissions:", error);
      }
    }
    // Fall back to state-based permissions
    return userPermissions.includes(permissionName);
  };

  // --- Fetch user permissions ---
  const fetchUserPermissions = async () => {
    try {
      // First check if permissions are already in localStorage
      const storedPermissions = localStorage.getItem('userPermissions');
      if (storedPermissions) {
        try {
          const parsedPermissions = JSON.parse(storedPermissions);
          if (Array.isArray(parsedPermissions)) {
            console.log("Using permissions from localStorage");
            setUserPermissions(parsedPermissions);
            setPermissionsLoaded(true);
            return;
          }
        } catch (error) {
          console.error("Error parsing stored permissions:", error);
        }
      }

      // If not in localStorage or invalid, fetch from API
      console.log("Fetching permissions from API");
      const response = await axios.get(`${API_URL}/user/permissions`, {
        headers: getAuthHeaders()
      });
      const permissions = response.data.permissions || [];
      setUserPermissions(permissions);
      
      // Store in localStorage for future use
      localStorage.setItem('userPermissions', JSON.stringify(permissions));
    } catch (error) {
      console.error("Error fetching permissions:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        localStorage.removeItem('userPermissions');
        window.location.href = "/login";
      }
    } finally {
      setPermissionsLoaded(true);
    }
  };

  // Configure axios with auth
  const api = axios.create({
    baseURL: `${API_URL}`,
    headers: { 'Content-Type': 'application/json' }
  });
  
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  
  // Fetch users from API with pagination and search
  const fetchUsers = (page = 1, search = '') => {
    if (!hasPermission('Security_read_all')) return;
    
    if (search && search.length < 3) {
      //minimum 3 characters should be there
      return;
    }
    var searchTxt = search ? search : '';
    
    setLoading(true);
    api
      .get(`/users?page=${page}${search ? `&search=${search}` : ''}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setUsers(res.data.data);
          setTotalPages(res.data.last_page || 1);
          setCurrentPage(res.data.current_page || 1);
        } else {
          setUsers([]);
        }
      })
      .catch((err) => {
        setError('Failed to fetch users');
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('user');
          localStorage.removeItem('userPermissions');
          window.location.href = "/login";
        }
      })
      .finally(() => setLoading(false));
  };

  // Fetch roles for dropdown with pagination and search handling
  const fetchRoles = (page = 1, search = '') => {
    api
      .get(`/roles?page=${page}${search ? `&search=${search}` : ''}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setRoles(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setRoles(res.data.data);
          // Optionally handle pagination state here if needed
        } else {
          setRoles([]);
        }
      })
      .catch((err) => console.error('Failed to fetch roles'));
  };

  const fetchDesignations = () => {
    api
      .get(`/designations`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setDesignations(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setDesignations(res.data.data);
        } else {
          setDesignations([]);
        }
      })
      .catch((err) => console.error('Failed to fetch designations'));
  };
  
  useEffect(() => {
    fetchUserPermissions();
  }, []);
  
  useEffect(() => {
    if (permissionsLoaded) {
      if (hasPermission('Security_read_all')) {
        fetchUsers(currentPage, search);
        fetchRoles();
        fetchDesignations();
      }
    }
  }, [permissionsLoaded, currentPage, search]);
  
  // Toggle user active/inactive status
  const toggleUserStatus = (id) => {
    if (!hasPermission('Security_update')) {
      setError("You don't have permission to update users");
      return;
    }
    
    api.put(`/users/${id}/toggle-status`)
      .then(() => fetchUsers(currentPage, search))
      .catch((err) => {
        setError('Failed to toggle user status');
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('user');
          localStorage.removeItem('userPermissions');
          window.location.href = "/login";
        }
      });
  };
  
  // Open modal for create or edit
  const openModal = (user = null) => {
    // Check permissions before opening modal
    if (user && !hasPermission('Security_update')) {
      setError("You don't have permission to update users");
      return;
    }
    
    if (!user && !hasPermission('Security_create')) {
      setError("You don't have permission to create users");
      return;
    }
    
    setErrors({});
    setError('');
    if (user) {
      setEditingUser(user);
      setUser({
        username: user.username,
        full_name: user.full_name,
        password: '', // Don't pre-fill password for security
        role_id: user.role_id,
        designation_id: user.designation_id || ''
      });
    } else {
      setEditingUser(null);
      setUser({ username: '', full_name: '', password: '', role_id: '', designation_id: '' });
    }
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setUser({ username: '', full_name: '', password: '', role_id: '', designation_id: '' });
    setErrors({});
    setError('');
  };
  
  // Validation function
  const validate = () => {
    const newErrors = {};
    
    // Email validation for username
    if (!user.username.trim()) {
      newErrors.username = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.username)) {
      newErrors.username = 'Please enter a valid email address';
    }
    
    // Full name validation
    if (!user.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (!/^[A-Za-z\s\.\-]+$/.test(user.full_name)) {
      newErrors.full_name = 'Full name can only contain letters, spaces, periods, and hyphens';
    }
    
    // Password validation
    if (!editingUser && !user.password.trim()) {
      newErrors.password = 'Password is required for new users';
    } else if (user.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(user.password)) {
      newErrors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
    }
    
    // Role validation
    if (!user.role_id) {
      newErrors.role_id = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Create or update user
  const saveUser = (e) => {
    e.preventDefault();
    setError('');
    
    // Check permissions before saving
    if (editingUser && !hasPermission('Security_update')) {
      setError("You don't have permission to update users");
      return;
    }
    
    if (!editingUser && !hasPermission('Security_create')) {
      setError("You don't have permission to create users");
      return;
    }
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    const userData = {
      username: user.username.trim(),
      full_name: user.full_name.trim(),
      role_id: user.role_id,
      designation_id: user.designation_id || null
    };
    
    // Only include password if provided
    if (user.password.trim()) {
      userData.password = user.password.trim();
    }
    
    const request = editingUser 
      ? api.put(`/users/${editingUser.id}`, userData)
      : api.post('/users', userData);
    
    request
      .then(() => {
        fetchUsers(currentPage, search);
        closeModal();
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('user');
          localStorage.removeItem('userPermissions');
          window.location.href = "/login";
          return;
        }
        
        if (err.response && err.response.status === 422 && err.response.data.errors) {
          // Laravel validation errors
          const backendErrors = {};
          Object.keys(err.response.data.errors).forEach(key => {
            backendErrors[key] = err.response.data.errors[key][0];
          });
          setErrors(backendErrors);
        } else {
          const message = err.response?.data?.message || 'Operation failed';
          setError(message);
        }
      })
      .finally(() => setIsSubmitting(false));
  };
  
  // Format role name for display
  const formatRoleName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (L) => L.toUpperCase());
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Permission-based rendering
  if (!permissionsLoaded) {
    return (
      <MainCard title="Users">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading permissions...</p>
        </div>
      </MainCard>
    );
  }

  if (!hasPermission('Security_read_all')) {
    return (
      <MainCard title="Users">
        <Alert variant="danger" className="text-center py-4">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You don't have permission to view users.</p>
          <p className="mb-0">Please contact your administrator for access.</p>
        </Alert>
      </MainCard>
    );
  }

  // Determine if any action permissions exist
  const hasActionPermission = hasPermission('Security_update') || hasPermission('Security_create');

  return (
    <>
      <MainCard title="Users">
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">Users</h5>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Form.Control
              type="text"
              placeholder="Search: Min 3 characters"
              value={search || ''}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchUsers(1, e.target.value);
              }}
              style={{ paddingLeft: '35px', backgroundColor: '#f0f2f8', border: 'none', width: '400px' }}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-search"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.442 1.398a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
              </svg>
            </span>
          </div>
          {hasPermission('Security_create') && (
            <Button 
              variant="primary" 
              onClick={() => openModal()}
              style={{ borderRadius: '0.3rem' }}
            >
              <Plus size={16} className="me-1" /> Add User
            </Button>
          )}
        </div>
        
        <hr className="mt-4" style={{ opacity: 0.15 }} />
        
        <div className="mt-4" style={{ 
          width: '100%',
          borderRadius: '0.3rem', 
          overflow: 'hidden' 
        }}>
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', borderColor: '#f0f0f0' }}>
              <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <tr>
                  <th className="py-3">ID</th>
                  <th className="py-3">Email</th>
                  <th className="py-3"> Name</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Designation</th>
                  <th className="py-3">Created</th>
                  {hasActionPermission && <th className="py-3 text-center">Actions</th>}
                </tr>
              </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={hasActionPermission ? 7 : 6} className="text-center py-4">
                  <Spinner animation="border" size="sm" /> Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={hasActionPermission ? 7 : 6} className="text-center py-4">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr 
                  key={u.id}
                  style={{ borderBottom: '1px solid #f0f0f0' }}
                >
                  <td className="py-2">{u.id}</td>
                  <td className="py-2">{u.username}</td>
                  <td className="py-2">{u.full_name}</td>
                  <td className="py-2">{u.role ? formatRoleName(u.role.name) : 'No Role'}</td>
                  <td className="py-2">{u.designation ? u.designation.name : '-'}</td>
                  <td className="py-2">{formatDate(u.created_at)}</td>
                  
                  {hasActionPermission && (
                    <td className="py-2 text-center">
                      <div className="d-flex justify-content-center gap-2">
                        {hasPermission('Security_update') && (
                          <Button 
                            variant="primary" 
                            size="sm"
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '5px',
                              minWidth: '70px',
                              justifyContent: 'center',
                              borderRadius: '0.3rem'
                            }}
                            onClick={() => openModal(u)}
                          >
                            <Pencil size={14} />
                            Edit
                          </Button>
                        )}
                        {hasPermission('Security_update') && (
                          <Button 
                            style={{ 
                              padding: '0.25rem 0.5rem',
                              minWidth: '100px',
                              borderRadius: '0.3rem',
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '5px',
                              justifyContent: 'center'
                            }}
                            variant={u.is_active ? "danger" : "success"}
                            size="sm"
                            onClick={() => toggleUserStatus(u.id)}
                          >
                            {u.is_active ? (
                              <>
                                <ShieldAlert size={14} /> Deactivate
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={14} /> Activate
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
            </Table>
          </div>
          <div className="py-3 px-3 d-flex justify-content-center border-top">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => fetchUsers(page, search)} />
          </div>
        </div>
      </MainCard>

      {/* Single Modal for Create/Edit */}
      <Modal show={showModal} onHide={closeModal} size="md">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Edit User' : 'Create User'}
            {((editingUser && !hasPermission('Security_update')) || 
              (!editingUser && !hasPermission('Security_create'))) && 
              " (No Permission)"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          
          <Form onSubmit={saveUser}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                isInvalid={!!errors.username}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                value={user.full_name}
                onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                isInvalid={!!errors.full_name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.full_name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password {editingUser && '(leave blank to keep current password)'}</Form.Label>
              <Form.Control
                type="password"
                placeholder={editingUser ? 'Enter new password' : 'Enter password'}
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                isInvalid={!!errors.password}
                required={!editingUser}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Minimum 8 characters with at least: 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={user.role_id}
                onChange={(e) => setUser({ ...user, role_id: e.target.value })}
                isInvalid={!!errors.role_id}
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {formatRoleName(role.name)}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.role_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Designation</Form.Label>
              <Form.Select
                value={user.designation_id}
                onChange={(e) => setUser({ ...user, designation_id: e.target.value })}
                isInvalid={!!errors.designation_id}
              >
                <option value="">Select a designation</option>
                {designations.map((designation) => (
                  <option key={designation.id} value={designation.id}>
                    {designation.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.designation_id}
              </Form.Control.Feedback>
            </Form.Group>
            
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" className="me-2" style={{ borderRadius: '0.3rem' }} onClick={closeModal}>
                <X className="me-1" size={18} /> Cancel
              </Button>
              {hasPermission('Security_create') && !editingUser && (
                <Button variant="primary" type="submit" style={{ borderRadius: '0.3rem' }} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="me-1 animate-spin" size={18} /> Saving...
                    </>
                  ) : (
                    <>
                      <UserPlus className="me-1" size={18} /> Create User
                    </>
                  )}
                </Button>
              )}
              {hasPermission('Security_update') && editingUser && (
                <Button variant="primary" type="submit" style={{ borderRadius: '0.3rem' }} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="me-1 animate-spin" size={18} /> Saving...
                    </>
                  ) : (
                    <>
                      <UserCog className="me-1" size={18} /> Update User
                    </>
                  )}
                </Button>
              )}
              {!hasPermission('Security_create') && !editingUser && (
                <Button variant="primary" disabled style={{ borderRadius: '0.3rem' }}>
                  <Lock className="me-1" size={18} /> No Permission to Create
                </Button>
              )}
              {!hasPermission('Security_update') && editingUser && (
                <Button variant="primary" disabled style={{ borderRadius: '0.3rem' }}>
                  <Lock className="me-1" size={18} /> No Permission to Update
                </Button>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}