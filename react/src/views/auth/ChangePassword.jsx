import { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from '../../utils/axiosConfig';

export default function ChangePassword({ show, onHide }) {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.old_password) {
      errors.old_password = 'Old password is required';
    }
    
    if (!formData.new_password) {
      errors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters';
    }
    
    if (!formData.new_password_confirmation) {
      errors.new_password_confirmation = 'Please confirm your new password';
    } else if (formData.new_password !== formData.new_password_confirmation) {
      errors.new_password_confirmation = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/change-password', formData);
      
      if (response.data.success) {
        setSuccess(response.data.message || 'Password changed successfully!');
        setFormData({
          old_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onHide();
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('Password change error:', err);
      
      if (err.response?.data?.errors) {
        // Handle Laravel validation errors
        setValidationErrors(err.response.data.errors);
        setError('Please fix the errors below');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      old_password: '',
      new_password: '',
      new_password_confirmation: ''
    });
    setError('');
    setSuccess('');
    setValidationErrors({});
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Old Password <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              isInvalid={!!validationErrors.old_password}
              placeholder="Enter your current password"
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.old_password}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Password <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              isInvalid={!!validationErrors.new_password}
              placeholder="Enter new password (min 8 characters)"
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.new_password}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="password"
              name="new_password_confirmation"
              value={formData.new_password_confirmation}
              onChange={handleChange}
              isInvalid={!!validationErrors.new_password_confirmation}
              placeholder="Re-enter new password"
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.new_password_confirmation}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Changing...
            </>
          ) : (
            'Change Password'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
