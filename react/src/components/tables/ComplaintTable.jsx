import React from 'react';
import { Table, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Visibility, Assignment } from '@mui/icons-material';

const ComplaintTable = ({ complaints, loading }) => {
  const navigate = useNavigate();

  const handleView = (complaint) => {
    navigate(`/complaint/${complaint.id}`);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!complaints || complaints.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No complaints found</p>
      </div>
    );
  }

  // If you want priority badges later, keep this placeholder
  const getPriorityBadge = (priority) => {
    const variants = {
      high: "danger",
      medium: "warning",
      low: "success"
    };
    return variants[priority] || "secondary";
  };

  return (
    <Table striped bordered hover responsive className="mt-3">
      <thead>
        <tr>
          <th style={{ width: '5%' }}>ID</th>
          <th style={{ width: '15%' }}>Title</th>
          <th style={{ width: '40%' }}>Description</th>
          <th style={{ width: '20%' }}>Assignment</th>
          <th style={{ width: '20%' }}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {complaints.map((complaint) => (
          <tr key={complaint.id}>
            <td>{complaint.id}</td>
            <td>{complaint.title}</td>
            <td>{complaint.description}</td>

            <td>
              {complaint.assignments && complaint.assignments.length > 0 ? (
                <div>
                  <div><strong>Division:</strong> {complaint.assignments[0].assignee_division?.name || '-'}</div>
                  <div><strong>Person:</strong> {complaint.assignments[0].assignee_user?.full_name || '-'}</div>
                  <div><strong>Due:</strong> {complaint.assignments[0].due_at
                    ? new Date(complaint.assignments[0].due_at).toLocaleDateString()
                    : '-'}</div>
                  <div><strong>Remark:</strong> {complaint.assignments[0].remark || '-'}</div>
                </div>
              ) : (
                <div className="text-muted">No Assignment</div>
              )}
            </td>

            <td>
              <div className="d-flex flex-column gap-2">
                <Button
                  style={{ backgroundColor: '#05443cff', borderColor: '#05443cff' }}
                  size="sm"
                  onClick={() => handleView(complaint)}
                >
                  <Visibility fontSize="small" className="me-1" /> View
                </Button>

                <Button
                  style={{ backgroundColor: '#011e1bff', borderColor: '#011e1bff' }}
                  size="sm"
                  onClick={() => alert('Assign functionality to be implemented')}
                >
                  <Assignment fontSize="small" className="me-1" /> Assign
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ComplaintTable;
