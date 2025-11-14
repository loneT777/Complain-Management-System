import { useState, useEffect } from "react";
import MainCard from "components/Card/MainCard";
import { Table, Button, Form, Modal, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import Pagination from "./Pagination";
import { Pencil, Plus, Trash2, X, Save, Loader2 } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;

export default function PaginatedExpensesTypes() {
  const [expensesTypes, setExpensesTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpenseType, setEditingExpenseType] = useState(null);
  const [expenseType, setExpenseType] = useState({ name: "" });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
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
        fetchExpensesTypes(currentPage, search);
      }
    }
  }, [permissionsLoaded, currentPage, search]);

  // Fetch expenses types from API
  const fetchExpensesTypes = (page = 1, search = null) => {
    if (!hasPermission('Settings_read_all')) return;
    
    if (search && search.length < 3) {
      //minimum 3 characters should be there
      return;
    }
    var searchTxt = search ? search : '';
    
    setLoading(true);
    axios
      .get(`${API_URL}/expense-types?page=${page}${search ? `&search=${search}` : ""}`, { headers: getAuthHeaders() })
      .then((res) => {
        // Handle both array response (old) and paginated response (new)
        if (Array.isArray(res.data)) {
          setExpensesTypes(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setExpensesTypes(res.data.data);
          setTotalPages(res.data.last_page || 1);
          setCurrentPage(res.data.current_page || 1);
        } else {
          setExpensesTypes([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setSubmitError("Failed to fetch expense types. Please try again.");
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

  // Open modal for create or edit
  const openModal = (expenseType = null) => {
    // Check permissions before opening modal
    if (expenseType && !hasPermission('Settings_update')) {
      setSubmitError("You don't have permission to update expense types");
      return;
    }
    
    if (!expenseType && !hasPermission('Settings_create')) {
      setSubmitError("You don't have permission to create expense types");
      return;
    }
    
    setErrors({});
    setSubmitError(null);
    if (expenseType) {
      setEditingExpenseType(expenseType);
      setExpenseType({ name: expenseType.name });
    } else {
      setEditingExpenseType(null);
      setExpenseType({ name: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpenseType(null);
    setExpenseType({ name: "" });
    setErrors({});
    setSubmitError(null);
  };

  // Validation
  const validate = () => {
    let tempErrors = {};
    
    // Name validation - only letters, spaces, periods, and apostrophes
    if (!expenseType.name?.trim()) {
      tempErrors.name = "Expense type name is required";
    } else if (!/^[A-Za-z\s\.'\s]+$/.test(expenseType.name)) {
      tempErrors.name = "Name may only contain letters, spaces, periods, and apostrophes";
    } else if (expenseType.name.length > 100) {
      tempErrors.name = "Name must be 100 characters or less";
    } else {
      // Check for uniqueness
      const isDuplicate = expensesTypes.some(
        (type) =>
          type.name.toLowerCase() === expenseType.name.toLowerCase() &&
          (!editingExpenseType || type.id !== editingExpenseType.id)
      );
      if (isDuplicate) {
        tempErrors.name = "This expense type name already exists";
      }
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Create or update expense type
  const saveExpenseType = (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    
    // Check permissions before saving
    if (editingExpenseType && !hasPermission('Settings_update')) {
      setSubmitError("You don't have permission to update expense types");
      return;
    }
    
    if (!editingExpenseType && !hasPermission('Settings_create')) {
      setSubmitError("You don't have permission to create expense types");
      return;
    }
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    const headers = getAuthHeaders();
    
    if (editingExpenseType) {
      // Update expense type
      axios
        .put(`${API_URL}/expense-types/${editingExpenseType.id}`, expenseType, { headers })
        .then((res) => {
          console.log("Update response:", res.data);
          fetchExpensesTypes(currentPage, search);
          closeModal();
          setSuccessMessage("Expense type updated successfully");
          setTimeout(() => setSuccessMessage(null), 3000);
        })
        .catch((err) => {
          console.error("Update error:", err);
          console.error("Error details:", err.response?.data);
          
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
            setSubmitError(err.response?.data?.message || err.response?.data?.error || "Failed to save expense type. Please try again.");
          }
        })
        .finally(() => setIsSubmitting(false));
    } else {
      // Create expense type
      axios
        .post(`${API_URL}/expense-types`, expenseType, { headers })
        .then((res) => {
          console.log("Create response:", res.data);
          fetchExpensesTypes(currentPage, search);
          closeModal();
          setSuccessMessage("Expense type created successfully");
          setTimeout(() => setSuccessMessage(null), 3000);
        })
        .catch((err) => {
          console.error("Create error:", err);
          console.error("Error details:", err.response?.data);
          
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
            setSubmitError(err.response?.data?.message || err.response?.data?.error || "Failed to save expense type. Please try again.");
          }
        })
        .finally(() => setIsSubmitting(false));
    }
  };

  // Delete expense type
  const deleteExpenseType = (type) => {
    if (!hasPermission('Settings_deactivate')) {
      setSubmitError("You don't have permission to delete expense types");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete "${type.name}"?`)) return;
    
    setIsSubmitting(true);
    axios
      .delete(`${API_URL}/expense-types/${type.id}`, {
        headers: getAuthHeaders()
      })
      .then(() => {
        fetchExpensesTypes(currentPage, search);
        setSuccessMessage("Expense type deleted successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch((err) => {
        console.error(err);
        setSubmitError("Failed to delete expense type. Please try again.");
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('user');
          localStorage.removeItem('userPermissions');
          window.location.href = "/login";
        }
      })
      .finally(() => setIsSubmitting(false));
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
          <p>You don't have permission to view expense types.</p>
          <p className="mb-0">Please contact your administrator for access.</p>
        </Alert>
      </MainCard>
    );
  }

  // Determine if any action permissions exist
  const hasActionPermission = hasPermission('Settings_update') || hasPermission('Settings_create') || hasPermission('Settings_deactivate');

  return (
    <MainCard cardClass="mt-0.9">
      {/* Header with title and Add button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Expenses Types</h4>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Form.Control
            type="text"
            placeholder="Search: Min 3 characters"
            value={search || ""}
            onChange={(e) => {setSearch(e.target.value); fetchExpensesTypes(1, e.target.value);}}
            style={{ paddingLeft: '35px',backgroundColor: '#f0f2f8',border: 'none',width: '400px' }}
          />
          <span style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#888',
            pointerEvents: 'none'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.442 1.398a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
            </svg>
          </span>
        </div>
        {hasPermission('Settings_create') && (
          <Button variant="primary" onClick={() => openModal()} style={{ borderRadius: '0.3rem' }}>
            <Plus size={16} className="me-1" /> Add Expense Type
          </Button>
        )}
      </div>
      
      {successMessage && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}
      
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
                {hasActionPermission && <th className="py-3">Actions</th>}
              </tr>
            </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={hasActionPermission ? 3 : 2} className="text-center py-4">
                <Spinner animation="border" size="sm" /> Loading expense types...
              </td>
            </tr>
          ) : expensesTypes.length === 0 ? (
            <tr>
              <td colSpan={hasActionPermission ? 3 : 2} className="text-center py-4">
                No expenses types found
              </td>
            </tr>
          ) : (
            expensesTypes.map((type, index) => (
              <tr 
                key={type.id || index}
                style={{ borderBottom: '1px solid #f0f0f0' }}
              >
                <td className="py-2">{(currentPage - 1) * pageSize + index + 1}</td>
                <td className="py-2">{type.name}</td>
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
                          onClick={() => openModal(type)}
                        >
                          <Pencil size={14} />
                          Edit
                        </Button>
                      )}
                      {hasPermission('Settings_deactivate') && (
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
                          onClick={() => deleteExpenseType(type)}
                          disabled={isSubmitting}
                        >
                          <Trash2 size={14} />
                          {isSubmitting ? 'Deleting...' : 'Delete'}
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
            {editingExpenseType ? "Edit Expense Type" : "Add Expense Type"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" className="mb-3">
              {submitError}
            </Alert>
          )}
          <Form onSubmit={saveExpenseType}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter expense type name"
                value={expenseType.name || ""}
                onChange={(e) =>
                  setExpenseType({ ...expenseType, name: e.target.value })
                }
                isInvalid={!!errors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" className="me-2" onClick={closeModal}>
                <X size={16} className="me-1" /> Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="me-1 animate-spin" /> Saving...
                  </>
                ) : (
                  editingExpenseType ? (
                    <>
                      <Save size={16} className="me-1" /> Update Expense Type
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="me-1" /> Create Expense Type
                    </>
                  )
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </MainCard>
  );
}