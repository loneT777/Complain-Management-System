import { useState, useEffect } from "react";
import MainCard from "components/Card/MainCard";
import { Table, Button, Form, Modal, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { Pencil, Plus, X, Save, Loader2, Lock } from 'lucide-react';
import Pagination from "./Pagination"; // Add this import

const API_URL = import.meta.env.VITE_API_URL;

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [service, setService] = useState({ name: "", code: "" });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 5;
  
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

  // Fetch services from API with pagination and search
  const fetchServices = (page = 1, search = null) => {
    if (!hasPermission('Settings_read_all')) return;
    
    if (search && search.length < 3) {
      //minimum 3 characters should be there
      return;
    }
    var searchTxt = search ? search : '';
    
    setLoading(true);
    axios
      .get(`${API_URL}/services?page=${page}${searchTxt ? `&search=${searchTxt}` : ''}`, {
        headers: getAuthHeaders()
      })
      .then((res) => {
        // Handle both array response (old) and paginated response (new)
        if (Array.isArray(res.data)) {
          setServices(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setServices(res.data.data);
          setTotalPages(res.data.last_page || 1);
          setCurrentPage(res.data.current_page || 1);
        } else {
          setServices([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setSubmitError("Failed to fetch services. Please try again.");
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
      if (hasPermission('Settings_read_all')) {
        fetchServices(currentPage, search);
      }
    }
  }, [permissionsLoaded, currentPage, search]);

  // Open modal for create or edit
  const openModal = (service = null) => {
    // Check permissions before opening modal
    if (service && !hasPermission('Settings_update')) {
      setSubmitError("You don't have permission to update category");
      return;
    }

    if (!service && !hasPermission('Settings_create')) {
      setSubmitError("You don't have permission to create category");
      return;
    }    setErrors({});
    setSubmitError(null);
    if (service) {
      setEditingService(service);
      setService({
        name: service.name || "",
        code: service.code || "",
      });
    } else {
      setEditingService(null);
      setService({ name: "", code: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setService({ name: "", code: "" });
    setErrors({});
    setSubmitError(null);
  };

  // Validation - STRICT: Both name and code are required
  const validate = () => {
    let tempErrors = {};
    
    // Name validation
    if (!service.name?.trim()) {
      tempErrors.name = "Service name is required";
    } else if (!/^[A-Za-z\s\-'.\u2019\u2013\u2014]+$/.test(service.name)) {
      tempErrors.name = "Name must only contain letters, spaces, hyphens, apostrophes, and periods";
    } else if (service.name.length > 100) {
      tempErrors.name = "Name must be 100 characters or less";
    }
    
    // Code validation - STRICT: Code is required
    if (!service.code?.trim()) {
      tempErrors.code = "Service code is required";
    } else if (!/^[A-Za-z0-9\-]+$/.test(service.code)) {
      tempErrors.code = "Code must only contain letters, numbers, and hyphens";
    } else if (service.code.length > 50) {
      tempErrors.code = "Code must be 50 characters or less";
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Create or update service
  const saveService = (e) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});
    
    // Check permissions before saving
    if (editingService && !hasPermission('Settings_update')) {
      setSubmitError("You don't have permission to update services");
      return;
    }
    
    if (!editingService && !hasPermission('Settings_create')) {
      setSubmitError("You don't have permission to create services");
      return;
    }
    
    // STRICT VALIDATION: Prevent submission if name or code is empty
    if (!service.name?.trim() || !service.code?.trim()) {
      let tempErrors = {};
      if (!service.name?.trim()) {
        tempErrors.name = "Service name is required";
      }
      if (!service.code?.trim()) {
        tempErrors.code = "Service code is required";
      }
      setErrors(tempErrors);
      return;
    }
    
    setIsSubmitting(true);
    const headers = getAuthHeaders();
    
    // Prepare data
    const dataToSend = {
      name: service.name,
      code: service.code
    };
    
    if (editingService) {
      // Update service
      axios
        .put(`${API_URL}/services/${editingService.id}`, dataToSend, { headers })
        .then(() => {
          fetchServices(currentPage, search);
          closeModal();
        })
        .catch((err) => {
          console.error(err);
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
            setSubmitError("Please fix the validation errors above.");
          } else {
            setSubmitError(err.response?.data?.message || "Failed to save service. Please try again.");
          }
        })
        .finally(() => setIsSubmitting(false));
    } else {
      // Create service
      axios
        .post(`${API_URL}/services`, dataToSend, { headers })
        .then(() => {
          fetchServices(currentPage, search);
          closeModal();
        })
        .catch((err) => {
          console.error(err);
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
            setSubmitError("Please fix the validation errors above.");
          } else {
            setSubmitError(err.response?.data?.message || "Failed to save service. Please try again.");
          }
        })
        .finally(() => setIsSubmitting(false));
    }
  };

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

  if (!hasPermission('Settings_read_all')) {
    return (
      <MainCard cardClass="mt-4">
        <Alert variant="danger" className="text-center py-4">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You don't have permission to view category.</p>
          <p className="mb-0">Please contact your administrator for access.</p>
        </Alert>
      </MainCard>
    );
  }

  // Determine if any action permissions exist
  const hasActionPermission = hasPermission('Settings_update') || hasPermission('Settings_create');

  return (
    <MainCard cardClass="mt-0.9" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header with title and Add button */}
      <div
        className="d-flex justify-content-between align-items-center mb-4"
        style={{ marginTop: "3px" }}
      >
        <h4 className="mb-0">Category</h4>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Form.Control
            type="text"
            placeholder="Search: Min 3 characters"
            value={search || ""}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchServices(1, e.target.value);
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
        {hasPermission('Settings_create') && (
          <Button 
            variant="primary" 
            onClick={() => openModal()} 
            style={{ borderRadius: '0.3rem' }}
          >
            <Plus size={16} className="me-1" /> Add Category
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
      
      <div className="d-flex justify-content-center mt-4">
        <div style={{ width: "100%", borderRadius: '0.3rem', overflow: 'hidden' }}>
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ borderCollapse: 'collapse', borderColor: '#f0f0f0' }}>
              <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <tr>
                  <th className="py-3" style={{ width: "10%" }}>#</th>
                  <th className="py-3" style={{ width: "40%" }}>Name</th>
                  <th className="py-3" style={{ width: "25%" }}>Code</th>
                  {hasActionPermission && <th className="py-3 text-center" style={{ width: "25%" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={hasActionPermission ? 4 : 3} className="text-center py-4">
                      <Spinner animation="border" size="sm" /> Loading category...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={hasActionPermission ? 4 : 3} className="text-center py-4">
                      No category found
                    </td>
                  </tr>
                ) : (
                  services.map((srv, index) => (
                    <tr 
                      key={srv.id || index} 
                      style={{ borderBottom: '1px solid #f0f0f0' }}
                    >
                      <td className="py-2">{(currentPage - 1) * pageSize + index + 1}</td>
                      <td className="py-2">{srv.name}</td>
                      <td className="py-2">{srv.code || "-"}</td>
                      {hasActionPermission && (
                        <td className="py-2 text-center">
                          {hasPermission('Settings_update') && (
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
                                margin: '0 auto',
                                borderRadius: '0.3rem'
                              }}
                              onClick={() => openModal(srv)}
                            >
                              <Pencil size={14} />
                              Edit
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
      </div>
      
      {/* Modal for Create/Edit */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingService ? "Edit Category" : "Add Category"}
            {((editingService && !hasPermission('Settings_update')) || 
              (!editingService && !hasPermission('Settings_create'))) && 
              " (No Permission)"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Show validation errors */}
          {submitError && (
            <Alert variant="danger" className="mb-3">
              {submitError}
            </Alert>
          )}
          
          <Form onSubmit={saveService}>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Category name"
                value={service.name || ""}
                onChange={(e) =>
                  setService({ ...service, name: e.target.value })
                }
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Code *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Category code"
                value={service.code || ""}
                onChange={(e) =>
                  setService({ ...service, code: e.target.value })
                }
                isInvalid={!!errors.code}
              />
              <Form.Control.Feedback type="invalid">
                {errors.code}
              </Form.Control.Feedback>
            </Form.Group>
            
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" className="me-2" style={{ borderRadius: '0.3rem' }} onClick={closeModal}>
                <X size={16} className="me-1" /> Cancel
              </Button>
              {hasPermission('Settings_create') && !editingService && (
                <Button variant="primary" type="submit" style={{ borderRadius: '0.3rem' }} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="me-1 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="me-1" /> Create Category
                    </>
                  )}
                </Button>
              )}
              {hasPermission('Settings_update') && editingService && (
                <Button variant="primary" type="submit" style={{ borderRadius: '0.3rem' }} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="me-1 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-1" /> Update Category
                    </>
                  )}
                </Button>
              )}
              {!hasPermission('Settings_create') && !editingService && (
                <Button variant="primary" disabled style={{ borderRadius: '0.3rem' }}>
                  <Lock size={16} className="me-1" /> No Permission to Create
                </Button>
              )}
              {!hasPermission('Settings_update') && editingService && (
                <Button variant="primary" disabled style={{ borderRadius: '0.3rem' }}>
                  <Lock size={16} className="me-1" /> No Permission to Update
                </Button>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </MainCard>
  );
}