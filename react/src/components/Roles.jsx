import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Add } from '@mui/icons-material';
import axios from 'axios';
import RoleTable from './RoleTable';
import RoleForm from './RoleForm';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRole, setCurrentRole] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/roles');
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditMode(true);
      setCurrentRole(role);
    } else {
      setEditMode(false);
      setCurrentRole({
        name: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentRole({
      name: '',
      description: ''
    });
  };

  const handleChange = (e) => {
    setCurrentRole({
      ...currentRole,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:8000/api/roles/${currentRole.id}`, currentRole);
      } else {
        await axios.post('http://localhost:8000/api/roles', currentRole);
      }
      fetchRoles();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Error saving role. Please check the form.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await axios.delete(`http://localhost:8000/api/roles/${id}`);
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Roles</h4>
              <Button
                style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
                onClick={() => handleOpenModal()}
              >
                <Add className="me-1" /> Add Role
              </Button>
            </Card.Header>
            <Card.Body>
              <RoleTable
                roles={roles}
                loading={loading}
                handleEdit={handleOpenModal}
                handleDelete={handleDelete}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <RoleForm
        show={showModal}
        handleClose={handleCloseModal}
        role={currentRole}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        editMode={editMode}
      />
    </Container>
  );
};

export default Roles;
