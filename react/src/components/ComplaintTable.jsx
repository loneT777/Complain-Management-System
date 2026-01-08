import React from 'react';
import { Table, Spinner, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ComplaintTable = ({ complaints, loading, assignments = {}, onAssign }) => {
  const navigate = useNavigate();

  // Check user role
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const isEngineer = userData?.role_id === 5;
  const isComplainant = userData?.role_id === 4;

  const handleView = (complaint) => {
    navigate(`/complaint/${complaint.id}`);
  };

  const getStatusColor = (statusName) => {
    const colors = {
      Pending: 'secondary',
      Assigned: 'warning',
      Completed: 'success'
    };
    return colors[statusName] || 'secondary';
  };

  const getPriorityColor = (priorityLevel) => {
    const colors = {
      Low: 'success',
      Medium: 'warning',
      Urgent: 'danger',
      'Very Urgent': 'dark'
    };
    return colors[priorityLevel] || 'secondary';
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

  return (
    <Table striped bordered hover responsive className="mt-3">
      <thead>
        <tr>
          <th style={{ width: '3%' }}>ID</th>
          <th style={{ width: '12%' }}>Title</th>
          <th style={{ width: '25%' }}>Description</th>
          <th style={{ width: '10%' }}>Status</th>
          <th style={{ width: '10%' }}>Priority</th>
          <th style={{ width: '20%' }}>Assignment</th>
          <th style={{ width: '20%' }}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {complaints.map((complaint) => (
          <tr
            key={complaint.id}
            style={{
              opacity: complaint.is_reassigned_away ? 0.5 : 1,
              filter: complaint.is_reassigned_away ? 'blur(1px)' : 'none',
              pointerEvents: complaint.is_reassigned_away ? 'none' : 'auto',
              backgroundColor: complaint.is_reassigned_away ? '#f8f9fa' : 'transparent'
            }}
          >
            <td>{complaint.id}</td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {complaint.title}
                {complaint.is_reassigned_away && (
                  <Badge bg="info" style={{ fontSize: '0.7rem' }}>
                    Reassigned
                  </Badge>
                )}
              </div>
            </td>
            <td>{complaint.description}</td>
            <td>
              {complaint.lastStatus ? (
                <Badge bg={getStatusColor(complaint.lastStatus.name)}>{complaint.lastStatus.name}</Badge>
              ) : (
                <Badge bg="secondary">Not Set</Badge>
              )}
            </td>
            <td>
              {complaint.priority_level ? (
                <Badge bg={getPriorityColor(complaint.priority_level)}>{complaint.priority_level}</Badge>
              ) : (
                <Badge bg="secondary">Not Set</Badge>
              )}
            </td>

            <td>
              {(() => {
                const assignment = complaint.assignments?.[0] || assignments[complaint.id];
                if (assignment) {
                  return (
                    <div>
                      <div>
                        <strong>Division:</strong> {assignment.assignee_division?.name || '-'}
                      </div>
                      <div>
                        <strong>Person:</strong> {assignment.assignee_user?.full_name || '-'}
                      </div>
                      <div>
                        <strong>Due:</strong> {assignment.due_at ? new Date(assignment.due_at).toLocaleDateString() : '-'}
                      </div>
                      <div>
                        <strong>Remark:</strong> {assignment.remark || '-'}
                      </div>
                    </div>
                  );
                }
                return <div className="text-muted">No Assignment</div>;
              })()}
            </td>

            <td>
              <div className="d-flex flex-column gap-2">
                <Button
                  style={{ backgroundColor: '#05443cff', borderColor: '#05443cff' }}
                  size="sm"
                  onClick={() => handleView(complaint)}
                  disabled={complaint.is_reassigned_away}
                >
                  View
                </Button>

                <Button
                  style={{ backgroundColor: '#011e1bff', borderColor: '#011e1bff' }}
                  size="sm"
                  onClick={() => onAssign(complaint)}
                  disabled={isEngineer || isComplainant || complaint.is_reassigned_away}
                  title={
                    complaint.is_reassigned_away
                      ? 'Complaint was reassigned'
                      : isEngineer
                        ? 'Engineers cannot assign complaints'
                        : isComplainant
                          ? 'Complainants cannot assign complaints'
                          : 'Assign complaint'
                  }
                >
                  Assign
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
