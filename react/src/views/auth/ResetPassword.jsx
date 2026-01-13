import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, Row, Col, Button, Form, InputGroup, Alert } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || '/api';

// assets
import logoDark from 'assets/images/logo-dark.png';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [formData, setFormData] = useState({
    email: emailParam || '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const professionalStyles = `
    .auth-wrapper {
      transition: none;
    }
    .professional-card {
      transition: box-shadow 0.2s ease;
    }
    .professional-card:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
    }
    .password-toggle {
      cursor: pointer;
      transition: color 0.2s ease;
    }
    .password-toggle:hover {
      color: #006666 !important;
    }
  `;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email) {
      setError('Please enter your email address.');
      return;
    }

    if (!formData.password) {
      setError('Please enter a new password.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/reset-password`, {
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        token: token
      });
      
      setSuccess(data.message || 'Your password has been reset successfully!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(' ');
        setError(errorMessages);
      } else {
        setError('An error occurred. Please try again or request a new reset link.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{professionalStyles}</style>
      <div
        className="auth-wrapper"
        style={{
          background: 'linear-gradient(135deg, #003333 0%, #005555 45%, #006666 100%)',
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="auth-content text-center">
          <Card
            className="borderless professional-card"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              maxWidth: '380px',
              margin: '0 auto'
            }}
          >
            <Row className="align-items-center text-center">
              <Col>
                <Card.Body
                  className="card-body"
                  style={{
                    padding: '1.5rem 1.5rem',
                    background: 'transparent'
                  }}
                >
                  <img
                    src={logoDark}
                    alt="Government Logo"
                    className="img-fluid mb-3"
                    style={{
                      maxHeight: '114px',
                      width: 'auto'
                    }}
                  />
                  <h4
                    className="mb-2"
                    style={{
                      color: '#006666',
                      fontWeight: '600',
                      fontSize: '1.6rem'
                    }}
                  >
                    Reset Password
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                    Enter your new password below.
                  </p>

                  {error && (
                    <Alert
                      variant="danger"
                      className="mb-3"
                      style={{
                        fontSize: '0.9rem',
                        borderRadius: '6px'
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert
                      variant="success"
                      className="mb-3"
                      style={{
                        fontSize: '0.9rem',
                        borderRadius: '6px'
                      }}
                    >
                      {success}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <InputGroup className="mb-3">
                      <InputGroup.Text
                        style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          color: '#495057'
                        }}
                      >
                        <FeatherIcon icon="mail" size={18} />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        style={{
                          border: '1px solid #dee2e6',
                          backgroundColor: '#fff',
                          color: '#495057',
                          fontSize: '1rem',
                          padding: '0.65rem'
                        }}
                      />
                    </InputGroup>

                    <InputGroup className="mb-3">
                      <InputGroup.Text
                        style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          color: '#495057'
                        }}
                      >
                        <FeatherIcon icon="lock" size={18} />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter new password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        style={{
                          border: '1px solid #dee2e6',
                          backgroundColor: '#fff',
                          color: '#495057',
                          fontSize: '1rem',
                          padding: '0.65rem'
                        }}
                      />
                      <InputGroup.Text
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          color: '#495057'
                        }}
                      >
                        <FeatherIcon icon={showPassword ? "eye-off" : "eye"} size={18} />
                      </InputGroup.Text>
                    </InputGroup>

                    <InputGroup className="mb-3">
                      <InputGroup.Text
                        style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          color: '#495057'
                        }}
                      >
                        <FeatherIcon icon="lock" size={18} />
                      </InputGroup.Text>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="password_confirmation"
                        placeholder="Confirm new password"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        disabled={isLoading}
                        style={{
                          border: '1px solid #dee2e6',
                          backgroundColor: '#fff',
                          color: '#495057',
                          fontSize: '1rem',
                          padding: '0.65rem'
                        }}
                      />
                      <InputGroup.Text
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          color: '#495057'
                        }}
                      >
                        <FeatherIcon icon={showConfirmPassword ? "eye-off" : "eye"} size={18} />
                      </InputGroup.Text>
                    </InputGroup>

                    <Button
                      type="submit"
                      className="btn btn-block mb-3"
                      disabled={isLoading || !token}
                      style={{
                        backgroundColor: '#006666',
                        borderColor: '#005555',
                        color: 'white',
                        fontWeight: '500',
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.95rem',
                        borderRadius: '6px',
                        width: '100%',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) e.target.style.backgroundColor = '#005555';
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoading) e.target.style.backgroundColor = '#006666';
                      }}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          <em>RESETTING...</em>
                        </>
                      ) : (
                        'RESET PASSWORD'
                      )}
                    </Button>

                    <div className="text-center">
                      <Link 
                        to="/login" 
                        style={{ 
                          fontSize: '0.9rem', 
                          color: '#006666', 
                          textDecoration: 'none',
                          fontWeight: '500'
                        }}
                      >
                        <FeatherIcon icon="arrow-left" size={16} style={{ marginRight: '5px' }} />
                        Back to Login
                      </Link>
                    </div>

                    <p className="text-muted mt-3 mb-2" style={{ fontSize: '0.85rem' }}>
                      © PM Office | Sri Lanka
                    </p>
                  </Form>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </>
  );
}
