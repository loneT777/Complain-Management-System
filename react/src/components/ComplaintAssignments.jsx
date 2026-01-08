import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import { Visibility, Assignment } from '@mui/icons-material';
import axios from 'axios';
import AssignComplaintForm from './AssignComplaintForm';
import ViewAssignmentDialog from './ViewAssignmentDialog';

const ComplaintAssignments = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignments, setAssignments] = useState({});

  // Check if user is role 5 (Engineer)
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const isEngineer = userData?.role_id === 5;

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/complaints');
      const complaintsData = response.data.data || [];
      setComplaints(complaintsData);
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
      const assignmentsMap = {};
      await Promise.all(
        complaintIds.map(async (complaintId) => {
          try {
            const res = await axios.get('http://localhost:8000/api/complaint_assignments', {
              params: { complaint_id: complaintId }
            });
            if (res.data && res.data.length > 0) {
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

  const handleViewClick = (complaint) => {
    const assignment = assignments[complaint.id];
    if (assignment) {
      setSelectedAssignment(assignment);
      setShowViewModal(true);
    }
  };

  const handleAssignFormClose = () => {
    setShowAssignModal(false);
    setSelectedComplaint(null);
  };

  const handleViewDialogClose = () => {
    setShowViewModal(false);
    setSelectedAssignment(null);
  };

  const handleAssignmentSaved = () => {
    setShowAssignModal(false);
    setSelectedComplaint(null);
    fetchComplaints();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Complaint Assignments</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reference No</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="6" sx={{ textAlign: 'center', p: 3 }}>
                    No complaints found
                  </TableCell>
                </TableRow>
              ) : (
                complaints.map((complaint) => {
                  const assignment = assignments[complaint.id];
                  return (
                    <TableRow key={complaint.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell>{complaint.id}</TableCell>
                      <TableCell>{complaint.reference_no}</TableCell>
                      <TableCell>{complaint.title}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        {complaint.description?.substring(0, 100)}
                        {complaint.description?.length > 100 ? '...' : ''}
                      </TableCell>
                      <TableCell>
                        {assignment ? (
                          <Chip label="Assigned" color="success" size="small" />
                        ) : (
                          <Chip label="Unassigned" color="warning" size="small" />
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {assignment && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewClick(complaint)}
                            title="View Assignment"
                            sx={{ mr: 1 }}
                          >
                            <Visibility />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleAssignClick(complaint)}
                          disabled={isEngineer}
                          title={isEngineer ? 'Engineers cannot assign complaints' : assignment ? 'Reassign' : 'Assign'}
                        >
                          <Assignment />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {showAssignModal && selectedComplaint && (
        <AssignComplaintForm
          show={showAssignModal}
          handleClose={handleAssignFormClose}
          complaint={selectedComplaint}
          onSaved={handleAssignmentSaved}
        />
      )}

      {showViewModal && selectedAssignment && (
        <ViewAssignmentDialog open={showViewModal} handleClose={handleViewDialogClose} assignment={selectedAssignment} />
      )}
    </Box>
  );
};

export default ComplaintAssignments;
