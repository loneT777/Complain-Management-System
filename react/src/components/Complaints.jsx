import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ComplaintTable from './ComplaintTable';

const Complaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Complaints</h4>
              <Button
                style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
                onClick={() => navigate('/add-complaint')}
              >
                <Add className="me-1" /> Add New Complaint
              </Button>
            </Card.Header>

            <Card.Body>
              <ComplaintTable
                complaints={complaints}
                loading={loading}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Complaints;
