import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Add } from '@mui/icons-material';
import axios from 'axios';
import PersonTable from './PersonTable';
import PersonForm from './PersonForm';

const Persons = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPerson, setCurrentPerson] = useState({
    title: '',
    full_name: '',
    nic: '',
    code: '',
    office_phone: '',
    whatsapp: '',
    address: '',
    type: '',
    designation: '',
    remark: ''
  });

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/persons');
      setPersons(response.data);
    } catch (error) {
      console.error('Error fetching persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (person = null) => {
    if (person) {
      setEditMode(true);
      setCurrentPerson(person);
    } else {
      setEditMode(false);
      setCurrentPerson({
        title: '',
        full_name: '',
        nic: '',
        code: '',
        office_phone: '',
        whatsapp: '',
        address: '',
        type: '',
        designation: '',
        remark: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPerson({
      title: '',
      full_name: '',
      nic: '',
      code: '',
      office_phone: '',
      whatsapp: '',
      address: '',
      type: '',
      designation: '',
      remark: ''
    });
  };

  const handleChange = (e) => {
    setCurrentPerson({
      ...currentPerson,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:8000/api/persons/${currentPerson.id}`, currentPerson);
      } else {
        await axios.post('http://localhost:8000/api/persons', currentPerson);
      }
      fetchPersons();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving person:', error);
      alert('Error saving person. Please check the form.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      try {
        await axios.delete(`http://localhost:8000/api/persons/${id}`);
        fetchPersons();
      } catch (error) {
        console.error('Error deleting person:', error);
      }
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Persons</h4>
              <Button
                style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
                onClick={() => handleOpenModal()}
              >
                <Add className="me-1" /> Add Person
              </Button>
            </Card.Header>
            <Card.Body>
              <PersonTable
                persons={persons}
                loading={loading}
                handleEdit={handleOpenModal}
                handleDelete={handleDelete}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <PersonForm
        show={showModal}
        handleClose={handleCloseModal}
        person={currentPerson}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        editMode={editMode}
      />
    </Container>
  );
};

export default Persons;
