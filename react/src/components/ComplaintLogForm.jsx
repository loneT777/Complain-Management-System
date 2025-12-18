import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const ComplaintLogForm = ({ show, onClose, complaintId, log, onSuccess }) => {
  const [formData, setFormData] = useState({
    action: '',
    remark: ''
  });
  const [statuses, setStatuses] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      if (log) {
        setFormData({
          action: log.action || '',
          remark: log.remark || ''
        });
      } else {
        setFormData({ action: '', remark: '' });
      }
    }
  }, [show, log]);

  const fetchDropdownData = async () => {
    try {
      const [statusRes, personRes] = await Promise.all([
        axios.get('http://localhost:8000/api/statuses'),
        axios.get('http://localhost:8000/api/persons')
      ]);
      setStatuses(statusRes.data);
      setPersons(personRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        action: formData.action,
        remark: formData.remark || null
      };

      if (log) {
        // Update existing log
        await axios.put(`http://localhost:8000/api/complaint-logs/${log.id}`, payload);
      } else {
        // Create new log
        await axios.post('http://localhost:8000/api/complaint-logs', {
          ...payload,
          complaint_id: complaintId
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving log:', error.response?.data || error.message);
      alert('Error saving complaint log: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{log ? 'Edit Complaint Log' : 'Add Complaint Log'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Action *</Form.Label>
            <Form.Control
              type="text"
              name="action"
              value={formData.action}
              onChange={handleChange}
              placeholder="e.g., Update, Review, In Progress"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              placeholder="Enter description"
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : log ? 'Update' : 'Add'}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ComplaintLogForm;
