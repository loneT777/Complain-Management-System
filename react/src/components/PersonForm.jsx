import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const PersonForm = ({ show, handleClose, person, handleChange, handleSubmit, editMode }) => {
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Edit Person' : 'Add Person'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={person.title}
                  onChange={handleChange}
                  placeholder="Mr./Ms./Dr."
                />
              </Form.Group>
            </Col>
            <Col md={9}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  value={person.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>NIC <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="nic"
                  value={person.nic}
                  onChange={handleChange}
                  required
                  placeholder="Enter NIC number"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Code</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={person.code}
                  onChange={handleChange}
                  placeholder="Enter code"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Office Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="office_phone"
                  value={person.office_phone}
                  onChange={handleChange}
                  placeholder="Enter office phone"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>WhatsApp</Form.Label>
                <Form.Control
                  type="text"
                  name="whatsapp"
                  value={person.whatsapp}
                  onChange={handleChange}
                  placeholder="Enter WhatsApp number"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="address"
              value={person.address}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Control
                  type="text"
                  name="type"
                  value={person.type}
                  onChange={handleChange}
                  placeholder="Enter type"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Designation</Form.Label>
                <Form.Control
                  type="text"
                  name="designation"
                  value={person.designation}
                  onChange={handleChange}
                  placeholder="Enter designation"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Remark</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="remark"
              value={person.remark}
              onChange={handleChange}
              placeholder="Enter remark"
            />
          </Form.Group>
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

export default PersonForm;
