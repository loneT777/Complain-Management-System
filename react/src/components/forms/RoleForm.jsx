import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const RoleForm = ({ show, handleClose, role, handleChange, handleSubmit, editMode }) => {
  return (
    <Modal show={show} onHide={handleClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Edit Role' : 'Add New Role'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Role Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={role.name}
                  onChange={handleChange}
                  placeholder="e.g., Administrator, User, Manager"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={role.description}
                  onChange={handleChange}
                  placeholder="Enter role description"
                />
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

export default RoleForm;
