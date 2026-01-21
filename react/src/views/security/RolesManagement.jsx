/**
 * RolesManagement Component
 * 
 * This component provides a comprehensive interface for managing system roles.
 * It allows users to view, create, edit, and search roles in the application.
 * 
 * Features:
 * - Display all roles in a table format
 * - Search functionality (minimum 3 characters)
 * - Add new roles with name, code, and description
 * - Edit existing roles
 * - Responsive design with Bootstrap components
 * 
 * @component
 */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Table, InputGroup, FormControl } from 'react-bootstrap';
import { Add, Edit, Search } from '@mui/icons-material';
import axios from '../../utils/axiosConfig';

const RolesManagement = () => {
  // State management for roles data
  const [roles, setRoles] = useState([]); // All roles from the database
  const [filteredRoles, setFilteredRoles] = useState([]); // Filtered roles based on search
  const [loading, setLoading] = useState(false); // Loading state for API calls
  
  // Modal and form state
  const [showModal, setShowModal] = useState(false); // Controls modal visibility
  const [editMode, setEditMode] = useState(false); // Determines if editing or creating
  
  // Search and current role state
  const [searchTerm, setSearchTerm] = useState(''); // Search input value
  const [currentRole, setCurrentRole] = useState({
    name: '',
    code: '',
    description: ''
  }); // Form data for add/edit operations

  /**
   * Fetch all roles on component mount
   */
  useEffect(() => {
    fetchRoles();
  }, []);

  /**
   * Trigger server-side search whenever search term changes
   */
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchRoles();
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  /**
   * Fetches all roles from the API with search parameter
   * Updates both roles and filteredRoles state
   */
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm && searchTerm.length >= 3) {
        params.search = searchTerm;
      }
      const response = await axios.get('/roles', { params });
      setRoles(response.data.data || []);
      setFilteredRoles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens the modal for adding or editing a role
   * @param {Object|null} role - Role object to edit, or null for new role
   */
  const handleOpenModal = (role = null) => {
    if (role) {
      // Edit mode: populate form with existing role data
      setEditMode(true);
      setCurrentRole(role);
    } else {
      // Add mode: reset form to empty values
      setEditMode(false);
      setCurrentRole({
        name: '',
        code: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  /**
   * Closes the modal and resets the form
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentRole({
      name: '',
      code: '',
      description: ''
    });
  };

  /**
   * Handles input changes in the form
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setCurrentRole({
      ...currentRole,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Submits the form to create or update a role
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        // Update existing role
        await axios.put(`/roles/${currentRole.id}`, currentRole);
      } else {
        // Create new role
        await axios.post('/roles', currentRole);
      }
      fetchRoles(); // Refresh the roles list
      handleCloseModal(); // Close the modal
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Error saving role. Please check the form.');
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              {/* Page Header with Title and Add Button */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Roles</h4>
                <Button
                  style={{ backgroundColor: '#7c4dff', borderColor: '#7c4dff' }}
                  onClick={() => handleOpenModal()}
                >
                  <Add style={{ marginRight: '5px' }} /> Add Role
                </Button>
              </div>

              {/* Search Bar */}
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

              {/* Roles Table */}
              {loading ? (
                <div className="text-center py-5">Loading...</div>
              ) : (
                <Table hover responsive>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th>Name</th>
                      <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.length > 0 ? (
                      filteredRoles.map((role) => (
                        <tr key={role.id}>
                          <td>{role.id}</td>
                          <td>{role.name}</td>
                          <td style={{ textAlign: 'right' }}>
                            {/* Edit Button */}
                            <Button
                              style={{ 
                                backgroundColor: '#7c4dff', 
                                borderColor: '#7c4dff',
                                fontSize: '14px',
                                padding: '6px 16px'
                              }}
                              size="sm"
                              onClick={() => handleOpenModal(role)}
                            >
                              <Edit style={{ fontSize: '16px', marginRight: '5px' }} />
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4">
                          {searchTerm.length > 0 && searchTerm.length < 3 
                            ? 'Enter at least 3 characters to search'
                            : 'No roles found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Role Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Role' : 'Add New Role'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Role Name Field */}
            <Form.Group className="mb-3">
              <Form.Label>Role Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentRole.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Role Code Field */}
            <Form.Group className="mb-3">
              <Form.Label>Role Code *</Form.Label>
              <Form.Control
                type="text"
                name="code"
                value={currentRole.code}
                onChange={handleChange}
                placeholder="e.g., ADMIN, USER, MANAGER"
                required
              />
            </Form.Group>

            {/* Description Field */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={currentRole.description}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Form Action Buttons */}
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#7c4dff', borderColor: '#7c4dff' }}
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

export default RolesManagement;
