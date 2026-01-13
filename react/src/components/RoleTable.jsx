import React from 'react';
import { Table, Spinner, Button } from 'react-bootstrap';
import { Edit, Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { Can } from './PermissionComponents';

const RoleTable = ({ roles, loading, handleEdit, handleDelete }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No roles found</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role, index) => (
            <tr key={role.id}>
              <td>{index + 1}</td>
              <td>{role.name}</td>
              <td>{role.description || '-'}</td>
              <td className="text-center">
                <Can permission="security.update">
                  <Button
                    style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(role)}
                  >
                    <Edit fontSize="small" />
                  </Button>
                </Can>
                {/* <Can permission="security.delete">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDelete(role.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Can> */}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RoleTable;