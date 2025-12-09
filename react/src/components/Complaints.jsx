import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Add } from '@mui/icons-material';
import axios from 'axios';
import ComplaintTable from './ComplaintTable';
import ComplaintForm from './ComplaintForm';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState({
    title: '',
    description: '',
    channel: '',
    priority_level: '',
    confidentiality_level: '',
    complainant_name: '',
    complainant_phone: '',
    remark: ''
  });

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

  const handleOpenModal = (complaint = null) => {
    if (complaint) {
      setEditMode(true);
      setCurrentComplaint(complaint);
    } else {
      setEditMode(false);
      setCurrentComplaint({
        title: '',
        description: '',
        channel: '',
        priority_level: '',
        confidentiality_level: '',
        complainant_name: '',
        complainant_phone: '',
        remark: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentComplaint({
      title: '',
      description: '',
      channel: '',
      priority_level: '',
      confidentiality_level: '',
      complainant_name: '',
      complainant_phone: '',
      remark: ''
    });
  };

  const handleChange = (e) => {
    setCurrentComplaint({
      ...currentComplaint,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await axios.put(
          `http://localhost:8000/api/complaints/${currentComplaint.id}`,
          currentComplaint
        );
      } else {
        await axios.post('http://localhost:8000/api/complaints', currentComplaint);
      }

      fetchComplaints();
      handleCloseModal();

    } catch (error) {
      console.error('Error saving complaint:', error);
      alert('Error saving complaint. Please check the form.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await axios.delete(`http://localhost:8000/api/complaints/${id}`);
        fetchComplaints();
      } catch (error) {
        console.error('Error deleting complaint:', error);
      }
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
                onClick={() => handleOpenModal()}
              >
                <Add className="me-1" /> Add New Complaint
              </Button>
            </Card.Header>

            <Card.Body>
              <ComplaintTable
                complaints={complaints}
                loading={loading}
                handleEdit={handleOpenModal}
                handleDelete={handleDelete}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ComplaintForm
        show={showModal}
        handleClose={handleCloseModal}
        complaint={currentComplaint}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        editMode={editMode}
      />
    </Container>
  );
};

export default Complaints;
