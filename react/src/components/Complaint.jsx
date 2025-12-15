import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Tab, Tabs, Alert, Table } from 'react-bootstrap';
import { ArrowBack, Edit, AttachFile, Message, Person, AccessTime, Download, Visibility } from '@mui/icons-material';
import axios from 'axios';

const Complaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  useEffect(() => {
    if (id) {
      fetchComplaint();
      fetchMessages();
      fetchAttachments();
    }
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

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/complaints/${id}/messages`);
      const messagesData = response.data.data || response.data || [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchAttachments = async () => {
    setLoadingAttachments(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/complaints/${id}/attachments`);
      const attachmentsData = response.data.data || response.data || [];
      setAttachments(Array.isArray(attachmentsData) ? attachmentsData : []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleDownload = async (attachmentId, fileName) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/attachments/${attachmentId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleView = (attachmentId) => {
    window.open(`http://localhost:8000/api/attachments/${attachmentId}/view`, '_blank');
  };

  const handleEdit = () => {
    navigate(`/edit-complaint/${id}`);
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

  const getMessageTypeBadge = (type) => {
    const typeConfig = {
      'initial': { bg: 'primary', label: 'Initial Complaint', icon: '📝' },
      'reply': { bg: 'success', label: 'Reply', icon: '💬' },
      'update': { bg: 'info', label: 'Update', icon: '🔄' },
      'resolution': { bg: 'warning', label: 'Resolution', icon: '✅' },
      'closed': { bg: 'secondary', label: 'Closed', icon: '🔒' },
      'escalation': { bg: 'danger', label: 'Escalation', icon: '⚠️' },
      'internal_note': { bg: 'dark', label: 'Internal Note', icon: '📌' },
      'follow_up': { bg: 'info', label: 'Follow-up', icon: '🔔' }
    };

    const config = typeConfig[type?.toLowerCase()] || { bg: 'light', label: type || 'Message', icon: '💬' };
    
    return (
      <Badge bg={config.bg} className="me-2">
        <span className="me-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
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
              <h4 className="mb-0">Complaint Details - {complaint.reference_no}</h4>
            </div>

            <div>
              <Button
                style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
                size="sm"
                onClick={handleEdit}
              >
                <Edit fontSize="small" className="me-1" /> Edit
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
                <Tab eventKey="messages" title={`Messages (${messages.length})`}>
                  <div className="py-4">
                    {loadingMessages ? (
                      <div className="text-center">
                        <Spinner animation="border" size="sm" />
                        <p className="text-muted mt-2">Loading messages...</p>
                      </div>
                    ) : messages.length > 0 ? (
                      <>
                        <Alert variant="info" className="mb-3">
                          <Message className="me-2" />
                          <strong>Total Messages:</strong> {messages.length}
                        </Alert>
                        <div className="messages-list">
                          {messages.map((msg, index) => (
                            <Card key={msg.id} className="mb-3 shadow-sm" style={{ borderLeft: `4px solid ${
                              msg.type === 'initial' ? '#0d6efd' : 
                              msg.type === 'reply' ? '#198754' : 
                              msg.type === 'update' ? '#0dcaf0' : 
                              msg.type === 'escalation' ? '#dc3545' : '#6c757d'
                            }` }}>
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div className="d-flex align-items-center flex-wrap">
                                    <Person className="me-2 text-primary" />
                                    <strong className="me-2">{msg.sender?.full_name || msg.sender_name || 'System'}</strong>
                                    {msg.type && getMessageTypeBadge(msg.type)}
                                  </div>
                                  <Badge bg="secondary" className="d-flex align-items-center">
                                    <AccessTime fontSize="small" className="me-1" />
                                    {new Date(msg.created_at).toLocaleString()}
                                  </Badge>
                                </div>
                                <div className="ms-4">
                                  <p className="mb-2">{msg.message}</p>
                                  {msg.parent_id && (
                                    <small className="text-muted">
                                      <i className="bi bi-reply-fill me-1"></i>
                                      Reply to message #{msg.parent_id}
                                    </small>
                                  )}
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted py-4">
                        <Message style={{ fontSize: 48, opacity: 0.3 }} />
                        <p className="mt-3">No messages yet</p>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="attachments" title={`Attachments (${attachments.length})`}>
                  <div className="py-4">
                    {loadingAttachments ? (
                      <div className="text-center">
                        <Spinner animation="border" size="sm" />
                        <p className="text-muted mt-2">Loading attachments...</p>
                      </div>
                    ) : attachments.length > 0 ? (
                      <>
                        <Alert variant="info" className="mb-3">
                          <AttachFile className="me-2" />
                          <strong>Total Attachments:</strong> {attachments.length} file(s)
                        </Alert>
                        <Table hover responsive className="mb-0">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>File Name</th>
                              <th>Type</th>
                              <th>Size</th>
                              <th>Uploaded</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attachments.map((att, index) => (
                              <tr key={att.id}>
                                <td>{index + 1}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <AttachFile className="me-2 text-muted" fontSize="small" />
                                    <strong>{att.file_name}</strong>
                                  </div>
                                  {att.description && (
                                    <small className="text-muted d-block ms-4">{att.description}</small>
                                  )}
                                </td>
                                <td>
                                  <Badge bg="light" text="dark">{att.file_type || 'N/A'}</Badge>
                                </td>
                                <td>{att.file_size ? `${(att.file_size / 1024).toFixed(2)} KB` : 'N/A'}</td>
                                <td>
                                  <small>{new Date(att.created_at).toLocaleDateString()}</small>
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline-primary"
                                      onClick={() => handleView(att.id)}
                                      title="View"
                                    >
                                      <Visibility fontSize="small" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline-success"
                                      onClick={() => handleDownload(att.id, att.file_name)}
                                      title="Download"
                                    >
                                      <Download fontSize="small" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </>
                    ) : (
                      <div className="text-center text-muted py-4">
                        <AttachFile style={{ fontSize: 48, opacity: 0.3 }} />
                        <p className="mt-3">No attachments</p>
                      </div>
                    )}
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
