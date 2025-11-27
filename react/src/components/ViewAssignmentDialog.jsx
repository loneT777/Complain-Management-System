import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  Divider,
  Grid
} from "@mui/material";
import { Close } from "@mui/icons-material";

const ViewAssignmentDialog = ({ open, handleClose, assignment }) => {
  if (!assignment) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Assignment Details
          <IconButton size="small" onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Complaint
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {assignment.complaint?.reference_no} - {assignment.complaint?.title}
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Assigned To (Division)
              </Typography>
              <Typography variant="body1">
                {assignment.assignee_division?.name || 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Assigned To (Person)
              </Typography>
              <Typography variant="body1">
                {assignment.assignee_user?.full_name || 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Assigned By
              </Typography>
              <Typography variant="body1">
                {assignment.assigner_user?.full_name || 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Due Date
              </Typography>
              <Typography variant="body1">
                {formatDate(assignment.due_at)}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Assigned On
              </Typography>
              <Typography variant="body1">
                {formatDate(assignment.created_at)}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Remarks
              </Typography>
              <Typography variant="body1">
                {assignment.remark || 'No remarks provided'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewAssignmentDialog;