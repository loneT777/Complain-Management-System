import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
const API_URL = import.meta.env.VITE_API_URL || '/api';

// assets
import logoDark from 'assets/images/logo-dark.png';

export default function SignIn1() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    remember: false
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load reCAPTCHA
  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard/summary');
    }
  }, [navigate]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials({
      ...credentials,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const checkLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!credentials.username && !credentials.password) {
      setError('Please enter both username and password.');
      return;
    }
    if (!credentials.username) {
      setError('Please enter your username.');
      return;
    }
    if (!credentials.password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/login`, {
        username: credentials.username,
        password: credentials.password
      });

      const { token, user, session_id, permissions } = data;

      // Use AuthContext login
      authLogin(user, permissions, token);
      localStorage.setItem('sessionId', session_id);

      navigate('/dashboard/summary');
    } catch (err) {
      console.error('Login error:', err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid username or password. Please try again.');
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
                    className="mb-3"
                    style={{
                      color: '#006666',
                      fontWeight: '600',
                      fontSize: '1.6rem'
                    }}
                  >
                    CMS
                  </h4>

                  {error && (
                    <div
                      className="alert alert-danger mb-3"
                      style={{
                        backgroundColor: '#f8d7da',
                        borderColor: '#f5c6cb',
                        color: '#721c24',
                        fontSize: '0.9rem',
                        border: '1px solid #f5c6cb',
                        borderRadius: '6px'
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <Form onSubmit={checkLogin}>
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
                        type="text"
                        name="username"
                        placeholder="Enter your username"
                        value={credentials.username}
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
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={credentials.password}
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

                    <div className="mb-3 text-end">
                      <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: '#006666', textDecoration: 'none' }}>
                        Forgot password?
                      </Link>
                    </div>

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
                          <em>SIGNING IN...</em>
                        </>
                      ) : (
                        'SIGN IN'
                      )}
                    </Button>

                    <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
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
