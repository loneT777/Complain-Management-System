import { useState, useEffect } from 'react';
import MainCard from 'components/Card/MainCard';
import { Table, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { Pencil, Plus, Save, X, Trash2, Loader2, ShieldCheck, Lock } from 'lucide-react';
import Pagination from './Pagination'; // Added this import
const API_URL = import.meta.env.VITE_API_URL;

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [permission, setPermission] = useState({ name: '' });
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
    return userPermissions.includes(permissionName);
  };

  // --- Get user permissions from localStorage or API ---
  const getUserPermissions = async () => {
    try {
      // First try to get permissions from localStorage
      const permissionsString = localStorage.getItem('userPermissions');
      if (permissionsString) {
        const permissions = JSON.parse(permissionsString);
        if (Array.isArray(permissions) && permissions.length > 0) {
          setUserPermissions(permissions);
          setPermissionsLoaded(true);
          return permissions;
        }
      }
      
      // If not in localStorage or empty, fetch from API
      const response = await axios.get(`${API_URL}/user/permissions`, {
        headers: getAuthHeaders()
      });
      const permissions = response.data.permissions || [];
      setUserPermissions(permissions);
      
      // Store in localStorage for future use
      localStorage.setItem('userPermissions', JSON.stringify(permissions));
      return permissions;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        localStorage.removeItem('userPermissions');
        window.location.href = "/login";
      }
      return [];
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
  
  // Fetch permissions from API
  const fetchPermissions = (page = 1, search = '') => {
    if (!hasPermission('Security_read_all')) return;
    
    if (search && search.length < 3) {
      //minimum 3 characters should be there
      return;
    }
    var searchTxt = search ? search : '';
    
    setLoading(true);
    api
      .get(`/permissions?page=${page}${search ? `&search=${search}` : ''}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPermissions(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setPermissions(res.data.data);
          setTotalPages(res.data.last_page || 1);
          setCurrentPage(res.data.current_page || 1);
        } else {
          setPermissions([]);
        }
      })
      .catch((err) => {
        setError('Failed to fetch permissions');
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
  
  useEffect(() => {
    // Get permissions from localStorage or API
    getUserPermissions()
    // .then(() => {
      // setPermissionsLoaded(true);
    // });
  }, []);
  
  useEffect(() => {
    if (permissionsLoaded) {
      if (hasPermission('Security_read_all')) {
        fetchPermissions(currentPage, search);
      }
    }
  }, [permissionsLoaded, currentPage, search]);
  
  // Open modal for create or edit
  const openModal = (permission = null) => {
    // Check permissions before opening modal
    if (permission && !hasPermission('Security_update')) {
      setError("You don't have permission to update permissions");
      return;
    }
    
    if (!permission && !hasPermission('Security_create')) {
      setError("You don't have permission to create permissions");
      return;
    }
    
    setErrors({});
    setError('');
    if (permission) {
      setEditingPermission(permission);
      setPermission({ name: permission.name });
    } else {
      setEditingPermission(null);
      setPermission({ name: '' });
    }
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setEditingPermission(null);
    setPermission({ name: '' });
    setErrors({});
    setError('');
  };
  
  // Validation function
  const validate = () => {
    const newErrors = {};
    
    // Permission name validation
    if (!permission.name.trim()) {
      newErrors.name = 'Permission name is required';
    } else if (!/^[a-zA-Z_]+(?:\.[a-zA-Z_]+)*$/.test(permission.name)) {
      newErrors.name = 'Permission name must be in alphanumeric with underscores and dots (e.g., "Users.Create")';
    } else if (permission.name.length > 255) {
      newErrors.name = 'Permission name must be less than 255 characters';
    } else {
      // Check for uniqueness
      const isDuplicate = permissions.some(
        (perm) =>
          perm.name.toLowerCase() === permission.name.toLowerCase() &&
          (!editingPermission || perm.id !== editingPermission.id)
      );
      if (isDuplicate) {
        newErrors.name = 'This permission name already exists';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Create or update permission
  const savePermission = (e) => {
    e.preventDefault();
    setError('');
    
    // Check permissions before saving
    if (editingPermission && !hasPermission('Security_update')) {
      setError("You don't have permission to update permissions");
      return;
    }
    
    if (!editingPermission && !hasPermission('Security_create')) {
      setError("You don't have permission to create permissions");
      return;
    }
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    const request = editingPermission 
      ? api.put(`/permissions/${editingPermission.id}`, permission)
      : api.post('/permissions', permission);
    
    request
      .then(() => {
        fetchPermissions(currentPage, search);
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
          setError(err.response?.data?.message || 'Operation failed');
        }
      })
      .finally(() => setIsSubmitting(false));
  };
  
  // Delete permission
  const deletePermission = (id) => {
    if (!hasPermission('Security_delete')) {
      setError("You don't have permission to delete permissions");
      return;
    }
    
    if (!confirm('Are you sure you want to delete this permission? This may affect role assignments.')) {
      return;
    }
    
    setLoading(true);
    api.delete(`/permissions/${id}`)
      .then(() => {
        fetchPermissions(); // Refresh the list with reindexed IDs
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
        setError(err.response?.data?.message || 'Failed to delete permission');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Permission-based rendering
  if (!permissionsLoaded) {
    return (
      <MainCard title="Permissions">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading permissions...</p>
        </div>
      </MainCard>
    );
  }

  if (!hasPermission('Security_read_all')) {
    return (
      <MainCard title="Permissions">
        <Alert variant="danger" className="text-center py-4">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You don't have permission to view permissions.</p>
          <p className="mb-0">Please contact your administrator for access.</p>
        </Alert>
      </MainCard>
    );
  }

  // Determine if any action permissions exist
  const hasActionPermission = hasPermission('Security_update') || hasPermission('Security_create') || hasPermission('Security_delete');
  
  return (
    <>
      <MainCard title="Permissions">
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">Permissions</h5>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Form.Control
              type="text"
              placeholder="Search: Min 3 characters"
              value={search || ''}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchPermissions(1, e.target.value);
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
              <Plus size={16} className="me-1" /> Add Permission
            </Button>
          )}
        </div>
        
        <hr className="mt-4" style={{ opacity: 0.15 }} />
        
        <div className="mt-4" style={{ 
          borderRadius: '0.3rem', 
          overflow: 'hidden' 
        }}>
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ borderCollapse: 'collapse', borderColor: '#f0f0f0' }}>
              <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <tr>
                  <th className="py-3">ID</th>
                  <th className="py-3">Name</th>
                  {hasActionPermission && <th className="py-3 text-end">Actions</th>}
                </tr>
              </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={hasActionPermission ? 3 : 2} className="text-center py-4">
                  <Spinner animation="border" size="sm" /> Loading permissions...
                </td>
              </tr>
            ) : permissions.length === 0 ? (
              <tr>
                <td colSpan={hasActionPermission ? 3 : 2} className="text-center py-4">
                  No permissions found
                </td>
              </tr>
            ) : (
              permissions.map((perm) => (
                <tr 
                  key={perm.id}
                  style={{ borderBottom: '1px solid #f0f0f0' }}
                >
                  <td className="py-2">{perm.id}</td>
                  <td className="py-2">{perm.name}</td>
                  {hasActionPermission && (
                    <td className="py-2 text-end">
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
                            marginRight: '0.5rem',
                            float: 'right',
                            borderRadius: '0.3rem'
                          }}
                          onClick={() => openModal(perm)}
                        >
                          <Pencil size={14} />
                          Edit
                        </Button>
                      )}
                      {hasPermission('Security_delete') && (
                        <Button 
                          variant="danger" 
                          size="sm"
                          style={{ 
                            borderRadius: '0.3rem',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '5px',
                            minWidth: '70px',
                            justifyContent: 'center'
                          }} 
                          onClick={() => deletePermission(perm.id)}
                        >
                          <Trash2 size={14} /> Delete
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
            </Table>
          </div>
          
          {/* Add Pagination Component */}
          <div className="mt-4 d-flex justify-content-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </MainCard>
      
      {/* Single Modal for Create/Edit */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPermission ? 'Edit Permission' : 'Create Permission'}
            {((editingPermission && !hasPermission('Security_update')) || 
              (!editingPermission && !hasPermission('Security_create'))) && 
              " (No Permission)"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          <Form onSubmit={savePermission}>
            <Form.Group className="mb-3">
              <Form.Label>Permission Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter permission name"
                value={permission.name || ''}
                onChange={(e) => setPermission({ ...permission, name: e.target.value })}
                isInvalid={!!errors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" className="me-2" style={{ borderRadius: '0.3rem' }} onClick={closeModal}>
                <X className="me-1" size={18} /> Cancel
              </Button>
              {hasPermission('Security_create') && !editingPermission && (
                <Button variant="primary" type="submit" style={{ borderRadius: '0.3rem' }} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="me-1 animate-spin" size={18} /> Saving...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="me-1" size={18} /> Create Permission
                    </>
                  )}
                </Button>
              )}
              {hasPermission('Security_update') && editingPermission && (
                <Button variant="primary" type="submit" style={{ borderRadius: '0.3rem' }} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="me-1 animate-spin" size={18} /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="me-1" size={18} /> Update Permission
                    </>
                  )}
                </Button>
              )}
              {!hasPermission('Security_create') && !editingPermission && (
                <Button variant="primary" disabled style={{ borderRadius: '0.3rem' }}>
                  <Lock className="me-1" size={18} /> No Permission to Create
                </Button>
              )}
              {!hasPermission('Security_update') && editingPermission && (
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