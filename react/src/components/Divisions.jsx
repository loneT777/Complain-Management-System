import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Add } from '@mui/icons-material';
import axios from 'axios';
import DivisionTable from './DivisionTable';
import DivisionForm from './DivisionForm';

const Divisions = () => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDivision, setCurrentDivision] = useState({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/divisions');
      setDivisions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching divisions:', error);
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
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDivision({
      name: '',
      code: '',
      description: ''
    });
  };

  const handleChange = (e) => {
    setCurrentDivision({
      ...currentDivision,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:8000/api/divisions/${currentDivision.id}`, currentDivision);
      } else {
        await axios.post('http://localhost:8000/api/divisions', currentDivision);
      }
      fetchDivisions();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving division:', error);
      alert('Error saving division. Please check the form.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this division?')) {
      try {
        await axios.delete(`http://localhost:8000/api/divisions/${id}`);
        fetchDivisions();
      } catch (error) {
        console.error('Error deleting division:', error);
      }
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Divisions</h4>
              <Button
                style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
                onClick={() => handleOpenModal()}
              >
                <Add className="me-1" /> Add Division
              </Button>
            </Card.Header>
            <Card.Body>
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
