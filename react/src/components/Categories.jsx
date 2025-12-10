import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Pagination, InputGroup, Modal, Table, Spinner, Badge } from 'react-bootstrap';
import { Add, Search, Message as MessageIcon } from '@mui/icons-material';
import CategoryTable from './CategoryTable';
import CategoryForm from './CategoryForm';
import axios from 'axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    parent_id: '',
    category_name: '',
    description: '',
    division_id: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showComplaintsModal, setShowComplaintsModal] = useState(false);
  const [categoryComplaints, setCategoryComplaints] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  
  // Pagination and search states
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalRows, setTotalRows] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchDivisions();
  }, [page, rowsPerPage, searchQuery]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/categories', {
        params: {
          page: page,
          per_page: rowsPerPage,
          search: searchQuery
        }
      });
      
      setCategories(response.data.data || []);
      setTotalRows(response.data.pagination?.total || 0);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorMessage('Failed to load categories: ' + (error.response?.data?.message || error.message));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await axios.get('/api/public/divisions');
      setDivisions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      setDivisions([]);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditMode(true);
      setFormData({
        id: category.id,
        code: category.code || '',
        parent_id: category.parent_id || '',
        category_name: category.category_name || '',
        description: category.description || '',
        division_id: category.division_id || ''
      });
    } else {
      setEditMode(false);
      setFormData({
        code: '',
        parent_id: '',
        category_name: '',
        description: '',
        division_id: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({
      code: '',
      parent_id: '',
      category_name: '',
      description: '',
      division_id: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Convert empty values to null
      const submitData = {
        ...formData,
        parent_id: formData.parent_id === '' ? null : formData.parent_id,
        division_id: formData.division_id === '' ? null : formData.division_id
      };

      if (editMode) {
        await axios.put(`/api/categories/${formData.id}`, submitData);
        setSuccessMessage('Category updated successfully');
      } else {
        await axios.post('/api/categories', submitData);
        setSuccessMessage('Category created successfully');
      }

      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setErrorMessage(error.response?.data?.message || 'Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/categories/${id}`);
        setSuccessMessage('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setErrorMessage(error.response?.data?.message || 'Error deleting category');
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
    
    // Debounce search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setPage(1); // Reset to first page on search
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handleViewComplaints = async (categoryId) => {
    setSelectedCategoryId(categoryId);
    setLoadingComplaints(true);
    setShowComplaintsModal(true);
    
    try {
      // Fetch complaints for this category
      const response = await axios.get(`/api/categories/${categoryId}/complaints`);
      setCategoryComplaints(response.data.data || []);
    } catch (error) {
      console.error('Error fetching complaints for category:', error);
      setErrorMessage('Failed to load complaints for this category');
      setCategoryComplaints([]);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleAddMessageForComplaint = (complaintId) => {
    // Navigate to Messages page with pre-selected complaint
    window.location.href = `/messages?complaint_id=${complaintId}`;
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center bg-white">
              <h4 className="mb-0">Categories</h4>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                <Add className="me-2" fontSize="small" />
                Add Category
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
                  <strong>Error:</strong> {errorMessage}
                  <br />
                  <small>Make sure the database is configured and migrations are run: `php artisan migrate`</small>
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
                      placeholder="Search by code, name, or description..."
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
              <CategoryTable
                categories={categories}
                divisions={divisions}
                loading={loading}
                handleEdit={handleOpenModal}
                handleDelete={handleDelete}
                handleViewComplaints={handleViewComplaints}
              />

              {/* Pagination */}
              {!loading && categories.length > 0 && (
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
      <CategoryForm
        show={showModal}
        handleClose={handleCloseModal}
        category={formData}
        handleChange={handleInputChange}
        handleSubmit={handleSaveCategory}
        editMode={editMode}
        divisions={divisions}
        categories={categories}
      />

      {/* Complaints Modal */}
      <Modal show={showComplaintsModal} onHide={() => setShowComplaintsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Complaints in this Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingComplaints ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading complaints...</p>
            </div>
          ) : categoryComplaints.length === 0 ? (
            <Alert variant="info">
              <p className="mb-2">No complaints found for this category</p>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => window.location.href = '/complaints'}
              >
                Create New Complaint
              </Button>
            </Alert>
          ) : (
            <>
              <div className="mb-3">
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={() => window.location.href = '/complaints'}
                >
                  <Add fontSize="small" className="me-1" />
                  Create New Complaint
                </Button>
              </div>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td>{complaint.reference_no}</td>
                      <td>{complaint.title}</td>
                      <td>
                        <Badge bg={
                          complaint.priority_level === 'High' ? 'danger' :
                          complaint.priority_level === 'Medium' ? 'warning' : 'info'
                        }>
                          {complaint.priority_level || 'Normal'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddMessageForComplaint(complaint.id)}
                        >
                          <MessageIcon fontSize="small" className="me-1" />
                          Add Message
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowComplaintsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Categories;
