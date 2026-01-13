import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const MessageForm = ({ show, handleClose, message, handleChange, handleSubmit, editMode }) => {
  const [complaints, setComplaints] = useState([]);
  const [parentMessages, setParentMessages] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [loadingParentMessages, setLoadingParentMessages] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (show) {
      fetchComplaints();
      setValidationErrors({});
    }
  }, [show]);

  useEffect(() => {
    if (message.complaint_id) {
      fetchParentMessages(message.complaint_id);
    } else {
      setParentMessages([]);
    }
  }, [message.complaint_id, show]);

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const response = await axios.get('/complaints', {
        params: { per_page: 100 }
      });
      console.log('Complaints loaded:', response.data);
      setComplaints(response.data.data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      console.error('Error response:', error.response);
      alert('Failed to load complaints. Please make sure the Laravel server is running on port 8000.');
    } finally {
      setLoadingComplaints(false);
    }
  };

  const fetchParentMessages = async (complaintId) => {
    setLoadingParentMessages(true);
    try {
      const response = await axios.get(`/complaints/${complaintId}/messages`);
      const messages = response.data.data || response.data || [];
      // Ensure messages is always an array
      setParentMessages(Array.isArray(messages) ? messages : []);
    } catch (error) {
      console.error('Error fetching parent messages:', error);
      setParentMessages([]);
    } finally {
      setLoadingParentMessages(false);
    }
  };

  const handleLocalSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    // Client-side validation
    const errors = {};
    if (!message.complaint_id) {
      errors.complaint_id = 'Please select a complaint';
    }
    if (!message.message || message.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long';
    }
    if (message.message && message.message.length > 1000) {
      errors.message = 'Message cannot exceed 1000 characters';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Call parent submit handler
    try {
      await handleSubmit(e);
      setValidationErrors({});
    } catch (error) {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      }
    }
  };

  const getMessageTypeLabel = (type) => {
    const types = {
      initial: 'Initial Complaint',
      reply: 'Reply',
      update: 'Update',
      resolution: 'Resolution',
      escalation: 'Escalation',
      internal: 'Internal Note'
    };
    return types[type] || type;
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Edit Message' : 'Add Message'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleLocalSubmit}>
          {/* Complaint Selection */}
          <Form.Group className="mb-3">
            <Form.Label>
              Complaint <span className="text-danger">*</span>
            </Form.Label>
            {loadingComplaints ? (
              <div className="text-center py-2">
                <Spinner animation="border" size="sm" /> Loading complaints...
              </div>
            ) : (
              <>
                <Form.Select
                  name="complaint_id"
                  value={message.complaint_id || ''}
                  onChange={handleChange}
                  required
                  isInvalid={!!validationErrors.complaint_id}
                  disabled={editMode}
                >
                  <option value="">Select a complaint</option>
                  {complaints.map((complaint) => (
                    <option key={complaint.id} value={complaint.id}>
                      {complaint.reference_no} - {complaint.title}
                    </option>
                  ))}
                </Form.Select>
                {validationErrors.complaint_id && (
                  <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                    {validationErrors.complaint_id[0] || validationErrors.complaint_id}
                  </Form.Control.Feedback>
                )}
                {!editMode && <Form.Text className="text-muted">Select the complaint this message relates to</Form.Text>}
              </>
            )}
          </Form.Group>

          {/* Message Content */}
          <Form.Group className="mb-3">
            <Form.Label>
              Message <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="message"
              value={message.message || ''}
              onChange={handleChange}
              required
              minLength={10}
              maxLength={1000}
              placeholder="Enter your message here... (minimum 10 characters)"
              isInvalid={!!validationErrors.message}
            />
            {validationErrors.message && (
              <Form.Control.Feedback type="invalid">{validationErrors.message[0] || validationErrors.message}</Form.Control.Feedback>
            )}
            <Form.Text className="text-muted">
              {message.message ? `${message.message.length}/1000 characters` : '0/1000 characters'}
            </Form.Text>
          </Form.Group>

          <Row>
            {/* Message Type */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select name="type" value={message.type || ''} onChange={handleChange} isInvalid={!!validationErrors.type}>
                  <option value="">Select type (optional)</option>
                  <option value="initial">Initial Complaint</option>
                  <option value="reply">Reply</option>
                  <option value="update">Update</option>
                  <option value="resolution">Resolution</option>
                  <option value="escalation">Escalation</option>
                  <option value="internal">Internal Note</option>
                </Form.Select>
                {validationErrors.type && (
                  <Form.Control.Feedback type="invalid">{validationErrors.type[0] || validationErrors.type}</Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            {/* Parent Message (for threading) */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Reply To Message</Form.Label>
                {loadingParentMessages ? (
                  <div className="text-center py-2">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  <>
                    <Form.Select
                      name="parent_id"
                      value={message.parent_id || ''}
                      onChange={handleChange}
                      disabled={!message.complaint_id || !Array.isArray(parentMessages) || parentMessages.length === 0}
                      isInvalid={!!validationErrors.parent_id}
                    >
                      <option value="">None (New Thread)</option>
                      {Array.isArray(parentMessages) && parentMessages.map((msg) => (
                        <option key={msg.id} value={msg.id}>
                          #{msg.id} - {getMessageTypeLabel(msg.type)} ({msg.message.substring(0, 50)}...)
                        </option>
                      ))}
                    </Form.Select>
                    {validationErrors.parent_id && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.parent_id[0] || validationErrors.parent_id}
                      </Form.Control.Feedback>
                    )}
                    <Form.Text className="text-muted">
                      {!message.complaint_id
                        ? 'Select a complaint first'
                        : parentMessages.length === 0
                          ? 'No messages available for this complaint'
                          : 'Optional - select to reply to an existing message'}
                    </Form.Text>
                  </>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Validation Error Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <Alert variant="danger" className="mt-3">
              <strong>Please correct the following errors:</strong>
              <ul className="mb-0 mt-2">
                {Object.entries(validationErrors).map(([field, errors]) => (
                  <li key={field}>{Array.isArray(errors) ? errors.join(', ') : errors}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }} onClick={handleLocalSubmit}>
          {editMode ? 'Update' : 'Create'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MessageForm;
