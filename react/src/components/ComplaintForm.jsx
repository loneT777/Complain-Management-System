import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const ComplaintForm = ({ show, handleClose, complaint, handleChange, handleSubmit, editMode }) => {
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Edit Complaint' : 'Add New Complaint'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={complaint.title}
                  onChange={handleChange}
                  placeholder="Enter complaint title"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Description <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={complaint.description}
                  onChange={handleChange}
                  placeholder="Enter detailed description"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Complainant Name</Form.Label>
                <Form.Control
                  type="text"
                  name="complainant_name"
                  value={complaint.complainant_name}
                  onChange={handleChange}
                  placeholder="Enter complainant name"
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Complainant Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="complainant_phone"
                  value={complaint.complainant_phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Channel</Form.Label>
                <Form.Select
                  name="channel"
                  value={complaint.channel}
                  onChange={handleChange}
                >
                  <option value="">Select channel</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Online Portal">Online Portal</option>
                  <option value="Letter">Letter</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Priority Level</Form.Label>
                <Form.Select
                  name="priority_level"
                  value={complaint.priority_level}
                  onChange={handleChange}
                >
                  <option value="">Select priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ComplaintForm;
