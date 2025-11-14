import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import MainCard from 'components/Card/MainCard';
import { Table, Button, Form, Modal, Alert, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { Download, Plus, Save, Pencil, Eye, X, Loader2, User, Lock, CheckCircle, ThumbsUp, ThumbsDown, RotateCcw, CheckCheck, XCircle, Paperclip, Upload } from 'lucide-react';
import Pagination from './Pagination';
const API_URL = import.meta.env.VITE_API_URL;

export default function ParliamentApplications() {
  // Get status from URL parameters
  const { statusId } = useParams();
  const [searchParams] = useSearchParams();
  const statusParam = statusId || searchParams.get('status');

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingApplication, setViewingApplication] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [application, setApplication] = useState({
    countries_visited: '',
    nature_of_travel: '',
    purpose_of_travel: '',
    departure_date: '',
    arrival_date: '',
    attachments: [] // Changed to array
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [parliamentMembers, setParliamentMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Parliament Member dropdown states
  const [pmSearchTerm, setPmSearchTerm] = useState('');
  const [pmDropdownOpen, setPmDropdownOpen] = useState(false);
  const [pmLoading, setPmLoading] = useState(false);
  const [filteredParliamentMembers, setFilteredParliamentMembers] = useState([]);
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusRemark, setStatusRemark] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [filesToDelete, setFilesToDelete] = useState([]); // Track files to delete

  // --- API CALLS ---
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
  }, []);

  const getMultiPartHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data'
    };
  }, []);

  const hasPermission = useCallback(
    (permissionName) => {
      return userPermissions.includes(permissionName);
    },
    [userPermissions]
  );

  const fetchUserPermissions = useCallback(() => {
    try {
      const permissionsString = localStorage.getItem('permissions');
      console.log('Permissions from localStorage:', permissionsString);

      if (permissionsString) {
        try {
          const permissions = JSON.parse(permissionsString);
          if (Array.isArray(permissions)) {
            setUserPermissions(permissions);
            console.log('Set user permissions:', permissions);
          } else {
            console.warn('Permissions from localStorage is not an array:', permissions);
            setUserPermissions([]);
          }
        } catch (e) {
          console.error('Error parsing permissions from localStorage:', e);
          setUserPermissions([]);
        }
      } else {
        console.warn('No permissions found in localStorage');
        setUserPermissions([]);
      }
    } catch (error) {
      console.error('Error fetching permissions from localStorage:', error);
      setUserPermissions([]);
    } finally {
      setPermissionsLoaded(true);
      console.log('Permissions loading completed');
    }
  }, []);

  const fetchParliamentMembers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/parliament-members`);
      setParliamentMembers(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (error) {
      console.error('Error fetching parliament members:', error);
    }
  }, []);

  // Fetch parliament members for search dropdown
  const fetchParliamentMembersForSearch = useCallback(
    async (search = '') => {
      if (search && search.length < 3) {
        setFilteredParliamentMembers(parliamentMembers);
        return;
      }

      try {
        setPmLoading(true);
        const params = new URLSearchParams();
        if (search) {
          params.append('search', search);
        }

        const url = `${API_URL}/parliament-members${params.toString() ? '?' + params.toString() : ''}`;
        const res = await axios.get(url, { headers: getAuthHeaders() });

        if (res.data && res.data.data) {
          setFilteredParliamentMembers(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching parliament members for search:', error);
      } finally {
        setPmLoading(false);
      }
    },
    [getAuthHeaders, parliamentMembers]
  );

  // Fetch applications with pagination and search
  const fetchApplications = useCallback(
    async (page = 1, search = null, status = null) => {
      if (!hasPermission('Application_read_all')) return;

      if (search && search.length < 3) {
        //minimum 3 characters should be there
        return;
      }
      var searchTxt = search ? search : '';

      try {
        setLoading(true);
        const res = await axios.get(
          `${API_URL}/parliament-applications?page=${page}&per_page=${pageSize}${searchTxt ? `&search=${searchTxt}` : ''}${status ? `&status=${encodeURIComponent(status)}` : ''}`
        );

        // Handle both array response (old) and paginated response (new)
        if (Array.isArray(res.data)) {
          setApplications(res.data || []);
          setTotalPages(1);
          setCurrentPage(1);
          setTotalItems(res.data.length);
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
    },
    [hasPermission]
  );

  // Get current session ID from localStorage
  const getCurrentSessionId = useCallback(() => {
    try {
      const sessionId = localStorage.getItem('login_session_id');
      setCurrentSessionId(sessionId);
      return sessionId;
    } catch (error) {
      console.error('Error getting session ID from local storage:', error);
      return null;
    }
  }, []);

  // Initialize component data
  useEffect(() => {
    fetchParliamentMembers();
    fetchUserPermissions();
    getCurrentSessionId();
  }, [fetchParliamentMembers, fetchUserPermissions, getCurrentSessionId]);

  // Update useEffect to fetch applications when page or search changes
  useEffect(() => {
    if (permissionsLoaded) {
      if (hasPermission('Application_read_all')) {
        fetchApplications(currentPage, search, statusParam);
      }
    }
  }, [permissionsLoaded, currentPage, search, statusParam, fetchApplications, hasPermission]);

  // --- HELPERS ---
  const formatDate = useCallback((value) => {
    if (!value) return '';
    try {
      const onlyDate = String(value).split('T')[0];
      const [y, m, d] = onlyDate.includes('-') ? onlyDate.split('-') : [];
      if (y && m && d) return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      const date = new Date(value);
      return isNaN(date)
        ? String(value)
        : `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    } catch (_) {
      return String(value);
    }
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setApplication((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }

      // If departure date changes and arrival date exists, validate arrival date
      if (name === 'departure_date' && application.arrival_date) {
        if (new Date(value) >= new Date(application.arrival_date)) {
          setErrors((prev) => ({
            ...prev,
            arrival_date: 'Arrival date must be after departure date'
          }));
        } else {
          setErrors((prev) => ({ ...prev, arrival_date: '' }));
        }
      }
    },
    [errors, application.arrival_date]
  );

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }, []);

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

    files.forEach((file) => {
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
      setApplication((prev) => ({ 
        ...prev, 
        attachments: [...prev.attachments, ...validFiles] 
      }));
      
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

  const handleRemoveFile = useCallback((index) => {
    setApplication((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
    
    setAttachmentPreviews(prev => {
      const removedPreview = prev[index];
      
      // If it's an existing file, add to delete list
      if (removedPreview && removedPreview.existing && removedPreview.id) {
        setFilesToDelete(deleteList => [...deleteList, removedPreview.id]);
      }
      
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke object URLs to prevent memory leaks
      prev.filter((_, i) => i === index).forEach(preview => {
        if (preview.preview && !preview.existing) {
          URL.revokeObjectURL(preview.preview);
        }
      });
      return newPreviews;
    });
    
    // Reset file input if all files are removed
    if (application.attachments.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [application.attachments.length]);

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
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  }, [processFiles]);

  const handleMemberChange = useCallback((member) => {
    setSelectedMemberId(member.id);
    const fullName = member.title ? `${member.title} ${member.name}` : member.name;
    setSelectedMemberName(fullName);
    setPmSearchTerm(fullName);
    setPmDropdownOpen(false);
    setErrors((prev) => ({ ...prev, parliament_member_id: '' }));
  }, []);

  const handlePmSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setPmSearchTerm(value);
      fetchParliamentMembersForSearch(value);
      setPmDropdownOpen(true);
    },
    [fetchParliamentMembersForSearch]
  );

  const handlePmInputFocus = useCallback(() => {
    setPmDropdownOpen(true);
    if (!pmSearchTerm) {
      setFilteredParliamentMembers(parliamentMembers);
    }
  }, [pmSearchTerm, parliamentMembers]);

  const handlePmInputBlur = useCallback(() => {
    // Delay closing to allow click on dropdown items
    setTimeout(() => setPmDropdownOpen(false), 200);
  }, []);

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearch(value);
      setCurrentPage(1); // Reset to first page when searching
      fetchApplications(1, value);
    },
    [fetchApplications]
  );

  // Get today's date in YYYY-MM-DD format for date input min attribute
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get min date for arrival date (departure date + 1 day)
  const getMinArrivalDate = () => {
    if (!application.departure_date) return getTodayDate();
    const departure = new Date(application.departure_date);
    departure.setDate(departure.getDate() + 1);
    return departure.toISOString().split('T')[0];
  };

  // --- MODALS ---
  const openModal = useCallback((app = null) => {
    setErrors({});
    setSubmitError('');
    setAttachmentPreviews([]);
    setFilesToDelete([]); // Reset files to delete
    if (app) {
      setEditingApplication(app);
      setApplication({
        countries_visited: app.countries_visited || '',
        nature_of_travel: app.nature_of_travel ? app.nature_of_travel.charAt(0).toUpperCase() + app.nature_of_travel.slice(1) : '',
        purpose_of_travel: app.purpose_of_travel || '',
        departure_date: app.departure_date?.split('T')[0] || '',
        arrival_date: app.arrival_date?.split('T')[0] || '',
        attachments: [] // Reset attachments when editing
      });
      setSelectedMemberId(app.parliament_member_id);
      
      // Set the parliament member name in the search field
      const memberName = app.parliament_member_full_name || 
                        (app.parliament_member?.title ? `${app.parliament_member.title} ${app.parliament_member.name}` : app.parliament_member?.name) || 
                        '';
      setPmSearchTerm(memberName);
      setSelectedMemberName(memberName);
      
      // Set attachment previews if there are existing attachments
      if (app.attachments && Array.isArray(app.attachments)) {
        const existingPreviews = app.attachments.map(attachment => ({
          existing: true,
          id: attachment.id,
          name: attachment.file_name || attachment.name,
          path: attachment.file_path || attachment.path,
          preview: `${API_URL}/storage/${attachment.file_path || attachment.path}`
        }));
        setAttachmentPreviews(existingPreviews);
      }
    } else {
      setEditingApplication(null);
      setApplication({
        countries_visited: '',
        nature_of_travel: '',
        purpose_of_travel: '',
        departure_date: '',
        arrival_date: '',
        attachments: []
      });
      setSelectedMemberId(null);
      setPmSearchTerm('');
      setSelectedMemberName('');
    }
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingApplication(null);
    setErrors({});
    setSubmitError('');
    setSelectedMemberId(null);
    setAttachmentPreviews([]);
    setFilesToDelete([]); // Reset files to delete
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const openViewModal = useCallback((app) => {
    setViewingApplication(app);
    setShowViewModal(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setShowViewModal(false);
    setViewingApplication(null);
  }, []);

  // --- VALIDATION ---
  const validate = useCallback(() => {
    let tempErrors = {};

    // Parliament Member validation
    if (!selectedMemberId) {
      tempErrors.parliament_member_id = 'Please select a Parliament Member';
    }

    // Countries visited validation
    if (!application.countries_visited?.trim()) {
      tempErrors.countries_visited = 'Countries visited is required';
    } else if (application.countries_visited.length > 150) {
      tempErrors.countries_visited = 'Countries visited must not exceed 150 characters';
    }

    // Nature of travel validation
    if (!application.nature_of_travel) {
      tempErrors.nature_of_travel = 'Nature of travel is required';
    } else if (!['Official', 'Private'].includes(application.nature_of_travel)) {
      tempErrors.nature_of_travel = 'Nature of travel must be either Official or Private';
    }

    // Purpose of travel validation
    if (!application.purpose_of_travel?.trim()) {
      tempErrors.purpose_of_travel = 'Purpose of travel is required';
    } else if (application.purpose_of_travel.length < 10) {
      tempErrors.purpose_of_travel = 'Purpose of travel must be at least 10 characters';
    } else if (application.purpose_of_travel.length > 1000) {
      tempErrors.purpose_of_travel = 'Purpose of travel must not exceed 1000 characters';
    }

    // Departure date validation
    if (!application.departure_date) {
      tempErrors.departure_date = 'Departure date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const departureDate = new Date(application.departure_date);

      if (departureDate < today) {
        tempErrors.departure_date = 'Departure date cannot be in the past';
      }
    }

    // Arrival date validation
    if (!application.arrival_date) {
      tempErrors.arrival_date = 'Arrival date is required';
    } else if (application.departure_date) {
      const departureDate = new Date(application.departure_date);
      const arrivalDate = new Date(application.arrival_date);

      if (arrivalDate <= departureDate) {
        tempErrors.arrival_date = 'Arrival date must be after departure date';
      }
    }

    // Attachments validation (optional)
    application.attachments.forEach((file, index) => {
      if (file.size > 5 * 1024 * 1024) {
        tempErrors[`attachment_${index}`] = `${file.name}: File size must be less than 5MB`;
      }
    });

    // Check if we have a session ID
    const currentSessionId = getCurrentSessionId();
    if (!currentSessionId) {
      tempErrors.general = 'No active session found. Please try again or contact support.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }, [selectedMemberId, application, getCurrentSessionId]);

  // --- SAVE / UPDATE ---
  const saveApplication = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitError('');

      if (!validate()) return;

      // Get the current session ID right before submission
      const currentSessionId = getCurrentSessionId();
      if (!currentSessionId) {
        setErrors((prev) => ({
          ...prev,
          general: 'Cannot submit without an active session. Please refresh the page.'
        }));
        return;
      }

      setIsSubmitting(true);
      setFileUploading(true);

      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('parliament_member_id', selectedMemberId);
        formData.append('countries_visited', application.countries_visited);
        formData.append('nature_of_travel', application.nature_of_travel);
        formData.append('purpose_of_travel', application.purpose_of_travel);
        formData.append('departure_date', application.departure_date);
        formData.append('arrival_date', application.arrival_date);
        formData.append('application_type', '2');
        formData.append('session_id', currentSessionId);
        
        // Add multiple files if exist
        application.attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
        
        // Add files to delete array for update operation
        if (editingApplication && filesToDelete.length > 0) {
          filesToDelete.forEach((fileId, index) => {
            formData.append(`files_to_delete[${index}]`, fileId);
          });
        }

        if (editingApplication) {
          await axios.post(
            `${API_URL}/parliament-applications/${editingApplication.id}?_method=PUT`, 
            formData, 
            { headers: getMultiPartHeaders() }
          );
          
          // If updating a "Resubmit Required" application, automatically change status to "Resubmit Pending"
          if (editingApplication.last_status?.toLowerCase() === 'resubmit required') {
            try {
              await axios.post(
                `${API_URL}/parliament-applications/${editingApplication.id}/status`,
                { 
                  status: 'Resubmit Pending', 
                  remark: 'Application resubmitted',
                  session_id: currentSessionId
                },
                { headers: getAuthHeaders() }
              );
            } catch (statusError) {
              console.error('Error updating status to Resubmit Pending:', statusError);
            }
          }
          
          setSuccessMessage('Application updated successfully!');
        } else {
          await axios.post(`${API_URL}/parliament-applications`, formData, { headers: getMultiPartHeaders() });
          setSuccessMessage('Application created successfully!');
        }
        fetchApplications(currentPage, search, statusParam); // Refresh with current page and search
        setTimeout(() => setSuccessMessage(''), 3000);
        closeModal();
      } catch (error) {
        console.error('Save error:', error.response?.data || error.message);

        if (error.response && error.response.status === 422 && error.response.data.errors) {
          // Backend validation errors
          const backendErrors = {};
          Object.keys(error.response.data.errors).forEach((key) => {
            backendErrors[key] = error.response.data.errors[key][0];
          });
          setErrors(backendErrors);
        } else {
          setSubmitError(error.response?.data?.message || 'Failed to save application. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
        setFileUploading(false);
      }
    },
    [
      validate,
      getCurrentSessionId,
      selectedMemberId,
      application,
      editingApplication,
      currentPage,
      search,
      fetchApplications,
      closeModal,
      getAuthHeaders,
      getMultiPartHeaders
    ]
  );

  // STATUS
  const handleStatusChange = useCallback(async (id, buttonLabel) => {
    // Map button labels to actual status values
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

    // Get the current session ID right before submission
    const currentSessionId = getCurrentSessionId();
    if (!currentSessionId) {
      alert("Cannot update status without an active session. Please refresh the page.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/parliament-applications/${id}/status`,
        { 
          status, 
          remark: statusRemark.trim(),
          session_id: currentSessionId
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        const updatedRemark = statusRemark.trim();
        setViewingApplication((prev) => ({ 
          ...prev, 
          last_status: status,
          last_status_remark: updatedRemark
        }));
        setApplications((prev) => prev.map((app) => (app.id === id ? { 
          ...app, 
          last_status: status,
          last_status_remark: updatedRemark
        } : app)));
        setSuccessMessage('Status updated successfully!');
        setStatusRemark(''); // Clear remark after successful update
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error);
      alert('Failed to update status');
    }
  }, [getCurrentSessionId, getAuthHeaders, statusRemark]);

  const getStatusBadge = useCallback((status) => {
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
  }, []);

  const canEditApplication = useCallback((status) => {
    return !status || status.toLowerCase() === 'pending' || status.toLowerCase() === 'resubmit pending';
  }, []);

  const getAvailableStatusOptions = useCallback((currentStatus) => {
    const status = currentStatus?.toLowerCase();
    if (!status || status === 'pending' || status === 'resubmit pending') return ['check'];
    if (status === 'checked') return ['recommend', 'do not recommend', 'require resubmit'];
    if (status === 'recommended') return ['approve', 'reject', 'require resubmit'];
    if (status === 'resubmit required') return [];  // User must edit and resubmit first
    if (status === 'not recommended') return [];
    if (status === 'rejected') return [];
    if (status === 'approved') return [];
    return [];
  }, []);

  // Check if user can change status
  const canChangeStatus = useCallback(
    (currentStatus) => {
      const statusOptions = getAvailableStatusOptions(currentStatus);

      if (statusOptions.length === 0) return false;

      // Check if user has permission for any of the available status options
      return statusOptions.some((statusOption) => {
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
    },
    [getAvailableStatusOptions, hasPermission]
  );

  // Handle PDF download
  const handleDownloadPDF = useCallback(async (applicationId) => {
    if (!applicationId) return;

    setIsDownloading(true);
    try {
      const token = localStorage.getItem('authToken');

      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = `${API_URL}/pdf/parliament-application/${applicationId}`;
      link.target = '_blank';
      link.download = `parliament_application_${applicationId}.pdf`;

      // Add authentication headers
      fetch(`${API_URL}/pdf/parliament-application/${applicationId}`, {
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
  }, []);

  // Handle attachment download
  const handleDownloadAttachment = useCallback(async (attachmentId, fileName) => {
    if (!attachmentId) return;

    try {
      const token = localStorage.getItem('authToken');

      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = `${API_URL}/parliament-application-files/${attachmentId}/download`;
      link.target = '_blank';
      link.download = fileName || 'attachment';

      // Add authentication headers
      fetch(`${API_URL}/parliament-application-files/${attachmentId}/download`, {
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

  if (!hasPermission('Application_read_all')) {
    return (
      <MainCard cardClass="mt-4">
        <Alert variant="danger" className="text-center py-4">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You don't have permission to view parliament applications.</p>
          <p className="mb-0">Please contact your administrator for access.</p>
        </Alert>
      </MainCard>
    );
  }

  // Rendering
  return (
    <MainCard cardClass="mt-0.9">
      {/* Header with title and Add button */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="mb-0">PM Applications</h4>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Form.Control
            type="text"
            placeholder="Search: Min 3 characters"
            value={search || ''}
            onChange={handleSearchChange}
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
          <Button variant="primary" onClick={() => openModal()} style={{ borderRadius: '0.3rem' }}>
            <Plus size={16} className="me-1" /> Add Application
          </Button>
        )}
      </div>

      {successMessage && (
        <Alert variant="success" className="mt-3">
          {successMessage}
        </Alert>
      )}

      <hr className="mt-4" style={{ opacity: 0.15 }} />

      <div
        className="mt-4"
        style={{
          width: '100%',
          borderRadius: '0.3rem',
          overflow: 'hidden'
        }}
      >
        <div className="table-responsive">
          <Table hover className="mb-0" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', borderColor: '#f0f0f0' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <tr>
                <th className="py-3" style={{ width: '5%' }}>
                  #
                </th>
                <th className="py-3" style={{ width: '15%' }}>
                  Parliament Member
                </th>
                <th className="py-3" style={{ width: '15%' }}>
                  Countries Visited
                </th>
                <th className="py-3" style={{ width: '12%' }}>
                  Nature of Travel
                </th>
                <th className="py-3" style={{ width: '13%' }}>
                  Departure Date
                </th>
                <th className="py-3" style={{ width: '13%' }}>
                  Arrival Date
                </th>
                <th className="py-3" style={{ width: '12%' }}>
                  Status
                </th>
                <th className="py-3 text-start" style={{ width: '15%' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <Spinner animation="border" size="sm" /> Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map((app, index) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">{app.parliament_member_full_name || app.parliament_member?.name || 'N/A'}</td>
                    <td className="py-2">{app.countries_visited}</td>
                    <td className="py-2">{app.nature_of_travel}</td>
                    <td className="py-2">{formatDate(app.departure_date)}</td>
                    <td className="py-2">{formatDate(app.arrival_date)}</td>
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
                      <div className="d-flex justify-content-start gap-2">{hasPermission('Application_update') && canEditApplication(app.last_status) && (
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
                          <Eye size={14} />
                          View
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
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
        </div>
      </div>

      {/* Application Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" scrollable backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editingApplication ? 'Edit Application' : 'Add Application'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={saveApplication}>
            {errors.general && <Alert variant="danger">{errors.general}</Alert>}
            {submitError && <Alert variant="danger">{submitError}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Parliament Member *</Form.Label>
              <div style={{ position: 'relative' }}>
                <Form.Control
                  type="text"
                  placeholder="Search: Min 3 characters"
                  value={pmSearchTerm}
                  onChange={handlePmSearchChange}
                  onFocus={handlePmInputFocus}
                  onBlur={handlePmInputBlur}
                  isInvalid={!!errors.parliament_member_id}
                  autoComplete="off"
                />
                {pmLoading && (
                  <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                    <Spinner animation="border" size="sm" />
                  </div>
                )}
                {pmDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '0.25rem',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
                    }}
                  >
                    {filteredParliamentMembers.length > 0 ? (
                      filteredParliamentMembers.map((member) => (
                        <div
                          key={member.id}
                          style={{
                            padding: '0.5rem 0.75rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseDown={() => handleMemberChange(member)}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                        >
                          {member.title ? `${member.title} ${member.name}` : member.name}
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: '0.5rem 0.75rem',
                          color: '#6c757d',
                          fontStyle: 'italic'
                        }}
                      >
                        No parliament member
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Form.Control.Feedback type="invalid">{errors.parliament_member_id}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Countries Visited *</Form.Label>
              <Form.Control
                type="text"
                name="countries_visited"
                value={application.countries_visited}
                onChange={handleInputChange}
                isInvalid={!!errors.countries_visited}
              />
              <Form.Control.Feedback type="invalid">{errors.countries_visited}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nature of Travel *</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  id="natureOfficial"
                  label="Official"
                  name="nature_of_travel"
                  value="Official"
                  checked={application.nature_of_travel === 'Official'}
                  onChange={handleInputChange}
                  isInvalid={!!errors.nature_of_travel}
                />
                <Form.Check
                  inline
                  type="radio"
                  id="naturePrivate"
                  label="Private"
                  name="nature_of_travel"
                  value="Private"
                  checked={application.nature_of_travel === 'Private'}
                  onChange={handleInputChange}
                  isInvalid={!!errors.nature_of_travel}
                />
              </div>
              {errors.nature_of_travel && <div className="invalid-feedback d-block">{errors.nature_of_travel}</div>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Purpose of Travel *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="purpose_of_travel"
                value={application.purpose_of_travel}
                onChange={handleInputChange}
                isInvalid={!!errors.purpose_of_travel}
              />
              <Form.Control.Feedback type="invalid">{errors.purpose_of_travel}</Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Departure Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="departure_date"
                  value={application.departure_date}
                  min={getTodayDate()}
                  onChange={handleInputChange}
                  isInvalid={!!errors.departure_date}
                />
                <Form.Control.Feedback type="invalid">{errors.departure_date}</Form.Control.Feedback>
              </Col>
              <Col md={6}>
                <Form.Label>Arrival Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="arrival_date"
                  value={application.arrival_date}
                  min={getMinArrivalDate()}
                  onChange={handleInputChange}
                  isInvalid={!!errors.arrival_date}
                />
                <Form.Control.Feedback type="invalid">{errors.arrival_date}</Form.Control.Feedback>
              </Col>
            </Row>

            {/* Multiple File Upload Field with Drag and Drop */}
            <Form.Group className="mb-3">
              <Form.Label>Attachments (Optional)</Form.Label>
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
              {errors.attachments && <div className="invalid-feedback d-block">{errors.attachments}</div>}
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={closeModal} disabled={isSubmitting}>
                <X className="me-1" size={18} /> Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting || fileUploading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="me-1 animate-spin" size={18} /> {editingApplication ? 'Updating...' : 'Submitting...'}
                  </>
                ) : editingApplication ? (
                  <>
                    <Save size={18} className="me-1" /> Update Application
                  </>
                ) : (
                  <>
                    <User size={18} className="me-1" /> Submit Application
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* View Application Modal */}
      <Modal show={showViewModal} onHide={closeViewModal} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>View Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingApplication && (
            <Form>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">
                  Parliament Member:
                </Col>
                <Col sm={8}>{viewingApplication.parliament_member_full_name || (viewingApplication.parliament_member?.title ? `${viewingApplication.parliament_member.title} ${viewingApplication.parliament_member.name}` : viewingApplication.parliament_member?.name)}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">
                  Countries Visited:
                </Col>
                <Col sm={8}>{viewingApplication.countries_visited}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">
                  Nature of Travel:
                </Col>
                <Col sm={8}>{viewingApplication.nature_of_travel}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">
                  Purpose of Travel:
                </Col>
                <Col sm={8}>{viewingApplication.purpose_of_travel}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">
                  Departure Date:
                </Col>
                <Col sm={8}>{formatDate(viewingApplication.departure_date)}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="fw-bold">
                  Arrival Date:
                </Col>
                <Col sm={8}>{formatDate(viewingApplication.arrival_date)}</Col>
              </Row>
              {/* Display attachments if exist */}
              {viewingApplication.attachments && viewingApplication.attachments.length > 0 && (
                <Row className="mb-3">
                  <Col sm={4} className="fw-bold">
                    Attachments:
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
              <Row className="mb-3 align-items-center">
                <Col sm={4} className="fw-bold">
                  Current Status:
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
                  <Col sm={4} className="fw-bold">
                    Reason:
                  </Col>
                  <Col sm={8}>
                    <div className="alert alert-secondary mb-0" style={{ padding: '0.75rem' }}>
                      {viewingApplication.last_status_remark}
                    </div>
                  </Col>
                </Row>
              )}

              {/* Status change options - only show if user has permission to change status */}
              {canChangeStatus(viewingApplication.last_status) && (
                <>
                  <Row className="mb-3">
                    <Col sm={4} className="fw-bold">
                      Change Status To:
                    </Col>
                    <Col sm={8}>
                      {/* Reason/Remark field */}
                      <div className="mb-3">
                        <h6>
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
            </Form>
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
            <X className="me-1" size={18} /> Close
          </Button>
        </Modal.Footer>
      </Modal>
    </MainCard>
  );
}