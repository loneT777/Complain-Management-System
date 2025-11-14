import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useParams } from 'react-router-dom';
import MainCard from "components/Card/MainCard";
import { Table, Button, Form, Modal, Row, Col, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { Download, Plus, ArrowUpCircle, Pencil, Eye, UserPlus, Trash2, Save, Send, X, CheckCircle, XCircle, ThumbsUp, ThumbsDown, CheckSquare, RefreshCw, CheckCheck, RotateCcw, Paperclip, Upload } from 'lucide-react';
import Pagination from "./Pagination"; // Import the Pagination component
import SubFormModal from './SubFormModal';
const API_URL = import.meta.env.VITE_API_URL;

export default function PO_Application() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSubFormModal, setShowSubFormModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [viewingApplication, setViewingApplication] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;
  const [searchParams] = useSearchParams();
  const { statusId } = useParams();
  const statusParam = statusId || searchParams.get('status');
  
  // ===== NEW: Employee Searchable Dropdown States =====
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [isSearchingEmployee, setIsSearchingEmployee] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  // ===============================================
  
  // ===== NEW: Attachment States =====
  const [attachments, setAttachments] = useState([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]); // Track files to delete on update
  const [isDragging, setIsDragging] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const fileInputRef = useRef(null);
  // ===============================================
  
  const [application, setApplication] = useState({
    name: '',
    post: '',
    designation_id: '',
    service: '',
    service_id: '',
    dateOfBirth: '',
    nicNumber: '',
    ministry: '',
    department: '',
    arrangements: '',
    purposeOfTravel: '',
    natureOfTravel: '',
    awardingAgencyName: '',
    awardingAgency: {},
    expenseAmounts: {},
    foreignLoan: '',
    courseStart: '',
    courseEnd: '',
    departureDate: '',
    returnDate: '',
    countries: '',
    foreignAddress: '',
    previousReport: '',
    declarationDate: new Date().toISOString().split('T')[0],
    foreignTravelHistory: [{ year: '', purpose: '', travelling_start_date: '', travelling_end_date: '', country: '' }],
    declarationChecked: false
  });
  const [errors, setErrors] = useState({});
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [expensesMet, setExpensesMet] = useState([]);
  const [goslFundTypes, setGoslFundTypes] = useState([]);
  const [goslFunds, setGoslFunds] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [nicError, setNicError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [services, setServices] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [statusRemark, setStatusRemark] = useState('');

  // Status helpers (unchanged)
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    const colorMap = {
      'pending': '#6c757d',
      'checked': '#17a2b8',
      'recommended': '#007bff',
      'not recommended': '#ffc107',
      'approved': '#28a745',
      'rejected': '#dc3545',
      'resubmit required': '#fd7e14',
      'resubmit pending': '#e83e8c'
    };
    
    return colorMap[statusLower] || '#6c757d';
  };

  const canEditApplication = (status) => {
    return !status || status.toLowerCase() === 'pending' || status.toLowerCase() === 'resubmit pending';
  };

  const getAvailableStatusOptions = (currentStatus) => {
    const status = currentStatus?.toLowerCase();
    if (!status || status === 'pending' || status === 'resubmit pending') return ['check'];
    if (status === 'checked') return ['recommend', 'do not recommend', 'require resubmit'];
    if (status === 'recommended') return ['approve', 'reject', 'require resubmit'];
    if (status === 'resubmit required') return [];
    if (status === 'not recommended') return [];
    if (status === 'rejected') return [];
    if (status === 'approved') return [];
    return [];
  };

  // ===== NEW: Employee Search Function =====
  const searchEmployees = async (searchTerm) => {
    if (!searchTerm.trim() || searchTerm.length < 3) {
      setEmployeeOptions([]);
      setShowEmployeeDropdown(false);
      return;
    }

    setIsSearchingEmployee(true);
    
    try {
      const response = await axios.get(`${API_URL}/employees?search=${searchTerm.trim()}&per_page=10`);
      const employees = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      setEmployeeOptions(employees);
      setShowEmployeeDropdown(true);
    } catch (error) {
      console.error('Error searching employees:', error);
      setEmployeeOptions([]);
      setShowEmployeeDropdown(false);
    } finally {
      setIsSearchingEmployee(false);
    }
  };

  // ===== NEW: Employee Selection Handler =====
const handleEmployeeSelection = (selectedEmployee) => {
  setApplication((prev) => ({
    ...prev,
    nicNumber: selectedEmployee.nic_no
    }));
  setEmployeeSearchTerm(selectedEmployee.nic_no);
  setShowEmployeeDropdown(false);
  setEmployeeOptions([]);
  fetchEmployeeByNIC(selectedEmployee.nic_no);
  };

  // ===== MODIFIED: Enhanced NIC Change Handler =====
  const handleNICChange = (e) => {
    const nicValue = e.target.value;
    setApplication((prev) => ({
      ...prev,
      nicNumber: nicValue
    }));
    setEmployeeSearchTerm(nicValue); // NEW: Update search term
    
    if (nicError) {
      setNicError('');
    }
    
    if (errors.nicNumber) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.nicNumber;
        return newErrors;
      });
    }
    
    // NEW: Trigger employee search for dropdown (3+ chars)
    if (window.employeeSearchTimeout) {
      clearTimeout(window.employeeSearchTimeout);
    }
    window.employeeSearchTimeout = setTimeout(() => {
      searchEmployees(nicValue);
    }, 300);
    
    // EXISTING: Debounce employee fetch (9+ chars)
    if (handleNICChange.timeout) {
      clearTimeout(handleNICChange.timeout);
    }
    handleNICChange.timeout = setTimeout(() => {
      if (nicValue.trim().length >= 9) {
        fetchEmployeeByNIC(nicValue);
      } else if (nicValue.trim().length === 0) {
        setApplication((prev) => ({
          ...prev,
          name: '',
          post: '',
          service: '',
          dateOfBirth: '',
          ministry: '',
          department: ''
        }));
        setEmployeeId(null);
        setDepartments([]);
      }
    }, 300);
  };

  // ===== NEW: Click Outside Handler =====
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmployeeDropdown && !event.target.closest('.employee-dropdown-container')) {
        setShowEmployeeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmployeeDropdown]);

  // ===== NEW: File Processing Functions =====
  const processFiles = useCallback((files) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    const validFiles = [];
    const errorMessages = [];

    Array.from(files).forEach((file) => {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        errorMessages.push(`${file.name}: File size must be less than 5MB`);
        return;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errorMessages.push(`${file.name}: Only PDF, Word, Excel, and image files are allowed`);
        return;
      }

      validFiles.push(file);
    });

    if (errorMessages.length > 0) {
      setErrors((prev) => ({ ...prev, attachments: errorMessages.join('\n') }));
    }

    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
      
      const newPreviews = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setAttachmentPreviews(prev => [...prev, ...newPreviews]);
      
      // Clear error when user selects valid files
      if (errors.attachments && errorMessages.length === 0) {
        setErrors((prev) => ({ ...prev, attachments: '' }));
      }
    }
  }, [errors]);

  const handleFileChange = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleRemoveFile = useCallback((index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    
    setAttachmentPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke object URLs to prevent memory leaks
      prev.filter((_, i) => i === index).forEach(preview => {
        URL.revokeObjectURL(preview.preview);
      });
      
      // Track existing files for deletion
      const removedPreview = prev[index];
      if (removedPreview && removedPreview.existing && removedPreview.id) {
        setFilesToDelete(deleteList => [...deleteList, removedPreview.id]);
      }
      
      return newPreviews;
    });
    
    // Reset file input if all files are removed
    if (attachments.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [attachments.length]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  // Handle attachment download
  const handleDownloadAttachment = useCallback(async (attachmentId, fileName) => {
    if (!attachmentId) return;

    try {
      const token = localStorage.getItem('authToken');

      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = `${API_URL}/application-files/${attachmentId}/download`;
      link.target = '_blank';
      link.download = fileName || 'attachment';

      // Add authentication headers
      fetch(`${API_URL}/application-files/${attachmentId}/download`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error('Error downloading attachment:', error);
          alert('Failed to download attachment. Please try again.');
        });
    } catch (error) {
      console.error('Error downloading attachment:', error);
      alert('Failed to download attachment. Please try again.');
    }
  }, []);
  // ===============================================

  const handleStatusChange = async (id, buttonLabel) => {
    const statusMap = {
      'check': 'checked',
      'recommend': 'recommended',
      'do not recommend': 'not recommended',
      'approve': 'approved',
      'reject': 'rejected',
      'require resubmit': 'resubmit required'
    };
    
    const status = statusMap[buttonLabel] || buttonLabel;
    
    // Validate remark - required only for specific statuses
    const requireRemarkStatuses = ['do not recommend', 'reject', 'require resubmit'];
    if (requireRemarkStatuses.includes(buttonLabel) && !statusRemark.trim()) {
      alert('Please provide a remark before changing the status to ' + buttonLabel + '.');
      return;
    }

    const isConfirmed = window.confirm(`Are you sure you want to ${buttonLabel} this application?`);
    if (!isConfirmed) return;
    try {
      const response = await axios.post(
        `${API_URL}/application/${id}/status`,
        { 
          status, 
          remark: statusRemark.trim(),
          session_id: currentSessionId
        }
      );
      if (response.data?.success || response.status === 200) {
        const updatedRemark = statusRemark.trim();
        setViewingApplication((prev) => (prev ? { 
          ...prev, 
          last_status: status,
          last_status_remark: updatedRemark
        } : prev));
        setApplications((prev) =>
          Array.isArray(prev) ? prev.map((app) => (app.id === id ? { 
            ...app, 
            last_status: status,
            last_status_remark: updatedRemark
          } : app)) : prev
        );
        setSuccessMessage('Status updated successfully!');
        setStatusRemark('');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error);
      alert('Failed to update status');
    }
  };

  const handleDownloadPDF = async (applicationId) => {
    if (!applicationId) return;

    if (!hasPermission('Application_print')) {
      alert('You do not have permission to print applications.');
      return;
    }

    setIsDownloading(true);
    try {
      const token = localStorage.getItem('authToken');

      const link = document.createElement('a');
      link.href = `${API_URL}/pdf/application/${applicationId}`;
      link.target = '_blank';
      link.download = `application_${applicationId}.pdf`;

      fetch(`${API_URL}/pdf/application/${applicationId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf'
        }
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error('Error downloading PDF:', error);
          alert('Failed to download PDF. Please try again.');
        })
        .finally(() => {
          setIsDownloading(false);
        });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
      setIsDownloading(false);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
  };

  const getMultiPartHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data'
    };
  };

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

  const hasPermission = useCallback((permissionName) => {
    return userPermissions.includes(permissionName);
  }, [userPermissions]);

  const getCurrentSessionId = () => {
    try {
      setCurrentSessionId(localStorage.getItem('login_session_id'));
    } catch (error) {
      console.error("Error getting session ID from local storage:", error);
      return 1;
    }
  };

  const fetchApplications = async (page = 1, search = null, status = null) => {
    if (!hasPermission('Application_read_all')) return;
    
    if (search && search.length < 3) {
      return;
    }
    var searchTxt = search ? search : '';
    
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/application?page=${page}&per_page=${pageSize}${searchTxt ? `&search=${searchTxt}` : ''}${status ? `&status=${encodeURIComponent(status)}` : ''}`);
      
      if (Array.isArray(res.data)) {
        const type1Applications = res.data.filter((app) => app.application_type === '1');
        setApplications(type1Applications || []);
        setTotalPages(1);
        setCurrentPage(1);
        setTotalItems(type1Applications.length);
      } else if (res.data && Array.isArray(res.data.data)) {
        setApplications(res.data.data || []);
        setTotalPages(res.data.last_page || 1);
        setCurrentPage(res.data.current_page || 1);
        setTotalItems(res.data.total || 0);
      } else {
        setApplications([]);
        setTotalPages(1);
        setCurrentPage(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
      setTotalPages(1);
      setCurrentPage(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(`${API_URL}/organizations?parents_only=true`);
      const parentOrgs = Array.isArray(res.data) 
        ? res.data.filter(org => !org.parent_id)
        : (res.data?.data || []).filter(org => !org.parent_id);
      
      setOrganizations(parentOrgs);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    }
  };

  const fetchDesignations = async () => {
    const possibleEndpoints = [
      `${API_URL}/designations`,
      `${API_URL}/designation`,
      `${API_URL}/posts`,
      `${API_URL}/positions`
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        const res = await axios.get(endpoint);
        const data = res.data;
        if (Array.isArray(data)) {
          setDesignations(data);
          console.log(`Successfully fetched designations from ${endpoint}:`, data);
          return;
        } else if (data && data.data && Array.isArray(data.data)) {
          setDesignations(data.data);
          console.log(`Successfully fetched designations from ${endpoint}:`, data.data);
          return;
        }
      } catch (error) {
        console.log(`Failed to fetch from ${endpoint}:`, error.message);
      }
    }

    console.error('Could not fetch designations from any endpoint');
    setDesignations([]);
  };

  const fetchExpenseTypes = async () => {
    try {
      const res = await axios.get(`${API_URL}/expense-types-all`);
      const data = Array.isArray(res.data) ? res.data : [];
      setExpenseTypes(data);

      let expenses = [];
      for (let i = 0; i < data.length; i++) {
        expenses[i] = {
          expenses_type_id: data[i].id,
          is_checked: false
        };
      }
      setExpensesMet(expenses);
    } catch (error) {
      console.error('Error fetching expense types:', error);
      setExpenseTypes([]);
      setExpensesMet([]);
    }
  };

  const fetchGoslFundTypes = async () => {
    try {
      const res = await axios.get(`${API_URL}/gosl-fund-types-all`);
      const data = Array.isArray(res.data) ? res.data : [];
      setGoslFundTypes(data);

      let funds = [];
      for (let i = 0; i < data.length; i++) {
        funds[i] = {
          gosl_fund_type_id: data[i].id,
          amount: '',
          is_selected: false
        };
      }
      setGoslFunds(funds);
    } catch (error) {
      console.error('Error fetching GOSL fund types:', error);
      setGoslFundTypes([]);
      setGoslFunds([]);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/services`);
      let servicesList = [];
      if (Array.isArray(res.data)) {
        servicesList = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        servicesList = res.data.data;
      } else if (res.data && typeof res.data === 'object') {
        servicesList = [res.data];
      }
      console.log('Fetched services:', servicesList);
      setServices(servicesList);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchServices();
        
        await Promise.all([
          fetchOrganizations(),
          fetchDesignations(),
          fetchExpenseTypes(),
          fetchGoslFundTypes(),
        ]);
        
        console.log('All data loaded successfully');
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
    fetchUserPermissions();
    getCurrentSessionId();
  }, []);

  useEffect(() => {
    if (permissionsLoaded) {
      if (hasPermission('Application_read_all')) {
        fetchApplications(currentPage, search, statusParam);
      }
    }
  }, [permissionsLoaded, currentPage, search, statusParam]);

  const loadDepartmentsForMinistry = async (ministryId) => {
    if (!ministryId) {
      setDepartments([]);
      return Promise.resolve([]);
    }
    
    try {
      console.log('Loading departments for ministry:', ministryId);
      const res = await axios.get(`${API_URL}/organizations?parent_id=${ministryId}`);
      
      const depts = Array.isArray(res.data) 
        ? res.data 
        : (res.data?.data || []);
      
      console.log('Received departments:', depts);
      setDepartments(depts);
      return Promise.resolve(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
      return Promise.reject(error);
    }
  };

  const validateDates = (app = application) => {
    const errors = {};
    
    if (app.departureDate && app.returnDate) {
      const departure = new Date(app.departureDate);
      const returnDate = new Date(app.returnDate);
      
      if (returnDate <= departure) {
        errors.returnDate = 'Return date must be after departure date';
      }
    }

    if (app.courseStart && app.departureDate) {
      const courseStart = new Date(app.courseStart);
      const departure = new Date(app.departureDate);
      
      if (courseStart < departure) {
        errors.courseStart = 'Course start date must be after departure date';
      }
    }

    if (app.courseStart && app.courseEnd) {
      const start = new Date(app.courseStart);
      const end = new Date(app.courseEnd);
      
      if (end <= start) {
        errors.courseEnd = 'Course completion date must be after commencement date';
      }
      
      if (app.returnDate) {
        const returnDate = new Date(app.returnDate);
        if (end > returnDate) {
          errors.courseEnd = 'Course completion date must be before return date';
        }
      }
    }

    return errors;
  };

  const validate = () => {
    let tempErrors = {};
    
    if (!application.name.trim()) tempErrors.name = 'Name is required';
    if (!application.nicNumber.trim()) tempErrors.nicNumber = 'NIC number is required';
    if (!application.ministry) tempErrors.ministry = 'Ministry is required';
    if (!application.purposeOfTravel.trim()) tempErrors.purposeOfTravel = 'Purpose of travel is required';
    if (!application.declarationChecked) tempErrors.declarationChecked = 'Declaration must be accepted';
    if (!employeeId && !editingApplication) tempErrors.employee = 'Employee not found with this NIC number';
    
    if (!application.arrangements.trim()) tempErrors.arrangements = 'Arrangements are required';
    
    const hasExpenseSelected = Array.isArray(expensesMet) && expensesMet.some(expense => expense.is_checked);
    if (!hasExpenseSelected) tempErrors.expensesMet = 'At least one expense must be selected';
    
    if (!application.courseStart) tempErrors.courseStart = 'Date of commencement is required';
    if (!application.courseEnd) tempErrors.courseEnd = 'Date of completion is required';
    if (!application.departureDate) tempErrors.departureDate = 'Departure date is required';
    if (!application.returnDate) tempErrors.returnDate = 'Return date is required';
    if (!application.countries.trim()) tempErrors.countries = 'Countries to be visited are required';
    if (!application.foreignAddress.trim()) tempErrors.foreignAddress = 'Foreign address is required';
    if (!application.previousReport) tempErrors.previousReport = 'Previous report submission status is required';

    const dateErrors = validateDates();
    
    setErrors({ ...tempErrors, ...dateErrors });
    return Object.keys(tempErrors).length === 0 && Object.keys(dateErrors).length === 0;
  };

  const isGovernmentSLSelected = () => {
    if (!Array.isArray(expenseTypes) || !Array.isArray(expensesMet)) return false;

    for (let i = 0; i < expensesMet.length; i++) {
      const expense = expensesMet[i];
      const expenseType = expenseTypes.find((et) => et.id === expense.expenses_type_id);

      if (expense.is_checked && expenseType) {
        const typeName = expenseType.name.toLowerCase();
        if (typeName.includes('government') && (typeName.includes('s.l') || typeName.includes('sl') || typeName.includes('sri lanka'))) {
          return true;
        }
      }
    }
    return false;
  };

  const fetchEmployeeByNIC = async (nicNumber) => {
    if (!nicNumber.trim()) {
      setNicError('');
      setApplication(prev => ({
        ...prev,
        name: '',
        post: '',
        service: '',
        dateOfBirth: '',
        ministry: '',
        department: ''
      }));
      return;
    }
    setIsSearching(true);
    try {
      setNicError('');
      const response = await axios.get(`${API_URL}/employees/nic/${nicNumber.trim()}`);
      const employee = response.data.data;
      if (employee) {
        let serviceName = '';
        let designationName = '';
        
        if (employee.service_name) {
          serviceName = employee.service_name;
        } else if (employee.service && typeof employee.service === 'object' && employee.service.name) {
          serviceName = employee.service.name;
        } else if (employee.service && typeof employee.service === 'string') {
          serviceName = employee.service;
        } else if (employee.service_id && Array.isArray(services) && services.length > 0) {
          const foundService = services.find((s) => s.id === employee.service_id);
          if (foundService) {
            serviceName = foundService.name;
          }
        }
        
        if (employee.designation_name) {
          designationName = employee.designation_name;
        } else if (employee.designation && typeof employee.designation === 'object' && employee.designation.name) {
          designationName = employee.designation.name;
        } else if (employee.designation && typeof employee.designation === 'string') {
          designationName = employee.designation;
        } else if (employee.post) {
          designationName = employee.post;
        } else if (employee.position) {
          designationName = employee.position;
        } else if (employee.designation_id && Array.isArray(designations) && designations.length > 0) {
          const foundDesignation = designations.find((d) => d.id === employee.designation_id);
          if (foundDesignation) {
            designationName = foundDesignation.name;
          }
        }
        
        console.log('Auto-fill Employee data:', employee);
        console.log('Extracted Service name:', serviceName);
        console.log('Extracted Designation name:', designationName);

        let resolved_designation_id = employee.designation_id || '';
        let resolved_service_id = employee.service_id || '';
        if (!resolved_designation_id && designationName && Array.isArray(designations)) {
          const found = designations.find(d => d.name && d.name.toLowerCase() === String(designationName).toLowerCase());
          if (found) resolved_designation_id = found.id;
        }
        if (!resolved_service_id && serviceName && Array.isArray(services)) {
          const foundS = services.find(s => s.name && s.name.toLowerCase() === String(serviceName).toLowerCase());
          if (foundS) resolved_service_id = foundS.id;
        }

        setApplication((prev) => ({
          ...prev,
          name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
          post: designationName,
          designation_id: resolved_designation_id || '',
          service: serviceName,
          service_id: resolved_service_id || '',
          dateOfBirth: employee.birthday || employee.date_of_birth || '',
        }));
        setEmployeeId(employee.id);
        
        try {
          const travelHistoryResponse = await axios.get(
            `${API_URL}/application/employee/${employee.id}/travel-history`, 
            getAuthHeaders()
          );
          
          console.log('Travel history API response:', travelHistoryResponse.data);
          
          if (travelHistoryResponse.data.success && travelHistoryResponse.data.data) {
            const histories = travelHistoryResponse.data.data;
            console.log('Fetched travel histories:', histories);
            
            if (histories.length > 0) {
              const historiesWithReadOnly = histories.map(h => ({
                ...h,
                isAutoFilled: true
              }));
              
              setApplication((prev) => ({
                ...prev,
                foreignTravelHistory: historiesWithReadOnly,
                previousReport: 'Yes'
              }));
              console.log('Travel histories loaded and previousReport set to Yes');
            }
          }
        } catch (travelError) {
          console.error('Error fetching travel history:', travelError);
          if (travelError.response) {
            console.error('Error response:', travelError.response.data);
          }
        }
        
        if (employee.organization_id) {
          try {
            const orgResponse = await axios.get(`${API_URL}/organizations/${employee.organization_id}`, getAuthHeaders());
            const organization = orgResponse.data;
            
            console.log('Fetched organization:', organization);
            
            if (organization.parent_id) {
              await loadDepartmentsForMinistry(organization.parent_id.toString());
              
              console.log('Setting ministry to:', organization.parent_id, 'and department to:', organization.id);
              
              setApplication((prev) => ({
                ...prev,
                ministry: String(organization.parent_id),
                department: String(organization.id)
              }));
            } else {
              console.log('Setting ministry to:', organization.id, 'department: N/A');
              
              setApplication((prev) => ({
                ...prev,
                ministry: String(organization.id),
                department: ''
              }));
              setDepartments([]);
            }
          } catch (orgError) {
            console.error('Error fetching organization details:', orgError);
            setApplication((prev) => ({
              ...prev,
              ministry: String(employee.organization_id) || '',
              department: ''
            }));
            setDepartments([]);
          }
        }
        setNicError('');
      } else {
        setNicError('Employee not found with this NIC number');
        setApplication((prev) => ({
          ...prev,
          name: '',
          post: '',
          service: '',
          dateOfBirth: '',
          ministry: '',
          department: ''
        }));
        setEmployeeId(null);
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      if (error.response && error.response.status === 404) {
        setNicError('Employee not found with this NIC number');
      } else {
        setNicError('Error fetching employee data');
      }
      setEmployeeId(null);
      setDepartments([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplication(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (name.startsWith('foreignTravelHistory')) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith('foreignTravelHistory_') || key.startsWith('travelEndDate_')) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }

    if (name === 'departureDate' || name === 'returnDate' || name === 'courseStart' || name === 'courseEnd') {
      const tempApp = { ...application, [name]: value };
      const dateErrors = validateDates(tempApp);
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (!dateErrors.departureDate && newErrors.departureDate) {
          delete newErrors.departureDate;
        }
        if (!dateErrors.returnDate && newErrors.returnDate) {
          delete newErrors.returnDate;
        }
        if (!dateErrors.courseStart && newErrors.courseStart) {
          delete newErrors.courseStart;
        }
        if (!dateErrors.courseEnd && newErrors.courseEnd) {
          delete newErrors.courseEnd;
        }
        return { ...newErrors, ...dateErrors };
      });
    }

    if (name === 'expensesMet' && errors.expensesMet) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.expensesMet;
        return newErrors;
      });
    }
  };

  const updateExpensesMet = (value, index, attr) => {
    if (!Array.isArray(expensesMet)) return;

    const newArray = expensesMet.map((expense, i) => {
      if (index === i) {
        return { ...expense, [attr]: value };
      } else {
        return expense;
      }
    });
    setExpensesMet(newArray);

    if (attr === 'is_checked' && value && errors.expensesMet) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.expensesMet;
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (section, field) => {
    setApplication((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }));
  };

  const handleExpenseAmountChange = (field, value) => {
    setApplication((prev) => ({
      ...prev,
      expenseAmounts: {
        ...prev.expenseAmounts,
        [field]: value
      }
    }));
  };

  const handleHistoryChange = (index, field, value) => {
    if (!Array.isArray(application.foreignTravelHistory)) return;

    setApplication((prev) => ({
      ...prev,
      foreignTravelHistory: prev.foreignTravelHistory.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`foreignTravelHistory_${index}`];
      delete newErrors[`travelEndDate_${index}`];
      return newErrors;
    });

    if (field === 'travelling_start_date' || field === 'travelling_end_date') {
      const travel = application.foreignTravelHistory[index];
      const updatedTravel = { ...travel, [field]: value };
      
      if (updatedTravel.travelling_start_date && updatedTravel.travelling_end_date) {
        const startDate = new Date(updatedTravel.travelling_start_date);
        const endDate = new Date(updatedTravel.travelling_end_date);
        
        if (endDate <= startDate) {
          setErrors((prev) => ({
            ...prev,
            [`travelEndDate_${index}`]: `Travel end date must be after start date in row ${index + 1}`
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`travelEndDate_${index}`];
            return newErrors;
          });
        }
      }
    }
  };

  const addTravelRow = () => {
    setApplication((prev) => ({
      ...prev,
      foreignTravelHistory: [
        ...(prev.foreignTravelHistory || []),
        { year: '', purpose: '', travelling_start_date: '', travelling_end_date: '', country: '' }
      ]
    }));
  };

  const removeTravelRow = (index) => {
    if (Array.isArray(application.foreignTravelHistory) && application.foreignTravelHistory.length > 1) {
      setApplication((prev) => ({
        ...prev,
        foreignTravelHistory: prev.foreignTravelHistory.filter((_, i) => i !== index)
      }));
    }
  };

  const handleDeclarationChange = (e) => {
    setApplication((prev) => ({
      ...prev,
      declarationChecked: e.target.checked
    }));
    if (e.target.checked && errors.declarationChecked) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.declarationChecked;
        return newErrors;
      });
    }
  };

  const handleMinistryChange = async (e) => {
    const selectedMinistryId = e.target.value;
    
    setApplication((prev) => ({
      ...prev,
      ministry: selectedMinistryId,
      department: editingApplication && prev.department && departments.some(d => d.id === prev.department && d.parent_id === selectedMinistryId) 
        ? prev.department 
        : ''
    }));
    
    if (selectedMinistryId && errors.ministry) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.ministry;
        return newErrors;
      });
    }
    
    await loadDepartmentsForMinistry(selectedMinistryId);
  };

  const handleDepartmentChange = (e) => {
    setApplication((prev) => ({
      ...prev,
      department: e.target.value
    }));
  };

  const openModal = async (app = null) => {
    setErrors({});
    setNicError('');
    setFilesToDelete([]); // Reset files to delete
    let initialGoslFunds = Array.isArray(goslFundTypes)
      ? goslFundTypes.map((type) => ({
          gosl_fund_type_id: type.id,
          amount: '',
          is_selected: false
        }))
      : [];
    
    if (!app) {
      resetExpensesMet();
      setGoslFunds(initialGoslFunds);
      // Reset attachments when opening new modal
      setAttachments([]);
      setAttachmentPreviews([]);
    }

    if (app) {
      setEditingApplication(app);
      let postName = '';
      if (typeof app.post === 'string' && app.post.trim()) {
        postName = app.post;
      } else if (app.employee) {
        postName =
          app.employee.designation_name ||
          (app.employee.designation && typeof app.employee.designation === 'object' && app.employee.designation.name) ||
          (app.employee.designation && typeof app.employee.designation === 'string' && app.employee.designation) ||
          app.employee.post ||
          '';

        if (!postName && app.employee.designation_id && Array.isArray(designations) && designations.length > 0) {
          const designation = designations.find((d) => d.id === app.employee.designation_id);
          postName = designation ? designation.name : app.post || '';
        }
      }
      let serviceName = '';
      if (typeof app.service === 'string' && app.service.trim()) {
        serviceName = app.service;
      } else if (app.employee) {
        serviceName =
          app.employee.service_name ||
          (app.employee.service && typeof app.employee.service === 'object' && app.employee.service.name) ||
          (app.employee.service && typeof app.employee.service === 'string' && app.employee.service) ||
          app.service ||
          '';

        if (!serviceName && app.employee.service_id && Array.isArray(services) && services.length > 0) {
          const service = services.find((s) => s.id === app.employee.service_id);
          serviceName = service ? service.name : app.service || '';
        }
      }
      
      let foreignTravelHistory = [{ year: '', purpose: '', travelling_start_date: '', travelling_end_date: '', country: '' }];
      if (app.travelling_histories && Array.isArray(app.travelling_histories) && app.travelling_histories.length > 0) {
        foreignTravelHistory = app.travelling_histories.map((item) => ({
          year: item.year || '',
          purpose: item.purpose_of_travel || '',
          travelling_start_date: item.travelling_start_date ? item.travelling_start_date.split('T')[0] : '',
          travelling_end_date: item.travelling_end_date ? item.travelling_end_date.split('T')[0] : '',
          country: item.country || ''
        }));
      } else if (app.foreignTravelHistory) {
        foreignTravelHistory = app.foreignTravelHistory;
      }
      
      let ministryId = '';
      let departmentId = '';
      
      try {
        if (app.organization) {
          if (app.organization.parent_id) {
            departmentId = app.organization_id;
            ministryId = app.organization.parent_id;
          } else {
            ministryId = app.organization_id;
            departmentId = '';
          }
        } else {
          const orgResponse = await axios.get(`${API_URL}/organizations/${app.organization_id}`);
          const orgDetails = orgResponse.data;
          
          console.log('Fetched organization details:', orgDetails);
          
          if (orgDetails) {
            if (orgDetails.parent_id) {
              departmentId = app.organization_id;
              ministryId = orgDetails.parent_id;
            } else {
              ministryId = app.organization_id;
              departmentId = '';
            }
          }
        }
      } catch (error) {
        console.error('Error fetching organization details:', error);
        ministryId = app.organization_id;
        departmentId = '';
      }
      
      console.log('Determined ministryId:', ministryId, 'departmentId:', departmentId);
      
      let loadedDepartments = [];
      if (ministryId) {
        try {
          loadedDepartments = await loadDepartmentsForMinistry(ministryId);
          console.log('Loaded departments:', loadedDepartments);
        } catch (error) {
          console.error('Error loading departments:', error);
        }
      }
      
      const applicationData = {
        ...app,
        nicNumber: app.employee?.nic_no || '',
        name: app.employee ? `${app.employee.first_name || ''} ${app.employee.last_name || ''}`.trim() : app.name || '',
        post: postName,
        service: serviceName,
        dateOfBirth: app.employee?.birthday || app.employee?.date_of_birth || app.dateOfBirth || '',
        ministry: ministryId,
        department: departmentId,
        arrangements: app.coverup_duty || app.arrangements || '',
        purposeOfTravel: app.purpose_of_travel || app.purposeOfTravel || '',
        awardingAgencyName: app.awarding_agency || app.awardingAgencyName || '',
        foreignLoan: app.loan_particulars || app.foreignLoan || '',
        courseStart: app.commencement_date ? app.commencement_date.split('T')[0] : app.courseStart || '',
        courseEnd: app.completion_date ? app.completion_date.split('T')[0] : app.courseEnd || '',
        departureDate: app.departure_date ? app.departure_date.split('T')[0] : app.departureDate || '',
        returnDate: app.arrival_date ? app.arrival_date.split('T')[0] : app.returnDate || '',
        countries: app.countries_visited || app.countries || '',
        foreignAddress: app.foreign_contact_data || app.foreignAddress || '',
        previousReport:
          app.previous_report_submitted === true ? 'Yes' : app.previous_report_submitted === false ? 'No' : app.previousReport || '',
        awardingAgency: {},
        expenseAmounts: {},
        natureOfTravel: app.nature_of_travel ? app.nature_of_travel.charAt(0).toUpperCase() + app.nature_of_travel.slice(1) : '',
        declarationDate: new Date().toISOString().split('T')[0],
        foreignTravelHistory: foreignTravelHistory,
        declarationChecked: false
      };
      
      setApplication(applicationData);
      setEmployeeId(app.employee_id);
      
      if (app.expense_types && Array.isArray(app.expense_types)) {
        const selectedExpenseIds = app.expense_types.map((et) => et.id);
        const updatedExpensesMet = Array.isArray(expensesMet)
          ? expensesMet.map((expense) => ({
              ...expense,
              is_checked: selectedExpenseIds.includes(expense.expenses_type_id)
            }))
          : [];
        setExpensesMet(updatedExpensesMet);
      }
      
      if (app.gosl_funds && Array.isArray(app.gosl_funds)) {
        const updatedGoslFunds = initialGoslFunds.map((fund) => {
          const existingFund = app.gosl_funds.find((gf) => gf.gosl_fund_type_id === fund.gosl_fund_type_id);
          if (existingFund) {
            return {
              ...fund,
              amount: existingFund.amount,
              is_selected: true
            };
          }
          return fund;
        });
        setGoslFunds(updatedGoslFunds);
      } else {
        setGoslFunds(initialGoslFunds);
      }
      
      // Load existing attachments if editing
      if (app.attachments && Array.isArray(app.attachments) && app.attachments.length > 0) {
        const existingPreviews = app.attachments.map(attachment => ({
          existing: true,
          id: attachment.id,
          name: attachment.file_name || attachment.name,
          path: attachment.file_path || attachment.path,
          preview: `${API_URL}/storage/${attachment.file_path || attachment.path}`
        }));
        setAttachmentPreviews(existingPreviews);
      } else {
        setAttachmentPreviews([]);
      }
    } else {
      setEditingApplication(null);
      setApplication({
        name: '',
        post: '',
        designation_id: '',
        service: '',
        service_id: '',
        dateOfBirth: '',
        nicNumber: '',
        ministry: '',
        department: '',
        arrangements: '',
        purposeOfTravel: '',
        natureOfTravel: 'Official',
        awardingAgencyName: '',
        awardingAgency: {},
        expensesMet: {},
        expenseAmounts: {},
        foreignLoan: '',
        courseStart: '',
        courseEnd: '',
        departureDate: '',
        returnDate: '',
        countries: '',
        foreignAddress: '',
        previousReport: '',
        declarationDate: new Date().toISOString().split('T')[0],
        foreignTravelHistory: [{ year: '', purpose: '', travelling_start_date: '', travelling_end_date: '', country: '' }],
        declarationChecked: false
      });
      setEmployeeId(null);
      setDepartments([]);
      setGoslFunds(initialGoslFunds);
    }
    setShowModal(true);
  };

  const openViewModal = (app) => {
    setViewingApplication(app);
    setShowViewModal(true);
    setStatusRemark('');
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingApplication(null);
    setStatusRemark('');
  };

  const openEmployeeModal = () => {
    setShowSubFormModal(true);
  };

  const closeEmployeeModal = () => {
    setShowSubFormModal(false);
  };

  const resetExpensesMet = () => {
    if (Array.isArray(expenseTypes)) {
      const resetExpenses = expenseTypes.map(type => ({
        expenses_type_id: type.id,
        is_checked: false
      }));
      setExpensesMet(resetExpenses);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingApplication(null);
    setApplication({
      name: '',
      post: '',
      designation_id: '',
      service: '',
      service_id: '',
      dateOfBirth: '',
      nicNumber: '',
      ministry: '',
      department: '',
      arrangements: '',
      purposeOfTravel: '',
      natureOfTravel: 'Official',
      awardingAgencyName: '',
      awardingAgency: {},
      expensesMet: {},
      expenseAmounts: {},
      foreignLoan: '',
      courseStart: '',
      courseEnd: '',
      departureDate: '',
      returnDate: '',
      countries: '',
      foreignAddress: '',
      previousReport: '',
      declarationDate: new Date().toISOString().split('T')[0],
      foreignTravelHistory: [{ year: '', purpose: '', travelling_start_date: '', travelling_end_date: '', country: '' }],
      declarationChecked: false
    });
    resetExpensesMet();
    setErrors({});
    setNicError('');
    setEmployeeId(null);
    setDepartments([]);
    // NEW: Clear employee dropdown state
    setShowEmployeeDropdown(false);
    setEmployeeOptions([]);
    setEmployeeSearchTerm('');
    // NEW: Clear attachments
    setAttachments([]);
    setAttachmentPreviews([]);
    setFilesToDelete([]); // Reset files to delete
  };

  const saveApplication = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    setFileUploading(true);
    
    try {
      let gosl_funds_payload = [];
      if (isGovernmentSLSelected()) {
        gosl_funds_payload = Array.isArray(goslFunds)
          ? goslFunds.map((fund) => ({
              gosl_fund_type_id: fund.gosl_fund_type_id,
              amount: fund.amount,
              is_selected: fund.is_selected
            }))
          : [];
      }
      
      const travelling_histories = [];
      
      if (Array.isArray(application.foreignTravelHistory)) {
        application.foreignTravelHistory.forEach(item => {
          if (item.year && item.purpose && item.travelling_start_date && item.travelling_end_date && item.country) {
            travelling_histories.push({
              year: item.year,
              purpose_of_travel: item.purpose,
              travelling_start_date: item.travelling_start_date,
              travelling_end_date: item.travelling_end_date,
              country: item.country
            });
          }
        });
      }
      
      console.log("Travel histories being sent to backend:", travelling_histories);

      const organization_id = application.department ? application.department : application.ministry;

      let resolved_designation_id = application.designation_id || '';
      let resolved_service_id = application.service_id || '';

      if (!resolved_designation_id && application.post) {
        const found = designations.find(d => d.name && d.name.toLowerCase() === String(application.post).toLowerCase());
        if (found) resolved_designation_id = found.id;
      }
      if (!resolved_service_id && application.service) {
        const foundS = services.find(s => s.name && s.name.toLowerCase() === String(application.service).toLowerCase());
        if (foundS) resolved_service_id = foundS.id;
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('session_id', currentSessionId);
      formData.append('employee_id', employeeId);
      formData.append('organization_id', organization_id);
      formData.append('designation_id', resolved_designation_id || null);
      formData.append('service_id', resolved_service_id || null);
      formData.append('awarding_agency', application.awardingAgencyName);
      formData.append('countries_visited', application.countries);
      formData.append('purpose_of_travel', application.purposeOfTravel);
      formData.append('nature_of_travel', application.natureOfTravel.toLowerCase());
      formData.append('departure_date', application.departureDate);
      formData.append('arrival_date', application.returnDate);
      formData.append('previous_report_submitted', application.previousReport === 'Yes' ? '1' : '0');
      formData.append('application_type', '1');
      formData.append('loan_particulars', application.foreignLoan);
      formData.append('commencement_date', application.courseStart);
      formData.append('completion_date', application.courseEnd);
      formData.append('foreign_contact_data', application.foreignAddress);
      formData.append('coverup_duty', application.arrangements);
      
      // Add expenses_met as individual array items
      if (Array.isArray(expensesMet)) {
        expensesMet.forEach((expense, index) => {
          formData.append(`expenses_met[${index}][expenses_type_id]`, expense.expenses_type_id);
          formData.append(`expenses_met[${index}][is_checked]`, expense.is_checked ? '1' : '0');
        });
      }
      
      // Add gosl_funds as individual array items
      if (Array.isArray(gosl_funds_payload) && gosl_funds_payload.length > 0) {
        gosl_funds_payload.forEach((fund, index) => {
          formData.append(`gosl_funds[${index}][gosl_fund_type_id]`, fund.gosl_fund_type_id);
          formData.append(`gosl_funds[${index}][amount]`, fund.amount);
          formData.append(`gosl_funds[${index}][is_selected]`, fund.is_selected ? '1' : '0');
        });
      }
      
      // Add travelling_histories as individual array items
      if (Array.isArray(travelling_histories) && travelling_histories.length > 0) {
        travelling_histories.forEach((history, index) => {
          formData.append(`travelling_histories[${index}][year]`, history.year);
          formData.append(`travelling_histories[${index}][purpose_of_travel]`, history.purpose);
          formData.append(`travelling_histories[${index}][travelling_start_date]`, history.travelling_start_date);
          formData.append(`travelling_histories[${index}][travelling_end_date]`, history.travelling_end_date);
          formData.append(`travelling_histories[${index}][country]`, history.country);
        });
      }
      
      // Add multiple files if exist
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
      
      // Add files to delete array for update operation
      if (editingApplication && filesToDelete.length > 0) {
        filesToDelete.forEach((fileId, index) => {
          formData.append(`files_to_delete[${index}]`, fileId);
        });
      }

      if (editingApplication) {
        const isResubmission = editingApplication.last_status?.toLowerCase() === 'resubmit required';
        
        await axios.post(
          `${API_URL}/application/${editingApplication.id}?_method=PUT`, 
          formData,
          { headers: getMultiPartHeaders() }
        );
        
        if (isResubmission) {
          await axios.post(
            `${API_URL}/application/${editingApplication.id}/status`,
            { 
              status: 'Resubmit Pending', 
              remark: 'Application resubmitted',
              session_id: currentSessionId
            }
          );
        }
        
        setSuccessMessage(isResubmission ? 'Application resubmitted successfully!' : 'Application updated successfully!');
      } else {
        await axios.post(
          `${API_URL}/application`,
          formData,
          { headers: getMultiPartHeaders() }
        );
        setSuccessMessage('Application created successfully!');
      }
      fetchApplications(currentPage, search, statusParam);
      setTimeout(() => setSuccessMessage(''), 3000);
      closeModal();
    } catch (error) {
      console.error('Save error:', error.response?.data || error.message);
      
      const onlyHasTravelHistoryErrors = error.response?.data?.errors && 
        Object.keys(error.response.data.errors).every(key => key === 'travelling_histories');
      
      if (onlyHasTravelHistoryErrors) {
        console.warn("Ignoring travel history validation errors and trying again without travel history");
        
        try {
          const formDataWithoutTravelHistory = new FormData();
          // Add all form data except travel history
          for (const [key, value] of formData.entries()) {
            if (key !== 'travelling_histories') {
              formDataWithoutTravelHistory.append(key, value);
            }
          }
          formDataWithoutTravelHistory.append('travelling_histories', JSON.stringify([]));
          
          if (editingApplication) {
            await axios.post(
              `${API_URL}/application/${editingApplication.id}?_method=PUT`,
              formDataWithoutTravelHistory,
              { headers: getMultiPartHeaders() }
            );
            setSuccessMessage('Application updated successfully!');
          } else {
            await axios.post(
              `${API_URL}/application`,
              formDataWithoutTravelHistory,
              { headers: getMultiPartHeaders() }
            );
            setSuccessMessage('Application created successfully!');
          }
          
          fetchApplications(currentPage, search, statusParam);
          setTimeout(() => setSuccessMessage(''), 3000);
          closeModal();
          return;
        } catch (secondError) {
          console.error("Second attempt also failed:", secondError);
        }
      }
      
      alert("Failed to save application. Please check the form for errors.");
      
      if (error.response && error.response.data.errors) {
        const backendErrors = error.response.data.errors;
        const formattedErrors = {};
        
        if (backendErrors.arrival_date) {
          formattedErrors.returnDate = backendErrors.arrival_date[0];
        }
        if (backendErrors.completion_date) {
          formattedErrors.courseEnd = backendErrors.completion_date[0];
        }
        if (backendErrors.departure_date) {
          formattedErrors.departureDate = backendErrors.departure_date[0];
        }
        if (backendErrors.commencement_date) {
          formattedErrors.courseStart = backendErrors.commencement_date[0];
        }
        
        setErrors({ ...errors, ...formattedErrors });
      }
    } finally {
      setIsSubmitting(false);
      setFileUploading(false);
    }
  };

  const handleGoslFundCheckboxChange = (index) => {
    if (!Array.isArray(goslFunds)) return;

    setGoslFunds((prev) => prev.map((fund, i) => {
      if (i === index) {
        if (fund.is_selected) {
          return { ...fund, is_selected: false, amount: '' };
        }
        return { ...fund, is_selected: true };
      }
      return fund;
    }));
  };

  const handleGoslFundAmountChange = (index, value) => {
    if (!Array.isArray(goslFunds)) return;

    setGoslFunds((prev) => prev.map((fund, i) => (i === index ? { ...fund, amount: value } : fund)));
  };

  const canChangeStatus = (currentStatus) => {
    const statusOptions = getAvailableStatusOptions(currentStatus);
    
    if (statusOptions.length === 0) return false;
    
    return statusOptions.some(statusOption => {
      if (statusOption === "check") {
        return hasPermission('Application_checking');
      }
      if (statusOption === "recommend" || statusOption === "do not recommend") {
        return hasPermission('Application_recommending_notrecommending');
      }
      if (statusOption === "approve" || statusOption === "reject") {
        return hasPermission('Application_approving_reject');
      }
      // Require resubmit can be used by users who can perform actions at the current stage
      // OR by users with Application_require_resubmit permission (if they also have stage permission)
      if (statusOption === "require resubmit") {
        const status = currentStatus?.toLowerCase();
        // If status is 'checked', require recommend permission
        if (status === 'checked') {
          return hasPermission('Application_recommending_notrecommending');
        }
        // If status is 'recommended', require approve permission
        if (status === 'recommended') {
          return hasPermission('Application_approving_reject');
        }
        // For other statuses, require the specific permission
        return hasPermission('Application_require_resubmit');
      }
      return false;
    });
  };

  const fetchRelatedData = async () => {
    try {
      await Promise.all([
        fetchOrganizations(),
        fetchDesignations(),
        fetchExpenseTypes(),
        fetchGoslFundTypes(),
        fetchServices()
      ]);
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  };

  // Add isSubmitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (!hasPermission('Application_read_all')) {
    return (
      <MainCard cardClass="mt-4">
        <Alert variant="danger" className="text-center py-4">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You don't have permission to view applications.</p>
          <p className="mb-0">Please contact your administrator for access.</p>
        </Alert>
      </MainCard>
    );
  }

  return (
    <MainCard cardClass="mt-0.9">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="mb-0">PO Applications</h4>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Form.Control
            type="text"
            placeholder="Search: Min 3 characters"
            value={search || ''}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchApplications(1, e.target.value, statusParam);
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
        {hasPermission('Application_create') && (
          <Button 
            variant="primary" 
            onClick={() => openModal()}
            style={{ borderRadius: '0.3rem' }}
          >
            <Plus size={16} className="me-1" /> Add Application
          </Button>
        )}
      </div>
      
      {successMessage && (
        <Alert variant="success" className="mt-3 mb-3">
          {successMessage}
        </Alert>
      )}
      
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
                <th className="py-3 text-start" style={{ width: '5%' }}>#</th>
                <th className="py-3" style={{ width: '15%' }}>Name</th>
                <th className="py-3" style={{ width: '12%' }}>NIC Number</th>
                <th className="py-3" style={{ width: '15%' }}>Ministry</th>
                <th className="py-3" style={{ width: '29%' }}>Purpose of Travel</th>
                <th className="py-3" style={{ width: '12%' }}>Status</th>
                <th className="py-3" style={{ width: '15%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <Spinner animation="border" size="sm" /> Loading applications...
                  </td>
                </tr>
              ) : !Array.isArray(applications) || applications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map((app, index) => (
                  <tr 
                    key={app.id || index}
                    style={{ borderBottom: '1px solid #f0f0f0' }}
                  >
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.employee ? `${app.employee.first_name} ${app.employee.last_name}` : 'N/A'}>
                      {app.employee ? `${app.employee.first_name} ${app.employee.last_name}` : 'N/A'}
                    </td>
                    <td className="py-2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.employee?.nic_no || 'N/A'}
                    </td>
                    <td className="py-2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.organization?.name || 'N/A'}>
                      {app.organization?.name || 'N/A'}
                    </td>
                    <td className="py-2" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.purpose_of_travel}>
                      {app.purpose_of_travel}
                    </td>
                    <td className="py-2">
                      <span 
                        className="badge" 
                        style={{ 
                          backgroundColor: getStatusBadge(app.last_status),
                          color: ['not recommended', 'resubmit required'].includes(app.last_status?.toLowerCase()) ? '#000' : '#fff'
                        }}
                      >
                        {app.last_status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="d-flex justify-content-start" style={{ gap: '10px' }}>{hasPermission('Application_update') && canEditApplication(app.last_status) && (
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
                            onClick={() => openModal(app)}
                          >
                            <Pencil size={14} />
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="info"
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
                          onClick={() => openViewModal(app)}
                        >
                          <Eye size={14} /> View
                        </Button>
                        {app.last_status?.toLowerCase() === 'resubmit required' && hasPermission('Application_update') && (
                          <Button
                            variant="primary"
                            size="sm"
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '5px',
                              minWidth: '90px',
                              justifyContent: 'center',
                              borderRadius: '0.3rem'
                            }}
                            onClick={() => openModal(app)}
                          >
                            <Pencil size={14} />
                            Edit
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
        <div className="py-3 px-3 d-flex justify-content-center border-top">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* ===== APPLICATION MODAL WITH NIC SEARCHABLE DROPDOWN ===== */}
      <Modal 
        show={showModal} 
        onHide={closeModal} 
        size="xl" 
        scrollable 
        backdrop="static" 
        keyboard={false}
        backdropClassName="modal-backdrop-blur"
        contentClassName={showSubFormModal ? 'blurred-parent-modal' : undefined}
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingApplication ? "Edit Application" : "New Application"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={saveApplication}>
            {/* Section 1: NIC with SEARCHABLE DROPDOWN */}
            <div className="row mb-3">
              <div className="col-12">
                <h6 className="fw-bold">1.</h6>
              </div>
              <div className="col-md-8 mb-2">
                <Form.Label className="small">1.1 Search by Name or NIC Number</Form.Label>
                <div className="d-flex align-items-center">
                  {/* ===== NEW: Searchable Employee Dropdown Container ===== */}
                  <div className="position-relative flex-grow-1 employee-dropdown-container" style={{ position: 'relative' }}>
                    <Form.Control
                      type="text"
                      name="nicNumber"
                      value={employeeSearchTerm || application.nicNumber || ''}
                      onChange={handleNICChange}
                      placeholder="Enter name or NIC number (min 3 characters)"
                      isInvalid={!!errors.nicNumber}
                      disabled={isSearching}
                      autoComplete="off"
                    />
                    
                    {/* Loading spinner */}
                    {isSearchingEmployee && (
                      <div 
                        style={{ 
                          position: 'absolute',
                          right: '50px',
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                      >
                        <Spinner animation="border" size="sm" />
                      </div>
                    )}
                    
                    {/* Dropdown list */}
                    {showEmployeeDropdown && employeeOptions.length > 0 && (
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
                        {employeeOptions.map((employee) => (
                          <div
                            key={employee.id}
                            style={{ 
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            onClick={() => handleEmployeeSelection(employee)}
                          >
                            <div style={{ fontWeight: 'bold' }}>
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#6c757d' }}>
                              NIC: {employee.nic_no}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Show message when no results */}
                    {showEmployeeDropdown && employeeOptions.length === 0 && employeeSearchTerm.length >= 3 && !isSearchingEmployee && (
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
                        No employees found
                      </div>
                    )}
                  </div>
                  {/* ===== END: Searchable Employee Dropdown Container ===== */}
                  
                  {!editingApplication && (
                    <Button variant="primary" className="ms-2" onClick={openEmployeeModal} type="button">
                      <UserPlus size={14} />
                    </Button>
                  )}
                </div>
                {nicError && <div className="text-danger small mt-1">{nicError}</div>}
                {errors.nicNumber && <div className="text-danger small mt-1">{errors.nicNumber}</div>}
              </div>
            </div>

            {/* Section 2: Personal Details */}
            <div className="row mb-3">
              <div className="col-12">
                <h6 className="fw-bold">2.</h6>
              </div>
              <div className="col-md-4 mb-2">
                <Form.Label className="small">2.1 Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={application.name || ''}
                  onChange={handleInputChange}
                  isInvalid={!!errors.name}
                  autoComplete="off"
                  readOnly={!!employeeId}
                  style={!!employeeId ? {backgroundColor: '#e9ecef'} : {}}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </div>
              <div className="col-md-4 mb-2">
                <Form.Label className="small">2.2 Post</Form.Label>
                <Form.Control 
                  type="text" 
                  name="post" 
                  value={application.post || ''} 
                  onChange={handleInputChange}
                  autoComplete="off"
                  readOnly={!!employeeId}
                  style={!!employeeId ? {backgroundColor: '#e9ecef'} : {}}
                />
              </div>
              <div className="col-md-4 mb-2">
                <Form.Label className="small">2.3 Category</Form.Label>
                <Form.Control 
                  type="text" 
                  name="service" 
                  value={application.service || ''} 
                  onChange={handleInputChange}
                  autoComplete="off"
                  readOnly={!!employeeId}
                  style={!!employeeId ? {backgroundColor: '#e9ecef'} : {}}
                />
              </div>
            </div>

            {/* Section 3: Date of Birth */}
            <div className="row mb-3">
              <div className="col-md-6">
                <h6 className="fw-bold">3. Date Of Birth</h6>
                <Form.Control 
                  type="date" 
                  name="dateOfBirth" 
                  value={application.dateOfBirth || ''} 
                  onChange={handleInputChange}
                  autoComplete="off"
                  readOnly={!!employeeId}
                  style={!!employeeId ? {backgroundColor: '#e9ecef'} : {}}
                />
              </div>
            </div>

            {/* Section 4: Ministry/Department */}
            <div className="row mb-3">
              <div className="col-12">
                <h6 className="fw-bold">4.</h6>
              </div>
              <div className="col-md-6 mb-2">
                <Form.Label className="small">4.1 Ministry/Provincial Council</Form.Label>
                {!!employeeId ? (
                  <Form.Control
                    type="text"
                    value={(() => {
                      const ministryId = application.ministry;
                      const ministry = organizations.find(org => String(org.id) === String(ministryId));
                      return ministry?.name || '';
                    })()}
                    readOnly
                    style={{backgroundColor: '#e9ecef'}}
                  />
                ) : (
                  <Form.Select 
                    value={application.ministry || ''} 
                    onChange={handleMinistryChange} 
                    isInvalid={!!errors.ministry}
                  >
                    <option value="">-- Select Ministry --</option>
                    {Array.isArray(organizations) &&
                      organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                  </Form.Select>
                )}
                <Form.Control.Feedback type="invalid">{errors.ministry}</Form.Control.Feedback>
              </div>
              <div className="col-md-6 mb-2">
                <Form.Label className="small">4.2 Department/Institution</Form.Label>
                {!!employeeId ? (
                  <Form.Control
                    type="text"
                    value={(() => {
                      if (!application.department || departments.length === 0) {
                        return 'N/A';
                      }
                      const departmentId = application.department;
                      const department = departments.find(dep => String(dep.id) === String(departmentId));
                      return department?.name || 'N/A';
                    })()}
                    readOnly
                    style={{backgroundColor: '#e9ecef'}}
                  />
                ) : (
                  <>
                    <Form.Select
                      value={application.department || ''}
                      onChange={handleDepartmentChange}
                      disabled={!application.ministry || !Array.isArray(departments) || departments.length === 0}
                    >
                      <option value="">-- Select Department --</option>
                      {Array.isArray(departments) &&
                        departments.map((dep) => (
                          <option key={dep.id} value={dep.id}>
                            {dep.name}
                          </option>
                        ))}
                    </Form.Select>
                    {!application.ministry && <Form.Text className="text-muted">Please select a ministry first</Form.Text>}
                    {application.ministry && (!Array.isArray(departments) || departments.length === 0) && (
                      <Form.Text className="text-muted">No departments available for selected ministry</Form.Text>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Section 5: Arrangements - FIXED: Added validation */}
            <div className="row mb-3">
              <div className="col-12">
                <h6 className="fw-bold">5. Arrangements made to cover up duties/Acting arrangements</h6>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="arrangements"
                  value={application.arrangements || ''}
                  onChange={handleInputChange}
                  isInvalid={!!errors.arrangements}
                />
                <Form.Control.Feedback type="invalid">{errors.arrangements}</Form.Control.Feedback>
              </div>
            </div>

            {/* Section 6: Travel Details */}
            <div className="row mb-3">
              <div className="col-12">
                <h6 className="fw-bold">6.</h6>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label className="small">6.1 Purpose of travel/Field of training:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="purposeOfTravel"
                  value={application.purposeOfTravel || ''}
                  onChange={handleInputChange}
                  isInvalid={!!errors.purposeOfTravel}
                />
                <Form.Control.Feedback type="invalid">{errors.purposeOfTravel}</Form.Control.Feedback>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label className="small">6.2 Nature of travel:</Form.Label>
                <div className="d-flex gap-3 mt-2">
                  <Form.Check
                    type="radio"
                    label="Official"
                    name="natureOfTravel"
                    value="Official"
                    checked={application.natureOfTravel === 'Official'}
                    onChange={handleInputChange}
                  />
                  <Form.Check
                    type="radio"
                    label="Private"
                    name="natureOfTravel"
                    value="Private"
                    checked={application.natureOfTravel === 'Private'}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Continue with other sections... */}
            <div className="row mb-3">
              <div className="col-12">
                <Form.Label className="small">6.3 In the case of training the awarding Agency</Form.Label>
                <Form.Control
                  type="text"
                  name="awardingAgencyName"
                  value={application.awardingAgencyName || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Section 6.4: Expenses - FIXED: Added validation */}
            <div className="row mb-3">
              <div className="col-12">
                <Form.Label className="small">6.4 How expenses are mainly to be met (Mark in cage)</Form.Label>
                {errors.expensesMet && (
                  <div className="text-danger small mb-2">{errors.expensesMet}</div>
                )}
                <div className="table-responsive">
                  <Table bordered size="sm">
                    <thead className="table-light">
                      <tr className="small">
                        {Array.isArray(expenseTypes) && expenseTypes.map((expenseType) => <th key={expenseType.id}>{expenseType.name}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {Array.isArray(expensesMet) &&
                          expensesMet.map((expenseMet, index) => (
                            <td className="text-center" key={expenseMet.expenses_type_id}>
                              <Form.Check
                                type="checkbox"
                                checked={expenseMet.is_checked}
                                onChange={(e) => updateExpensesMet(e.target.checked, index, 'is_checked')}
                              />
                            </td>
                          ))}
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Section 6.5: GOSL Funds */}
            {isGovernmentSLSelected() && (
              <div className="row mb-3">
                <div className="col-12">
                  <Form.Label className="small">6.5 If met from GOSL funds, nature and amount</Form.Label>
                  <div className="table-responsive">
                    <Table bordered size="sm">
                      <thead className="table-light">
                        <tr className="small">
                          {Array.isArray(goslFundTypes) && goslFundTypes.map((fundType) => <th key={fundType.id}>{fundType.name}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {Array.isArray(goslFunds) &&
                            goslFunds.map((fund, index) => (
                              <td className="text-center" key={fund.gosl_fund_type_id}>
                                <Form.Check
                                  type="checkbox"
                                  checked={fund.is_selected}
                                  onChange={() => handleGoslFundCheckboxChange(index)}
                                />
                              </td>
                            ))}
                        </tr>
                        <tr>
                          {Array.isArray(goslFunds) &&
                            goslFunds.map((fund, index) => (
                              <td key={fund.gosl_fund_type_id}>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  placeholder="Amount"
                                  value={fund.amount}
                                  onChange={(e) => handleGoslFundAmountChange(index, e.target.value)}
                                  disabled={!fund.is_selected}
                                />
                              </td>
                            ))}
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            {/* Section 6.6: Foreign Loan */}
            <div className="row mb-3">
              <div className="col-12">
                <Form.Label className="small">6.6 In case of a Foreign loan/Project/particulars thereof</Form.Label>
                <Form.Control type="text" name="foreignLoan" value={application.foreignLoan || ''} onChange={handleInputChange} />
              </div>
            </div>

            {/* Section 6.7-6.8: Course Dates - FIXED: Added validation */}
            <div className="row mb-3">
              <div className="col-md-6">
                <Form.Label className="small">6.7 Date of commencement of course/training</Form.Label>
                <Form.Control
                  type="date"
                  name="courseStart"
                  value={application.courseStart || ''}
                  onChange={handleInputChange}
                  isInvalid={!!errors.courseStart}
                />
                <Form.Control.Feedback type="invalid">{errors.courseStart}</Form.Control.Feedback>
              </div>
              <div className="col-md-6">
                <Form.Label className="small">6.8 Date of completion</Form.Label>
                <Form.Control
                  type="date"
                  name="courseEnd"
                  value={application.courseEnd || ''}
                  onChange={handleInputChange}
                  isInvalid={!!errors.courseEnd}
                />
                <Form.Control.Feedback type="invalid">{errors.courseEnd}</Form.Control.Feedback>
              </div>
            </div>

            {/* Section 6.9: Travel Dates - FIXED: Added validation */}
            <div className="row mb-3">
              <div className="col-md-6">
                <Form.Label className="small">6.9 Date of departure</Form.Label>
                <Form.Control
                  type="date"
                  className="mb-2"
                  name="departureDate"
                  value={application.departureDate || ''}
                  onChange={handleInputChange}
                  placeholder="Departure Date"
                  isInvalid={!!errors.departureDate}
                  min={new Date().toISOString().split('T')[0]} // Keep this to prevent selecting past dates
                />
                <Form.Control.Feedback type="invalid">{errors.departureDate}</Form.Control.Feedback>
                <Form.Text className="text-muted mb-2">
                  Departure of arrival.
                </Form.Text>
                <Form.Control
                  type="date"
                  name="returnDate"
                  value={application.returnDate || ''}
                  onChange={handleInputChange}
                  placeholder="Return Date"
                  isInvalid={!!errors.returnDate}
                  min={application.departureDate || new Date().toISOString().split('T')[0]}
                />
                <Form.Control.Feedback type="invalid">{errors.returnDate}</Form.Control.Feedback>
              </div>
            </div>

            {/* Section 6.10: Countries - FIXED: Added validation */}
            <div className="row mb-3">
              <div className="col-12">
                <Form.Label className="small">6.10 Countries to be visited</Form.Label>
                <Form.Control 
                  type="text" 
                  name="countries" 
                  value={application.countries || ''} 
                  onChange={handleInputChange}
                  isInvalid={!!errors.countries}
                />
                <Form.Control.Feedback type="invalid">{errors.countries}</Form.Control.Feedback>
              </div>
            </div>

            {/* Section 6.11: Foreign Address - FIXED: Added validation */}
            <div className="row mb-3">
              <div className="col-12">
                <Form.Label className="small">6.11 Foreign address, Telephone, Fax, E-mail, indicating numbers:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="foreignAddress"
                  value={application.foreignAddress || ''}
                  onChange={handleInputChange}
                  isInvalid={!!errors.foreignAddress}
                />
                <Form.Control.Feedback type="invalid">{errors.foreignAddress}</Form.Control.Feedback>
              </div>
            </div>

            {/* Section 6.12: Previous Report - FIXED: Added validation */}
            <div className="row mb-4">
              <div className="col-12">
                <Form.Label className="small">6.12 Has the report on the previous official trip been submitted</Form.Label>
                <div className="d-flex gap-3 mt-2">
                  <Form.Check
                    type="radio"
                    label="Yes"
                    name="previousReport"
                    value="Yes"
                    checked={application.previousReport === 'Yes'}
                    onChange={handleInputChange}
                    isInvalid={!!errors.previousReport}
                  />
                  <Form.Check
                    type="radio"
                    label="No"
                    name="previousReport"
                    value="No"
                    checked={application.previousReport === 'No'}
                    onChange={(e) => {
                      // Prevent selecting "No" if travel history exists
                      const hasTravelHistory = application.foreignTravelHistory && application.foreignTravelHistory.length > 0 && 
                        application.foreignTravelHistory.some(h => h.year || h.purpose || h.travelling_start_date || h.travelling_end_date || h.country);
                      
                      if (!hasTravelHistory) {
                        handleInputChange(e);
                      }
                    }}
                    isInvalid={!!errors.previousReport}
                  />
                </div>
                <Form.Control.Feedback type="invalid">{errors.previousReport}</Form.Control.Feedback>
              </div>
            </div>

            {/* Section 7: Foreign Travel Particulars - Only show if previous report was submitted (Yes) */}
            {application.previousReport === 'Yes' && (
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="fw-bold">
                    7. Particulars of foreign travel of applicant during the current year and the preceding three years
                  </h6>
                  
                  <div className="table-responsive">
                    <Table bordered size="sm">
                      <thead className="table-light">
                        <tr className="small text-center">
                          <th className="align-middle">Year</th>
                          <th className="align-middle">Purpose of travel</th>
                          <th className="align-middle">Travelling Start Date</th>
                          <th className="align-middle">Travelling End Date</th>
                          <th className="align-middle">Country</th>
                          <th className="align-middle">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                      {Array.isArray(application.foreignTravelHistory) &&
                        application.foreignTravelHistory.map((travel, index) => (
                          <tr key={index} style={travel.isAutoFilled ? { backgroundColor: '#f8f9fa' } : {}}>
                            <td>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={travel.year}
                                onChange={(e) => handleHistoryChange(index, 'year', e.target.value)}
                                placeholder="Year"
                                readOnly={travel.isAutoFilled}
                                style={travel.isAutoFilled ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={travel.purpose}
                                onChange={(e) => handleHistoryChange(index, 'purpose', e.target.value)}
                                placeholder="Purpose"
                                readOnly={travel.isAutoFilled}
                                style={travel.isAutoFilled ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="date"
                                size="sm"
                                value={travel.travelling_start_date}
                                onChange={(e) => handleHistoryChange(index, 'travelling_start_date', e.target.value)}
                                placeholder="Start Date"
                                readOnly={travel.isAutoFilled}
                                style={travel.isAutoFilled ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="date"
                                size="sm"
                                value={travel.travelling_end_date}
                                onChange={(e) => handleHistoryChange(index, 'travelling_end_date', e.target.value)}
                                placeholder="End Date"
                                readOnly={travel.isAutoFilled}
                                style={travel.isAutoFilled ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={travel.country}
                                onChange={(e) => handleHistoryChange(index, 'country', e.target.value)}
                                placeholder="Country"
                                readOnly={travel.isAutoFilled}
                                style={travel.isAutoFilled ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                              />
                            </td>
                            <td className="text-center">
                              <div className="btn-group" role="group">
                                {!travel.isAutoFilled && index === application.foreignTravelHistory.length - 1 && (
                                  <Button variant="primary" size="sm" onClick={addTravelRow} title="Add Row" style={{ borderRadius: '0.3rem' }}>
                                    <Plus size={14} />
                                  </Button>
                                )}
                                {!travel.isAutoFilled && application.foreignTravelHistory.length > 1 && (
                                  <Button variant="danger" size="sm" onClick={() => removeTravelRow(index)} title="Remove Row" style={{ borderRadius: '0.3rem' }}>
                                    <Trash2 size={14} />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
            )}

            {/* Section 8: Attachments */}
            <div className="row mb-3">
              <div className="col-12">
                <h6 className="fw-bold">8. Attachments</h6>
                <div
                  className={`border rounded p-4 text-center ${isDragging ? 'border-primary bg-light' : 'border-secondary'}`}
                  style={{
                    borderStyle: 'dashed',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '120px'
                  }}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    multiple
                    style={{ display: 'none' }}
                  />
                  
                  {attachmentPreviews.length > 0 ? (
                    <div className="text-start">
                      <div className="mb-2 fw-bold">Selected Files:</div>
                      {attachmentPreviews.map((preview, index) => (
                        <div key={index} className="d-flex align-items-center justify-content-between mb-2 p-2 bg-light rounded">
                          <div className="d-flex align-items-center">
                            <Paperclip size={16} className="me-2 text-primary" />
                            <div>
                              <div className="fw-bold">{preview.name || preview.file.name}</div>
                              <div className="text-muted small">
                                {preview.file ? `${(preview.file.size / 1024 / 1024).toFixed(2)} MB` : 'Existing file'}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            {preview.existing && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadAttachment(preview.id, preview.name);
                                }}
                                style={{ borderRadius: '0.3rem' }}
                              >
                                <Download size={14} />
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(index);
                              }}
                              style={{ borderRadius: '0.3rem' }}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="text-center mt-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          style={{ borderRadius: '0.3rem' }}
                        >
                          <Plus size={14} className="me-1" /> Add More Files
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column align-items-center">
                      <Upload size={32} className="mb-2 text-muted" />
                      <div className="fw-bold">
                        {isDragging ? 'Drop files here' : 'Drag & drop files here or click to browse'}
                      </div>
                      <div className="text-muted small">
                        Allowed file types: PDF, Word, Excel, and images (Max size: 5MB each)
                      </div>
                    </div>
                  )}
                </div>
                {errors.attachments && <div className="text-danger small mt-1">{errors.attachments}</div>}
              </div>
            </div>

            {/* Section 9: Declaration */}
            <div className="row mb-4">
              <div className="col-12">
                <h6 className="fw-bold">9. Declaration by applicant</h6>
                <Form.Check
                  type="checkbox"
                  id="declarationCheckbox"
                  label="I certify that the particulars furnished in this application are true."
                  checked={application.declarationChecked}
                  onChange={handleDeclarationChange}
                  isInvalid={!!errors.declarationChecked}
                />
                <Form.Control.Feedback type="invalid">{errors.declarationChecked}</Form.Control.Feedback>
              </div>
            </div>

            <Button variant="primary" type="submit" className="me-2" style={{ borderRadius: '0.3rem' }} disabled={isSubmitting || fileUploading}>
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="visually-hidden">Loading...</span>
                </>
              ) : editingApplication ? (
                <>
                  <Save size={16} className="me-1" /> Update Application
                </>
              ) : (
                <>
                  <Send size={16} className="me-1" /> Submit Application
                </>
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* SubFormModal for Employee Creation */}
      <SubFormModal
        show={showSubFormModal}
        onHide={() => setShowSubFormModal(false)}
        type="employee"
        onSave={async (response) => {
          try {
            // Fetch updated data
            await fetchRelatedData();
            
            // Handle the response
            const newEmployee = response?.id ? response : response?.data;
            
            if (newEmployee?.id) {
              // Update the application form with the new employee details
              const serviceName = newEmployee.service?.name || newEmployee.service_name || '';
              const designationName = newEmployee.designation?.name || newEmployee.designation_name || '';
              
              setApplication((prev) => ({
                ...prev,
                name: `${newEmployee.first_name || ''} ${newEmployee.last_name || ''}`.trim(),
                post: designationName,
                service: serviceName,
                dateOfBirth: newEmployee.birthday || newEmployee.date_of_birth || '',
                ministry: newEmployee.organization_id || '',
                nicNumber: newEmployee.nic_no || ''
              }));
              
              // Store the employee ID
              setEmployeeId(newEmployee.id);
              
              // Load departments for the organization
              if (newEmployee.organization_id) {
                loadDepartmentsForMinistry(newEmployee.organization_id);
              }
              
              setShowSubFormModal(false);
              setSuccessMessage('Employee created successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
            }
          } catch (error) {
            console.error('Error handling employee creation:', error);
          }
        }}
      />

      {/* View Application Modal */}
      <Modal show={showViewModal} onHide={closeViewModal} size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingApplication && (
            <div>
              <h5 className="mb-3">Application Information</h5>

              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Name:</strong>
                </Col>
                <Col sm={8}>
                  {viewingApplication.employee
                    ? `${viewingApplication.employee.first_name} ${viewingApplication.employee.last_name}`
                    : 'N/A'}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}>
                  <strong>NIC Number:</strong>
                </Col>
                <Col sm={8}>{viewingApplication.employee?.nic_no || 'N/A'}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Ministry:</strong>
                </Col>
                <Col sm={8}>
                  {(() => {
                    // If organization has a parent, show the parent as ministry
                    if (viewingApplication.organization?.parent_id) {
                      const parentOrg = organizations.find(o => o.id === viewingApplication.organization.parent_id);
                      return parentOrg?.name || 'N/A';
                    }
                    // If no parent, check if organization itself is a ministry (no parent_id in organizations list)
                    const isMinistry = organizations.some(o => o.id === viewingApplication.organization_id && !o.parent_id);
                    if (isMinistry) {
                      return viewingApplication.organization?.name || 'N/A';
                    }
                    // Otherwise, try to find the parent from the loaded organizations
                    const org = organizations.find(o => o.id === viewingApplication.organization_id);
                    if (org?.parent_id) {
                      const parentOrg = organizations.find(o => o.id === org.parent_id);
                      return parentOrg?.name || 'N/A';
                    }
                    return 'N/A';
                  })()}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Department:</strong>
                </Col>
                <Col sm={8}>
                  {(() => {
                    // If organization has a parent, it's a department
                    if (viewingApplication.organization?.parent_id) {
                      return viewingApplication.organization?.name || 'N/A';
                    }
                    // Check if the organization is a department by looking if it has a parent in the organizations list
                    const org = organizations.find(o => o.id === viewingApplication.organization_id);
                    if (org?.parent_id) {
                      return org.name || 'N/A';
                    }
                    // If no parent found, it's a ministry, so no department
                    return 'N/A';
                  })()}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Purpose of Travel:</strong>
                </Col>
                <Col sm={8}>{viewingApplication.purpose_of_travel || 'N/A'}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Countries to Visit:</strong>
                </Col>
                <Col sm={8}>{viewingApplication.countries_visited || 'N/A'}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Departure Date:</strong>
                </Col>
                <Col sm={8}>
                  {viewingApplication.departure_date ? new Date(viewingApplication.departure_date).toLocaleDateString() : 'N/A'}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Return Date:</strong>
                </Col>
                <Col sm={8}>{viewingApplication.arrival_date ? new Date(viewingApplication.arrival_date).toLocaleDateString() : 'N/A'}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Awarding Agency:</strong>
                </Col>
                <Col sm={8}>{viewingApplication.awarding_agency || 'N/A'}</Col>
              </Row>

              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Coverup Duty:</strong>
                </Col>
                <Col sm={8}>{viewingApplication.coverup_duty || 'N/A'}</Col>
              </Row>

              {/* Display attachments if exist */}
              {viewingApplication.attachments && viewingApplication.attachments.length > 0 && (
                <Row className="mb-2">
                  <Col sm={4}>
                    <strong>Attachments:</strong>
                  </Col>
                  <Col sm={8}>
                    {viewingApplication.attachments.map((attachment, index) => (
                      <div key={index} className="mb-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => handleDownloadAttachment(attachment.id, attachment.file_name)}
                          style={{ borderRadius: '0.3rem' }}
                        >
                          <Download size={14} className="me-1" />
                          {attachment.file_name || `Attachment ${index + 1}`}
                        </Button>
                      </div>
                    ))}
                  </Col>
                </Row>
              )}

              <Row className="mb-2">
                <Col sm={4}>
                  <strong>Status:</strong>
                </Col>
                <Col sm={8}>
                  <span 
                    className="badge" 
                    style={{ 
                      backgroundColor: getStatusBadge(viewingApplication.last_status),
                      color: ['not recommended', 'resubmit required'].includes(viewingApplication.last_status?.toLowerCase()) ? '#000' : '#fff'
                    }}
                  >
                    {viewingApplication.last_status || 'Pending'}
                  </span>
                  {viewingApplication.last_status_updated_by && (
                    <span className="ms-2 text-muted" style={{ fontSize: '0.9em' }}>
                      by {viewingApplication.last_status_updated_by}
                    </span>
                  )}
                </Col>
              </Row>

              {/* Display remark/reason for not recommended, rejected, or resubmit required statuses */}
              {(viewingApplication.last_status?.toLowerCase() === 'not recommended' || 
                viewingApplication.last_status?.toLowerCase() === 'rejected' ||
                viewingApplication.last_status?.toLowerCase() === 'resubmit required') && 
               viewingApplication.last_status_remark && (
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Reason:</strong>
                  </Col>
                  <Col sm={8}>
                    <div className="alert alert-secondary mb-0" style={{ padding: '0.75rem' }}>
                      {viewingApplication.last_status_remark}
                    </div>
                  </Col>
                </Row>
              )}
              
              {/* Status change options - only show if user has permission */}
              {canChangeStatus(viewingApplication.last_status) && (
                <>
                  <Row className="mb-3">
                    <Col sm={4}><strong>Change Status To:</strong></Col>
                    <Col sm={8}>
                      {/* Reason/Remark field */}
                      <div className="mb-3">
                        <h6 className="fw-bold mb-2">
                          Reason/Remark for Status Change
                        </h6>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Please provide a remark for this status change..."
                          value={statusRemark}
                          onChange={(e) => setStatusRemark(e.target.value)}
                          style={{ borderRadius: '0.3rem' }}
                        />
                      </div>

                      {/* Status Change Buttons */}
                      <div className="d-flex gap-2">
                        {getAvailableStatusOptions(viewingApplication.last_status)
                          .filter((statusOption) => {
                            if (statusOption === 'check') {
                              return hasPermission('Application_checking');
                            }
                            if (statusOption === 'recommend' || statusOption === 'do not recommend') {
                              return hasPermission('Application_recommending_notrecommending');
                            }
                            if (statusOption === 'approve' || statusOption === 'reject') {
                              return hasPermission('Application_approving_reject');
                            }
                            // Require resubmit can be used by users who can perform actions at the current stage
                            // OR by users with Application_require_resubmit permission (if they also have stage permission)
                            if (statusOption === 'require resubmit') {
                              const currentStatus = viewingApplication.last_status?.toLowerCase();
                              // If status is 'checked', require recommend permission
                              if (currentStatus === 'checked') {
                                return hasPermission('Application_recommending_notrecommending');
                              }
                              // If status is 'recommended', require approve permission
                              if (currentStatus === 'recommended') {
                                return hasPermission('Application_approving_reject');
                              }
                              // For other statuses, require the specific permission
                              return hasPermission('Application_require_resubmit');
                            }
                            return false;
                          })
                          .map((statusOption) => {
                            // Map status to color - matching pie chart colors
                            const getButtonColor = (status) => {
                              const colorMap = {
                                'check': '#17a2b8',
                                'recommend': '#007bff',
                                'do not recommend': '#ffc107',
                                'approve': '#28a745',
                                'reject': '#dc3545',
                                'require resubmit': '#fd7e14'
                              };
                              return colorMap[status] || '#007bff';
                            };

                            // Map status to icon
                            const getStatusIcon = (status) => {
                              const iconMap = {
                                'check': <CheckCircle size={16} className="me-1" />,
                                'recommend': <ThumbsUp size={16} className="me-1" />,
                                'do not recommend': <ThumbsDown size={16} className="me-1" />,
                                'approve': <CheckCheck size={16} className="me-1" />,
                                'reject': <XCircle size={16} className="me-1" />,
                                'require resubmit': <RotateCcw size={16} className="me-1" />
                              };
                              return iconMap[status] || null;
                            };

                            const buttonColor = getButtonColor(statusOption);
                            const icon = getStatusIcon(statusOption);
                            const textColor = ['do not recommend', 'require resubmit'].includes(statusOption) ? '#000' : '#fff';

                            return (
                              <Button
                                key={statusOption}
                                size="sm"
                                style={{ 
                                  borderRadius: '0.3rem',
                                  backgroundColor: buttonColor,
                                  borderColor: buttonColor,
                                  color: textColor
                                }}
                                onClick={() => handleStatusChange(viewingApplication.id, statusOption)}
                              >
                                {icon}
                                {statusOption.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </Button>
                            );
                          })}
                      </div>
                    </Col>
                  </Row>
                </>
              )}

              <hr />

              <h5 className="mb-3">Expense Details</h5>
              {viewingApplication.expense_types &&
              Array.isArray(viewingApplication.expense_types) &&
              viewingApplication.expense_types.length > 0 ? (
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th>Expense Type</th>
                      <th>Covered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingApplication.expense_types.map((expense, index) => (
                      <tr key={index}>
                        <td>{expense.name}</td>
                        <td>{expense.pivot && expense.pivot.is_checked ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No expense information available.</p>
              )}

              <h5 className="mb-3 mt-4">Travel History</h5>
              {viewingApplication.travelling_histories &&
              Array.isArray(viewingApplication.travelling_histories) &&
              viewingApplication.travelling_histories.length > 0 ? (
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Purpose</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingApplication.travelling_histories.map((history, index) => (
                      <tr key={index}>
                        <td>{history.year || 'N/A'}</td>
                        <td>{history.purpose_of_travel || 'N/A'}</td>
                        <td>{history.travelling_start_date ? new Date(history.travelling_start_date).toLocaleDateString() : 'N/A'}</td>
                        <td>{history.travelling_end_date ? new Date(history.travelling_end_date).toLocaleDateString() : 'N/A'}</td>
                        <td>{history.country || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No travel history available.</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* Download PDF button - only shown to users with Application_print permission */}
          {hasPermission('Application_print') && (
            <Button 
              variant="primary" 
              className="me-2"
              style={{ borderRadius: '0.3rem' }}
              onClick={() => handleDownloadPDF(viewingApplication?.id)} 
              disabled={isDownloading}
            >
              {isDownloading ? 'Downloading...' : 'Download PDF'}{' '}
              <Download size={16} style={{ marginLeft: '10px', transform: 'translateY(-3px)' }} />
            </Button>
          )}
          <Button variant="secondary" onClick={closeViewModal} style={{ borderRadius: '0.3rem' }}>
            <X size={16} className="me-1" /> Close
          </Button>
        </Modal.Footer>
      </Modal>
    </MainCard>
  );
}