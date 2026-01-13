import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert, InputGroup, FormControl, Pagination, Badge } from 'react-bootstrap';
import { Save, Search } from '@mui/icons-material';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';

const RolePermissions = () => {
  const { refreshPermissions } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissionMatrix, setPermissionMatrix] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    fetchAllRolePermissions();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, permissions, currentPage]);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/roles');
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/permissions');
      const perms = response.data.data || [];
      setPermissions(perms);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRolePermissions = async () => {
    try {
      const response = await axios.get('/roles-with-permissions');
      const rolesData = response.data.data || [];
      
      // Build a matrix object: { permissionId: { roleId: true/false } }
      const matrix = {};
      rolesData.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(permission => {
            if (!matrix[permission.id]) {
              matrix[permission.id] = {};
            }
            matrix[permission.id][role.id] = true;
          });
        }
      });
      
      setPermissionMatrix(matrix);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
    }
  };

  const handleSearch = () => {
    let filtered = permissions;
    
    if (searchTerm.length >= 3) {
      filtered = permissions.filter(permission =>
        permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Calculate pagination
    const totalItems = filtered.length;
    const pages = Math.ceil(totalItems / perPage);
    setTotalPages(pages);
    
    // Get current page items
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedItems = filtered.slice(startIndex, endIndex);
    
    setFilteredPermissions(paginatedItems);
  };

  const handlePermissionToggle = (permissionId, roleId) => {
    setPermissionMatrix(prev => {
      const newMatrix = { ...prev };
      if (!newMatrix[permissionId]) {
        newMatrix[permissionId] = {};
      }
      newMatrix[permissionId][roleId] = !newMatrix[permissionId]?.[roleId];
      return newMatrix;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Convert matrix to API format
      const updates = [];
      roles.forEach(role => {
        const permissionIds = [];
        Object.keys(permissionMatrix).forEach(permissionId => {
          if (permissionMatrix[permissionId]?.[role.id]) {
            permissionIds.push(parseInt(permissionId));
          }
        });
        updates.push({
          role_id: role.id,
          permission_ids: permissionIds
        });
      });

      // Save all role permissions
      for (const update of updates) {
        await axios.post('/role-permissions', update);
      }

      // Refresh current user's permissions if their role was changed
      await refreshPermissions();

      setMessage({ 
        type: 'success', 
        text: 'All role permissions updated successfully! Permissions refreshed for current session.' 
      });
    } catch (error) {
      console.error('Error saving role permissions:', error);
      setMessage({ type: 'danger', text: 'Error saving role permissions. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const isChecked = (permissionId, roleId) => {
    return permissionMatrix[permissionId]?.[roleId] || false;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // First page
    if (startPage > 1) {
      items.push(
        <Pagination.First key="first" onClick={() => handlePageChange(1)} />
      );
      items.push(
        <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Last page
    if (endPage < totalPages) {
      items.push(
        <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
      );
      items.push(
        <Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} />
      );
    }

    return <Pagination className="justify-content-center mt-3">{items}</Pagination>;
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h3 className="mb-1" style={{ fontWeight: 600, color: '#2c3e50' }}>
                Role & Permissions Management
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                Configure access control and permissions for each role
              </p>
            </div>
            <Button
              style={{ 
                backgroundColor: '#7c4dff', 
                borderColor: '#7c4dff',
                padding: '10px 30px',
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(124, 77, 255, 0.3)'
              }}
              onClick={handleSave}
              disabled={saving}
            >
              <Save style={{ marginRight: '8px', fontSize: '20px' }} /> 
              {saving ? 'Saving Changes...' : 'Save All Changes'}
            </Button>
          </div>
          
          <Alert 
            variant="info" 
            className="mb-4"
            style={{
              backgroundColor: '#e8f4fd',
              border: '1px solid #b3dcf7',
              borderRadius: '8px'
            }}
          >
            <strong>💡 Quick Guide:</strong> Changes made here will reflect immediately for your current session. 
            Other users will see the changes after they refresh the page or log back in.
          </Alert>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Card 
            style={{ 
              border: 'none',
              boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
              borderRadius: '12px'
            }}
          >
            <Card.Body className="p-4">

              {message.text && (
                <Alert 
                  variant={message.type} 
                  dismissible 
                  onClose={() => setMessage({ type: '', text: '' })}
                  style={{ borderRadius: '8px' }}
                >
                  {message.text}
                </Alert>
              )}

              <Row className="mb-4">
                <Col md={6}>
                  <InputGroup 
                    style={{
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <InputGroup.Text 
                      style={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e0e0e0
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading permissions...</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: '8px' }}>
                  <Table hover responsive bordered style={{ marginBottom: 0 }}>
                    <thead style={{ backgroundColor: '#7c4dff' }}>
                      <tr>
                        <th style={{ 
                          minWidth: '250px', 
                          position: 'sticky', 
                          left: 0, 
                          backgroundColor: '#7c4dff', 
                          zIndex: 10,
                          color: '#fff',
                          fontWeight: 600,(permission, index) => (
                          <tr 
                            key={permission.id}
                            style={{ 
                              backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9fb',
                              transition: 'all 0.2s'
                            }}
                          >
                            <td style={{ 
                              position: 'sticky', 
                              left: 0, 
                              backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9fb',
                              zIndex: 5,
                              fontWeight: 500,
                              padding: '14px 16px',
                              borderRight: '2px solid #e0e0e0'
                            }}>
                              <div>
                                <div style={{ color: '#2c3e50', fontSize: '14px' }}>
                                  {permission.name}
                                </div>
                                <small style={{ color: '#999', fontSize: '12px' }}>
                                  {permission.code}
                                </small>
                              </div>
                            </td>
                            {roles.map(role => (
                              <td key={`${permission.id}-${role.id}`} style={{ 
                                textAlign: 'center',
                                padding: '14px 16px',
                                verticalAlign: 'middle'
                              }}>
                                <Form.Check
                                  type="checkbox"
                                  checked={isChecked(permission.id, role.id)}
                                  onChange={() => handlePermissionToggle(permission.id, role.id)}
                                  style={{ 
                                    display: 'inline-block',
                                    cursor: 'pointer'
                                  }}
                                  className="form-check-input-lg"
                                />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={roles.length + 1} className="text-center py-5" style={{ backgroundColor: '#f9f9fb' }}>
                            <div style={{ color: '#999' }}>
                              {searchTerm.length > 0 && searchTerm.length < 3 
                                ? '🔍 Enter at least 3 characters to search'
                                : '📋 No permissions found'}
                            </div>
                    bg="light" 
                    text="dark" 
                    style={{
                      fontSize: '13px',
                      padding: '8px 16px',
                      fontWeight: 500
                    }}
                  >
                    {permissions.length} Total Permissions
                  </Badge>
                </Col>
              </Row>

              
              {/* Bottom Save Button */}
              <div 
                className="mt-4 pt-4" 
                style={{ 
                  borderTop: '2px solid #e0e0e0',
                  textAlign: 'center'
                }}
              >
                <Button
                  size="lg"
                  style={{ 
                    backgroundColor: '#7c4dff', 
                    borderColor: '#7c4dff',
                    padding: '12px 50px',
                    fontWeight: 600,
                    fontSize: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(124, 77, 255, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onClick={handleSave}
                  disabled={saving}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(124, 77, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(124, 77, 255, 0.3)';
                  }}
                >
                  <Save style={{ marginRight: '10px', fontSize: '22px' }} /> 
                  {saving ? 'Saving All Changes...' : 'Save All Changes'}
                </Button>
                <div className="mt-3">
                  <small style={{ color: '#999', fontSize: '13px' }}>
                    💾 Changes will be applied immediately to all roles
                  </small>
                </div>
              </div>
              {loading ? (
                <div className="text-center py-5">Loading...</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <Table hover responsive bordered>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th style={{ minWidth: '200px', position: 'sticky', left: 0, backgroundColor: '#f8f9fa', zIndex: 10 }}>
                          Permission
                        </th>
                        {roles.map(role => (
                          <th key={role.id} style={{ minWidth: '150px', textAlign: 'center' }}>
                            {role.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPermissions.length > 0 ? (
                        filteredPermissions.map(permission => (
                          <tr key={permission.id}>
                            <td style={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 5 }}>
                              {permission.code || permission.name}
                            </td>
                            {roles.map(role => (
                              <td key={`${permission.id}-${role.id}`} style={{ textAlign: 'center' }}>
                                <Form.Check
                                  type="checkbox"
                                  checked={isChecked(permission.id, role.id)}
                                  onChange={() => handlePermissionToggle(permission.id, role.id)}
                                  style={{ display: 'inline-block' }}
                                />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={roles.length + 1} className="text-center py-4">
                            {searchTerm.length > 0 && searchTerm.length < 3 
                              ? 'Enter at least 3 characters to search'
                              : 'No permissions found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {renderPagination()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RolePermissions;
