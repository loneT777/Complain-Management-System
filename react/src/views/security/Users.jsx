import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Table, Badge, InputGroup, FormControl } from 'react-bootstrap';
import { Add, Edit, Search } from '@mui/icons-material';
import axios from '../../utils/axiosConfig';
import { Can } from '../../components/PermissionComponents';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState({
    full_name: '',
    username: '',
    password: '',
    role_id: '',
    designation: '',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm && searchTerm.length >= 3) {
        params.search = searchTerm;
      }
      const response = await axios.get('/users', { params });
      setUsers(response.data.data || []);
      setFilteredUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/roles');
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditMode(true);
      setCurrentUser({
        id: user.id,
        full_name: user.person?.full_name || user.full_name || '',
        username: user.username || '',
        password: '',
        role_id: user.role_id || '',
        designation: user.designation || '',
        is_active: user.is_active !== undefined ? user.is_active : true
      });
    } else {
      setEditMode(false);
      setCurrentUser({
        full_name: '',
        username: '',
        password: '',
        role_id: '',
        designation: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentUser({
      full_name: '',
      username: '',
      password: '',
      role_id: '',
      designation: '',
      is_active: true
    });
  };

  const handleDeactivate = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        const response = await axios.put(`/users/${userId}`, { is_active: false });
        alert(response.data.message || 'User deactivated successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deactivating user:', error);
        if (error.response?.data?.message) {
          alert('Error: ' + error.response.data.message);
        } else {
          alert('Error deactivating user. Please try again.');
        }
      }
    }
  };

  const handleActivate = async (userId) => {
    if (window.confirm('Are you sure you want to activate this user?')) {
      try {
        const response = await axios.put(`/users/${userId}`, { is_active: true });
        alert(response.data.message || 'User activated successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error activating user:', error);
        if (error.response?.data?.message) {
          alert('Error: ' + error.response.data.message);
        } else {
          alert('Error activating user. Please try again.');
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setCurrentUser(prevUser => ({
      ...prevUser,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const updateData = { ...currentUser };
        if (!updateData.password || updateData.password.trim() === '') {
          delete updateData.password; // Don't update password if not provided
        }
        const response = await axios.put(`/users/${currentUser.id}`, updateData);
        alert(response.data.message || 'User updated successfully');
      } else {
        const response = await axios.post('/users', currentUser);
        alert(response.data.message || 'User created successfully');
      }
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      if (error.response?.data?.message) {
        alert('Error: ' + error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat().join('\n');
        alert('Validation errors:\n' + errors);
      } else {
        alert('Error saving user. Please check the form and try again.');
      }
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">USERS</h4>
              <Can permission="security.create">
                <Button
                  style={{ 
                    backgroundColor: '#3a4c4a', 
                    borderColor: '#3a4c4a'
                  }}
                  onClick={() => handleOpenModal()}
                >
                  <Add style={{ marginRight: '5px' }} /> Add User
                </Button>
              </Can>
            </Card.Header>
            <Card.Body>

              {/* Search Bar */}
              <Row className="mb-4">
                <Col md={6}>
                  <InputGroup style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <InputGroup.Text style={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRight: 'none'
                    }}>
                      <Search style={{ color: '#94a3b8' }} />
                    </InputGroup.Text>
                    <FormControl
                      placeholder="Search: Min 3 characters"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderLeft: 'none',
                        padding: '12px'
                      }}
                    />
                  </InputGroup>
                </Col>
              </Row>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Designation</th>
                        <th>Created</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                          <tr key={user.id}>
                            <td>{index + 1}</td>
                            <td>{user.username || 'N/A'}</td>
                            <td>{user.person?.full_name || user.username || 'N/A'}</td>
                            <td>
                              <span style={{
                                backgroundColor: '#e0e7ff',
                                color: '#4338ca',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '500'
                              }}>
                                {user.role?.name || 'N/A'}
                              </span>
                            </td>
                            <td>{user.designation || 'N/A'}</td>
                            <td>
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                <Can permission="security.update">
                                  <Button
                                    style={{ 
                                      backgroundColor: '#3a4c4a', 
                                      borderColor: '#3a4c4a'
                                    }}
                                    size="sm"
                                    onClick={() => handleOpenModal(user)}
                                  >
                                    <Edit fontSize="small" />
                                  </Button>
                                </Can>
                                <Can permission="security.delete">
                                  {user.is_active ? (
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleDeactivate(user.id)}
                                    >
                                      Deactivate
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleActivate(user.id)}
                                    >
                                      Activate
                                    </Button>
                                  )}
                                </Can>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-4">
                            {searchTerm.length > 0 && searchTerm.length < 3 
                              ? 'Enter at least 3 characters to search'
                              : 'No users found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Form Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        centered 
        backdrop="static"
        style={{ zIndex: 9999 }}
      >
        <Modal.Header 
          closeButton 
          style={{ 
            borderBottom: '1px solid #e5e7eb', 
            padding: '20px 24px',
            backgroundColor: '#fff',
            position: 'relative',
            zIndex: 10000
          }}
        >
          <Modal.Title style={{ color: '#111827', fontWeight: '600', fontSize: '18px' }}>
            {editMode ? 'Edit User' : 'Create User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px', backgroundColor: '#fff' }}>
          <Form onSubmit={handleSubmit}>
            {/* Username (Email) */}
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#374151', fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>
                Username (Email)
              </Form.Label>
              <Form.Control
                type="email"
                name="username"
                value={currentUser.username}
                onChange={handleChange}
                placeholder="Enter email address"
                required
                style={{ 
                  padding: '12px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              />
              <Form.Text style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', display: 'block' }}>
                Use email address as username
              </Form.Text>
            </Form.Group>

            {/* Full Name */}
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#374151', fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>
                Full Name
              </Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={currentUser.full_name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                style={{ 
                  padding: '12px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              />
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#374151', fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>
                Password
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={currentUser.password}
                onChange={handleChange}
                placeholder="Enter password"
                required={!editMode}
                style={{ 
                  padding: '12px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              />
              <Form.Text style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', display: 'block' }}>
                {editMode ? 'Leave blank to keep current password. ' : ''}Minimum 8 characters
              </Form.Text>
            </Form.Group>

            {/* Role */}
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#374151', fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>
                Role
              </Form.Label>
              <Form.Select
                name="role_id"
                value={currentUser.role_id}
                onChange={handleChange}
                required
                style={{ 
                  padding: '12px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: currentUser.role_id ? '#111827' : '#6b7280'
                }}
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id} style={{ color: '#111827' }}>
                    {role.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Designation */}
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#374151', fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>
                Designation
              </Form.Label>
              <Form.Control
                type="text"
                name="designation"
                value={currentUser.designation}
                onChange={handleChange}
                placeholder="Select a designation"
                style={{ 
                  padding: '12px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              />
            </Form.Group>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-3" style={{ marginTop: '24px' }}>
              <Button 
                variant="secondary" 
                onClick={handleCloseModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  backgroundColor: '#6b7280',
                  borderColor: '#6b7280',
                  color: '#fff',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: '700' }}>×</span>
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ 
                  backgroundColor: '#006666', 
                  borderColor: '#006666',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Add style={{ fontSize: '18px' }} />
                {editMode ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Users;
