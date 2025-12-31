import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Send, Reply, ArrowBack } from '@mui/icons-material';
import { format } from 'date-fns';

const MessageThread = ({ complaintId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyType, setReplyType] = useState('reply');
  const [replyingTo, setReplyingTo] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (complaintId) {
      fetchComplaint();
      fetchMessages();
    }
  }, [complaintId]);

  const fetchComplaint = async () => {
    try {
      const response = await fetch(`/api/messages?search=${complaintId}`);
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setComplaint(data.data[0].complaint);
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/complaints/${complaintId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages');
      
      const data = await response.json();
      setMessages(data.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          complaint_id: complaintId,
          message: replyText,
          type: replyType,
          parent_id: replyingTo
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setSuccess('Message sent successfully');
      setReplyText('');
      setReplyingTo(null);
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleReplyTo = (messageId) => {
    setReplyingTo(messageId);
    setReplyType('reply');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  const getMessageTypeColor = (type) => {
    const colors = {
      'reply': 'primary',
      'update': 'info',
      'resolution': 'success',
      'escalation': 'warning',
      'internal': 'default'
    };
    return colors[type?.toLowerCase()] || 'default';
  };

  const renderMessage = (message, depth = 0) => {
    const userName = message.user ? message.user.username : 'System';
    const userInitial = userName.charAt(0).toUpperCase();
    
    return (
      <Box key={message.id} sx={{ ml: depth * 4, mb: 2 }}>
        <Paper elevation={1} sx={{ p: 2, backgroundColor: depth > 0 ? '#f9f9f9' : 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar sx={{ bgcolor: depth > 0 ? 'secondary.main' : 'primary.main' }}>
              {userInitial}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {userName}
                  </Typography>
                  {message.type && (
                    <Chip 
                      label={message.type} 
                      size="small" 
                      color={getMessageTypeColor(message.type)}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(message.created_at)}
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                {message.message}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<Reply />}
                  onClick={() => handleReplyTo(message.id)}
                  disabled={sending}
                >
                  Reply
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Render nested replies */}
        {message.replies && message.replies.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {message.replies.map(reply => renderMessage(reply, depth + 1))}
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5">
            {complaint?.reference_no || `Complaint #${complaintId}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {complaint?.title}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Complaint Details */}
      {complaint && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Complaint Details
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Description:</strong> {complaint.description}
          </Typography>
          {complaint.priority_level && (
            <Chip 
              label={`Priority: ${complaint.priority_level}`} 
              size="small" 
              color={complaint.priority_level === 'high' ? 'error' : complaint.priority_level === 'medium' ? 'warning' : 'default'}
            />
          )}
        </Paper>
      )}

      {/* Messages Thread */}
      <Box sx={{ mb: 3 }}>
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No messages yet. Start the conversation below.
          </Typography>
        ) : (
          messages.map(message => renderMessage(message))
        )}
      </Box>

      {/* Reply Box */}
      <Paper elevation={3} sx={{ p: 2, position: 'sticky', bottom: 0, backgroundColor: 'white' }}>
        {replyingTo && (
          <Box sx={{ mb: 2, p: 1, backgroundColor: '#f0f0f0', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption">
              Replying to message #{replyingTo}
            </Typography>
            <Button size="small" onClick={() => setReplyingTo(null)}>
              Cancel
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {['reply', 'update', 'resolution', 'escalation', 'internal'].map(type => (
            <Chip
              key={type}
              label={type}
              size="small"
              color={replyType === type ? getMessageTypeColor(type) : 'default'}
              onClick={() => setReplyType(type)}
              clickable
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Type your message here..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={sending}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<Send />}
            onClick={handleSendReply}
            disabled={sending || !replyText.trim()}
            sx={{ height: 'fit-content' }}
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MessageThread;
