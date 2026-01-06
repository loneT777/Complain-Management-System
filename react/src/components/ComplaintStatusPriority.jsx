import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, Dropdown, Alert } from 'react-bootstrap';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const ComplaintStatusPriority = ({ complaintId, complaint, onUpdate }) => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const statusRes = await axios.get(`${API_URL}/complaint-statuses`);
      setStatuses(statusRes.data);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const handleStatusChange = async (statusId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.put(`${API_URL}/complaints/${complaintId}/status`, {
        status_id: statusId,
        remark: 'Status updated from complaint view'
      });
      setSuccess('Status updated successfully');
      if (onUpdate) {
        onUpdate(response.data.data);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusName) => {
    const colors = {
      'Pending': 'secondary',
      'Assigned': 'warning',
      'Completed': 'success'
    };
    return colors[statusName] || 'secondary';
  };

  return (
    <Card className="mb-3">
      <Card.Header className="bg-light">
        <h5 className="mb-0">Complaint Status</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        {success && <Alert variant="success" className="mb-3">{success}</Alert>}

        <Row className="mb-4">
          <Col md={6}>
            <div className="mb-3">
              <h6 className="mb-2">Current Status</h6>
              <div className="d-flex align-items-center gap-2 mb-2">
                {complaint?.lastStatus ? (
                  <Badge bg={getStatusColor(complaint.lastStatus.name)}>
                    {complaint.lastStatus.name}
                  </Badge>
                ) : (
                  <Badge bg="secondary">Not Set</Badge>
                )}
              </div>
              <Dropdown>
                <Dropdown.Toggle 
                  variant="outline-primary" 
                  size="sm" 
                  disabled={loading}
                >
                  Change Status
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {statuses.map((status) => (
                    <Dropdown.Item
                      key={status.id}
                      onClick={() => handleStatusChange(status.id)}
                    >
                      {status.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ComplaintStatusPriority;
