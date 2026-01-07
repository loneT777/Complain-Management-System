import React from 'react';
import { Table, Spinner, Button } from 'react-bootstrap';
import { Edit, Delete } from '@mui/icons-material';

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
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.id}</td>
              <td>{role.name}</td>
              <td>{role.description || '-'}</td>
              <td className="text-center">
                <Button
                  variant="primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(role)}
                >
                  <Edit fontSize="small" />
                </Button>
                {/* <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(role.id)}
                >
                  <Delete fontSize="small" />
                </Button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RoleTable;
