import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import AssignComplaintForm from './AssignComplaintForm';

const Complaints = () => {
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
      const response = await axios.get('http://localhost:8000/api/complaints');
      const complaintsData = response.data.data || [];
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
          const res = await axios.get('http://localhost:8000/api/complaint_assignments', {
            params: { complaint_id: complaintId }
          });
          if (res.data && res.data.length > 0) {
            // For simplicity take the first assignment (if multiple)
            assignmentsMap[complaintId] = res.data[0];
          }
        })
      );
      setAssignments(assignmentsMap);
    } catch (error) {
      console.error('Error fetching complaint assignments:', error);
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
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>Complaints</h4>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Loading complaints...</p>
              ) : (
                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Assignment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No complaints found.
                        </td>
                      </tr>
                    )}
                    {complaints.map((complaint) => {
                      const assignment = assignments[complaint.id];
                      return (
                        <tr key={complaint.id}>
                          <td>{complaint.id}</td>
                          <td>{complaint.title}</td>
                          <td>{complaint.description}</td>
                          <td>
                            {assignment ? (
                              <>
                                <div>
                                  <strong>Division:</strong> {assignment.assigneeDivision ? assignment.assigneeDivision.name : '-'}
                                </div>
                                <div>
                                  <strong>Person:</strong> {assignment.assigneeUser ? assignment.assigneeUser.full_name : '-'}
                                </div>
                                <div>
                                  <strong>Due:</strong> {assignment.due_at || '-'}
                                </div>
                                <div>
                                  <strong>Remark:</strong> {assignment.remark || '-'}
                                </div>
                              </>
                            ) : (
                              <span>No Assignment</span>
                            )}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="primary"
                              className="me-2"
                              onClick={() => alert(`View complaint ID: ${complaint.id}`)}
                            >
                              View
                            </Button>
                            <Button size="sm" variant="success" onClick={() => handleAssignClick(complaint)}>
                              Assign
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showAssignModal && selectedComplaint && (
        <AssignComplaintForm
          show={showAssignModal}
          handleClose={handleAssignFormClose}
          complaint={selectedComplaint}
          onSaved={handleAssignmentSaved}
        />
      )}
    </Container>
  );
};

export default Complaints;
