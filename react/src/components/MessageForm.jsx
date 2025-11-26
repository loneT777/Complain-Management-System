import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const MessageForm = ({ show, handleClose, message, handleChange, handleSubmit, editMode }) => {
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Edit Message' : 'Add Message'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Complaint ID <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              name="complaint_id"
              value={message.complaint_id}
              onChange={handleChange}
              required
              placeholder="Enter complaint ID"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Message <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="message"
              value={message.message}
              onChange={handleChange}
              required
              placeholder="Enter message content"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={message.type}
                  onChange={handleChange}
                >
                  <option value="">None</option>
                  <option value="reply">Reply</option>
                  <option value="update">Update</option>
                  <option value="resolution">Resolution</option>
                  <option value="escalation">Escalation</option>
                  <option value="internal">Internal Note</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Parent Message ID</Form.Label>
                <Form.Control
                  type="number"
                  name="parent_id"
                  value={message.parent_id}
                  onChange={handleChange}
                  placeholder="Optional - for replies"
                />
                <Form.Text className="text-muted">
                  Optional - for replies
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {editMode ? 'Update' : 'Create'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MessageForm;
