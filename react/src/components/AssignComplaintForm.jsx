import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from "@mui/material";
import { Close } from "@mui/icons-material";
import axios from "axios";

const AssignComplaintForm = ({ show, handleClose, complaint, onSaved }) => {
  const [divisions, setDivisions] = useState([]);
  const [persons, setPersons] = useState([]);
  const [formData, setFormData] = useState({
    assignee_division_id: "",
    assignee_user_id: "",
    due_at: "",
    remark: "",
  });
  const [loadingPersons, setLoadingPersons] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      fetchDivisions();
      fetchAllPersons();
      setFormData({
        assignee_division_id: "",
        assignee_user_id: "",
        due_at: "",
        remark: "",
      });
      setErrors({});
    }
  }, [show]);

  const fetchDivisions = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/divisions");
      setDivisions(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch divisions", error);
    }
  };

  const fetchAllPersons = async () => {
    setLoadingPersons(true);
    try {
      const response = await axios.get("http://localhost:8000/api/persons");
      setPersons(response.data || []);
    } catch (error) {
      console.error("Failed to fetch persons", error);
      setPersons([]);
    } finally {
      setLoadingPersons(false);
    }
  };

  const handleDivisionChange = (e) => {
    const divisionId = e.target.value;
    setFormData({
      ...formData,
      assignee_division_id: divisionId,
      assignee_user_id: "",
    });
    
    if (errors.assignee_division_id) {
      setErrors({ ...errors, assignee_division_id: null });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    
    try {
      await axios.post("http://localhost:8000/api/complaint_assignments", {
        complaint_id: complaint.id,
        assignee_division_id: formData.assignee_division_id || null,
        assignee_user_id: formData.assignee_user_id || null,
        due_at: formData.due_at || null,
        remark: formData.remark || "",
      });
      onSaved();
    } catch (error) {
      console.error("Failed to save complaint assignment", error);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert("Failed to save assignment. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={show} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Assign Complaint: {complaint?.reference_no}
          <IconButton size="small" onClick={handleClose} disabled={saving}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small" error={!!errors.assignee_division_id}>
            <InputLabel>Division</InputLabel>
            <Select
              name="assignee_division_id"
              value={formData.assignee_division_id}
              onChange={handleDivisionChange}
              disabled={saving}
              label="Division"
            >
              <MenuItem value="">-- Select Division --</MenuItem>
              {divisions.map((division) => (
                <MenuItem key={division.id} value={division.id}>
                  {division.name}
                </MenuItem>
              ))}
            </Select>
            {errors.assignee_division_id && (
              <Typography variant="caption" color="error">
                {errors.assignee_division_id[0]}
              </Typography>
            )}
          </FormControl>

          <FormControl 
            fullWidth 
            size="small" 
            error={!!errors.assignee_user_id}
            disabled={saving || loadingPersons}
          >
            <InputLabel>Person</InputLabel>
            <Select
              name="assignee_user_id"
              value={formData.assignee_user_id}
              onChange={handleChange}
              label="Person"
            >
              <MenuItem value="">-- Select Person --</MenuItem>
              {persons.map((person) => (
                <MenuItem key={person.id} value={person.id}>
                  {person.full_name}
                </MenuItem>
              ))}
            </Select>
            {loadingPersons && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
            {errors.assignee_user_id && (
              <Typography variant="caption" color="error">
                {errors.assignee_user_id[0]}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            size="small"
            type="date"
            label="Due Date"
            name="due_at"
            value={formData.due_at}
            onChange={handleChange}
            disabled={saving}
            error={!!errors.due_at}
            helperText={errors.due_at ? errors.due_at[0] : ''}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            size="small"
            label="Remark"
            name="remark"
            value={formData.remark}
            onChange={handleChange}
            disabled={saving}
            error={!!errors.remark}
            helperText={errors.remark ? errors.remark[0] : ''}
            placeholder="Enter any additional remarks"
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={saving}
        >
          {saving ? "Assigning..." : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignComplaintForm;