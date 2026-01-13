import React from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import { Edit, Delete } from '@mui/icons-material';
import { Can } from './PermissionComponents';

const PersonTable = ({ persons, loading, handleEdit, handleDelete }) => {
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
            <th>Title</th>
            <th>Full Name</th>
            <th>NIC</th>
            <th>Code</th>
            <th>Office Phone</th>
            <th>WhatsApp</th>
            <th>Type</th>
            <th>Designation</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {persons.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center text-muted py-4">
                No persons found
              </td>
            </tr>
          ) : (
            persons.map((person) => (
              <tr key={person.id}>
                <td>{person.id}</td>
                <td>{person.title}</td>
                <td>{person.full_name}</td>
                <td>{person.nic}</td>
                <td>{person.code}</td>
                <td>{person.office_phone}</td>
                <td>{person.whatsapp}</td>
                <td>{person.type}</td>
                <td>{person.designation}</td>
                <td className="text-center">
                  <Can permission="setting.update">
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(person)}
                    >
                      <Edit fontSize="small" />
                    </Button>
                  </Can>
                  <Can permission="setting.delete">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(person.id)}
                    >
                      <Delete fontSize="small" />
                    </Button>
                  </Can>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default PersonTable;
