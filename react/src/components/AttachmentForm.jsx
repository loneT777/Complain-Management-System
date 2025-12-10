import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { CloudUpload } from '@mui/icons-material';
import axios from 'axios';

const AttachmentForm = ({ show, handleClose, attachment, handleSubmit, editMode }) => {
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [replaceFile, setReplaceFile] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    id: null,
    complaint_id: '',
    file_name: '',
    extension: '',
    description: '',
    user_id: 1 // Default user
  });

  useEffect(() => {
    if (show) {
      setValidationError('');
      setReplaceFile(false);
      setSelectedFile(null);
      fetchComplaints();
      if (attachment && editMode) {
        setFormData({
          id: attachment.id || null,
          complaint_id: attachment.complaint_id || '',
          file_name: attachment.file_name || '',
          extension: attachment.extension || '',
          description: attachment.description || '',
          user_id: attachment.user_id || 1
        });
      } else {
        setFormData({
          id: null,
          complaint_id: '',
          file_name: '',
          extension: '',
          description: '',
          user_id: 1
        });
      }
    }
  }, [show, attachment, editMode]);

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const response = await axios.get('/api/complaints', {
        params: { per_page: 100 }
      });
      setComplaints(response.data.data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setValidationError('File size must not exceed 10MB');
        return;
      }
      
      // Validate file type
      const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'];
      const extension = file.name.split('.').pop().toLowerCase();
      
      if (!allowedExtensions.includes(extension)) {
        setValidationError('Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, ZIP, RAR');
        return;
      }
      
      setValidationError('');
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        file_name: file.name,
        extension: extension
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setValidationError('File size must not exceed 10MB');
        return;
      }
      
      // Validate file type
      const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'];
      const extension = file.name.split('.').pop().toLowerCase();
      
      if (!allowedExtensions.includes(extension)) {
        setValidationError('Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, ZIP, RAR');
        return;
      }
      
      setValidationError('');
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        file_name: file.name,
        extension: extension
      }));
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    
    setValidationError('');
    
    // Validate complaint selection
    if (!formData.complaint_id) {
      setValidationError('Please select a complaint');
      return;
    }
    
    // Validate file selection for new uploads
    if (!editMode && !selectedFile) {
      setValidationError('Please select a file to upload');
      return;
    }
    
    const submitData = {
      ...formData,
      file: selectedFile
    };
    
    handleSubmit(submitData);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Edit Attachment' : 'Add Attachment'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {validationError && (
          <Alert variant="danger" dismissible onClose={() => setValidationError('')}>
            {validationError}
          </Alert>
        )}
        
        <Form onSubmit={handleLocalSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Complaint <span className="text-danger">*</span></Form.Label>
            {loadingComplaints ? (
              <div className="text-center py-2">
                <Spinner animation="border" size="sm" /> Loading complaints...
              </div>
            ) : (
              <Form.Select
                name="complaint_id"
                value={formData.complaint_id}
                onChange={handleChange}
                required
                disabled={editMode}
              >
                <option value="">Select a complaint</option>
                {complaints.map((complaint) => (
                  <option key={complaint.id} value={complaint.id}>
                    {complaint.reference_no} - {complaint.title}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description for this attachment..."
            />
          </Form.Group>

          {!editMode && (
            <Form.Group className="mb-3">
              <Form.Label>Attachments (Optional)</Form.Label>
              <div
                className={`border rounded p-4 text-center ${dragActive ? 'border-primary bg-light' : 'border-secondary'}`}
                style={{ 
                  borderStyle: 'dashed',
                  borderWidth: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                <CloudUpload style={{ fontSize: '48px', color: '#6c757d', marginBottom: '10px' }} />
                <h5 className="mb-2">Drag & drop files here or click to browse</h5>
                <p className="text-muted mb-0">
                  Allowed file types: PDF, Word, Excel, and images (Max size: 5MB each)
                </p>
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                  style={{ display: 'none' }}
                />
              </div>
            </Form.Group>
          )}

          {editMode && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Current File</Form.Label>
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{formData.file_name}</strong>
                      <br />
                      <small className="text-muted">Type: {formData.extension?.toUpperCase()}</small>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setReplaceFile(true)}
                    >
                      Replace File
                    </Button>
                  </div>
                </div>
              </Form.Group>

              {replaceFile && (
                <Form.Group className="mb-3">
                  <Form.Label>New File <span className="text-danger">*</span></Form.Label>
                  <div
                    className={`border rounded p-4 text-center ${dragActive ? 'border-primary bg-light' : 'border-secondary'}`}
                    style={{ 
                      borderStyle: 'dashed',
                      borderWidth: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleBrowseClick}
                  >
                    <CloudUpload style={{ fontSize: '48px', color: '#6c757d', marginBottom: '10px' }} />
                    <h5 className="mb-2">Drag & drop new file here or click to browse</h5>
                    <p className="text-muted mb-0">
                      Allowed file types: PDF, Word, Excel, and images (Max size: 10MB)
                    </p>
                    <Form.Control
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                      style={{ display: 'none' }}
                    />
                  </div>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description for this attachment..."
                />
              </Form.Group>
            </>
          )}

          {selectedFile && (
            <Alert variant="info">
              <strong>Selected File:</strong> {selectedFile.name}<br />
              <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB<br />
              <strong>Type:</strong> {selectedFile.type || 'Unknown'}
            </Alert>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleLocalSubmit}>
          {editMode ? 'Update' : 'Upload'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AttachmentForm;
