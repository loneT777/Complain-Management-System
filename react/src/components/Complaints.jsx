import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import ComplaintTable from './ComplaintTable';
import AssignComplaintForm from './AssignComplaintForm';

const Complaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignments, setAssignments] = useState({}); // complaintId => assignment

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/complaints');
      console.log('Complaints API Response:', response.data);
      
      const complaintsData = response.data.data || response.data;
      console.log('Complaints Data:', complaintsData);
      console.log('Complaints Count:', complaintsData?.length);
      
      setComplaints(complaintsData);

      // Fetch assignments for all complaints
      await fetchAssignments(complaintsData.map((c) => c.id));
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (complaintIds) => {
    if (!complaintIds.length) {
      setAssignments({});
      return;
    }
    try {
      // Fetch assignments for each complaint and aggregate
      const assignmentsMap = {};
      await Promise.all(
        complaintIds.map(async (complaintId) => {
          try {
            const res = await axios.get('/complaint_assignments', {
              params: { complaint_id: complaintId }
            });
            if (res.data && res.data.length > 0) {
              // For simplicity take the first assignment (if multiple)
              assignmentsMap[complaintId] = res.data[0];
            }
          } catch (err) {
            // Silently ignore assignment fetch errors for individual complaints
            console.warn(`Could not fetch assignments for complaint ${complaintId}`);
          }
        })
      );
      setAssignments(assignmentsMap);
    } catch (error) {
      console.error('Error fetching complaint assignments:', error);
      setAssignments({});
    }
  };

  const handleAssignClick = (complaint) => {
    setSelectedComplaint(complaint);
    setShowAssignModal(true);
  };

  const handleAssignFormClose = () => {
    setShowAssignModal(false);
    setSelectedComplaint(null);
  };

  const handleAssignmentSaved = () => {
    setShowAssignModal(false);
    setSelectedComplaint(null);
    fetchComplaints(); // refresh complaints and assignments on save
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Complaints</h4>
              <Button style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }} onClick={() => navigate('/add-complaint')}>
                <Add className="me-1" /> Add New Complaint
              </Button>
            </Card.Header>

            <Card.Body>
              <ComplaintTable complaints={complaints} loading={loading} assignments={assignments} onAssign={handleAssignClick} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showAssignModal && selectedComplaint && (
        <AssignComplaintForm
          show={showAssignModal}
          onClose={handleAssignFormClose}
          complaintId={selectedComplaint.id}
          assignment={assignments[selectedComplaint.id] || null}
          onSuccess={handleAssignmentSaved}
        />
      )}
    </Container>
  );
};

export default Complaints;
