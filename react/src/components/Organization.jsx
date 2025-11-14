import { useState, useEffect, useCallback } from "react";
import MainCard from "components/Card/MainCard";
import { Table, Button, Form, Modal, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { Pencil, Plus, X, Save, Loader2, Lock, Building } from 'lucide-react';
import Pagination from './Pagination';
const API_URL = import.meta.env.VITE_API_URL;

export default function Organization() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [organization, setOrganization] = useState({
    name: "",
    code: "",
    coordinator_name: "",
    coordinator_designation: "",
    coordinator_phone_number: "",
    coordinator_email: "",
    parent_id: "",
  });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 5;
  
  // Parent organization search
  const [parentSearchTerm, setParentSearchTerm] = useState("");
  const [parentSearchResults, setParentSearchResults] = useState([]);
  const [allParentOrganizations, setAllParentOrganizations] = useState([]);
  
  // Permission state
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Add session state variables
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loginSessions, setLoginSessions] = useState([]);

  // --- Get auth token with useCallback ---
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }, []);

  // --- Check user permissions with useCallback ---
  const hasPermission = useCallback((permissionName) => {
    return userPermissions.includes(permissionName);
  }, [userPermissions]);

  // --- Get user permissions from localStorage only ---
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
      setPermissionsLoaded(true);
      console.log("Permissions loading completed");
    }
  }, []);

  // Fetch organizations with pagination and search with useCallback
  const fetchOrganizations = useCallback((page = 1, searchText = null) => {
    if (!hasPermission('Organization_read_all')) return;
    
    if (searchText && searchText.length < 3) {
      // minimum 3 characters should be there
      return;
    }
    
    var searchTxt = searchText ? searchText : '';
    
    setLoading(true);
    axios
      .get(`${API_URL}/organizations?page=${page}&with=parent${searchTxt ? `&search=${searchTxt}` : ''}`, { headers: getAuthHeaders() })
      .then((res) => {
        // Handle both array response (old) and paginated response (new)
        if (Array.isArray(res.data)) {
          setOrganizations(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setOrganizations(res.data.data);
          setTotalPages(res.data.last_page || 1);
          setCurrentPage(res.data.current_page || 1);
        } else {
          setOrganizations([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setSubmitError("Failed to fetch organizations. Please try again.");
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('user');
          localStorage.removeItem('userPermissions');
          window.location.href = "/login";
        }
      })
      .finally(() => setLoading(false));
  }, [hasPermission, getAuthHeaders]);
  
  // Load ALL parent organizations for dropdown with useCallback
  const loadParentOrganizations = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/organizations?all_parents=true`, { 
        headers: getAuthHeaders() 
      });
      
      let parentOrgs = [];
      if (Array.isArray(res.data)) {
        parentOrgs = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        parentOrgs = res.data.data;
      }
      
      // Filter out the current organization if editing
      if (editingOrganization) {
        parentOrgs = parentOrgs.filter(org => org.id !== editingOrganization.id);
      }
      
      setAllParentOrganizations(parentOrgs);
      setParentSearchResults(parentOrgs);
    } catch (error) {
      console.error("Error loading parent organizations:", error);
    }
  }, [getAuthHeaders, editingOrganization]);
  
  // Search for organizations matching the term with useCallback
  const searchOrganizations = useCallback(async (term) => {
    // If term is empty, show all parent organizations
    if (!term || term.trim() === '') {
      setParentSearchResults(allParentOrganizations);
      return;
    }

    try {
      const searchLower = term.toLowerCase();
      
      // First search locally in the loaded parent organizations
      let localResults = allParentOrganizations.filter(org => 
        // Match by name or code
        (org.name.toLowerCase().includes(searchLower) || 
        (org.code && org.code.toLowerCase().includes(searchLower))) &&
        // Don't include the current organization if editing
        (!editingOrganization || org.id !== editingOrganization.id)
      );
      
      // If we have local results, use those
      if (localResults.length > 0) {
        setParentSearchResults(localResults);
        return;
      }
      
      // Otherwise make an API call
      const response = await axios.get(
        `${API_URL}/organizations?search=${term}&all_parents=true`, 
        { headers: getAuthHeaders() }
      );
      
      let results = [];
      if (Array.isArray(response.data)) {
        results = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        results = response.data.data;
      }
      
      // Filter out the current organization if editing
      if (editingOrganization) {
        results = results.filter(org => org.id !== editingOrganization.id);
      }
      
      setParentSearchResults(results);
    } catch (error) {
      console.error("Error searching organizations:", error);
    }
  }, [allParentOrganizations, editingOrganization, getAuthHeaders]);

  // Get the current session ID from localStorage with useCallback
  const getCurrentSessionId = useCallback(() => {
    try {
      const sessionId = localStorage.getItem('login_session_id');
      setCurrentSessionId(sessionId);
      return sessionId;
    } catch (error) {
      console.error("Error getting session ID from local storage:", error);
      return null;
    }
  }, []);

  // Add function to fetch login sessions with useCallback
  const fetchLoginSessions = useCallback(async () => {
    // try {
    //   const res = await axios.get(`${API_URL}/login-sessions`, { headers: getAuthHeaders() });
    //   const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    //   setLoginSessions(data);
    // } catch (error) {
    //   console.error('Error fetching login sessions:', error);
    //   setLoginSessions([]);
    // }
  }, [getAuthHeaders]);

  // Effect to handle parent search with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchOrganizations(parentSearchTerm);
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [parentSearchTerm, searchOrganizations]);
  
  // Initialize permissions and data
  useEffect(() => {
    // Get permissions from API
    fetchUserPermissions();
    
    // Add these lines to fetch login sessions and get current session ID
    fetchLoginSessions();
    getCurrentSessionId();
  }, [fetchUserPermissions, fetchLoginSessions, getCurrentSessionId]);
  
  useEffect(() => {
    if (permissionsLoaded) {
      if (hasPermission('Organization_read_all')) {
        fetchOrganizations(currentPage, search);
        loadParentOrganizations(); // Load parent organizations when component mounts
      }
    }
  }, [permissionsLoaded, currentPage, search, hasPermission, fetchOrganizations, loadParentOrganizations]);
  
  // Open modal for add/edit with useCallback
  const openModal = useCallback((org = null) => {
    // Check permissions before opening modal
    if (org && !hasPermission('Organization_update')) {
      setSubmitError("You don't have permission to update organizations");
      return;
    }
    
    if (!org && !hasPermission('Organization_create')) {
      setSubmitError("You don't have permission to create organizations");
      return;
    }
    
    setErrors({});
    setSubmitError(null);
    
    if (org) {
      setEditingOrganization(org);
      setOrganization({
        name: org.name || "",
        code: org.code || "",
        coordinator_name: org.coordinator_name || "",
        coordinator_designation: org.coordinator_designation || "",
        coordinator_phone_number: org.coordinator_phone_number || "",
        coordinator_email: org.coordinator_email || "",
        parent_id: org.parent_id || "",
      });
      
      // Set parent search term if there's a parent
      if (org.parent_id) {
        const parentOrg = organizations.find(o => o.id === org.parent_id) || allParentOrganizations.find(o => o.id === org.parent_id);
        if (parentOrg) {
          setParentSearchTerm(parentOrg.name);
        } else if (org.parent) {
          setParentSearchTerm(org.parent.name);
        } else {
          setParentSearchTerm('');
        }
      } else {
        setParentSearchTerm('');
      }
    } else {
      setEditingOrganization(null);
      setOrganization({
        name: "",
        code: "",
        coordinator_name: "",
        coordinator_designation: "",
        coordinator_phone_number: "",
        coordinator_email: "",
        parent_id: "",
      });
      setParentSearchTerm('');
    }
    setShowModal(true);
    // Show all parent organizations by default when opening modal
    setParentSearchResults(allParentOrganizations);
  }, [hasPermission, organizations, allParentOrganizations]);
  
  // Close modal with useCallback
  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingOrganization(null);
    setOrganization({
      name: "",
      code: "",
      coordinator_name: "",
      coordinator_designation: "",
      coordinator_phone_number: "",
      coordinator_email: "",
      parent_id: "",
    });
    setErrors({});
    setSubmitError(null);
    setParentSearchTerm('');
    setParentSearchResults(allParentOrganizations);
  }, [allParentOrganizations]);

  // Frontend validation with useCallback
  const validate = useCallback(() => {
    let tempErrors = {};
    
    // Name validation
    if (!organization.name?.trim()) {
      tempErrors.name = "Organization name is required";
    } else if (organization.name.length > 100) {
      tempErrors.name = "Organization name must be 100 characters or less";
    } else {
      // Check for uniqueness
      const isDuplicate = organizations.some(
        (org) =>
          org.name.toLowerCase() === organization.name.toLowerCase() &&
          (!editingOrganization || org.id !== editingOrganization.id)
      );
      if (isDuplicate) {
        tempErrors.name = "This organization name already exists";
      }
    }
    
    // Code validation - Now required
    if (!organization.code?.trim()) {
      tempErrors.code = "Code is required";
    } else if (organization.code.length > 50) {
      tempErrors.code = "Code must be 50 characters or less";
    } else if (!/^[a-zA-Z0-9\-]+$/.test(organization.code)) {
      tempErrors.code = "Code must only contain letters, numbers, and hyphens";
    } else {
      // Check for uniqueness
      const isDuplicate = organizations.some(
        (org) =>
          org.code && org.code.toLowerCase() === organization.code.toLowerCase() &&
          (!editingOrganization || org.id !== editingOrganization.id)
      );
      if (isDuplicate) {
        tempErrors.code = "This code already exists";
      }
    }
    
    // Coordinator name validation - optional, but validate format if provided
    if (organization.coordinator_name?.trim()) {
      if (organization.coordinator_name.length > 100) {
        tempErrors.coordinator_name = "Coordinator name must be 100 characters or less";
      }
    }
    
    // Coordinator designation validation - Check for special characters
    if (!organization.coordinator_designation?.trim()) {
      tempErrors.coordinator_designation = "Coordinator designation is required";
    } else if (organization.coordinator_designation.length > 100) {
      tempErrors.coordinator_designation = "Coordinator designation must be 100 characters or less";
    } else if (!/^[a-zA-Z\s\'\-]+$/.test(organization.coordinator_designation)) {
      tempErrors.coordinator_designation = "Coordinator designation must only contain letters, spaces, hyphens, and apostrophes";
    }
    
    // Coordinator phone validation - Optional
    if (organization.coordinator_phone_number?.trim()) {
      if (!/^07\d{8}$/.test(organization.coordinator_phone_number)) {
        tempErrors.coordinator_phone_number = "Phone number must be 10 digits starting with 07";
      } else {
        // Check for uniqueness only if provided
        const isDuplicate = organizations.some(
          (org) =>
            org.coordinator_phone_number && 
            org.coordinator_phone_number === organization.coordinator_phone_number &&
            (!editingOrganization || org.id !== editingOrganization.id)
        );
        if (isDuplicate) {
          tempErrors.coordinator_phone_number = "This phone number already exists";
        }
      }
    }
    
    // Coordinator email validation - Optional
    if (organization.coordinator_email?.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organization.coordinator_email)) {
        tempErrors.coordinator_email = "Invalid email address";
      } else if (organization.coordinator_email.length > 150) {
        tempErrors.coordinator_email = "Email must be 150 characters or less";
      } else {
        // Check for uniqueness only if provided
        const isDuplicate = organizations.some(
          (org) =>
            org.coordinator_email && 
            org.coordinator_email.toLowerCase() === organization.coordinator_email.toLowerCase() &&
            (!editingOrganization || org.id !== editingOrganization.id)
        );
        if (isDuplicate) {
          tempErrors.coordinator_email = "This email already exists";
        }
      }
    }
    
    // Parent ID validation - Make it optional
    if (organization.parent_id && !allParentOrganizations.some(org => org.id === Number(organization.parent_id))) {
      tempErrors.parent_id = "Selected parent organization does not exist";
    }
    
    // Check if we have a session ID
    const currentSessionId = getCurrentSessionId();
    if (!currentSessionId) {
      tempErrors.general = "No active session found. Please try again or contact support.";
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }, [organization, organizations, editingOrganization, allParentOrganizations, getCurrentSessionId]);

  // Save organization with useCallback
  const saveOrganization = useCallback(async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Check permissions before saving
    if (editingOrganization && !hasPermission('Organization_update')) {
      setSubmitError("You don't have permission to update organizations");
      return;
    }
    
    if (!editingOrganization && !hasPermission('Organization_create')) {
      setSubmitError("You don't have permission to create organizations");
      return;
    }
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const headers = getAuthHeaders();
      
      // Get the current session ID
      const sessionId = getCurrentSessionId();
      if (!sessionId) {
        setErrors(prev => ({
          ...prev,
          general: "Cannot submit without an active session. Please refresh the page."
        }));
        return;
      }
      
      // Prepare organization data - convert empty string to null for parent_id
      const organizationData = {
        ...organization,
        session_id: sessionId,
        parent_id: organization.parent_id || null // Convert empty string to null
      };
      
      if (editingOrganization) {
        await axios.put(
          `${API_URL}/organizations/${editingOrganization.id}`,
          organizationData,
          { headers }
        );
      } else {
        await axios.post(
          `${API_URL}/organizations`,
          organizationData,
          { headers }
        );
      }
      
      fetchOrganizations(currentPage, search);
      loadParentOrganizations(); // Reload parent organizations after save
      closeModal();
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        localStorage.removeItem('userPermissions');
        window.location.href = "/login";
        return;
      }
      
      if (error.response && error.response.status === 422 && error.response.data.errors) {
        // Laravel validation errors
        const backendErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          backendErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(backendErrors);
      } else {
        setSubmitError(error.response?.data?.message || "Failed to save organization. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    editingOrganization, 
    hasPermission, 
    validate, 
    getAuthHeaders, 
    getCurrentSessionId, 
    organization, 
    fetchOrganizations, 
    currentPage, 
    search, 
    loadParentOrganizations, 
    closeModal
  ]);

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

  if (!hasPermission('Organization_read_all')) {
    return (
      <MainCard cardClass="mt-4">
        <Alert variant="danger" className="text-center py-4">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You don't have permission to view organizations.</p>
          <p className="mb-0">Please contact your administrator for access.</p>
        </Alert>
      </MainCard>
    );
  }

  // --- Render ---
  return (
    <MainCard cardClass="mt-0.9" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Organizations</h4>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Form.Control
            type="text"
            placeholder="Search: Min 3 characters"
            value={search || ''}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchOrganizations(1, e.target.value);
            }}
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
        {hasPermission('Organization_create') && (
          <Button variant="primary" onClick={() => openModal()} style={{ borderRadius: '0.3rem' }}>
            <Plus size={16} className="me-1" /> Add Organization
          </Button>
        )}
      </div>
      
      {/* Global Error Alert */}
      {submitError && (
        <Alert variant="danger" className="mb-3">
          {submitError}
        </Alert>
      )}
      
      <hr className="mt-4" style={{ opacity: 0.15 }} />
      
      {/* Table */}
      <div className="mt-4" style={{ 
        borderRadius: '0.3rem', 
        overflow: 'hidden' 
      }}>
        <div className="table-responsive">
          <Table hover className="mb-0" style={{ borderCollapse: 'collapse', borderColor: '#f0f0f0' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <tr>
                <th className="py-3">#</th>
                <th className="py-3">Name</th>
                <th className="py-3">Code</th>
                <th className="py-3">Parent Organization</th>
                <th className="py-3">Coordinator Name</th>
                <th className="py-3">Coordinator Designation</th>
                <th className="py-3">Coordinator Phone</th>
                <th className="py-3">Coordinator Email</th>
                {hasPermission('Organization_update') && <th className="py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={hasPermission('Organization_update') ? 9 : 8} className="text-center py-4">
                    <Spinner animation="border" size="sm" /> Loading organizations...
                  </td>
                </tr>
              ) : organizations.length === 0 ? (
                <tr>
                  <td colSpan={hasPermission('Organization_update') ? 9 : 8} className="text-center py-4">
                    No organizations found
                  </td>
                </tr>
              ) : (
                organizations.map((org, index) => (
                  <tr 
                    key={org.id || index}
                    style={{ borderBottom: '1px solid #f0f0f0' }}
                  >
                    <td className="py-2">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="py-2">
                      {/* Display organization name without indentation */}
                      {org.name}
                    </td>
                    <td className="py-2">{org.code || "-"}</td>
                    <td className="py-2">{org.parent ? org.parent.name : "-"}</td>
                    <td className="py-2">{org.coordinator_name}</td>
                    <td className="py-2">{org.coordinator_designation}</td>
                    <td className="py-2">{org.coordinator_phone_number || "-"}</td>
                    <td className="py-2">{org.coordinator_email || "-"}</td>
                    {hasPermission('Organization_update') && (
                      <td className="py-2">
                        <Button
                          variant="primary"
                          size="sm"
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '5px',
                            minWidth: '70px',
                            justifyContent: 'center'
                          }}
                          onClick={() => openModal(org)}
                        >
                          <Pencil size={14} />
                          Edit
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
      
      {/* Add Pagination Component */}
      <div className="mt-4 d-flex justify-content-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
      
      {/* Modal */}
      <Modal 
        show={showModal} 
        onHide={closeModal} 
        size="lg"
        backdrop="static"  // Prevent closing when clicking outside
        keyboard={false}   // Prevent closing with escape key
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingOrganization ? "Edit Organization" : "Add Organization"}
            {((editingOrganization && !hasPermission('Organization_update')) || 
              (!editingOrganization && !hasPermission('Organization_create'))) && 
              " (No Permission)"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" className="mb-3">
              {submitError}
            </Alert>
          )}
          
          <Form onSubmit={saveOrganization}>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter organization name"
                value={organization.name || ""}
                onChange={(e) =>
                  setOrganization({ ...organization, name: e.target.value })
                }
                isInvalid={!!errors.name}
                onClick={(e) => e.stopPropagation()} // Stop propagation on click
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Code *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter organization code"
                value={organization.code || ""}
                onChange={(e) =>
                  setOrganization({ ...organization, code: e.target.value })
                }
                isInvalid={!!errors.code}
              />
              <Form.Control.Feedback type="invalid">
                {errors.code}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Coordinator Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter coordinator name"
                value={organization.coordinator_name || ""}
                onChange={(e) =>
                  setOrganization({
                    ...organization,
                    coordinator_name: e.target.value,
                  })
                }
                isInvalid={!!errors.coordinator_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.coordinator_name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Coordinator Designation *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter coordinator designation"
                value={organization.coordinator_designation || ""}
                onChange={(e) =>
                  setOrganization({
                    ...organization,
                    coordinator_designation: e.target.value,
                  })
                }
                isInvalid={!!errors.coordinator_designation}
              />
              <Form.Control.Feedback type="invalid">
                {errors.coordinator_designation}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Coordinator Phone Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter coordinator phone number"
                value={organization.coordinator_phone_number || ""}
                onChange={(e) =>
                  setOrganization({
                    ...organization,
                    coordinator_phone_number: e.target.value,
                  })
                }
                isInvalid={!!errors.coordinator_phone_number}
              />
              <Form.Control.Feedback type="invalid">
                {errors.coordinator_phone_number}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Must be 10 digits starting with 07 (e.g., 0712345678)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Coordinator Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter coordinator email"
                value={organization.coordinator_email || ""}
                onChange={(e) =>
                  setOrganization({
                    ...organization,
                    coordinator_email: e.target.value,
                  })
                }
                isInvalid={!!errors.coordinator_email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.coordinator_email}
              </Form.Control.Feedback>
            </Form.Group>
             
            {/* Parent Organization Selection - Combined Field */}
            <Form.Group className="mb-3">
              <Form.Label>Ministry (Optional)</Form.Label>
              <Form.Select
                value={organization.parent_id || ''}
                onChange={e => setOrganization({ ...organization, parent_id: e.target.value })}
                isInvalid={!!errors.parent_id}
              >
                <option value="">-- No Parent (Top-level) --</option>
                {allParentOrganizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}{org.code ? ` (Code: ${org.code})` : ''}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.parent_id}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Leave empty if this is a top-level organization (Ministry)
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" className="me-2" onClick={closeModal}>
                <X className="me-1" size={18} /> Cancel
              </Button>
              {hasPermission('Organization_create') && !editingOrganization && (
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="me-1 animate-spin" size={18} /> Saving...
                    </>
                  ) : (
                    <>
                      <Building className="me-1" size={18} /> Create Organization
                    </>
                  )}
                </Button>
              )}
              {hasPermission('Organization_update') && editingOrganization && (
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="me-1 animate-spin" size={18} /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="me-1" size={18} /> Update Organization
                    </>
                  )}
                </Button>
              )}
              {!hasPermission('Organization_create') && !editingOrganization && (
                <Button variant="primary" disabled>
                  <Lock className="me-1" size={18} /> No Permission to Create
                </Button>
              )}
              {!hasPermission('Organization_update') && editingOrganization && (
                <Button variant="primary" disabled>
                  <Lock className="me-1" size={18} /> No Permission to Update
                </Button>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </MainCard>
  );
}