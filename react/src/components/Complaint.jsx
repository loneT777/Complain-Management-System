import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Tab, Tabs } from 'react-bootstrap';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const Complaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/complaints/${id}`);
      setComplaint(response.data);
    } catch (error) {
      console.error('Error fetching complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate('/complaints', { state: { editComplaint: complaint } });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await axios.delete(`http://localhost:8000/api/complaints/${id}`);
        navigate('/complaints');
      } catch (error) {
        console.error('Error deleting complaint:', error);
        alert('Error deleting complaint');
      }
    }
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      Low: 'secondary',
      Medium: 'info',
      High: 'warning',
      Urgent: 'danger'
    };
    return <Badge bg={variants[priority] || 'secondary'}>{priority || 'N/A'}</Badge>;
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">Loading complaint details...</p>
        </div>
      </Container>
    );
  }

  if (!complaint) {
    return (
      <Container fluid className="p-4">
        <Card>
          <Card.Body>
            <p className="text-muted text-center">Complaint not found</p>
            <div className="text-center">
              <Button variant="primary" onClick={() => navigate('/complaints')}>
                Back to Complaints
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-3"
                onClick={() => navigate('/complaints')}
              >
                <ArrowBack fontSize="small" className="me-1" /> Back
              </Button>
              <h4 className="mb-0">Complaint Details - {complaint.reference_no}</h4>
            </div>

            <div>
              <Button
                variant="outline-primary"
                size="sm"
                className="me-2"
                onClick={handleEdit}
              >
                <Edit fontSize="small" className="me-1" /> Edit
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleDelete}
              >
                <Delete fontSize="small" className="me-1" /> Delete
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* LEFT SIDE */}
        <Col lg={8}>
          {/* Complaint Info */}
          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Complaint Information</h5></Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Reference No:</strong>
                  <p className="text-primary">{complaint.reference_no}</p>
                </Col>
                <Col md={6}>
                  <strong>Status:</strong>
                  <p>{complaint.last_status?.name || 'New'}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col><strong>Title:</strong><p>{complaint.title}</p></Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <strong>Description:</strong>
                  <p className="text-muted">{complaint.description}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}><strong>Channel:</strong><p>{complaint.channel || 'N/A'}</p></Col>
                <Col md={6}><strong>Priority:</strong><p>{getPriorityBadge(complaint.priority_level)}</p></Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}><strong>Confidentiality:</strong><p>{complaint.confidentiality_level || 'N/A'}</p></Col>
                <Col md={6}><strong>Due Date:</strong><p>{complaint.due_at ? new Date(complaint.due_at).toLocaleDateString() : 'N/A'}</p></Col>
              </Row>

              {complaint.remark && (
                <Row><Col><strong>Remarks:</strong><p className="text-muted">{complaint.remark}</p></Col></Row>
              )}
            </Card.Body>
          </Card>

          {/* TABS */}
          <Card className="mb-4">
            <Card.Body>
              <Tabs defaultActiveKey="messages">
                <Tab eventKey="messages" title="Messages">
                  <div className="py-4 text-muted text-center">
                    {complaint.messages?.length ? (
                      complaint.messages.map(msg => (
                        <div key={msg.id} className="mb-3 p-3 border rounded text-start">
                          <p>{msg.message}</p>
                          <small>{new Date(msg.created_at).toLocaleString()}</small>
                        </div>
                      ))
                    ) : (
                      <p>No messages yet</p>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="attachments" title="Attachments">
                  <div className="py-4 text-muted text-center">
                    {complaint.attachments?.length ? (
                      <ul className="list-unstyled">
                        {complaint.attachments.map(att => (
                          <li key={att.id}>📎 {att.file_name}</li>
                        ))}
                      </ul>
                    ) : <p>No attachments</p>}
                  </div>
                </Tab>

                <Tab eventKey="logs" title="Activity Log">
                  <div className="py-4 text-muted text-center">
                    {complaint.logs?.length ? (
                      complaint.logs.map(log => (
                        <div key={log.id} className="mb-3 p-3 border rounded text-start">
                          <strong>{log.action}</strong>
                          <br />
                          <small>{new Date(log.created_at).toLocaleString()}</small>
                        </div>
                      ))
                    ) : <p>No logs yet</p>}
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT SIDE */}
        <Col lg={4}>
          {/* Complainant */}
          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Complainant Details</h5></Card.Header>
            <Card.Body>
              <p><strong>Name:</strong> {complaint.complainant_name || complaint.complainant?.full_name || 'N/A'}</p>
              <p><strong>Phone:</strong> {complaint.complainant_phone || complaint.complainant?.office_phone || 'N/A'}</p>

              {complaint.complainant?.email && <p><strong>Email:</strong> {complaint.complainant.email}</p>}
              {complaint.complainant?.address && <p><strong>Address:</strong> {complaint.complainant.address}</p>}
            </Card.Body>
          </Card>

          {/* Timeline */}
          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Timeline</h5></Card.Header>
            <Card.Body>
              <p><strong>Created:</strong> {new Date(complaint.created_at).toLocaleString()}</p>
              {complaint.received_at && <p><strong>Received:</strong> {new Date(complaint.received_at).toLocaleString()}</p>}
              <p><strong>Updated:</strong> {new Date(complaint.updated_at).toLocaleString()}</p>

              {complaint.user_received && (
                <p><strong>Received By:</strong> {complaint.user_received.full_name}</p>
              )}
            </Card.Body>
          </Card>

          {/* Assignments */}
          {complaint.assignments?.length > 0 && (
            <Card className="mb-4">
              <Card.Header><h5 className="mb-0">Assignments</h5></Card.Header>
              <Card.Body>
                {complaint.assignments.map(assign => (
                  <div key={assign.id} className="mb-3 pb-3 border-bottom">
                    <p><strong>Assignee:</strong> {assign.assignee_user?.full_name}</p>
                    <p><strong>Division:</strong> {assign.assignee_division?.name}</p>
                    <small>Due: {assign.due_at ? new Date(assign.due_at).toLocaleDateString() : 'N/A'}</small>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Complaint;
