import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Pagination, InputGroup } from 'react-bootstrap';
import { Add, Search } from '@mui/icons-material';
import MessageTable from './MessageTable';
import MessageForm from './MessageForm';
import MessageThread from './MessageThread';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const preSelectedComplaintId = searchParams.get('complaint_id');
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewingThread, setViewingThread] = useState(null);
  const [formData, setFormData] = useState({
    complaint_id: '',
    message: '',
    type: '',
    parent_id: ''
  });
  
  // Auto-open modal if complaint_id is in URL
  useEffect(() => {
    if (preSelectedComplaintId) {
      handleOpenModal(null, preSelectedComplaintId);
      // Clear the URL parameter after opening
      searchParams.delete('complaint_id');
      setSearchParams(searchParams);
    }
  }, [preSelectedComplaintId]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Pagination and search states
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalRows, setTotalRows] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, [page, rowsPerPage, searchQuery]);

  // If viewing a thread, show the thread component
  if (viewingThread) {
    return <MessageThread complaintId={viewingThread} onBack={() => setViewingThread(null)} />;
  }

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/messages', {
        params: {
          page: page,
          per_page: rowsPerPage,
          search: searchQuery
        }
      });

      setMessages(response.data.data || []);
      setTotalRows(response.data.pagination?.total || 0);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching messages:', error);
      setErrorMessage('Failed to load messages: ' + (error.response?.data?.message || error.message));
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (message = null, complaintId = null) => {
    if (message) {
      setEditMode(true);
      setFormData({
        id: message.id,
        complaint_id: message.complaint_id || '',
        message: message.message || '',
        type: message.type || '',
        parent_id: message.parent_id || ''
      });
    } else {
      setEditMode(false);
      setFormData({
        complaint_id: complaintId || '',
        message: '',
        type: '',
        parent_id: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({
      complaint_id: '',
      message: '',
      type: '',
      parent_id: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveMessage = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const submitData = {
        complaint_id: formData.complaint_id,
        message: formData.message,
        type: formData.type || null,
        parent_id: formData.parent_id || null,
        session_id: 1 // Default session ID from our seeder
      };

      if (editMode) {
        await axios.put(`http://localhost:8000/api/messages/${formData.id}`, submitData);
        setSuccessMessage('Message updated successfully');
      } else {
        await axios.post('http://localhost:8000/api/messages', submitData);
        setSuccessMessage('Message created successfully');
      }

      handleCloseModal();
      fetchMessages();
    } catch (error) {
      console.error('Error saving message:', error);
      const errorMsg = error.response?.data?.message || 'Error saving message';
      const errors = error.response?.data?.errors;
      
      if (errors) {
        const errorList = Object.values(errors).flat().join(', ');
        setErrorMessage(`${errorMsg}: ${errorList}`);
      } else {
        setErrorMessage(errorMsg);
      }
      
      // Re-throw to let form handle validation errors
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await axios.delete(`http://localhost:8000/api/messages/${id}`);
        setSuccessMessage('Message deleted successfully');
        fetchMessages();
      } catch (error) {
        console.error('Error deleting message:', error);
        setErrorMessage(error.response?.data?.message || 'Error deleting message');
      }
    }
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
              <h4 className="mb-0">Messages</h4>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                <Add className="me-2" fontSize="small" />
                Add Message
              </Button>
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
                      placeholder="Search messages, complaint number, or type..."
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
              <MessageTable
                messages={messages}
                loading={loading}
                handleEdit={handleOpenModal}
                handleDelete={handleDelete}
                handleViewThread={setViewingThread}
              />

              {/* Pagination */}
              {!loading && messages.length > 0 && (
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
      <MessageForm
        show={showModal}
        handleClose={handleCloseModal}
        message={formData}
        handleChange={handleInputChange}
        handleSubmit={handleSaveMessage}
        editMode={editMode}
      />
    </Container>
  );
};

export default Messages;
