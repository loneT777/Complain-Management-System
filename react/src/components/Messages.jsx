import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  MenuItem,
  TablePagination,
  InputAdornment,
  Chip
} from '@mui/material';
import { Edit, Delete, Add, Close, Search, Message as MessageIcon, Chat } from '@mui/icons-material';
import { format } from 'date-fns';
import MessageThread from './MessageThread';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [viewingThread, setViewingThread] = useState(null);
  const [formData, setFormData] = useState({
    complaint_id: '',
    message: '',
    type: '',
    parent_id: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Pagination and search states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalRows, setTotalRows] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, [page, rowsPerPage, searchQuery]);

  // If viewing a thread, show the thread component
  if (viewingThread) {
    return <MessageThread complaintId={viewingThread} onBack={() => setViewingThread(null)} />;
  }

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page + 1,
        per_page: rowsPerPage,
        search: searchQuery
      });

      const response = await fetch(`/api/messages?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data.data || []);
      setTotalRows(data.pagination?.total || 0);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching messages:', error);
      setErrorMessage('Failed to load messages: ' + error.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (message = null) => {
    if (message) {
      setEditingMessage(message);
      setFormData({
        complaint_id: message.complaint_id || '',
        message: message.message || '',
        type: message.type || '',
        parent_id: message.parent_id || ''
      });
    } else {
      setEditingMessage(null);
      setFormData({
        complaint_id: '',
        message: '',
        type: '',
        parent_id: ''
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMessage(null);
    setFormData({
      complaint_id: '',
      message: '',
      type: '',
      parent_id: ''
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSaveMessage = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const url = editingMessage ? `/api/messages/${editingMessage.id}` : '/api/messages';
      const method = editingMessage ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        parent_id: formData.parent_id === '' ? null : formData.parent_id
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }
        setErrorMessage(data.message || 'Failed to save message');
        return;
      }

      setSuccessMessage(data.message || (editingMessage ? 'Message updated successfully' : 'Message created successfully'));
      handleCloseDialog();
      fetchMessages();
    } catch (error) {
      console.error('Error saving message:', error);
      setErrorMessage('Error saving message');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const response = await fetch(`/api/messages/${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.message || 'Failed to delete message');
          return;
        }

        setSuccessMessage(data.message || 'Message deleted successfully');
        fetchMessages();
      } catch (error) {
        console.error('Error deleting message:', error);
        setErrorMessage('Error deleting message');
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setPage(0);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  const getMessageType = (type) => {
    if (!type) return <Chip label="General" size="small" />;
    
    const typeColors = {
      'reply': 'primary',
      'update': 'info',
      'resolution': 'success',
      'escalation': 'warning',
      'internal': 'default'
    };

    return <Chip label={type} size="small" color={typeColors[type.toLowerCase()] || 'default'} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Messages</Typography>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Message
        </Button>
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

      {/* Search Box */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search messages, complaint number, or type..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: 2 }}>
          <CircularProgress />
          <Typography>Loading messages...</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Complaint</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Parent ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="7" sx={{ textAlign: 'center', p: 3 }}>
                    No messages found
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => (
                  <TableRow key={message.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>{message.id}</TableCell>
                    <TableCell>
                      {message.complaint ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {message.complaint.reference_no || `#${message.complaint.id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {message.complaint.title}
                          </Typography>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {message.message}
                      </Typography>
                    </TableCell>
                    <TableCell>{getMessageType(message.type)}</TableCell>
                    <TableCell>{message.parent_id || '-'}</TableCell>
                    <TableCell>{formatDate(message.created_at)}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton 
                        size="small" 
                        color="info" 
                        onClick={() => setViewingThread(message.complaint_id)} 
                        title="View Thread"
                      >
                        <Chat />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(message)} title="Edit">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(message.id)} title="Delete">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {!loading && messages.length > 0 && (
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          sx={{ mt: 2 }}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingMessage ? 'Edit Message' : 'Add New Message'}
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
              type="number"
              label="Complaint ID"
              name="complaint_id"
              value={formData.complaint_id}
              onChange={handleInputChange}
              error={!!errors.complaint_id}
              helperText={errors.complaint_id ? errors.complaint_id[0] : 'Required'}
              placeholder="Enter complaint ID"
            />

            <TextField
              fullWidth
              size="small"
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              error={!!errors.message}
              helperText={errors.message ? errors.message[0] : ''}
              placeholder="Enter message content"
              multiline
              rows={4}
            />

            <TextField
              fullWidth
              size="small"
              select
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              error={!!errors.type}
              helperText={errors.type ? errors.type[0] : 'Optional'}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="reply">Reply</MenuItem>
              <MenuItem value="update">Update</MenuItem>
              <MenuItem value="resolution">Resolution</MenuItem>
              <MenuItem value="escalation">Escalation</MenuItem>
              <MenuItem value="internal">Internal Note</MenuItem>
            </TextField>

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Parent Message ID"
              name="parent_id"
              value={formData.parent_id}
              onChange={handleInputChange}
              error={!!errors.parent_id}
              helperText={errors.parent_id ? errors.parent_id[0] : 'Optional - for replies'}
              placeholder="Enter parent message ID"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveMessage} variant="contained" color="primary">
            {editingMessage ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;
