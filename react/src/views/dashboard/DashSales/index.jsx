import { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

import FlatCard from 'components/Widgets/Statistic/FlatCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Mock stats data when API is not available
const getMockStats = () => ({
  po_application_details: {
    pending_applications: { title: 'Pending', value: 0, icon: 'schedule' },
    checked_applications: { title: 'Checked', value: 0, icon: 'done' },
    recommended_applications: { title: 'Recommended', value: 0, icon: 'thumb_up' },
    not_recommended_applications: { title: 'Not Recommended', value: 0, icon: 'thumb_down' },
    approved_applications: { title: 'Approved', value: 0, icon: 'check_circle' },
    rejected_applications: { title: 'Rejected', value: 0, icon: 'cancel' },
    required_resubmit_applications: { title: 'Resubmit Required', value: 0, icon: 'redo' },
    resubmit_pending_applications: { title: 'Resubmit Pending', value: 0, icon: 'hourglass_empty' }
  },
  pm_application_details: {
    pending_applications: { title: 'Pending', value: 0, icon: 'schedule' },
    checked_applications: { title: 'Checked', value: 0, icon: 'done' },
    recommended_applications: { title: 'Recommended', value: 0, icon: 'thumb_up' },
    not_recommended_applications: { title: 'Not Recommended', value: 0, icon: 'thumb_down' },
    approved_applications: { title: 'Approved', value: 0, icon: 'check_circle' },
    rejected_applications: { title: 'Rejected', value: 0, icon: 'cancel' },
    required_resubmit_applications: { title: 'Resubmit Required', value: 0, icon: 'redo' },
    resubmit_pending_applications: { title: 'Resubmit Pending', value: 0, icon: 'hourglass_empty' }
  },
  employee_details: {
    public_officers: { title: 'Public Officers', value: 0, icon: 'person' },
    parliament_members: { title: 'Parliament Members', value: 0, icon: 'groups' },
    total_members: { title: 'Total Members', value: 0, icon: 'people' },
    po_total_applications: { title: 'PO Total Applications', value: 0, icon: 'description' },
    pm_total_applications: { title: 'PM Total Applications', value: 0, icon: 'description' },
    all_total_applications: { title: 'All Total Applications', value: 0, icon: 'description' }
  },
  total_applications: 0,
  total_users: 0,
  total_divisions: 0,
  total_organizations: 0,
  pie_chart_data: []
});

export default function DashSales() {
  const initialStats = getMockStats();
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/dashboard/stats`);
        if (response.data && response.data.po_application_details) {
          setStats(response.data);
        } else {
          setStats(getMockStats());
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set mock data if API fails
        setStats(getMockStats());
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats || !stats.po_application_details || !stats.employee_details) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  // Helper function to get status ID based on title
  const getStatusId = (statusTitle) => {
    const statusMap = {
      'Pending': 1,
      'Checked': 2,
      'Recommended': 3,
      'Not Recommended': 4,
      'Approved': 5,
      'Rejected': 6,
      'Resubmit Required': 7,
      'Resubmit Pending': 8
    };
    return statusMap[statusTitle] || 1;
  };

  // Helper function to get status color based on title
  const getStatusColor = (statusTitle) => {
    const colorMap = {
      'Pending': '#6c757d',
      'Checked': '#17a2b8',
      'Recommended': '#007bff',
      'Not Recommended': '#ffc107',
      'Approved': '#28a745',
      'Rejected': '#dc3545',
      'Resubmit Required': '#fd7e14',
      'Resubmit Pending': '#e83e8c'
    };
    return colorMap[statusTitle] || '#6c757d';
  };

  // Component to render status button
  const StatusButton = ({ title, value, icon, applicationType }) => {
    const handleClick = () => {
      const statusId = getStatusId(title);
      const route = applicationType === 'po' 
        ? `/applications/po-applications/${statusId}`
        : `/applications/pm-applications/${statusId}`;
      navigate(route);
    };

    const statusColor = getStatusColor(title);

    return (
      <Button 
        variant="outline-primary"
        className="w-100 d-flex align-items-center justify-content-between p-3 status-button-hover"
        style={{ 
          minHeight: '70px',
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderBottom: `4px solid ${statusColor}`,
          color: '#212529',
          transition: 'background-color 0.3s ease, transform 0.2s ease',
          cursor: 'pointer'
        }}
        onClick={handleClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div className="d-flex align-items-center">
          <i 
            className="material-icons-two-tone text-primary me-3" 
            style={{ fontSize: '1.8rem' }}
          >
            {icon}
          </i>
          <div className="text-start">
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'black' }}>{value}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{title}</div>
          </div>
        </div>
      </Button>
    );
  };

  return (
    <div style={{ fontSize: '0.9rem' }}>
      {/* PO and PM Application Details Side by Side */}
      <Row className="mb-4">
        {/* PO Application Details Card */}
        <Col md={6} className="mb-4">
          <Card className="flat-card h-100">
            <Card.Header className="pb-3 d-flex align-items-center" style={{ height: '20px' }}>
              <h6 className="mb-0">Public Officers Application Details</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col sm={6}>
                  <StatusButton 
                    title={stats.po_application_details.pending_applications.title}
                    value={stats.po_application_details.pending_applications.value}
                    icon={stats.po_application_details.pending_applications.icon}
                    applicationType="po"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.po_application_details.checked_applications.title}
                    value={stats.po_application_details.checked_applications.value}
                    icon={stats.po_application_details.checked_applications.icon}
                    applicationType="po"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.po_application_details.recommended_applications.title}
                    value={stats.po_application_details.recommended_applications.value}
                    icon={stats.po_application_details.recommended_applications.icon}
                    applicationType="po"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.po_application_details.not_recommended_applications.title}
                    value={stats.po_application_details.not_recommended_applications.value}
                    icon={stats.po_application_details.not_recommended_applications.icon}
                    applicationType="po"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.po_application_details.approved_applications.title}
                    value={stats.po_application_details.approved_applications.value}
                    icon={stats.po_application_details.approved_applications.icon}
                    applicationType="po"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.po_application_details.rejected_applications.title}
                    value={stats.po_application_details.rejected_applications.value}
                    icon={stats.po_application_details.rejected_applications.icon}
                    applicationType="po"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.po_application_details.required_resubmit_applications.title}
                    value={stats.po_application_details.required_resubmit_applications.value}
                    icon={stats.po_application_details.required_resubmit_applications.icon}
                    applicationType="po"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.po_application_details.resubmit_pending_applications.title}
                    value={stats.po_application_details.resubmit_pending_applications.value}
                    icon={stats.po_application_details.resubmit_pending_applications.icon}
                    applicationType="po"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* PM Application Details Card */}
        <Col md={6} className="mb-4">
          <Card className="flat-card h-100">
            <Card.Header className="pb-3 d-flex align-items-center" style={{ height: '20px' }}>
              <h6 className="mb-0">Parliament Members Application Details</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col sm={6}>
                  <StatusButton 
                    title={stats.pm_application_details.pending_applications.title}
                    value={stats.pm_application_details.pending_applications.value}
                    icon={stats.pm_application_details.pending_applications.icon}
                    applicationType="pm"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.pm_application_details.checked_applications.title}
                    value={stats.pm_application_details.checked_applications.value}
                    icon={stats.pm_application_details.checked_applications.icon}
                    applicationType="pm"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.pm_application_details.recommended_applications.title}
                    value={stats.pm_application_details.recommended_applications.value}
                    icon={stats.pm_application_details.recommended_applications.icon}
                    applicationType="pm"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.pm_application_details.not_recommended_applications.title}
                    value={stats.pm_application_details.not_recommended_applications.value}
                    icon={stats.pm_application_details.not_recommended_applications.icon}
                    applicationType="pm"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.pm_application_details.approved_applications.title}
                    value={stats.pm_application_details.approved_applications.value}
                    icon={stats.pm_application_details.approved_applications.icon}
                    applicationType="pm"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.pm_application_details.rejected_applications.title}
                    value={stats.pm_application_details.rejected_applications.value}
                    icon={stats.pm_application_details.rejected_applications.icon}
                    applicationType="pm"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.pm_application_details.required_resubmit_applications.title}
                    value={stats.pm_application_details.required_resubmit_applications.value}
                    icon={stats.pm_application_details.required_resubmit_applications.icon}
                    applicationType="pm"
                  />
                </Col>
                <Col sm={6}>
                  <StatusButton 
                    title={stats.pm_application_details.resubmit_pending_applications.title}
                    value={stats.pm_application_details.resubmit_pending_applications.value}
                    icon={stats.pm_application_details.resubmit_pending_applications.icon}
                    applicationType="pm"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="mb-2">
        {/* Employee Distribution Chart */}
        <Col md={4} className="mb-4">
          <Card className="flat-card">
            <Card.Header className="pb-3 d-flex align-items-center" style={{ height: '20px' }}>
              <h6 className="mb-0">Employee Distribution</h6>
            </Card.Header>
            <Card.Body>
              <Doughnut
                data={{
                  labels: ['Public Officers', 'Parliament Members'],
                  datasets: [
                    {
                      data: [
                        stats.employee_details.public_officers.value,
                        stats.employee_details.parliament_members.value
                      ],
                      backgroundColor: ['#11195bff', '#f7fa34ff'],
                      borderColor: '#fff',
                      borderWidth: 2,
                      hoverOffset: 4,
                      cutout: '50%'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
                height={300}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* PO Application Status Chart */}
        <Col md={4} className="mb-4">
          <Card className="flat-card">
            <Card.Header className="pb-3 d-flex align-items-center" style={{ height: '20px' }}>
              <h6 className="mb-0">PO Application Status</h6>
            </Card.Header>
            <Card.Body>
              <Doughnut
                data={{
                  labels: ['Pending', 'Checked', 'Approved', 'Rejected', 'Recommended', 'Not Recommended', 'Resubmit Required', 'Resubmit Pending'],
                  datasets: [
                    {
                      data: [
                        stats.po_application_details.pending_applications.value,
                        stats.po_application_details.checked_applications.value,
                        stats.po_application_details.approved_applications.value,
                        stats.po_application_details.rejected_applications.value,
                        stats.po_application_details.recommended_applications.value,
                        stats.po_application_details.not_recommended_applications.value,
                        stats.po_application_details.required_resubmit_applications.value,
                        stats.po_application_details.resubmit_pending_applications.value
                      ],
                      backgroundColor: [
                        '#6c757d',
                        '#17a2b8',
                        '#28a745',
                        '#dc3545',
                        '#007bff',
                        '#ffc107',
                        '#fd7e14',
                        '#e83e8c'
                      ],
                      borderColor: '#fff',
                      borderWidth: 2,
                      hoverOffset: 4,
                      cutout: '50%'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
                height={300}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* PM Application Status Chart */}
        <Col md={4} className="mb-4">
          <Card className="flat-card">
            <Card.Header className="pb-3 d-flex align-items-center" style={{ height: '20px' }}>
              <h6 className="mb-0">PM Application Status</h6>
            </Card.Header>
            <Card.Body>
              <Doughnut
                data={{
                  labels: ['Pending', 'Checked', 'Approved', 'Rejected', 'Recommended', 'Not Recommended', 'Resubmit Required', 'Resubmit Pending'],
                  datasets: [
                    {
                      data: [
                        stats.pm_application_details.pending_applications.value,
                        stats.pm_application_details.checked_applications.value,
                        stats.pm_application_details.approved_applications.value,
                        stats.pm_application_details.rejected_applications.value,
                        stats.pm_application_details.recommended_applications.value,
                        stats.pm_application_details.not_recommended_applications.value,
                        stats.pm_application_details.required_resubmit_applications.value,
                        stats.pm_application_details.resubmit_pending_applications.value
                      ],
                      backgroundColor: [
                        '#6c757d',
                        '#17a2b8',
                        '#28a745',
                        '#dc3545',
                        '#007bff',
                        '#ffc107',
                        '#fd7e14',
                        '#e83e8c'
                      ],
                      borderColor: '#fff',
                      borderWidth: 2,
                      hoverOffset: 4,
                      cutout: '50%'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
                height={300}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Summary Card */}
      <Row className="mb-2">
        <Col md={12}>
          <Card className="flat-card">
            <Card.Header className="pb-3 d-flex align-items-center" style={{ height: '20px' }}>
              <h6 className="mb-0">Summary</h6>
            </Card.Header>
            <div className="row-table">
              <Card.Body className="col-sm-4 br">
                <FlatCard
                  params={{
                    title: stats.employee_details.public_officers.title,
                    iconClass: 'text-primary mb-1',
                    icon: stats.employee_details.public_officers.icon,
                    value: stats.employee_details.public_officers.value
                  }}
                />
              </Card.Body>
              <Card.Body className="col-sm-4 br">
                <FlatCard
                  params={{
                    title: stats.employee_details.parliament_members.title,
                    iconClass: 'text-primary mb-1',
                    icon: stats.employee_details.parliament_members.icon,
                    value: stats.employee_details.parliament_members.value
                  }}
                />
              </Card.Body>
              <Card.Body className="col-sm-4">
                <FlatCard
                  params={{
                    title: stats.employee_details.total_members.title,
                    iconClass: 'text-primary mb-1',
                    icon: stats.employee_details.total_members.icon,
                    value: stats.employee_details.total_members.value
                  }}
                />
              </Card.Body>
            </div>
            <div className="row-table">
              <Card.Body className="col-sm-4 br">
                <FlatCard
                  params={{
                    title: stats.employee_details.po_total_applications.title,
                    iconClass: 'text-primary mb-1',
                    icon: stats.employee_details.po_total_applications.icon,
                    value: stats.employee_details.po_total_applications.value
                  }}
                />
              </Card.Body>
              <Card.Body className="col-sm-4 br">
                <FlatCard
                  params={{
                    title: stats.employee_details.pm_total_applications.title,
                    iconClass: 'text-primary mb-1',
                    icon: stats.employee_details.pm_total_applications.icon,
                    value: stats.employee_details.pm_total_applications.value
                  }}
                />
              </Card.Body>
              <Card.Body className="col-sm-4">
                <FlatCard
                  params={{
                    title: stats.employee_details.all_total_applications.title,
                    iconClass: 'text-primary mb-1',
                    icon: stats.employee_details.all_total_applications.icon,
                    value: stats.employee_details.all_total_applications.value
                  }}
                />
              </Card.Body>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}