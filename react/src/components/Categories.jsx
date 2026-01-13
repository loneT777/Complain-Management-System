import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Add } from '@mui/icons-material';
import CategoryTable from './CategoryTable';
import CategoryForm from './CategoryForm';
import axios from '../utils/axiosConfig';
import { Can } from './PermissionComponents';

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

  useEffect(() => {
    fetchCategories();
    fetchDivisions();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/categories');
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorMessage('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await axios.get('/divisions');
      setDivisions(response.data.data || response.data || []);
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
        await axios.put(`/categories/${formData.id}`, submitData);
        setSuccessMessage('Category updated successfully');
      } else {
        await axios.post('/categories', submitData);
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
        await axios.delete(`/categories/${id}`);
        setSuccessMessage('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setErrorMessage(error.response?.data?.message || 'Error deleting category');
      }
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">CATEGORIES</h4>
              <Can permission="setting.create">
                <Button style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }} onClick={() => handleOpenModal()}>
                  <Add className="me-1" /> Add Category
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

              <CategoryTable
                categories={categories}
                divisions={divisions}
                loading={loading}
                handleEdit={handleOpenModal}
                handleDelete={handleDelete}
              />
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
    </Container>
  );
};

export default Categories;
