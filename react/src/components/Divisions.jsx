import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Add } from '@mui/icons-material';
import axios from '../utils/axiosConfig';
import DivisionTable from './DivisionTable';
import DivisionForm from './DivisionForm';
import { Can } from './PermissionComponents';

const Divisions = () => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentDivision, setCurrentDivision] = useState({
    name: '',
    code: '',
    description: '',
    location: '',
    officer_in_charge: '',
    contact_no: '',
    parent_id: '',
    remark: '',
    is_approved: false
  });

  useEffect(() => {
    fetchDivisions();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        fetchDivisions();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const fetchDivisions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery && searchQuery.length >= 3) {
        params.search = searchQuery;
      }
      const response = await axios.get('/divisions', { params });
      const divisionsData = response.data.data || [];
      // Sort divisions by ID in ascending order
      const sortedDivisions = divisionsData.sort((a, b) => a.id - b.id);
      setDivisions(sortedDivisions);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      setErrorMessage('Failed to fetch divisions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (division = null) => {
    if (division) {
      setEditMode(true);
      setCurrentDivision(division);
    } else {
      setEditMode(false);
      setCurrentDivision({
        name: '',
        code: '',
        description: '',
        location: '',
        officer_in_charge: '',
        contact_no: '',
        parent_id: '',
        remark: '',
        is_approved: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDivision({
      name: '',
      code: '',
      description: '',
      location: '',
      officer_in_charge: '',
      contact_no: '',
      parent_id: '',
      remark: '',
      is_approved: false
    });
    setErrorMessage('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentDivision({
      ...currentDivision,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const url = editMode 
        ? `/divisions/${currentDivision.id}` 
        : '/divisions';
      const method = editMode ? 'PUT' : 'POST';

      // Convert empty parent_id to null
      const submitData = {
        ...currentDivision,
        parent_id: currentDivision.parent_id === '' ? null : currentDivision.parent_id
      };

      await axios({
        method,
        url,
        data: submitData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setSuccessMessage(editMode ? 'Division updated successfully' : 'Division created successfully');
      fetchDivisions();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving division:', error);
      setErrorMessage(error.response?.data?.message || 'Error saving division. Please check the form.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this division?')) {
      try {
        await axios.delete(`/divisions/${id}`);
        setSuccessMessage('Division deleted successfully');
        fetchDivisions();
      } catch (error) {
        console.error('Error deleting division:', error);
        setErrorMessage('Error deleting division');
      }
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">DIVISIONS</h4>
              <Can permission="setting.create">
                <Button
                  style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
                  onClick={() => handleOpenModal()}
                >
                  <Add className="me-1" /> Add Division
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

              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search divisions (min 3 characters)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <DivisionTable
                divisions={divisions}
                loading={loading}
                handleEdit={handleOpenModal}
                handleDelete={handleDelete}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <DivisionForm
        show={showModal}
        handleClose={handleCloseModal}
        division={currentDivision}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        editMode={editMode}
      />
    </Container>
  );
};

export default Divisions;