import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Table, Badge, InputGroup, FormControl } from 'react-bootstrap';
import { Add, Edit, Search } from '@mui/icons-material';
import axios from '../../utils/axiosConfig';

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
    handleSearch();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/users');
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

  const handleSearch = () => {
    if (searchTerm.length >= 3) {
      const filtered = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.person?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else if (searchTerm.length === 0) {
      setFilteredUsers(users);
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
        email: '',
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
    <Container fluid className="p-4" style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Row className="mb-4">
        <Col>
          <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Card.Body className="p-4">
              {/* Page Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0" style={{ fontWeight: '600', color: '#1e293b' }}>Users</h4>
                <Button
                  style={{ 
                    backgroundColor: '#6366f1', 
                    borderColor: '#6366f1',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(99,102,241,0.3)',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleOpenModal()}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4f46e5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6366f1'}
                >
                  <Add style={{ marginRight: '5px' }} /> Add User
                </Button>
              </div>

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
                <div style={{ overflowX: 'auto' }}>
                  <Table hover responsive style={{ marginBottom: 0 }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ 
                          width: '60px', 
                          padding: '16px 12px',
                          color: '#64748b',
                          fontWeight: '600',
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>ID</th>
                        <th style={{ 
                          padding: '16px 12px',
                          color: '#64748b',
                          fontWeight: '600',
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Username</th>
                        <th style={{ 
                          padding: '16px 12px',
                          color: '#64748b',
                          fontWeight: '600',
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Name</th>
                        <th style={{ 
                          padding: '16px 12px',
                          color: '#64748b',
                          fontWeight: '600',
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Role</th>
                        <th style={{ 
                          padding: '16px 12px',
                          color: '#64748b',
                          fontWeight: '600',
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Designation</th>
                        <th style={{ 
                          width: '120px',
                          padding: '16px 12px',
                          color: '#64748b',
                          fontWeight: '600',
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Created</th>
                        <th style={{ 
                          width: '240px', 
                          textAlign: 'right',
                          padding: '16px 12px',
                          color: '#64748b',
                          fontWeight: '600',
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 12px', color: '#475569', fontWeight: '500' }}>{user.id}</td>
                            <td style={{ padding: '16px 12px', color: '#475569' }}>{user.username || 'N/A'}</td>
                            <td style={{ padding: '16px 12px', color: '#1e293b', fontWeight: '500' }}>
                              {user.person?.full_name || user.username || 'N/A'}
                            </td>
                            <td style={{ padding: '16px 12px' }}>
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
                            <td style={{ padding: '16px 12px', color: '#64748b' }}>{user.designation || 'N/A'}</td>
                            <td style={{ padding: '16px 12px', color: '#64748b', fontSize: '14px' }}>
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td style={{ textAlign: 'right', padding: '16px 12px' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Button
                                  style={{ 
                                    backgroundColor: '#6366f1', 
                                    borderColor: '#6366f1',
                                    fontSize: '13px',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s',
                                    border: 'none'
                                  }}
                                  size="sm"
                                  onClick={() => handleOpenModal(user)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#4f46e5';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(99, 102, 241, 0.3)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#6366f1';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  <Edit style={{ fontSize: '16px' }} />
                                  Edit
                                </Button>
                                <Button
                                  style={{ 
                                    backgroundColor: '#ef4444', 
                                    borderColor: '#ef4444',
                                    fontSize: '13px',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    border: 'none'
                                  }}
                                  size="sm"
                                  onClick={() => handleDeactivate(user.id)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#dc2626';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.3)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ef4444';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  Deactivate
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-5" style={{ color: '#94a3b8' }}>
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
            {/* Username */}
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#374151', fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>
                Username
              </Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={currentUser.username}
                onChange={handleChange}
                placeholder="Enter username"
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
                Minimum 8 characters with at least: 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)
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
                  backgroundColor: '#6366f1', 
                  borderColor: '#6366f1',
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
