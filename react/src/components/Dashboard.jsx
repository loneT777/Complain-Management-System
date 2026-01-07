import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PRIORITY_COLORS = {
    'low': '#4CAF50',
    'medium': '#FFC107',
    'urgent': '#FF9800',
    'very_urgent': '#F44336'
  };

  const STATUS_COLORS = {
    'pending': '#2196F3',
    'assigned': '#9C27B0',
    'completed': '#4CAF50'
  };

  useEffect(() => {
    fetchDashboardStats();
    
    // Refresh dashboard when window gains focus (user returns from another page)
    const handleFocus = () => {
      fetchDashboardStats();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [location]); // Re-fetch when location changes (navigating back to dashboard)

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/dashboard-stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12,
            family: 'inherit'
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const sum = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / sum) * 100);
            return label + ': ' + value + ' (' + percentage + '%)';
          }
        }
      }
    }
  });

  if (loading) {
    return (
      <div className="dashboard-container mt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container mt-5">
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-container mt-5">
        <Alert variant="warning">No data available</Alert>
      </div>
    );
  }

  return (
    <div className="dashboard-container py-4">


      {/* Key Metrics Cards - Status */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="metric-card metric-card-total">
            <Card.Body>
              <div className="metric-header">
                <h6 className="metric-label">Total Complaints</h6>
              </div>
              <h2 className="metric-value">{stats.total_complaints}</h2>
              <p className="metric-description">All time complaints</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="metric-card metric-card-open">
            <Card.Body>
              <div className="metric-header">
                <h6 className="metric-label">Pending</h6>
              </div>
              <h2 className="metric-value">{stats.pending_count}</h2>
              <p className="metric-description">Awaiting action</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="metric-card metric-card-resolved">
            <Card.Body>
              <div className="metric-header">
                <h6 className="metric-label">Assigned</h6>
              </div>
              <h2 className="metric-value">{stats.assigned_count}</h2>
              <p className="metric-description">In progress</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="metric-card metric-card-closed">
            <Card.Body>
              <div className="metric-header">
                <h6 className="metric-label">Completed</h6>
              </div>
              <h2 className="metric-value">{stats.completed_count}</h2>
              <p className="metric-description">Resolved</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Key Metrics Cards - Priority */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="metric-card metric-card-priority-low">
            <Card.Body>
              <div className="metric-header">
                <h6 className="metric-label">Low Priority</h6>
              </div>
              <h2 className="metric-value">{stats.low_count}</h2>
              <p className="metric-description">Can wait</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="metric-card metric-card-priority-medium">
            <Card.Body>
              <div className="metric-header">
                <h6 className="metric-label">Medium Priority</h6>
              </div>
              <h2 className="metric-value">{stats.medium_count}</h2>
              <p className="metric-description">Normal handling</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="metric-card metric-card-priority-urgent">
            <Card.Body>
              <div className="metric-header">
                <h6 className="metric-label">Urgent Priority</h6>
              </div>
              <h2 className="metric-value">{stats.urgent_count}</h2>
              <p className="metric-description">Needs attention</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="metric-card metric-card-priority-very-urgent">
            <Card.Body>
              <div className="metric-header">
                <h6 className="metric-label">Very Urgent</h6>
              </div>
              <h2 className="metric-value">{stats.very_urgent_count}</h2>
              <p className="metric-description">Critical</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card className="chart-card">
            <Card.Body>
              <h5 className="chart-title">Complaint Status Distribution</h5>
              <div className="chart-container">
                <Doughnut
                  data={{
                    labels: stats.status_stats.map(item => item.status_name),
                    datasets: [{
                      data: stats.status_stats.map(item => item.count),
                      backgroundColor: stats.status_stats.map(item => STATUS_COLORS[item.status_code] || '#999'),
                      borderColor: '#fff',
                      borderWidth: 2
                    }]
                  }}
                  options={getChartOptions()}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="chart-card">
            <Card.Body>
              <h5 className="chart-title">Complaint Priority Distribution</h5>
              <div className="chart-container">
                <Doughnut
                  data={{
                    labels: stats.priority_stats.map(item => item.priority_level.charAt(0).toUpperCase() + item.priority_level.slice(1).replace('_', ' ')),
                    datasets: [{
                      data: stats.priority_stats.map(item => item.count),
                      backgroundColor: stats.priority_stats.map(item => PRIORITY_COLORS[item.priority_level] || '#999'),
                      borderColor: '#fff',
                      borderWidth: 2
                    }]
                  }}
                  options={getChartOptions()}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
