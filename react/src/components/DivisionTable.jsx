import React from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import { Edit, Delete } from '@mui/icons-material';

const DivisionTable = ({ divisions, loading, handleEdit, handleDelete }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Division Name</th>
            <th>Code</th>
            <th>Description</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {divisions.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center text-muted py-4">
                No divisions found
              </td>
            </tr>
          ) : (
            divisions.map((division) => (
              <tr key={division.id}>
                <td>{division.id}</td>
                <td>{division.name}</td>
                <td>{division.code}</td>
                <td>{division.description}</td>
                <td className="text-center">
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(division)}
                  >
                    <Edit fontSize="small" />
                  </Button>
                  {/* <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(division.id)}
                  >
                    <Delete fontSize="small" />
                  </Button> */}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default DivisionTable;
