import { useState, useEffect, useCallback } from "react";
import MainCard from "components/Card/MainCard";
import { Table, Button, Form, Modal, Row, Col, Alert, Spinner } from "react-bootstrap";
import Pagination from "./Pagination";
import axios from "axios";
import SubFormModal from './SubFormModal';
import { Pencil, Eye, Plus, X, Save, Loader2, Lock, UserPlus } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [employee, setEmployee] = useState({});
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownError, setDropdownError] = useState(null);
  
  // Organization searchable dropdown states
  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgOptions, setOrgOptions] = useState([]);
  const [isSearchingOrg, setIsSearchingOrg] = useState(false);
  
  // Add pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Permission state
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Pagination and search states
  const [searchTerm, setSearchTerm] = useState("");

  // Sub-form modal states
  const [showSubFormModal, setShowSubFormModal] = useState(false);
  const [activeSubForm, setActiveSubForm] = useState(null);

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
        const permissions = JSON.parse(permissionsString);
        if (Array.isArray(permissions)) {
          setUserPermissions(permissions);
          console.log("Set user permissions:", permissions);
        } else {
          console.warn("Permissions from localStorage is not an array:", permissions);
          setUserPermissions([]);
        }
      } else {
        console.warn("No permissions found in localStorage");
        setUserPermissions([]);
      }
    } catch (error) {
      console.error("Error parsing permissions from localStorage:", error);
      setUserPermissions([]);
    } finally {
      setPermissionsLoaded(true);
      console.log("Permissions loading completed");
    }
  }, []);

  // --- Fetch employees with useCallback ---
  const fetchEmployees = useCallback(
    async (page = 1, search = '') => {
      if (!hasPermission('Employee_read_all')) {
        console.log('No permission to read employees, skipping fetch');
        setLoading(false);
        return;
      }

      if (search && search.length < 3) {
        return;
      }

      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('page', page);
        if (search) params.append('search', search);

        const url = `${API_URL}/employees?${params.toString()}`;
        const res = await axios.get(url, { headers: getAuthHeaders() });
        console.log('Employees data received:', res.data);

        if (res.data.data) {
          setEmployees(res.data.data);
          setCurrentPage(res.data.current_page || 1);
          setTotalPages(res.data.last_page || 1);
          setTotalItems(res.data.total || 0);
        } else {
          setEmployees(Array.isArray(res.data) ? res.data : []);
          setCurrentPage(1);
          setTotalPages(1);
          setTotalItems(0);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        setSubmitError('Failed to load employees. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [hasPermission, getAuthHeaders]
  );

  // --- Search organizations with dropdown ---
  const searchOrganizations = useCallback(
    async (searchValue) => {
      if (!searchValue.trim() || searchValue.length < 3) {
        setOrgOptions([]);
        setOrgDropdownOpen(false);
        return;
      }

      setIsSearchingOrg(true);
      
      try {
        const params = new URLSearchParams();
        params.append('search', searchValue.trim());
        
        const url = `${API_URL}/organizations?${params.toString()}`;
        console.log('Searching organizations with URL:', url);
        
        const res = await axios.get(url, { headers: getAuthHeaders() });
        console.log('Organization search response:', res.data);

        const orgs = Array.isArray(res.data) ? res.data : res.data.data || [];
        
        setOrgOptions(orgs);
        setOrgDropdownOpen(true);
      } catch (error) {
        console.error('Error searching organizations:', error);
        setOrgOptions([]);
        setOrgDropdownOpen(false);
      } finally {
        setIsSearchingOrg(false);
      }
    },
    [getAuthHeaders]
  );

  // --- Fetch organizations (initial load) ---
  const fetchOrganizations = useCallback(
    async (search = '') => {
      if (search && search.length < 3) {
        return;
      }

      try {
        setOrgLoading(true);
        const params = new URLSearchParams();
        
        if (search) {
          params.append('search', search);
        }
        
        const url = `${API_URL}/organizations${params.toString() ? '?' + params.toString() : ''}`;
        console.log('Fetching organizations with URL:', url);
        
        const res = await axios.get(url, { headers: getAuthHeaders() });
        console.log('Organizations response:', res.data);

        if (res.data && res.data.data) {
          setOrganizations(res.data.data);
        } else if (Array.isArray(res.data)) {
          setOrganizations(res.data);
        } else {
          setOrganizations([]);
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setDropdownError('Failed to load organizations.');
      } finally {
        setOrgLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // --- Fetch related data with useCallback ---
  const fetchRelatedData = useCallback(async () => {
    setDropdownLoading(true);
    setDropdownError(null);

    try {
      console.log("Fetching dropdown data...");

      const [orgRes, desRes, serRes] = await Promise.all([
        axios.get(`${API_URL}/organizations`),
        axios.get(`${API_URL}/designations`),
        axios.get(`${API_URL}/services`),
      ]);

      console.log("Organizations response:", orgRes.data);
      console.log("Designations response:", desRes.data);
      console.log("Services response:", serRes.data);

      setOrganizations(Array.isArray(orgRes.data) ? orgRes.data : orgRes.data?.data || []);
      setDesignations(Array.isArray(desRes.data) ? desRes.data : desRes.data?.data || []);
      setServices(Array.isArray(serRes.data) ? serRes.data : serRes.data?.data || []);

    } catch (error) {
      console.error("Error fetching related data:", error);
      alert("Failed to load data. Please try again.");
      
      try {
        console.log("Trying authenticated endpoints as fallback...");

        const headers = getAuthHeaders();
        const [orgRes, desRes, serRes] = await Promise.all([
          axios.get(`${API_URL}/organizations`, { headers }),
          axios.get(`${API_URL}/designations`, { headers }),
          axios.get(`${API_URL}/services`, { headers }),
        ]);

        setOrganizations(Array.isArray(orgRes.data) ? orgRes.data : orgRes.data?.data || []);
        setDesignations(Array.isArray(desRes.data) ? desRes.data : desRes.data?.data || []);
        setServices(Array.isArray(serRes.data) ? serRes.data : serRes.data?.data || []);
        setDropdownError(null);

      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        setDropdownError("Failed to load dropdown data from all sources.");
      }
    } finally {
      setDropdownLoading(false);
    }
  }, [getAuthHeaders]);

  // --- Helper functions with useCallback ---
  const getRelatedName = useCallback((id, dataArray, field = "name") => {
    if (!Array.isArray(dataArray)) return "";
    const item = dataArray.find(item => String(item.id) === String(id));
    return item ? item[field] : "";
  }, []);

  const capitalizeFirst = useCallback((str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }, []);

  // --- Modal handling with useCallback ---
  const openModal = useCallback(async (emp = null) => {
    // Check permissions before opening modal
    if (emp && !hasPermission('Employee_update')) {
      setSubmitError("You don't have permission to update employees");
      return;
    }

    if (!emp && !hasPermission('Employee_create')) {
      setSubmitError("You don't have permission to create employees");
      return;
    }

    // Load dropdown data when modal is opened
    if (organizations.length === 0 || designations.length === 0 || services.length === 0) {
      await fetchRelatedData();
    }
    
    setErrors({});
    setSubmitError(null);
    if (emp) {
      console.log("Editing employee:", emp);
      setEditingEmployee(emp);
      setEmployee({
        title: emp.title || "",
        first_name: emp.first_name || "",
        last_name: emp.last_name || "",
        gender: emp.gender ? emp.gender.charAt(0).toUpperCase() + emp.gender.slice(1).toLowerCase() : "",
        nic_no: emp.nic_no || "",
        passport_no: emp.passport_no || "",
        birthday: emp.birthday || "",
        phone_no: emp.phone_no || "",
        whatsapp_no: emp.whatsapp_no || "",
        email: emp.email || "",
        organization_id: emp.organization_id || "",
        designation_id: emp.designation_id || "",
        service_id: emp.service_id || "",
      });
      
      // Set the organization search term to the selected organization name
      if (emp.organization_id) {
        const orgName = getRelatedName(emp.organization_id, organizations);
        setOrgSearchTerm(orgName);
      }
    } else {
      setEditingEmployee(null);
      setEmployee({
        title: "",
        first_name: "",
        last_name: "",
        gender: "",
        nic_no: "",
        passport_no: "",
        birthday: "",
        phone_no: "",
        whatsapp_no: "",
        email: "",
        organization_id: "",
        designation_id: "",
        service_id: "",
      });
      setOrgSearchTerm('');
    }
    setOrgDropdownOpen(false);
    setOrgOptions([]);
    setShowModal(true);
  }, [hasPermission, organizations.length, designations.length, services.length, fetchRelatedData, getRelatedName, organizations]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingEmployee(null);
    setEmployee({
      first_name: "",
      last_name: "",
      gender: "",
      nic_no: "",
      passport_no: "",
      birthday: "",
      phone_no: "",
      whatsapp_no: "",
      email: "",
      organization_id: "",
      designation_id: "",
      service_id: "",
    });
    setErrors({});
    setSubmitError(null);
    setOrgSearchTerm('');
    setOrgDropdownOpen(false);
    setOrgOptions([]);
  }, []);

  // --- View Modal handling with useCallback ---
  const openViewModal = useCallback(async (emp) => {
    if (!hasPermission('Employee_read_one')) {
      setSubmitError("You don't have permission to view employee details");
      return;
    }

    // Load dropdown data for view modal if not already loaded
    if (organizations.length === 0 || designations.length === 0 || services.length === 0) {
      await fetchRelatedData();
    }
    
    setViewingEmployee(emp);
    setShowViewModal(true);
  }, [hasPermission, organizations.length, designations.length, services.length, fetchRelatedData]);

  const closeViewModal = useCallback(() => {
    setShowViewModal(false);
    setViewingEmployee(null);
  }, []);

  // --- Validation with useCallback ---
  const validate = useCallback(() => {
    let tempErrors = {};

    // Required fields
    if (!employee.title?.trim()) tempErrors.title = "Title is required";
    if (!employee.first_name?.trim()) tempErrors.first_name = "First name is required";
    if (!employee.last_name?.trim()) tempErrors.last_name = "Last name is required";

    // Add gender validation
    if (!employee.gender?.trim()) tempErrors.gender = "Gender is required";

    // NIC validation
    if (!employee.nic_no?.trim()) {
      tempErrors.nic_no = "NIC number is required";
    } else {
      if (!/^[a-zA-Z0-9]+$/.test(employee.nic_no)) {
        tempErrors.nic_no = "NIC number must only contain letters and numbers";
      }
      if (employee.nic_no.length > 12) {
        tempErrors.nic_no = "NIC number must be 12 characters or less";
      }
    }

    // Passport validation - Optional
    if (employee.passport_no?.trim()) {
      if (!/^[a-zA-Z0-9]+$/.test(employee.passport_no)) {
        tempErrors.passport_no = "Passport number must contain only letters and numbers";
      } else if (employee.passport_no.length < 8) {
        tempErrors.passport_no = "Passport number must be at least 8 characters";
      } else if (employee.passport_no.length > 10) {
        tempErrors.passport_no = "Passport number must not exceed 10 characters";
      }
    }

    // Email validation - Optional
    if (employee.email?.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
        tempErrors.email = "Invalid email address";
      }
    }

    // Phone validation - Optional
    if (employee.phone_no?.trim()) {
      if (!/^07\d{8}$/.test(employee.phone_no)) {
        tempErrors.phone_no = "Phone number must start with 07 followed by 8 digits (e.g., 0712345678)";
      }
    }

    // WhatsApp validation - Optional
    if (employee.whatsapp_no?.trim()) {
      if (!/^07\d{8}$/.test(employee.whatsapp_no)) {
        tempErrors.whatsapp_no = "WhatsApp number must start with 07 followed by 8 digits (e.g., 0712345678)";
      }
    }

    // Birthday validation
    if (employee.birthday) {
      const birthday = new Date(employee.birthday);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthday > today) {
        tempErrors.birthday = "Birthday cannot be in the future";
      }
    }

    // Organization validation
    if (!employee.organization_id) {
      tempErrors.organization_id = "Organization is required";
    }

    // Designation validation
    if (!employee.designation_id) {
      tempErrors.designation_id = "Designation is required";
    }

    // Check if we have a session ID
    const sessionId = localStorage.getItem('login_session_id');
    if (!sessionId) {
      tempErrors.general = "No active session found. Please try again or contact support.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }, [employee]);

  // --- Save employee with useCallback ---
  const saveEmployee = useCallback(async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Check permissions before saving
    if (editingEmployee && !hasPermission('Employee_update')) {
      setSubmitError("You don't have permission to update employees");
      return;
    }

    if (!editingEmployee && !hasPermission('Employee_create')) {
      setSubmitError("You don't have permission to create employees");
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const headers = getAuthHeaders();

      // Get the current session ID
      const sessionId = localStorage.getItem('login_session_id');
      if (!sessionId) {
        setErrors(prev => ({
          ...prev,
          general: "Cannot submit without an active session. Please refresh the page."
        }));
        return;
      }

      // Add session_id to the employee data
      const employeeData = {
        ...employee,
        session_id: sessionId
      };

      if (editingEmployee) {
        await axios.put(`${API_URL}/employees/${editingEmployee.id}`, employeeData, { headers });
      } else {
        await axios.post(`${API_URL}/employees`, employeeData, { headers });
      }
      fetchEmployees(currentPage, searchTerm);
      closeModal();
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);

      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
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
        setSubmitError(error.response?.data?.message || "Failed to save employee. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [editingEmployee, employee, hasPermission, validate, getAuthHeaders, fetchEmployees, currentPage, searchTerm, closeModal]);

  // --- Handle organization search and selection ---
  const handleOrganizationSearch = useCallback(
    (searchValue) => {
      setOrgSearchTerm(searchValue);
      
      // Clear selected organization when user types
      if (employee.organization_id && searchValue !== getRelatedName(employee.organization_id, organizations)) {
        setEmployee({ ...employee, organization_id: '' });
      }
      
      // Search organizations with debouncing
      if (window.orgSearchTimeout) {
        clearTimeout(window.orgSearchTimeout);
      }
      
      window.orgSearchTimeout = setTimeout(() => {
        searchOrganizations(searchValue);
      }, 300);
    },
    [employee, searchOrganizations, getRelatedName, organizations]
  );

  const handleOrganizationSelection = useCallback(
    (selectedOrg) => {
      setEmployee((prev) => ({
        ...prev,
        organization_id: selectedOrg.id
      }));
      setOrgSearchTerm(selectedOrg.name);
      setOrgDropdownOpen(false);
      setOrgOptions([]);
      
      // Clear error if exists
      if (errors.organization_id) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.organization_id;
          return newErrors;
        });
      }
    },
    [errors.organization_id]
  );

  // --- Search and pagination handlers with useCallback ---
  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    fetchEmployees(1, value);
  }, [fetchEmployees]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    fetchEmployees(page, searchTerm);
  }, [fetchEmployees, searchTerm]);

  // --- useEffects ---
  useEffect(() => {
    // Initialize permissions from localStorage only
    fetchUserPermissions();
    
    // Fetch related data immediately
    fetchRelatedData();
  }, [fetchUserPermissions, fetchRelatedData]);

  useEffect(() => {
    if (permissionsLoaded) {
      if (hasPermission('Employee_read_all')) {
        console.log('Fetching employees with permissions:', userPermissions);
        fetchEmployees(currentPage, searchTerm);
      }
    }
  }, [permissionsLoaded, currentPage, searchTerm, hasPermission, fetchEmployees, userPermissions]);

  // Click outside handler for organization dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (orgDropdownOpen && !event.target.closest('.org-dropdown-container')) {
        setOrgDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [orgDropdownOpen]);

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

  if (!hasPermission('Employee_read_all')) {
    return (
      <MainCard cardClass="mt-4">
        <Alert variant="danger" className="text-center py-4">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You don't have permission to view employees.</p>
          <p className="mb-0">Please contact your administrator for access.</p>
        </Alert>
      </MainCard>
    );
  }

  return (
    <MainCard cardClass="mt-0.9" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Public Officers</h4>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Form.Control
            type="text"
            placeholder="Search: Min 3 characters"
            value={searchTerm || ""}
            onChange={(e) => { setSearchTerm(e.target.value); handleSearch(e); }}
            style={{ paddingLeft: '35px', backgroundColor: '#f0f2f8', border: 'none', width: '400px' }}
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
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.442 1.398a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
            </svg>
          </span>
        </div>
        {hasPermission('Employee_create') && (
          <Button variant="primary" onClick={() => openModal()} style={{ borderRadius: '0.3rem' }}>
            <Plus size={16} className="me-1" /> Add Officer
          </Button>
        )}
      </div>

      {/* Dropdown Error Alert */}
      {dropdownError && (
        <Alert variant="warning" className="mb-3">
          {dropdownError}
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
                <th className="py-3">Full Name</th>
                <th className="py-3">NIC No</th>
                <th className="py-3">Phone No</th>
                <th className="py-3">Email</th>
                <th className="py-3">Organization</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <Spinner animation="border" size="sm" /> Loading employees...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7">No officers found</td>
                </tr>
              ) : (
                employees.map((emp, index) => (
                  <tr
                    key={emp.id || index}
                    style={{ borderBottom: '1px solid #f0f0f0' }}
                  >
                    <td className="py-2">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="py-2">{`${emp.title ? emp.title + '. ' : ''}${emp.first_name || ""} ${emp.last_name || ""}`}</td>
                    <td className="py-2">{emp.nic_no}</td>
                    <td className="py-2">{emp.phone_no || "-"}</td>
                    <td className="py-2">{emp.email || "-"}</td>
                    <td className="py-2">{getRelatedName(emp.organization_id, organizations)}</td>
                    <td className="py-2">
                      <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                        {hasPermission('Employee_update') && (
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
                            onClick={() => openModal(emp)}
                          >
                            <Pencil size={14} />
                            Edit
                          </Button>
                        )}
                        {hasPermission('Employee_read_one') && (
                          <Button
                            variant="info"
                            size="sm"
                            style={{
                              padding: '0.25rem 0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              minWidth: '70px',
                              justifyContent: 'center'
                            }}
                            onClick={() => openViewModal(emp)}
                          >
                            <Eye size={14} />
                            View
                          </Button>
                        )}
                      </div>
                    </td>
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
          onPageChange={handlePageChange}
        />
      </div>

      {/* Edit/Add Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        size="xl"
        backdrop="static"
        keyboard={false}
        backdropClassName="modal-backdrop-blur"
        contentClassName={showSubFormModal ? 'blurred-parent-modal' : undefined}
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingEmployee ? "Edit Officer" : "Add Officer"}
            {((editingEmployee && !hasPermission('Employee_update')) ||
              (!editingEmployee && !hasPermission('Employee_create'))) &&
              " (No Permission)"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" className="mb-3">
              {submitError}
            </Alert>
          )}

          {errors.full_name && (
            <Alert variant="danger" className="mb-3">
              {errors.full_name}
            </Alert>
          )}

          <Form onSubmit={saveEmployee}>
            <div className="row">
              <div className="col-md-3">
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Select
                    value={employee.title || ""}
                    onChange={(e) => setEmployee({ ...employee, title: e.target.value })}
                    isInvalid={!!errors.title}
                  >
                    <option value="">Select Title</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Miss">Miss</option>
                    <option value="Dr">Dr</option>
                    <option value="Prof">Prof</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={employee.first_name || ""}
                    onChange={(e) => setEmployee({ ...employee, first_name: e.target.value })}
                    isInvalid={!!errors.first_name}
                  />
                  <Form.Control.Feedback type="invalid">{errors.first_name}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-5">
                <Form.Group className="mb-3">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={employee.last_name || ""}
                    onChange={(e) => setEmployee({ ...employee, last_name: e.target.value })}
                    isInvalid={!!errors.last_name}
                  />
                  <Form.Control.Feedback type="invalid">{errors.last_name}</Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Gender *</Form.Label>
                  <Form.Select
                    value={employee.gender || ""}
                    onChange={(e) => setEmployee({ ...employee, gender: e.target.value })}
                    isInvalid={!!errors.gender}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>NIC No *</Form.Label>
                  <Form.Control
                    type="text"
                    value={employee.nic_no || ""}
                    onChange={(e) => setEmployee({ ...employee, nic_no: e.target.value })}
                    isInvalid={!!errors.nic_no}
                  />
                  <Form.Control.Feedback type="invalid">{errors.nic_no}</Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Passport No</Form.Label>
                  <Form.Control
                    type="text"
                    value={employee.passport_no || ""}
                    onChange={(e) => setEmployee({ ...employee, passport_no: e.target.value })}
                    isInvalid={!!errors.passport_no}
                  />
                  <Form.Control.Feedback type="invalid">{errors.passport_no}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={employee.email || ""}
                    onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Phone No</Form.Label>
                  <Form.Control
                    type="text"
                    value={employee.phone_no || ""}
                    onChange={(e) => setEmployee({ ...employee, phone_no: e.target.value })}
                    isInvalid={!!errors.phone_no}
                  />
                  <Form.Control.Feedback type="invalid">{errors.phone_no}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>WhatsApp No</Form.Label>
                  <Form.Control
                    type="text"
                    value={employee.whatsapp_no || ""}
                    onChange={(e) => setEmployee({ ...employee, whatsapp_no: e.target.value })}
                    isInvalid={!!errors.whatsapp_no}
                  />
                  <Form.Control.Feedback type="invalid">{errors.whatsapp_no}</Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Birthday</Form.Label>
                  <Form.Control
                    type="date"
                    value={employee.birthday || ""}
                    onChange={(e) => setEmployee({ ...employee, birthday: e.target.value })}
                    isInvalid={!!errors.birthday}
                  />
                  <Form.Control.Feedback type="invalid">{errors.birthday}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <div className="d-flex gap-2 align-items-center">
                    <div style={{ flex: 1 }}>
                      {dropdownLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <Form.Select
                          value={employee.service_id || ""}
                          onChange={(e) => setEmployee({ ...employee, service_id: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Select Category</option>
                          {services.length > 0 ? (
                            services.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No category available
                            </option>
                          )}
                        </Form.Select>
                      )}
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        setActiveSubForm('service');
                        setShowSubFormModal(true);
                      }}
                      style={{
                        padding: '0.375rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '40px',
                        height: '38px'
                      }}
                      title="Add new category"
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Organization *</Form.Label>
                  <div className="d-flex gap-2 align-items-center">
                    <div style={{ flex: 1 }} className="position-relative org-dropdown-container">
                      {dropdownLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <>
                          <Form.Control
                            type="text"
                            value={orgSearchTerm}
                            onChange={(e) => handleOrganizationSearch(e.target.value)}
                            placeholder="Search organization (min 3 characters)"
                            isInvalid={!!errors.organization_id}
                            autoComplete="off"
                          />
                          
                          {/* Loading spinner */}
                          {isSearchingOrg && (
                            <div 
                              style={{ 
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none'
                              }}
                            >
                              <Spinner animation="border" size="sm" />
                            </div>
                          )}
                          
                          {/* Dropdown list */}
                          {orgDropdownOpen && orgOptions.length > 0 && (
                            <div 
                              style={{ 
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                marginTop: '4px',
                                maxHeight: '200px', 
                                overflowY: 'auto', 
                                backgroundColor: 'white',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                zIndex: 9999
                              }}
                            >
                              {orgOptions.map((org) => (
                                <div
                                  key={org.id}
                                  style={{ 
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f0f0f0'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                  onClick={() => handleOrganizationSelection(org)}
                                >
                                  {org.name}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Show message when no results */}
                          {orgDropdownOpen && orgOptions.length === 0 && orgSearchTerm.length >= 3 && !isSearchingOrg && (
                            <div 
                              style={{ 
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                marginTop: '4px',
                                padding: '8px 12px',
                                backgroundColor: 'white',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                zIndex: 9999,
                                color: '#6c757d'
                              }}
                            >
                              No organizations found
                            </div>
                          )}
                          
                          <Form.Control.Feedback type="invalid">{errors.organization_id}</Form.Control.Feedback>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        setActiveSubForm('organization');
                        setShowSubFormModal(true);
                      }}
                      style={{
                        padding: '0.375rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '40px',
                        height: '38px'
                      }}
                      title="Add new organization"
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Designation *</Form.Label>
                  <div className="d-flex gap-2 align-items-center">
                    <div style={{ flex: 1 }}>
                      {dropdownLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <>
                          <Form.Select
                            value={employee.designation_id || ""}
                            onChange={(e) => setEmployee({ ...employee, designation_id: e.target.value })}
                            isInvalid={!!errors.designation_id}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">Select Designation</option>
                            {designations.length > 0 ? (
                              designations.map((des) => (
                                <option key={des.id} value={des.id}>
                                  {des.name}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>
                                No designations available
                              </option>
                            )}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{errors.designation_id}</Form.Control.Feedback>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        setActiveSubForm('designation');
                        setShowSubFormModal(true);
                      }}
                      style={{
                        padding: '0.375rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '40px',
                        height: '38px'
                      }}
                      title="Add new designation"
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                </Form.Group>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" className="me-2" onClick={closeModal}>
                <X size={16} className="me-1" /> Cancel
              </Button>
              {hasPermission('Employee_create') && !editingEmployee && (
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="me-1 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} className="me-1" /> Create Officer
                    </>
                  )}
                </Button>
              )}
              {hasPermission('Employee_update') && editingEmployee && (
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="me-1 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-1" /> Update Officer
                    </>
                  )}
                </Button>
              )}
              {!hasPermission('Employee_create') && !editingEmployee && (
                <Button variant="primary" disabled>
                  <Lock size={16} className="me-1" /> No Permission to Create
                </Button>
              )}
              {!hasPermission('Employee_update') && editingEmployee && (
                <Button variant="primary" disabled>
                  <Lock size={16} className="me-1" /> No Permission to Update
                </Button>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* View Employee Modal */}
      <Modal
        show={showViewModal}
        onHide={closeViewModal}
        size="lg"
        scrollable
        backdrop="static"
        keyboard={false}
        backdropClassName="modal-backdrop-blur"
      >
        <Modal.Header closeButton>
          <Modal.Title>Public Officer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingEmployee && (
            <div>
              <h5 className="mb-3">Personal Information</h5>

              <Row className="mb-2">
                <Col sm={4}><strong>Full Name:</strong></Col>
                <Col sm={8}>{`${viewingEmployee.title ? viewingEmployee.title + '. ' : ''}${viewingEmployee.first_name || ""} ${viewingEmployee.last_name || ""}`}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}><strong>Gender:</strong></Col>
                <Col sm={8}>{capitalizeFirst(viewingEmployee.gender) || 'N/A'}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}><strong>NIC Number:</strong></Col>
                <Col sm={8}>{viewingEmployee.nic_no || 'N/A'}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}><strong>Passport Number:</strong></Col>
                <Col sm={8}>{viewingEmployee.passport_no || 'N/A'}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}><strong>Birthday:</strong></Col>
                <Col sm={8}>{viewingEmployee.birthday ? new Date(viewingEmployee.birthday).toLocaleDateString() : 'N/A'}</Col>
              </Row>

              <hr />

              <h5 className="mb-3">Contact Information</h5>

              <Row className="mb-2">
                <Col sm={4}><strong>Phone Number:</strong></Col>
                <Col sm={8}>{viewingEmployee.phone_no || 'N/A'}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}><strong>WhatsApp Number:</strong></Col>
                <Col sm={8}>{viewingEmployee.whatsapp_no || 'N/A'}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}><strong>Email:</strong></Col>
                <Col sm={8}>{viewingEmployee.email || 'N/A'}</Col>
              </Row>

              <hr />

              <h5 className="mb-3">Work Information</h5>

              <Row className="mb-2">
                <Col sm={4}><strong>Organization:</strong></Col>
                <Col sm={8}>{getRelatedName(viewingEmployee.organization_id, organizations) || 'N/A'}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}><strong>Designation:</strong></Col>
                <Col sm={8}>{getRelatedName(viewingEmployee.designation_id, designations) || 'N/A'}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}><strong>Category:</strong></Col>
                <Col sm={8}>{getRelatedName(viewingEmployee.service_id, services) || 'N/A'}</Col>
              </Row>

            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeViewModal}>
            <X size={16} className="me-1" /> Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sub-form Modal */}
      <SubFormModal
        show={showSubFormModal}
        onHide={() => setShowSubFormModal(false)}
        type={activeSubForm}
        onSave={async (response) => {
          try {
            // Fetch the latest data to ensure the new item appears in dropdowns
            await fetchRelatedData();
            
            // Automatically select the newly added item
            // Handle both direct data response and nested data structure
            const newItemId = response?.id || response?.data?.id;
            
            if (newItemId) {
              switch (activeSubForm) {
                case 'service':
                  setEmployee(prev => ({ ...prev, service_id: newItemId }));
                  break;
                case 'organization':
                  setEmployee(prev => ({ ...prev, organization_id: newItemId }));
                  // Set the organization name in search term
                  const orgName = response?.name || response?.data?.name;
                  if (orgName) {
                    setOrgSearchTerm(orgName);
                  }
                  break;
                case 'designation':
                  setEmployee(prev => ({ ...prev, designation_id: newItemId }));
                  break;
              }
              console.log(`Successfully added new ${activeSubForm} with ID: ${newItemId}`);
            } else {
              console.warn('No ID found in response:', response);
            }
          } catch (error) {
            console.error('Error updating dropdowns:', error);
          }
        }}
      />
    </MainCard>
  );
}