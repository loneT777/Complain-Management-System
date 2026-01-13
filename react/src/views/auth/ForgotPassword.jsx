import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Button, Form, InputGroup, Alert } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || '/api';

// assets
import logoDark from 'assets/images/logo-dark.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
  `;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/forgot-password`, { email });
      
      setSuccess(data.message || 'Password reset link has been sent to your email address. Please check your inbox.');
      setEmail('');
    } catch (err) {
      console.error('Forgot password error:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred. Please try again later.');
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
                    Forgot Password?
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                    Enter your email address and we'll send you a link to reset your password.
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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

                    <Button
                      type="submit"
                      className="btn btn-block mb-3"
                      disabled={isLoading}
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
                          <em>SENDING...</em>
                        </>
                      ) : (
                        'SEND RESET LINK'
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
