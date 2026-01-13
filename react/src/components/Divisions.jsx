import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress, 
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import axios from '../utils/axiosConfig';
import { Can } from './PermissionComponents';

const Divisions = () => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDivision, setEditingDivision] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    location: '',
    officer_in_charge: '',
    contact_no: '',
    parent_id: '',
    remark: '',
    is_approved: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/divisions');
      setDivisions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      setErrorMessage('Failed to fetch divisions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (division = null) => {
    if (division) {
      setEditingDivision(division);
      setFormData({
        name: division.name || '',
        code: division.code || '',
        description: division.description || '',
        location: division.location || '',
        officer_in_charge: division.officer_in_charge || '',
        contact_no: division.contact_no || '',
        parent_id: division.parent_id || '',
        remark: division.remark || '',
        is_approved: division.is_approved || false
      });
    } else {
      setEditingDivision(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        location: '',
        officer_in_charge: '',
        contact_no: '',
        parent_id: '',
        remark: '',
        is_approved: false
      });
    }
    setErrors({});
    setErrorMessage('');
    setSuccessMessage('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDivision(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      location: '',
      officer_in_charge: '',
      contact_no: '',
      parent_id: '',
      remark: '',
      is_approved: false
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleSaveDivision = async () => {
    try {
      const url = editingDivision 
        ? `/divisions/${editingDivision.id}` 
        : '/divisions';
      const method = editingDivision ? 'PUT' : 'POST';

      // Convert empty parent_id to null
      const submitData = {
        ...formData,
        parent_id: formData.parent_id === '' ? null : formData.parent_id
      };

      const response = await axios({
        method,
        url,
        data: submitData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setSuccessMessage(editingDivision ? 'Division updated successfully' : 'Division created successfully');
      fetchDivisions();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving division:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrorMessage(error.response?.data?.message || 'Failed to save division');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this division?')) {
      try {
        await axios.delete(`/divisions/${id}`);
        setSuccessMessage('Division deleted successfully');
        fetchDivisions();
      } catch (error) {
        console.error('Error deleting division:', error);
        setErrorMessage('Failed to delete division');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Divisions</Typography>
        <Can permission="setting.create">
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Add Division
          </Button>
        </Can>
      </Box>

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage('')} sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

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
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Officer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {divisions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="9" sx={{ textAlign: 'center', p: 3 }}>
                    No divisions found
                  </TableCell>
                </TableRow>
              ) : (
                divisions.map((division) => (
                  <TableRow key={division.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>{division.id}</TableCell>
                    <TableCell>{division.name}</TableCell>
                    <TableCell>{division.code}</TableCell>
                    <TableCell>{division.description}</TableCell>
                    <TableCell>{division.location}</TableCell>
                    <TableCell>{division.officer_in_charge}</TableCell>
                    <TableCell>{division.contact_no}</TableCell>
                    <TableCell>
                      {division.is_approved ? (
                        <Typography sx={{ color: 'green', fontWeight: 'bold' }}>Approved</Typography>
                      ) : (
                        <Typography sx={{ color: 'orange', fontWeight: 'bold' }}>Pending</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Can permission="setting.update">
                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(division)} title="Edit">
                          <Edit />
                        </IconButton>
                      </Can>
                      <Can permission="setting.delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(division.id)} title="Delete">
                          <Delete />
                        </IconButton>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingDivision ? 'Edit Division' : 'Add New Division'}
            <IconButton size="small" onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Division Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name ? errors.name[0] : ''}
              placeholder="e.g., Finance Division"
              required
            />

            <TextField
              fullWidth
              size="small"
              label="Division Code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              error={!!errors.code}
              helperText={errors.code ? errors.code[0] : ''}
              placeholder="e.g., DIV001"
              required
            />

            <TextField
              fullWidth
              size="small"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              error={!!errors.description}
              helperText={errors.description ? errors.description[0] : ''}
              placeholder="Enter description"
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              size="small"
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              error={!!errors.location}
              helperText={errors.location ? errors.location[0] : ''}
              placeholder="Enter location"
            />

            <TextField
              fullWidth
              size="small"
              label="Officer in Charge"
              name="officer_in_charge"
              value={formData.officer_in_charge}
              onChange={handleInputChange}
              error={!!errors.officer_in_charge}
              helperText={errors.officer_in_charge ? errors.officer_in_charge[0] : ''}
              placeholder="Enter officer name"
            />

            <TextField
              fullWidth
              size="small"
              label="Contact Number"
              name="contact_no"
              value={formData.contact_no}
              onChange={handleInputChange}
              error={!!errors.contact_no}
              helperText={errors.contact_no ? errors.contact_no[0] : ''}
              placeholder="e.g., +94-11-1234567"
            />

            <TextField
              fullWidth
              size="small"
              label="Parent Division ID"
              name="parent_id"
              type="number"
              value={formData.parent_id}
              onChange={handleInputChange}
              error={!!errors.parent_id}
              helperText={errors.parent_id ? errors.parent_id[0] : 'Optional'}
              placeholder="Leave blank if no parent"
            />

            <TextField
              fullWidth
              size="small"
              label="Remark"
              name="remark"
              value={formData.remark}
              onChange={handleInputChange}
              error={!!errors.remark}
              helperText={errors.remark ? errors.remark[0] : ''}
              placeholder="Enter any additional remarks"
              multiline
              rows={2}
            />

            <FormControlLabel
              control={<Checkbox name="is_approved" checked={formData.is_approved} onChange={handleInputChange} />}
              label="Mark as Approved"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveDivision} variant="contained" color="primary">
            {editingDivision ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Divisions;