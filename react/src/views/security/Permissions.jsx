import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Table, InputGroup, FormControl, Pagination } from 'react-bootstrap';
import { Add, Edit, Search } from '@mui/icons-material';
import axios from '../../utils/axiosConfig';

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPermission, setCurrentPermission] = useState({
    name: '',
    code: '',
    module: '',
    description: ''
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        setCurrentPage(1); // Reset to first page on new search
        fetchPermissions();
      }
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  useEffect(() => {
    fetchPermissions();
  }, [currentPage]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: perPage
      };
      if (searchTerm && searchTerm.length >= 3) {
        params.search = searchTerm;
      }
      const response = await axios.get('/permissions', { params });
      const data = response.data.data || [];
      const pagination = response.data.pagination || {};
      
      setPermissions(data);
      setTotalRecords(pagination.total || 0);
      setTotalPages(Math.ceil((pagination.total || 0) / perPage));
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (permission = null) => {
    if (permission) {
      setEditMode(true);
      setCurrentPermission({
        id: permission.id,
        name: permission.name || '',
        code: permission.code || '',
        module: permission.module || '',
        description: permission.description || ''
      });
    } else {
      setEditMode(false);
      setCurrentPermission({
        name: '',
        code: '',
        module: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPermission({
      name: '',
      code: '',
      module: '',
      description: ''
    });
  };

  const handleChange = (e) => {
    setCurrentPermission({
      ...currentPermission,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`/permissions/${currentPermission.id}`, currentPermission);
      } else {
        await axios.post('/permissions', currentPermission);
      }
      fetchPermissions();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving permission:', error);
      alert('Error saving permission. Please check the form.');
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // First page
    if (startPage > 1) {
      items.push(
        <Pagination.First key="first" onClick={() => handlePageChange(1)} />
      );
      items.push(
        <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Last page
    if (endPage < totalPages) {
      items.push(
        <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
      );
      items.push(
        <Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} />
      );
    }

    return <Pagination className="justify-content-center mt-3">{items}</Pagination>;
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">PERMISSIONS</h4>
              <Button
                style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
                onClick={() => handleOpenModal()}
              >
                <Add style={{ marginRight: '5px' }} /> Add Permission
              </Button>
            </Card.Header>
            <Card.Body>

              <Row className="mb-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text style={{ backgroundColor: '#f5f5f5', border: 'none' }}>
                      <Search style={{ color: '#999' }} />
                    </InputGroup.Text>
                    <FormControl
                      placeholder="Search: Min 3 characters"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ backgroundColor: '#f5f5f5', border: 'none' }}
                    />
                  </InputGroup>
                </Col>
              </Row>

              {loading ? (
                <div className="text-center py-5">Loading...</div>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '80px' }}>#</th>
                        <th>Name</th>
                        <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.length > 0 ? (
                        permissions.map((permission, index) => (
                          <tr key={permission.id}>
                            <td>{(currentPage - 1) * perPage + index + 1}</td>
                            <td>{permission.name || permission.code || 'N/A'}</td>
                            <td style={{ textAlign: 'center' }}>
                              <Button
                                style={{ 
                                  backgroundColor: '#3a4c4a', 
                                  borderColor: '#3a4c4a'
                                }}
                                size="sm"
                                onClick={() => handleOpenModal(permission)}
                              >
                                <Edit fontSize="small" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center text-muted py-4">
                            {searchTerm.length > 0 && searchTerm.length < 3 
                              ? 'Enter at least 3 characters to search'
                              : 'No permissions found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {renderPagination()}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Permission Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Permission' : 'Add New Permission'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Permission Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentPermission.name}
                onChange={handleChange}
                placeholder="e.g., Security Read, Complaint Create"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Permission Code *</Form.Label>
              <Form.Control
                type="text"
                name="code"
                value={currentPermission.code}
                onChange={handleChange}
                placeholder="e.g., security.read, complaint.create"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Module *</Form.Label>
              <Form.Control
                type="text"
                name="module"
                value={currentPermission.module}
                onChange={handleChange}
                placeholder="e.g., Users, Complaints, Reports"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={currentPermission.description}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
              >
                {editMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Permissions;
