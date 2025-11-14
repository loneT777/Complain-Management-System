import { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Plus, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function SubFormModal({ 
  show, 
  onHide, 
  type,
  onSave 
}) {
  // Form state
  const [formData, setFormData] = useState({
    // Common fields
    name: '', 
    code: '',
    // Organization specific fields
    coordinator_name: '',
    coordinator_designation: '',
    coordinator_phone_number: '',
    coordinator_email: '',
    parent_id: '',
    // Employee specific fields
    title: '',
    first_name: '',
    last_name: '',
    gender: '',
    nic_no: '',
    passport_no: '',
    birthday: '',
    phone_no: '',
    whatsapp_no: '',
    email: '',
    organization_id: '',
    designation_id: '',
    service_id: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [services, setServices] = useState([]);
  
  // Nested modal states for employee form
  const [showNestedModal, setShowNestedModal] = useState(false);
  const [activeNestedForm, setActiveNestedForm] = useState(null);

  // Organization searchable dropdown states
  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [orgOptions, setOrgOptions] = useState([]);
  const [isSearchingOrg, setIsSearchingOrg] = useState(false);

  // Employee Organization searchable dropdown states
  const [empOrgSearchTerm, setEmpOrgSearchTerm] = useState('');
  const [empOrgDropdownOpen, setEmpOrgDropdownOpen] = useState(false);
  const [empOrgOptions, setEmpOrgOptions] = useState([]);
  const [isSearchingEmpOrg, setIsSearchingEmpOrg] = useState(false);

  // Reset form when type changes
  useEffect(() => {
    setFormData({
      name: '',
      code: '',
      coordinator_name: '',
      coordinator_designation: '',
      coordinator_phone_number: '',
      coordinator_email: '',
      parent_id: '',
      title: '',
      first_name: '',
      last_name: '',
      gender: '',
      nic_no: '',
      passport_no: '',
      birthday: '',
      phone_no: '',
      whatsapp_no: '',
      email: '',
      organization_id: '',
      designation_id: '',
      service_id: ''
    });
    setErrors({});
    setSubmitError(null);
    setOrgSearchTerm('');
    setOrgDropdownOpen(false);
    setOrgOptions([]);
    setEmpOrgSearchTerm('');
    setEmpOrgDropdownOpen(false);
    setEmpOrgOptions([]);
  }, [type]);

  // Fetch organizations for parent dropdown and other dropdowns
  useEffect(() => {
    if ((type === 'organization' || type === 'employee') && show) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('authToken');
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          };
          
          const [orgRes, desRes, serRes] = await Promise.all([
            axios.get(`${API_URL}/organizations`, { headers }),
            axios.get(`${API_URL}/designations`, { headers }),
            axios.get(`${API_URL}/services`, { headers })
          ]);
          
          setOrganizations(Array.isArray(orgRes.data) ? orgRes.data : orgRes.data?.data || []);
          setDesignations(Array.isArray(desRes.data) ? desRes.data : desRes.data?.data || []);
          setServices(Array.isArray(serRes.data) ? serRes.data : serRes.data?.data || []);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }
  }, [type, show]);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  };

  // Search organizations with dropdown
  const searchOrganizations = async (searchValue) => {
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
      const res = await axios.get(url, { headers: getAuthHeaders() });

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
  };

  // Handle organization search
  const handleOrganizationSearch = (searchValue) => {
    setOrgSearchTerm(searchValue);
    
    // Clear selected organization when user types
    if (formData.parent_id && searchValue !== formData.parent_id) {
      setFormData({ ...formData, parent_id: '' });
    }
    
    // Search organizations with debouncing
    if (window.orgSearchTimeout) {
      clearTimeout(window.orgSearchTimeout);
    }
    
    window.orgSearchTimeout = setTimeout(() => {
      searchOrganizations(searchValue);
    }, 300);
  };

  // Handle organization selection
  const handleOrganizationSelection = (selectedOrg) => {
    setFormData((prev) => ({
      ...prev,
      parent_id: selectedOrg.id
    }));
    setOrgSearchTerm(selectedOrg.name);
    setOrgDropdownOpen(false);
    setOrgOptions([]);
    
    // Clear error if exists
    if (errors.parent_id) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.parent_id;
        return newErrors;
      });
    }
  };

  // Search employee organizations
  const searchEmployeeOrganizations = async (searchValue) => {
    if (!searchValue.trim() || searchValue.length < 3) {
      setEmpOrgOptions([]);
      setEmpOrgDropdownOpen(false);
      return;
    }

    setIsSearchingEmpOrg(true);
    
    try {
      const params = new URLSearchParams();
      params.append('search', searchValue.trim());
      
      const url = `${API_URL}/organizations?${params.toString()}`;
      const res = await axios.get(url, { headers: getAuthHeaders() });

      const orgs = Array.isArray(res.data) ? res.data : res.data.data || [];
      
      setEmpOrgOptions(orgs);
      setEmpOrgDropdownOpen(true);
    } catch (error) {
      console.error('Error searching organizations:', error);
      setEmpOrgOptions([]);
      setEmpOrgDropdownOpen(false);
    } finally {
      setIsSearchingEmpOrg(false);
    }
  };

  // Handle employee organization search
  const handleEmployeeOrganizationSearch = (searchValue) => {
    setEmpOrgSearchTerm(searchValue);
    
    // Clear selected organization when user types
    if (formData.organization_id && searchValue !== formData.organization_id) {
      setFormData({ ...formData, organization_id: '' });
    }
    
    // Search organizations with debouncing
    if (window.empOrgSearchTimeout) {
      clearTimeout(window.empOrgSearchTimeout);
    }
    
    window.empOrgSearchTimeout = setTimeout(() => {
      searchEmployeeOrganizations(searchValue);
    }, 300);
  };

  // Handle employee organization selection
  const handleEmployeeOrganizationSelection = (selectedOrg) => {
    setFormData((prev) => ({
      ...prev,
      organization_id: selectedOrg.id
    }));
    setEmpOrgSearchTerm(selectedOrg.name);
    setEmpOrgDropdownOpen(false);
    setEmpOrgOptions([]);
    
    // Clear error if exists
    if (errors.organization_id) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.organization_id;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    
    switch(type) {
      case 'service':
      case 'designation':
        // Common validations for service and designation
        if (!formData.name?.trim()) {
          tempErrors.name = "Name is required";
        }
        if (!formData.code?.trim()) {
          tempErrors.code = "Code is required";
        }
        break;
        
      case 'organization':
        // Organization specific validations
        if (!formData.name?.trim()) {
          tempErrors.name = "Name is required";
        }
        if (!formData.code?.trim()) {
          tempErrors.code = "Code is required";
        }
        if (!formData.coordinator_name?.trim()) {
          tempErrors.coordinator_name = "Coordinator name is required";
        }
        if (!formData.coordinator_designation?.trim()) {
          tempErrors.coordinator_designation = "Coordinator designation is required";
        }
        if (!formData.coordinator_phone_number?.trim()) {
          tempErrors.coordinator_phone_number = "Phone number is required";
        } else if (!/^07\d{8}$/.test(formData.coordinator_phone_number)) {
          tempErrors.coordinator_phone_number = "Phone number must start with 07 followed by 8 digits";
        }
        if (!formData.coordinator_email?.trim()) {
          tempErrors.coordinator_email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.coordinator_email)) {
          tempErrors.coordinator_email = "Invalid email format";
        }
        break;
        
      case 'employee':
        // Employee specific validations
        if (!formData.title?.trim()) tempErrors.title = "Title is required";
        if (!formData.first_name?.trim()) tempErrors.first_name = "First name is required";
        if (!formData.last_name?.trim()) tempErrors.last_name = "Last name is required";
        if (!formData.gender?.trim()) tempErrors.gender = "Gender is required";
        
        if (!formData.nic_no?.trim()) {
          tempErrors.nic_no = "NIC number is required";
        } else {
          if (!/^[a-zA-Z0-9]+$/.test(formData.nic_no)) {
            tempErrors.nic_no = "NIC number must only contain letters and numbers";
          }
          if (formData.nic_no.length > 12) {
            tempErrors.nic_no = "NIC number must be 12 characters or less";
          }
        }
        
        if (!formData.birthday) {
          tempErrors.birthday = "Birthday is required";
        } else {
          const birthday = new Date(formData.birthday);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (birthday > today) {
            tempErrors.birthday = "Birthday cannot be in the future";
          }
        }
        
        if (!formData.organization_id) {
          tempErrors.organization_id = "Organization is required";
        }
        
        if (!formData.service_id) {
          tempErrors.service_id = "Category is required";
        }
        
        // Optional fields validation
        if (formData.passport_no?.trim() && !/^[a-zA-Z0-9]+$/.test(formData.passport_no)) {
          tempErrors.passport_no = "Passport number must only contain letters and numbers";
        }
        
        if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          tempErrors.email = "Invalid email address";
        }
        
        if (formData.phone_no?.trim() && !/^07\d{8}$/.test(formData.phone_no)) {
          tempErrors.phone_no = "Phone number must start with 07 followed by 8 digits";
        }
        
        if (formData.whatsapp_no?.trim() && !/^07\d{8}$/.test(formData.whatsapp_no)) {
          tempErrors.whatsapp_no = "WhatsApp number must start with 07 followed by 8 digits";
        }
        break;
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      // Prepare data based on form type
      let endpoint;
      let dataToSend;
      
      switch (type) {
        case 'service':
          endpoint = 'services';
          dataToSend = {
            name: formData.name,
            code: formData.code
          };
          break;
        case 'organization':
          endpoint = 'organizations';
          dataToSend = {
            name: formData.name,
            code: formData.code,
            coordinator_name: formData.coordinator_name,
            coordinator_designation: formData.coordinator_designation,
            coordinator_phone_number: formData.coordinator_phone_number,
            coordinator_email: formData.coordinator_email,
            parent_id: formData.parent_id || null
          };
          break;
        case 'designation':
          endpoint = 'designations';
          dataToSend = {
            name: formData.name,
            code: formData.code
          };
          break;
        case 'employee':
          endpoint = 'employees';
          const sessionId = localStorage.getItem('login_session_id');
          dataToSend = {
            title: formData.title,
            first_name: formData.first_name,
            last_name: formData.last_name,
            gender: formData.gender,
            nic_no: formData.nic_no,
            passport_no: formData.passport_no,
            birthday: formData.birthday,
            phone_no: formData.phone_no,
            whatsapp_no: formData.whatsapp_no,
            email: formData.email,
            organization_id: formData.organization_id,
            designation_id: formData.designation_id,
            service_id: formData.service_id,
            session_id: sessionId
          };
          break;
        default:
          throw new Error('Invalid form type');
      }

      const response = await axios.post(
        `${API_URL}/${endpoint}`,
        dataToSend,
        { headers }
      );

      console.log(`Successfully created ${type}:`, response.data);

      if (onSave) {
        await onSave(response.data);
      }
      onHide();
      // Reset form
      setFormData({
        name: '',
        code: '',
        coordinator_name: '',
        coordinator_designation: '',
        coordinator_phone_number: '',
        coordinator_email: '',
        parent_id: '',
        title: '',
        first_name: '',
        last_name: '',
        gender: '',
        nic_no: '',
        passport_no: '',
        birthday: '',
        phone_no: '',
        whatsapp_no: '',
        email: '',
        organization_id: '',
        designation_id: '',
        service_id: ''
      });
    } catch (error) {
      console.error('Error saving:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setSubmitError(error.response?.data?.message || 'Failed to save. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNestedSave = async (data) => {
    try {
      // Refresh the dropdown data
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };
      
      const [orgRes, desRes, serRes] = await Promise.all([
        axios.get(`${API_URL}/organizations`, { headers }),
        axios.get(`${API_URL}/designations`, { headers }),
        axios.get(`${API_URL}/services`, { headers })
      ]);
      
      setOrganizations(Array.isArray(orgRes.data) ? orgRes.data : orgRes.data?.data || []);
      setDesignations(Array.isArray(desRes.data) ? desRes.data : desRes.data?.data || []);
      setServices(Array.isArray(serRes.data) ? serRes.data : serRes.data?.data || []);
      
      // Auto-select the newly created item
      if (data && data.id) {
        switch (activeNestedForm) {
          case 'service':
            setFormData(prev => ({ ...prev, service_id: data.id }));
            break;
          case 'organization':
            setFormData(prev => ({ ...prev, organization_id: data.id }));
            break;
          case 'designation':
            setFormData(prev => ({ ...prev, designation_id: data.id }));
            break;
        }
      }
      
      setShowNestedModal(false);
      setActiveNestedForm(null);
    } catch (error) {
      console.error('Error updating dropdowns:', error);
    }
  };

  const renderServiceForm = () => (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Name *</Form.Label>
        <Form.Control
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          isInvalid={!!errors.name}
          placeholder="Enter category name"
        />
        <Form.Control.Feedback type="invalid">
          {errors.name}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Code *</Form.Label>
        <Form.Control
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          isInvalid={!!errors.code}
          placeholder="Enter category code"
        />
        <Form.Control.Feedback type="invalid">
          {errors.code}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="secondary" onClick={onHide} className="me-2">
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="me-1 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Plus size={16} className="me-1" /> Add Category
            </>
          )}
        </Button>
      </div>
    </Form>
  );

  const renderOrganizationForm = () => (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Name *</Form.Label>
        <Form.Control
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          isInvalid={!!errors.name}
          placeholder="Enter organization name"
        />
        <Form.Control.Feedback type="invalid">
          {errors.name}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Code *</Form.Label>
        <Form.Control
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          isInvalid={!!errors.code}
          placeholder="Enter organization code"
        />
        <Form.Control.Feedback type="invalid">
          {errors.code}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Coordinator Name *</Form.Label>
        <Form.Control
          type="text"
          value={formData.coordinator_name}
          onChange={(e) => setFormData({ ...formData, coordinator_name: e.target.value })}
          isInvalid={!!errors.coordinator_name}
          placeholder="Enter coordinator name"
        />
        <Form.Control.Feedback type="invalid">
          {errors.coordinator_name}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Coordinator Designation *</Form.Label>
        <Form.Control
          type="text"
          value={formData.coordinator_designation}
          onChange={(e) => setFormData({ ...formData, coordinator_designation: e.target.value })}
          isInvalid={!!errors.coordinator_designation}
          placeholder="Enter coordinator designation"
        />
        <Form.Control.Feedback type="invalid">
          {errors.coordinator_designation}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Coordinator Phone Number *</Form.Label>
        <Form.Control
          type="text"
          value={formData.coordinator_phone_number}
          onChange={(e) => setFormData({ ...formData, coordinator_phone_number: e.target.value })}
          isInvalid={!!errors.coordinator_phone_number}
          placeholder="Enter phone number (e.g., 0712345678)"
        />
        <Form.Control.Feedback type="invalid">
          {errors.coordinator_phone_number}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Coordinator Email *</Form.Label>
        <Form.Control
          type="email"
          value={formData.coordinator_email}
          onChange={(e) => setFormData({ ...formData, coordinator_email: e.target.value })}
          isInvalid={!!errors.coordinator_email}
          placeholder="Enter coordinator email"
        />
        <Form.Control.Feedback type="invalid">
          {errors.coordinator_email}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Parent Organization (Optional)</Form.Label>
        <div className="position-relative org-dropdown-container">
          <Form.Control
            type="text"
            value={orgSearchTerm}
            onChange={(e) => handleOrganizationSearch(e.target.value)}
            placeholder="Search organization (min 3 characters)"
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
        </div>
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="secondary" onClick={onHide} className="me-2">
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="me-1 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Plus size={16} className="me-1" /> Add Organization
            </>
          )}
        </Button>
      </div>
    </Form>
  );

  const renderDesignationForm = () => (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Name *</Form.Label>
        <Form.Control
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          isInvalid={!!errors.name}
          placeholder="Enter designation name"
        />
        <Form.Control.Feedback type="invalid">
          {errors.name}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Code *</Form.Label>
        <Form.Control
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          isInvalid={!!errors.code}
          placeholder="Enter designation code"
        />
        <Form.Control.Feedback type="invalid">
          {errors.code}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="secondary" onClick={onHide} className="me-2">
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="me-1 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Plus size={16} className="me-1" /> Add Designation
            </>
          )}
        </Button>
      </div>
    </Form>
  );

  const renderEmployeeForm = () => (
    <Form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Title *</Form.Label>
            <Form.Select
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>First Name *</Form.Label>
            <Form.Control
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              isInvalid={!!errors.first_name}
              placeholder="Enter first name"
            />
            <Form.Control.Feedback type="invalid">
              {errors.first_name}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Last Name *</Form.Label>
            <Form.Control
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              isInvalid={!!errors.last_name}
              placeholder="Enter last name"
            />
            <Form.Control.Feedback type="invalid">
              {errors.last_name}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Gender *</Form.Label>
            <Form.Select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              isInvalid={!!errors.gender}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.gender}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>NIC No *</Form.Label>
            <Form.Control
              type="text"
              value={formData.nic_no}
              onChange={(e) => setFormData({ ...formData, nic_no: e.target.value })}
              isInvalid={!!errors.nic_no}
              placeholder="Enter NIC number"
            />
            <Form.Control.Feedback type="invalid">
              {errors.nic_no}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Passport No</Form.Label>
            <Form.Control
              type="text"
              value={formData.passport_no}
              onChange={(e) => setFormData({ ...formData, passport_no: e.target.value })}
              isInvalid={!!errors.passport_no}
              placeholder="Enter passport number"
            />
            <Form.Control.Feedback type="invalid">
              {errors.passport_no}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              isInvalid={!!errors.email}
              placeholder="Enter email"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Phone No</Form.Label>
            <Form.Control
              type="text"
              value={formData.phone_no}
              onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
              isInvalid={!!errors.phone_no}
              placeholder="Enter phone number"
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone_no}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>WhatsApp No</Form.Label>
            <Form.Control
              type="text"
              value={formData.whatsapp_no}
              onChange={(e) => setFormData({ ...formData, whatsapp_no: e.target.value })}
              isInvalid={!!errors.whatsapp_no}
              placeholder="Enter WhatsApp number"
            />
            <Form.Control.Feedback type="invalid">
              {errors.whatsapp_no}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Birthday *</Form.Label>
            <Form.Control
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              isInvalid={!!errors.birthday}
            />
            <Form.Control.Feedback type="invalid">
              {errors.birthday}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Category *</Form.Label>
            <div className="d-flex gap-2 align-items-start">
              <div style={{ flex: 1 }}>
                <Form.Select
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  isInvalid={!!errors.service_id}
                >
                  <option value="">Select Category</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  setActiveNestedForm('service');
                  setShowNestedModal(true);
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
            <Form.Control.Feedback type="invalid">
              {errors.service_id}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Organization *</Form.Label>
            <div className="d-flex gap-2 align-items-start">
              <div style={{ flex: 1, position: 'relative' }} className="emp-org-dropdown-container">
                <Form.Control
                  type="text"
                  value={empOrgSearchTerm}
                  onChange={(e) => handleEmployeeOrganizationSearch(e.target.value)}
                  placeholder="Search organization (min 3 characters)"
                  isInvalid={!!errors.organization_id}
                  autoComplete="off"
                />
                
                {/* Loading spinner */}
                {isSearchingEmpOrg && (
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
                {empOrgDropdownOpen && empOrgOptions.length > 0 && (
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
                    {empOrgOptions.map((org) => (
                      <div
                        key={org.id}
                        style={{ 
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        onClick={() => handleEmployeeOrganizationSelection(org)}
                      >
                        {org.name}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show message when no results */}
                {empOrgDropdownOpen && empOrgOptions.length === 0 && empOrgSearchTerm.length >= 3 && !isSearchingEmpOrg && (
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
                
                <Form.Control.Feedback type="invalid">
                  {errors.organization_id}
                </Form.Control.Feedback>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  setActiveNestedForm('organization');
                  setShowNestedModal(true);
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
            <Form.Label>Designation</Form.Label>
            <div className="d-flex gap-2 align-items-start">
              <div style={{ flex: 1 }}>
                <Form.Select
                  value={formData.designation_id}
                  onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
                  isInvalid={!!errors.designation_id}
                >
                  <option value="">Select Designation</option>
                  {designations.map(des => (
                    <option key={des.id} value={des.id}>
                      {des.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.designation_id}
                </Form.Control.Feedback>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  setActiveNestedForm('designation');
                  setShowNestedModal(true);
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

      <div className="d-flex justify-content-end">
        <Button variant="secondary" onClick={onHide} className="me-2">
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="me-1 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Plus size={16} className="me-1" /> Create Officer
            </>
          )}
        </Button>
      </div>

      {/* Nested SubFormModal for Service, Organization, Designation */}
      {showNestedModal && (
        <SubFormModal
          show={showNestedModal}
          onHide={() => {
            setShowNestedModal(false);
            setActiveNestedForm(null);
          }}
          type={activeNestedForm}
          onSave={handleNestedSave}
        />
      )}
    </Form>
  );

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      size={type === 'employee' ? 'xl' : 'lg'}
      backdropClassName="modal-backdrop-
      "
      contentClassName={showNestedModal ? 'blurred-parent-modal' : undefined}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {type === 'service' ? 'Add New Category' :
           type === 'organization' ? 'Add New Organization' :
           type === 'designation' ? 'Add New Designation' :
           type === 'employee' ? 'Add Officer' : ''}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {submitError && (
          <Alert variant="danger" className="mb-3">
            {submitError}
          </Alert>
        )}
        
        {type === 'service' && renderServiceForm()}
        {type === 'organization' && renderOrganizationForm()}
        {type === 'designation' && renderDesignationForm()}
        {type === 'employee' && renderEmployeeForm()}
      </Modal.Body>
    </Modal>
  );
}
