import { useState, useEffect } from "react";
import MainCard from "components/Card/MainCard";
import { Table, Button, Form, Modal, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import Pagination from "./Pagination";
import { Pencil, Plus, Trash2, X, Save, Loader2, Lock } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;

export default function PaginatedDesignations() {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [designation, setDesignation] = useState({ name: "", code: "" });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 10; // Changed from 5 to 10
  
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

  // --- Fetch user permissions ---
  const fetchUserPermissions = () => {
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
  };

  // --- Check user permissions ---
  const hasPermission = (permissionName) => {
    return userPermissions.includes(permissionName);
  };

  // Fetch designations from API
  const fetchDesignations = (page = 1, search = null) => {
    if (!hasPermission('Settings_read_all')) return;
    
    if (search && search.length < 3) {
      //minimum 3 characters should be there
      return;
    }
    var searchTxt = search ? search : '';
    
    setLoading(true);
    axios
      .get(`${API_URL}/designations?page=${page}${searchTxt ? `&search=${searchTxt}` : ''}`, {
        headers: getAuthHeaders()
      })
      .then((res) => {
        // Handle both array response (old) and paginated response (new)
        if (Array.isArray(res.data)) {
          setDesignations(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setDesignations(res.data.data);
          setTotalPages(res.data.last_page || 1);
          setCurrentPage(res.data.current_page || 1);
        } else {
          setDesignations([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setSubmitError("Failed to fetch designations. Please try again.");
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('user');
          window.location.href = "/login";
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  useEffect(() => {
    if (permissionsLoaded) {
      if (hasPermission('Settings_read_all')) {
        fetchDesignations(currentPage, search);
      }
    }
  }, [permissionsLoaded, currentPage, search]);

  // Open modal for create or edit
  const openModal = (designation = null) => {
    // Check permissions before opening modal
    if (designation && !hasPermission('Settings_update')) {
      setSubmitError("You don't have permission to update designations");
      return;
    }
    
    if (!designation && !hasPermission('Settings_create')) {
      setSubmitError("You don't have permission to create designations");
      return;
    }
    
    setErrors({});
    setSubmitError(null);
    if (designation) {
      setEditingDesignation(designation);
      setDesignation({
        name: designation.name || "",
        code: designation.code || "",
      });
    } else {
      setEditingDesignation(null);
      setDesignation({ name: "", code: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDesignation(null);
    setDesignation({ name: "", code: "" });
    setErrors({});
    setSubmitError(null);
  };

  // Validation
  const validate = () => {
    let tempErrors = {};
    
    // Name validation
    if (!designation.name?.trim()) {
      tempErrors.name = "Designation name is required";
    } else if (!/^[A-Za-z\s\-'.]+$/.test(designation.name)) {
      tempErrors.name = "Name must only contain letters, spaces, hyphens, apostrophes, and periods";
    } else if (designation.name.length > 100) {
      tempErrors.name = "Name must be 100 characters or less";
    } else {
      // Check for uniqueness
      const isDuplicate = designations.some(
        (desig) =>
          desig.name.toLowerCase() === designation.name.toLowerCase() &&
          (!editingDesignation || desig.id !== editingDesignation.id)
      );
      if (isDuplicate) {
        tempErrors.name = "This designation name already exists";
      }
    }
    
    // Code validation
    if (designation.code && !/^[A-Za-z0-9\-]+$/.test(designation.code)) {
      tempErrors.code = "Code must only contain letters, numbers, and hyphens";
    } else if (designation.code && designation.code.length > 50) {
      tempErrors.code = "Code must be 50 characters or less";
    } else if (designation.code) {
      // Check for uniqueness
      const isDuplicate = designations.some(
        (desig) =>
          desig.code && desig.code.toLowerCase() === designation.code.toLowerCase() &&
          (!editingDesignation || desig.id !== editingDesignation.id)
      );
      if (isDuplicate) {
        tempErrors.code = "This designation code already exists";
      }
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Create or update designation
  const saveDesignation = (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Check permissions before saving
    if (editingDesignation && !hasPermission('Settings_update')) {
      setSubmitError("You don't have permission to update designations");
      return;
    }
    
    if (!editingDesignation && !hasPermission('Settings_create')) {
      setSubmitError("You don't have permission to create designations");
      return;
    }
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    const headers = getAuthHeaders();
    
    if (editingDesignation) {
      // Update designation
      axios
        .put(`${API_URL}/designations/${editingDesignation.id}`, designation, { headers })
        .then(() => {
          fetchDesignations(currentPage, search);
          closeModal();
        })
        .catch((err) => {
          console.error(err);
          if (err.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('user');
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
            setSubmitError(err.response?.data?.message || "Failed to save designation. Please try again.");
          }
        })
        .finally(() => setIsSubmitting(false));
    } else {
      // Create designation
      axios
        .post(`${API_URL}/designations`, designation, { headers })
        .then(() => {
          fetchDesignations(currentPage, search);
          closeModal();
        })
        .catch((err) => {
          console.error(err);
          if (err.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('user');
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
            setSubmitError(err.response?.data?.message || "Failed to create designation. Please try again.");
          }
        })
        .finally(() => setIsSubmitting(false));
    }
  };

  // Delete designation
  const deleteDesignation = (id) => {
    // Check permissions before deleting
    if (!hasPermission('Settings_delete')) {
      setSubmitError("You don't have permission to delete designations");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this designation?")) {
      setIsSubmitting(true);
      axios
        .delete(`${API_URL}/designations/${id}`, { headers: getAuthHeaders() })
        .then(() => {
          fetchDesignations(currentPage, search);
        })
        .catch((err) => {
          console.error(err);
          if (err.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('user');
            window.location.href = "/login";
            return;
          }
          setSubmitError(err.response?.data?.message || "Failed to delete designation. Please try again.");
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
          <p>You don't have permission to view designations.</p>
          <p className="mb-0">Please contact your administrator for access.</p>
        </Alert>
      </MainCard>
    );
  }

  // Determine if any action permissions exist
  const hasActionPermission = hasPermission('Settings_update') || 
                             hasPermission('Settings_create') || 
                             hasPermission('Settings_delete');

  return (
    <MainCard cardClass="mt-0.9">
      {/* Header with title and Add button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Designations</h4>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Form.Control
            type="text"
            placeholder="Search: Min 3 characters"
            value={search || ''}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchDesignations(1, e.target.value);
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
          <Button variant="primary" onClick={() => openModal()} style={{ borderRadius: '0.3rem' }}>
            <Plus size={16} className="me-1" /> Add Designation
          </Button>
        )}
      </div>
      
      {submitError && (
        <Alert variant="danger" className="mb-3">
          {submitError}
        </Alert>
      )}
      
      <hr className="mt-4" style={{ opacity: 0.15 }} />
      
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
                {hasActionPermission && <th className="py-3">Actions</th>}
              </tr>
            </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={hasActionPermission ? 4 : 3} className="text-center py-4">
                <Spinner animation="border" size="sm" /> Loading designations...
              </td>
            </tr>
          ) : designations.length === 0 ? (
            <tr>
              <td colSpan={hasActionPermission ? 4 : 3} className="text-center py-4">
                No designations found
              </td>
            </tr>
          ) : (
            designations.map((desig, index) => (
              <tr 
                key={desig.id || index}
                style={{ borderBottom: '1px solid #f0f0f0' }}
              >
                <td className="py-2">{(currentPage - 1) * pageSize + index + 1}</td>
                <td className="py-2">{desig.name}</td>
                <td className="py-2">{desig.code || "-"}</td>
                {hasActionPermission && (
                  <td className="py-2">
                    <div className="d-flex">
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
                            marginRight: '0.5rem'
                          }}
                          onClick={() => openModal(desig)}
                        >
                          <Pencil size={14} />
                          Edit
                        </Button>
                      )}
                      {hasPermission('Settings_delete') && (
                        <Button
                          variant="danger"
                          size="sm"
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '5px',
                            minWidth: '70px',
                            justifyContent: 'center'
                          }}
                          onClick={() => deleteDesignation(desig.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 size={14} />
                          Delete
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
      </div>
      
      <div className="mt-4 d-flex justify-content-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
      {/* Modal for Create/Edit */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingDesignation ? "Edit Designation" : "Add Designation"}
            {((editingDesignation && !hasPermission('Settings_update')) || 
              (!editingDesignation && !hasPermission('Settings_create'))) && 
              " (No Permission)"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" className="mb-3">
              {submitError}
            </Alert>
          )}
          
          <Form onSubmit={saveDesignation}>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter designation name"
                value={designation.name || ""}
                onChange={(e) =>
                  setDesignation({ ...designation, name: e.target.value })
                }
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter designation code"
                value={designation.code || ""}
                onChange={(e) =>
                  setDesignation({ ...designation, code: e.target.value })
                }
                isInvalid={!!errors.code}
              />
              <Form.Control.Feedback type="invalid">
                {errors.code}
              </Form.Control.Feedback>
            </Form.Group>
            
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" className="me-2" onClick={closeModal}>
                <X size={16} className="me-1" /> Cancel
              </Button>
              {hasPermission('Settings_create') && !editingDesignation && (
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="me-1 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="me-1" /> Create Designation
                    </>
                  )}
                </Button>
              )}
              {hasPermission('Settings_update') && editingDesignation && (
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="me-1 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-1" /> Update Designation
                    </>
                  )}
                </Button>
              )}
              {!hasPermission('Settings_create') && !editingDesignation && (
                <Button variant="primary" disabled>
                  <Lock size={16} className="me-1" /> No Permission to Create
                </Button>
              )}
              {!hasPermission('Settings_update') && editingDesignation && (
                <Button variant="primary" disabled>
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