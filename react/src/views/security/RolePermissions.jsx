import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert, InputGroup, FormControl, Pagination } from 'react-bootstrap';
import { Save, Search, Refresh } from '@mui/icons-material';
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
      <Row className="mb-3">
        <Col>
          <Alert variant="info" className="mb-0">
            <strong>How it works:</strong> Changes made here will reflect immediately for your current session. 
            Other users will see the changes after they refresh the page or log back in.
          </Alert>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Role Permissions</h4>
                <div>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      fetchAllRolePermissions();
                      setMessage({ type: 'info', text: 'Permissions reloaded from database' });
                    }}
                    className="me-2"
                  >
                    <Refresh style={{ marginRight: '5px' }} /> Reload
                  </Button>
                  <Button
                    style={{ backgroundColor: '#7c4dff', borderColor: '#7c4dff' }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save style={{ marginRight: '5px' }} /> {saving ? 'Saving...' : 'Save All'}
                  </Button>
                </div>
              </div>

              {message.text && (
                <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
                  {message.text}
                </Alert>
              )}

              <Row className="mb-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text style={{ backgroundColor: '#f5f5f5', border: 'none' }}>
                      <Search style={{ color: '#999' }} />
                    </InputGroup.Text>
                    <FormControl
                      placeholder="Search Permissions: Min 3 characters"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ backgroundColor: '#f5f5f5', border: 'none' }}
                    />
                  </InputGroup>
                </Col>
              </Row>

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
