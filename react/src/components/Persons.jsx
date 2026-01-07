import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Add } from '@mui/icons-material';
import axios from '../utils/axiosConfig';
import PersonTable from './PersonTable';
import PersonForm from './PersonForm';

const Persons = () => {
  const [persons, setPersons] = useState([]);
  const [divisions, setDivisions] = useState([]);
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
    remark: '',
    division_id: ''
  });

  useEffect(() => {
    fetchPersons();
    fetchDivisions();
  }, []);

  const fetchPersons = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/persons');
      setPersons(response.data);
    } catch (error) {
      console.error('Error fetching persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await axios.get('/public/divisions');
      setDivisions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching divisions:', error);
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
        remark: '',
        division_id: ''
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
      remark: '',
      division_id: ''
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
        await axios.put(`/persons/${currentPerson.id}`, currentPerson);
      } else {
        await axios.post('/persons', currentPerson);
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
        await axios.delete(`/persons/${id}`);
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
        divisions={divisions}
      />
    </Container>
  );
};

export default Persons;
