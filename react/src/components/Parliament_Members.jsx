import { useState, useEffect, useCallback } from "react";
import MainCard from "components/Card/MainCard";
import { Table, Button, Form, Modal, Row, Col, Alert, Spinner } from "react-bootstrap";
import Pagination from "./Pagination";
import axios from "axios";
import { Pencil, Plus } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;

export default function ParliamentMembers() {
  const [members, setMembers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [member, setMember] = useState({});
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownError, setDropdownError] = useState(null);
  
  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;
  
  // Permission state
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Title state
  const [selectedTitle, setSelectedTitle] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [actualName, setActualName] = useState("");

  // Session state
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [hasSessionIdColumn, setHasSessionIdColumn] = useState(false);

  const titleOptions = ["Mr", "Mrs", "Ms", "Dr", "Rev", "Other"];

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

  // Fetch members with pagination and search
  const fetchMembers = useCallback(async (page = 1, search = null) => {
    if (!hasPermission('Employee_read_all')) return;
    
    if (search && search.length < 3) {
      //minimum 3 characters should be there
      return;
    }
    var searchTxt = search ? search : '';
    
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/parliament-members?page=${page}${searchTxt ? `&search=${searchTxt}` : ''}`, { headers: getAuthHeaders() });
      
      // Handle both array response (old) and paginated response (new)
      if (Array.isArray(res.data)) {
        setMembers(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setMembers(res.data.data);
        setTotalPages(res.data.last_page || 1);
        setCurrentPage(res.data.current_page || 1);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setSubmitError("Failed to fetch parliament members. Please try again.");
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        localStorage.removeItem('userPermissions');
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  }, [hasPermission, getAuthHeaders]);

  // Fetch organizations & designations
  const fetchRelatedData = useCallback(async () => {
    setDropdownLoading(true);
    setDropdownError(null);
    
    try {
      console.log("Fetching dropdown data...");
      
      // Try public endpoints first
      const [orgRes, desRes] = await Promise.all([
        axios.get(`${API_URL}/organizations`),
        axios.get(`${API_URL}/designations`),
      ]);
      
      console.log("Organizations response:", orgRes.data);
      console.log("Designations response:", desRes.data);
      
      setOrganizations(Array.isArray(orgRes.data) ? orgRes.data : orgRes.data?.data || []);
      setDesignations(Array.isArray(desRes.data) ? desRes.data : desRes.data?.data || []);
      
    } catch (error) {
      console.error("Error fetching related data:", error);
      
      // Fallback to authenticated endpoints if public ones fail
      try {
        console.log("Trying authenticated endpoints as fallback...");
        
        const [orgRes, desRes] = await Promise.all([
          axios.get(`${API_URL}/organizations`, { headers: getAuthHeaders() }),
          axios.get(`${API_URL}/designations`, { headers: getAuthHeaders() }),
        ]);
        
        setOrganizations(Array.isArray(orgRes.data) ? orgRes.data : orgRes.data?.data || []);
        setDesignations(Array.isArray(desRes.data) ? desRes.data : desRes.data?.data || []);
        setDropdownError(null);
        
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        setDropdownError("Failed to load dropdown data from all sources.");
      }
    } finally {
      setDropdownLoading(false);
    }
  }, [getAuthHeaders]);

  // Get the current session ID from localStorage only
  const getCurrentSessionId = useCallback(() => {
    try {
      // Try to get login_session_id directly from localStorage
      const sessionId = localStorage.getItem('login_session_id');
      if (sessionId && sessionId !== 'undefined' && sessionId !== 'null') {
        console.log("Found login_session_id in localStorage:", sessionId);
        setCurrentSessionId(sessionId);
        return sessionId;
      }
      
      // Try to get session from user object in local storage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.session_id) {
          console.log("Found session ID in user object:", user.session_id);
          setCurrentSessionId(user.session_id);
          return user.session_id;
        }
      }
      
      // Last resort: use default value
      console.log("No session ID found, using default value 1");
      setCurrentSessionId("1");
      return 1;
    } catch (error) {
      console.error("Error getting session ID from local storage:", error);
      setCurrentSessionId("1");
      return 1;
    }
  }, []);

  // Check if session_id column exists
  const checkSessionIdColumn = useCallback(async () => {
    try {
      // Try to fetch a single member to see if session_id is included
      const res = await axios.get(`${API_URL}/parliament-members?limit=1`, { headers: getAuthHeaders() });
      
      if (res.data && (Array.isArray(res.data) ? res.data : res.data.data || []).length > 0) {
        const firstMember = Array.isArray(res.data) ? res.data[0] : (res.data.data ? res.data.data[0] : null);
        if (firstMember && 'session_id' in firstMember) {
          setHasSessionIdColumn(true);
          console.log("session_id column exists in parliament_members table");
        } else {
          setHasSessionIdColumn(false);
          console.log("session_id column does not exist in parliament_members table");
        }
      } else {
        setHasSessionIdColumn(false);
      }
    } catch (error) {
      console.error("Error checking session_id column:", error);
      setHasSessionIdColumn(false);
    }
  }, [getAuthHeaders]);

  // Initialize component data
  useEffect(() => {
    // Get permissions from API with localStorage fallback
    fetchUserPermissions();
    
    // Fetch dropdown data immediately
    fetchRelatedData();
    
    // Get current session ID
    getCurrentSessionId();
    
    // Check if session_id column exists
    checkSessionIdColumn();
  }, [fetchUserPermissions, fetchRelatedData, getCurrentSessionId, checkSessionIdColumn]);

  // Fetch members when permissions are loaded, page changes, or search term changes
  useEffect(() => {
    if (permissionsLoaded) {
      if (hasPermission('Employee_read_all')) {
        fetchMembers(currentPage, search);
      }
    }
  }, [permissionsLoaded, currentPage, search, fetchMembers, hasPermission]);

  // Parse name to extract title
  const parseNameWithTitle = useCallback((fullName) => {
    if (!fullName) return { title: "", customTitle: "", actualName: "" };
    
    const nameParts = fullName.trim().split(" ");
    const firstPart = nameParts[0];
    
    // Remove period from first part for comparison
    const firstPartWithoutPeriod = firstPart.replace(/\.$/, "");
    
    // Check if first part matches our predefined titles
    if (titleOptions.slice(0, -1).includes(firstPartWithoutPeriod)) {
      return {
        title: firstPartWithoutPeriod,
        customTitle: "",
        actualName: nameParts.slice(1).join(" ")
      };
    }
    
    // Check if it might be a custom title (ends with period or is short)
    if (firstPart.endsWith(".") || (firstPartWithoutPeriod.length <= 4 && nameParts.length > 1)) {
      return {
        title: "Other",
        customTitle: firstPart, // Keep original format with period
        actualName: nameParts.slice(1).join(" ")
      };
    }
    
    // No title detected
    return {
      title: "",
      customTitle: "",
      actualName: fullName
    };
  }, []);

  // Modal handling
  const openModal = useCallback(async (m = null) => {
    // Check permissions before opening modal
    if (m && !hasPermission('Employee_update')) {
      setSubmitError("You don't have permission to update parliament members");
      return;
    }
    
    if (!m && !hasPermission('Employee_create')) {
      setSubmitError("You don't have permission to create parliament members");
      return;
    }

    // Load dropdown data when modal is opened
    if (organizations.length === 0 || designations.length === 0) {
      await fetchRelatedData();
    }
    
    setErrors({});
    setSubmitError(null);
      if (m) {
      setEditingMember(m);
      // Set title fields
      const title = m.title?.replace(/\.$/, ''); // Remove trailing period if exists
      const isCustomTitle = !titleOptions.slice(0, -1).includes(title);
      setSelectedTitle(isCustomTitle ? "Other" : title);
      setCustomTitle(isCustomTitle ? m.title : "");
      setActualName(m.name);
      setMember({
        name: m.name || "",
        job_role: m.job_role || "",
        organization_id: m.organization_id || "",
        designation_id: m.designation_id || "",
        code: m.code || "",
        session_id: m.session_id || "",
      });
    } else {
      setEditingMember(null);
      setSelectedTitle("");
      setCustomTitle("");
      setActualName("");
      setMember({
        name: "",
        job_role: "",
        organization_id: "",
        designation_id: "",
        code: "",
        session_id: hasSessionIdColumn ? getCurrentSessionId() : null, // Only set if column exists
      });
    }
    setShowModal(true);
  }, [hasPermission, parseNameWithTitle, hasSessionIdColumn, getCurrentSessionId, organizations.length, designations.length, fetchRelatedData]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingMember(null);
    setMember({});
    setSelectedTitle("");
    setCustomTitle("");
    setActualName("");
    setErrors({});
    setSubmitError(null);
  }, []);

  // Validation
  const validate = useCallback(() => {
    let tempErrors = {};
    
    // Name validation
    if (!actualName?.trim()) {
      tempErrors.name = "Name is required";
    }
    
    // Title validation - title is now required
    if (!selectedTitle) {
      tempErrors.title = "Title is required";
    }
    
    if (selectedTitle === "Other" && !customTitle?.trim()) {
      tempErrors.customTitle = "Custom title is required when 'Other' is selected";
    }
    
    // Job role validation
    if (!member.job_role?.trim()) {
      tempErrors.job_role = "Job role is required";
    }
    
    // Designation validation
    if (!member.designation_id) {
      tempErrors.designation_id = "Designation is required";
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }, [actualName, selectedTitle, customTitle, member]);

  // Get formatted title
  const getFormattedTitle = useCallback(() => {
    if (selectedTitle === "Other" && customTitle.trim()) {
      return customTitle.trim().endsWith('.') ? customTitle.trim() : `${customTitle.trim()}.`;
    } else if (selectedTitle !== "Other" && selectedTitle) {
      return `${selectedTitle}.`;
    }
    return "";
  }, [selectedTitle, customTitle]);

  // Save member
  const saveMember = useCallback(async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Check permissions before saving
    if (editingMember && !hasPermission('Employee_update')) {
      setSubmitError("You don't have permission to update parliament members");
      return;
    }
    
    if (!editingMember && !hasPermission('Employee_create')) {
      setSubmitError("You don't have permission to create parliament members");
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const headers = getAuthHeaders();
      
      // Prepare member data
      const memberData = {
        name: actualName.trim(),
        title: getFormattedTitle(),
        job_role: member.job_role,
        designation_id: member.designation_id,
      };
      
      // Only add session_id if column exists
      if (hasSessionIdColumn) {
        const sessionId = member.session_id || getCurrentSessionId();
        memberData.session_id = sessionId;
      }
      
      if (editingMember) {
        await axios.put(
          `${API_URL}/parliament-members/${editingMember.id}`,
          memberData,
          { headers }
        );
      } else {
        await axios.post(`${API_URL}/parliament-members`, memberData, { headers });
      }
      fetchMembers(currentPage, search);
      closeModal();
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      
      // Handle authentication errors
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
        setSubmitError(error.response?.data?.message || "Failed to save parliament member. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, getFormattedTitle, editingMember, member, hasSessionIdColumn, getCurrentSessionId, currentPage, search, fetchMembers, closeModal, getAuthHeaders, hasPermission]);

  // Helper to get related name
  const getRelatedName = useCallback((id, dataArray) => {
    const item = dataArray.find((d) => String(d.id) === String(id));
    return item ? item.name : "";
  }, []);

  // Handle search
  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1); // Reset to first page when searching
    fetchMembers(1, value);
  }, [fetchMembers]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    fetchMembers(page, search);
  }, [fetchMembers, search]);

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
          <p>You don't have permission to view parliament members.</p>
          <p className="mb-0">Please contact your administrator for access.</p>
        </Alert>
      </MainCard>
    );
  }

  // Check if user has any action permissions
  const hasAnyActionPermission = hasPermission('Employee_update');

  return (
    <MainCard cardClass="mt-0.9">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="mb-0">Parliament Members</h4>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Form.Control
            type="text"
            placeholder="Search: Min 3 characters"
            value={search || ''}
            onChange={handleSearch}
            style={{ 
              paddingLeft: '35px',
              backgroundColor: '#f0f2f8',
              border: 'none',
              width: '400px'
            }}
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
            <Plus size={16} className="me-1" /> Add Member
          </Button>
        )}
      </div>

      {/* Global Error Alert */}
      {submitError && (
        <Alert variant="danger" className="mb-3">
          {submitError}
        </Alert>
      )}

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
                <th className="py-3">Code</th>
                <th className="py-3">Title</th>
                <th className="py-3">Name</th>
                <th className="py-3">Job Role</th>
                <th className="py-3">Designation</th>
                <th className="py-3">Organization</th>
                {hasAnyActionPermission && <th className="py-3">Actions</th>}
              </tr>
            </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={hasAnyActionPermission ? 8 : 7} className="text-center py-4">
                <Spinner animation="border" size="sm" /> Loading members...
              </td>
            </tr>
          ) : members.length === 0 ? (
            <tr>
              <td colSpan={hasAnyActionPermission ? 8 : 7} className="text-center py-4">No members found</td>
            </tr>
          ) : (
            members.map((m, index) => (
              <tr 
                key={m.id || index}
                style={{ borderBottom: '1px solid #f0f0f0' }}
              >
                <td className="py-2">{(currentPage - 1) * pageSize + index + 1}</td>
                <td className="py-2">{m.code}</td>
                <td className="py-2">{m.title}</td>
                <td className="py-2">{m.name}</td>
                <td className="py-2">{m.job_role}</td>
                <td className="py-2">{getRelatedName(m.designation_id, designations)}</td>
                <td className="py-2">Parliament</td>
                {hasAnyActionPermission && (
                  <td className="py-2">
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
                        onClick={() => openModal(m)}
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
        size="lg"
        backdrop="static"  // Prevent closing when clicking outside
        keyboard={false}   // Prevent closing with escape key
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingMember ? "Edit Member" : "Add Member"}
            {((editingMember && !hasPermission('Employee_update')) || 
              (!editingMember && !hasPermission('Employee_create'))) && 
              " (No Permission)"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Display submit error if exists */}
          {submitError && (
            <Alert variant="danger" className="mb-3">
              {submitError}
            </Alert>
          )}
          
          <Form onSubmit={saveMember}>
            {editingMember && (
              <div className="mb-3 text-muted" style={{ fontSize: "0.9rem" }}>
                Code: <strong>{member.code}</strong>
              </div>
            )}

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Row>
                    <Col md={3}>
                      <Form.Select
                        value={selectedTitle}
                        onChange={(e) => setSelectedTitle(e.target.value)}
                        isInvalid={!!errors.title}
                        onClick={(e) => e.stopPropagation()} // Stop propagation on click
                      >
                        <option value="">Select Title</option>
                        {titleOptions.map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.title}
                      </Form.Control.Feedback>
                    </Col>
                    
                    {selectedTitle === "Other" && (
                      <Col md={3}>
                        <Form.Control
                          type="text"
                          placeholder="Custom title"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          isInvalid={!!errors.customTitle}
                          onClick={(e) => e.stopPropagation()} // Stop propagation on click
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.customTitle}
                        </Form.Control.Feedback>
                      </Col>
                    )}
                    
                    <Col md={selectedTitle === "Other" ? 6 : 9}>
                      <Form.Control
                        type="text"
                        placeholder="Enter name"
                        value={actualName}
                        onChange={(e) => setActualName(e.target.value)}
                        isInvalid={!!errors.name}
                        onClick={(e) => e.stopPropagation()} // Stop propagation on click
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Role *</Form.Label>
                  <Form.Control
                    type="text"
                    value={member.job_role || ""}
                    onChange={(e) => setMember({ ...member, job_role: e.target.value })}
                    isInvalid={!!errors.job_role}
                    onClick={(e) => e.stopPropagation()} // Stop propagation on click
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.job_role}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Designation *</Form.Label>
                  {dropdownLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <>
                      <Form.Select
                        value={member.designation_id || ""}
                        onChange={(e) => setMember({ ...member, designation_id: e.target.value })}
                        isInvalid={!!errors.designation_id}
                        onClick={(e) => e.stopPropagation()} // Stop propagation on click
                      >
                        <option value="">Select Designation</option>
                        {designations.map((des) => (
                          <option key={des.id} value={des.id}>
                            {des.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.designation_id}
                      </Form.Control.Feedback>
                    </>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Organization</Form.Label>
                  <Form.Control
                    type="text"
                    value="Parliament"
                    readOnly
                    disabled
                    style={{ backgroundColor: '#e9ecef' }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" className="me-2" onClick={closeModal}>
                Cancel
              </Button>
              {hasPermission('Employee_create') && !editingMember && (
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : "Create Member"}
                </Button>
              )}
              {hasPermission('Employee_update') && editingMember && (
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : "Update Member"}
                </Button>
              )}
              {!hasPermission('Employee_create') && !editingMember && (
                <Button variant="primary" disabled>
                  No Permission to Create
                </Button>
              )}
              {!hasPermission('Employee_update') && editingMember && (
                <Button variant="primary" disabled>
                  No Permission to Update
                </Button>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </MainCard>
  );
}