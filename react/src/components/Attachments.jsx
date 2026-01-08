import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Pagination, InputGroup, Modal } from 'react-bootstrap';
import { Add, Search, CloudUpload } from '@mui/icons-material';
import AttachmentTable from './AttachmentTable';
import AttachmentForm from './AttachmentForm';
import axios from '../utils/axiosConfig';
import { Can } from './PermissionComponents';

const Attachments = () => {
  const [attachments, setAttachments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    complaint_id: '',
    file_name: '',
    extension: '',
    description: '',
    user_id: 1
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Pagination and search states
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchAttachments();
    fetchComplaints();
  }, [page, rowsPerPage, searchQuery]);

  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/public/attachments', {
        params: {
          page: page,
          per_page: rowsPerPage,
          search: searchQuery
        }
      });
      
      console.log('API Response:', response.data);
      console.log('Attachments data:', response.data.data);
      
      setAttachments(response.data.data || []);
      setTotalRows(response.data.pagination?.total || 0);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setErrorMessage('Failed to load attachments: ' + (error.response?.data?.message || error.message));
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await axios.get('/complaints');
      setComplaints(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    }
  };

  const handleOpenModal = (attachment = null) => {
    if (attachment) {
      setEditMode(true);
      setFormData({
        id: attachment.id,
        complaint_id: attachment.complaint_id,
        file_name: attachment.file_name,
        extension: attachment.extension,
        description: attachment.description || '',
        user_id: attachment.user_id || 1
      });
    } else {
      setEditMode(false);
      setFormData({
        id: null,
        complaint_id: '',
        file_name: '',
        extension: '',
        description: '',
        user_id: 1
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({
      id: null,
      complaint_id: '',
      file_name: '',
      extension: '',
      description: '',
      user_id: 1
    });
  };

  const handleSaveAttachment = async (submitData) => {
    setSuccessMessage('');
    setErrorMessage('');

    // Validation
    if (!submitData.complaint_id) {
      setErrorMessage('Please select a complaint');
      return;
    }

    if (!editMode && (!submitData.files || submitData.files.length === 0)) {
      setErrorMessage('Please select at least one file to upload');
      return;
    }

    try {
      if (editMode) {
        if (!submitData.id) {
          setErrorMessage('Attachment ID is missing');
          return;
        }
        
        console.log('Updating attachment ID:', submitData.id);
        
        // Check if file is being replaced
        if (submitData.files && submitData.files.length > 0) {
          // Use FormData for file upload
          const formDataToSend = new FormData();
          formDataToSend.append('complaint_id', submitData.complaint_id);
          formDataToSend.append('user_id', submitData.user_id);
          formDataToSend.append('description', submitData.description || '');
          formDataToSend.append('file', submitData.files[0]);
          formDataToSend.append('_method', 'PUT');

          await axios.post(`/api/public/attachments/${submitData.id}`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          // Update only metadata
          await axios.put(`/api/public/attachments/${submitData.id}`, {
            complaint_id: submitData.complaint_id,
            file_name: submitData.file_name,
            extension: submitData.extension,
            description: submitData.description,
            user_id: submitData.user_id
          });
        }
        setSuccessMessage('Attachment updated successfully');
      } else {
        // Upload multiple files to a single group
        let uploadedCount = 0;
        let groupId = null;
        const errors = [];

        for (const file of submitData.files) {
          try {
            const formDataToSend = new FormData();
            formDataToSend.append('complaint_id', submitData.complaint_id);
            formDataToSend.append('user_id', submitData.user_id);
            formDataToSend.append('description', submitData.description || '');
            formDataToSend.append('file', file);
            
            // Add to same group if this is not the first file
            if (groupId) {
              formDataToSend.append('group_id', groupId);
            }

            const response = await axios.post('/public/attachments', formDataToSend, {
              headers: {
                'Content-Type': 'multipart/form-data'
                
              }
            });
            
            // Store group_id from first upload
            if (!groupId && response.data.data) {
              groupId = response.data.data.id;
            }
            
            uploadedCount++;
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            errors.push(`${file.name}: ${error.response?.data?.message || 'Upload failed'}`);
          }
        }

        if (uploadedCount > 0) {
          setSuccessMessage(`Successfully uploaded ${uploadedCount} file(s) to attachment group ${groupId || ''}${errors.length > 0 ? `. ${errors.length} failed.` : ''}`);
        }
        
        if (errors.length > 0 && uploadedCount === 0) {
          setErrorMessage('All uploads failed: ' + errors.join(', '));
          return;
        }
      }

      handleCloseModal();
      fetchAttachments();
    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMsg = 'Failed to upload attachment';
      
      if (error.response?.data?.errors) {
        // Laravel validation errors
        const errors = error.response.data.errors;
        errorMsg = Object.values(errors).flat().join(', ');
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await axios.delete(`/public/attachments/${id}`);
        setSuccessMessage('Attachment deleted successfully');
        fetchAttachments();
      } catch (error) {
        console.error('Error deleting attachment:', error);
        setErrorMessage(error.response?.data?.message || 'Error deleting attachment');
      }
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const response = await axios.get(`/api/public/attachments/${attachment.id}/download`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      setErrorMessage('Error downloading attachment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleView = (attachment) => {
    setViewingAttachment(attachment);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingAttachment(null);
  };

  const getFilePreviewUrl = (attachment) => {
    // For images, create preview URL using the API endpoint
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    if (imageExtensions.includes(attachment.extension?.toLowerCase())) {
      return `/api/public/attachments/${attachment.id}/view`;
    }
    return null;
  };

  const getComplaintRef = (complaintId) => {
    const complaint = complaints.find(c => c.id === complaintId);
    return complaint ? complaint.reference_no : '-';
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setPage(1);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center bg-white">
              <h4 className="mb-0">
                <CloudUpload className="me-2" />
                Attachments
              </h4>
              <Can permission="attachment">
                <Button variant="primary" onClick={() => handleOpenModal()}>
                  <Add className="me-2" fontSize="small" />
                  Upload Attachment
                </Button>
              </Can>
            </Card.Header>
            <Card.Body>
              {successMessage && (
                <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
                  {successMessage}
                </Alert>
              )}

              {errorMessage && (
                <Alert variant="danger" dismissible onClose={() => setErrorMessage('')}>
                  {errorMessage}
                </Alert>
              )}

              {/* Search and Per Page */}
              <Row className="mb-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search fontSize="small" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by file name, complaint reference..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </InputGroup>
                </Col>
                <Col md={6} className="d-flex justify-content-end align-items-center">
                  <Form.Label className="mb-0 me-2">Show</Form.Label>
                  <Form.Select
                    style={{ width: 'auto' }}
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Form.Select>
                  <span className="ms-2">entries</span>
                </Col>
              </Row>

              {/* Table */}
              <AttachmentTable
                attachments={attachments}
                complaints={complaints}
                loading={loading}
                handleEdit={handleOpenModal}
                handleDelete={handleDelete}
                handleDownload={handleDownload}
                handleView={handleView}
              />

              {/* Pagination */}
              {!loading && attachments.length > 0 && (
                <Row className="mt-3">
                  <Col md={6} className="d-flex align-items-center">
                    <span className="text-muted">
                      Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, totalRows)} of {totalRows} entries
                    </span>
                  </Col>
                  <Col md={6} className="d-flex justify-content-end">
                    <Pagination>
                      <Pagination.First onClick={() => handleChangePage(1)} disabled={page === 1} />
                      <Pagination.Prev onClick={() => handleChangePage(page - 1)} disabled={page === 1} />
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === page}
                              onClick={() => handleChangePage(pageNum)}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        } else if (pageNum === page - 2 || pageNum === page + 2) {
                          return <Pagination.Ellipsis key={pageNum} />;
                        }
                        return null;
                      })}
                      
                      <Pagination.Next onClick={() => handleChangePage(page + 1)} disabled={page === totalPages} />
                      <Pagination.Last onClick={() => handleChangePage(totalPages)} disabled={page === totalPages} />
                    </Pagination>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Form Modal */}
      <AttachmentForm
        show={showModal}
        handleClose={handleCloseModal}
        attachment={formData}
        handleSubmit={handleSaveAttachment}
        editMode={editMode}
      />

      {/* View Attachment Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>View Attachment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingAttachment && (
            <>
              <div className="mb-3">
                <strong>File Name:</strong> {viewingAttachment.file_name}
              </div>
              <div className="mb-3">
                <strong>Complaint:</strong>{' '}
                <span className="badge bg-secondary">{getComplaintRef(viewingAttachment.complaint_id)}</span>
              </div>
              <div className="mb-3">
                <strong>File Type:</strong>{' '}
                <span className="badge bg-info">{viewingAttachment.extension?.toUpperCase()}</span>
              </div>
              <div className="mb-3">
                <strong>Uploaded:</strong>{' '}
                {viewingAttachment.uploaded_at
                  ? new Date(viewingAttachment.uploaded_at).toLocaleString()
                  : '-'}
              </div>
              {viewingAttachment.description && (
                <div className="mb-3">
                  <strong>Description:</strong>
                  <p className="mt-2 p-3 bg-light rounded">{viewingAttachment.description}</p>
                </div>
              )}
              
              {/* File Preview */}
              {getFilePreviewUrl(viewingAttachment) ? (
                <div className="mb-3">
                  <strong>Preview:</strong>
                  <div className="mt-2 text-center">
                    <img
                      src={getFilePreviewUrl(viewingAttachment)}
                      alt={viewingAttachment.file_name}
                      style={{ maxWidth: '100%', maxHeight: '500px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              ) : (
                <Alert variant="info">
                  Preview not available for this file type. Click download to view the file.
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseViewModal}>
            Close
          </Button>
          {viewingAttachment && (
            <Button variant="success" onClick={() => handleDownload(viewingAttachment)}>
              Download
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Attachments;
