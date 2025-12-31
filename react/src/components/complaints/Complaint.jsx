import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Tab, Tabs, Alert, Table, Form, InputGroup } from 'react-bootstrap';
import { ArrowBack, Edit, AttachFile, Message, Person, AccessTime, Download, Visibility, Add, Delete, Reply, Send, MoreVert, AccountCircle } from '@mui/icons-material';
import axios from 'axios';
import MessageForm from '../forms/MessageForm';
import AttachmentForm from '../forms/AttachmentForm';
import './Complaint.css';

const Complaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  
  // Message modal states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState({
    id: null,
    complaint_id: id,
    message: '',
    type: 'reply',
    parent_id: null,
    sender_name: ''
  });
  const [editingMessage, setEditingMessage] = useState(false);
  
  // Quick comment states
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showReplies, setShowReplies] = useState({});
  
  // Attachment modal states
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState({
    id: null,
    complaint_id: id,
    file_name: '',
    description: ''
  });
  const [editingAttachment, setEditingAttachment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchComplaint();
      fetchMessages();
      fetchAttachments();
    }
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/complaints/${id}`);
      setComplaint(response.data);
    } catch (error) {
      console.error('Error fetching complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/complaints/${id}/messages`);
      const messagesData = response.data.data || response.data || [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchAttachments = async () => {
    setLoadingAttachments(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/complaints/${id}/attachments`);
      const attachmentsData = response.data.data || response.data || [];
      setAttachments(Array.isArray(attachmentsData) ? attachmentsData : []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleDownload = async (attachmentId, fileName) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/attachments/${attachmentId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleView = (attachmentId) => {
    window.open(`http://localhost:8000/api/attachments/${attachmentId}/view`, '_blank');
  };

  const handleEdit = () => {
    navigate(`/edit-complaint/${id}`);
  };

  // Message handlers
  const handleAddMessage = () => {
    setCurrentMessage({
      id: null,
      complaint_id: id,
      message: '',
      type: 'reply',
      parent_id: null,
      sender_name: ''
    });
    setEditingMessage(false);
    setShowMessageModal(true);
  };

  const handleReplyMessage = (parentMessage) => {
    setCurrentMessage({
      id: null,
      complaint_id: id,
      message: '',
      type: 'reply',
      parent_id: parentMessage.id,
      sender_name: ''
    });
    setEditingMessage(false);
    setShowMessageModal(true);
  };

  const handleEditMessage = (message) => {
    setCurrentMessage({
      id: message.id,
      complaint_id: message.complaint_id,
      message: message.message,
      type: message.type,
      parent_id: message.parent_id,
      sender_name: message.sender_name
    });
    setEditingMessage(true);
    setShowMessageModal(true);
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await axios.delete(`http://localhost:8000/api/messages/${messageId}`);
        fetchMessages();
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message');
      }
    }
  };

  const handleMessageChange = (e) => {
    const { name, value } = e.target;
    setCurrentMessage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMessage) {
        await axios.put(`http://localhost:8000/api/messages/${currentMessage.id}`, currentMessage);
      } else {
        await axios.post('http://localhost:8000/api/messages', currentMessage);
      }
      setShowMessageModal(false);
      fetchMessages();
    } catch (error) {
      console.error('Error saving message:', error);
      alert('Failed to save message');
      throw error;
    }
  };

  // Quick comment handlers
  const handleQuickComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await axios.post('http://localhost:8000/api/messages', {
        complaint_id: parseInt(id),
        message: newComment.trim(),
        type: 'reply',
        user_id: 1 // Default user ID - should be replaced with actual logged-in user
      });
      setNewComment('');
      fetchMessages();
    } catch (error) {
      console.error('Error posting comment:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || error.message;
      alert('Failed to post comment: ' + errorMsg);
    }
  };

  const handleQuickReply = async (parentId) => {
    if (!replyText.trim()) return;
    
    try {
      await axios.post('http://localhost:8000/api/messages', {
        complaint_id: parseInt(id),
        message: replyText.trim(),
        type: 'reply',
        parent_id: parentId,
        user_id: 1 // Default user ID - should be replaced with actual logged-in user
      });
      setReplyText('');
      setReplyingTo(null);
      fetchMessages();
    } catch (error) {
      console.error('Error posting reply:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || error.message;
      alert('Failed to post reply: ' + errorMsg);
    }
  };

  const handleQuickEdit = async (messageId) => {
    if (!editText.trim()) return;
    
    try {
      const message = messages.find(m => m.id === messageId);
      await axios.put(`http://localhost:8000/api/messages/${messageId}`, {
        ...message,
        message: editText
      });
      setEditingId(null);
      setEditText('');
      fetchMessages();
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Failed to edit message');
    }
  };

  const startEditing = (message) => {
    setEditingId(message.id);
    setEditText(message.message);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const toggleReplies = (messageId) => {
    setShowReplies(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const getMessageReplies = (parentId) => {
    return messages.filter(msg => msg.parent_id === parentId);
  };

  const getTopLevelMessages = () => {
    return messages.filter(msg => !msg.parent_id);
  };

  // Attachment handlers
  const handleAddAttachment = () => {
    setCurrentAttachment({
      id: null,
      complaint_id: id,
      file_name: '',
      description: ''
    });
    setEditingAttachment(false);
    setShowAttachmentModal(true);
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await axios.delete(`http://localhost:8000/api/public/attachments/${attachmentId}`);
        fetchAttachments();
      } catch (error) {
        console.error('Error deleting attachment:', error);
        alert('Failed to delete attachment');
      }
    }
  };

  const handleAttachmentSubmit = async (formData) => {
    try {
      await axios.post('http://localhost:8000/api/public/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowAttachmentModal(false);
      fetchAttachments();
    } catch (error) {
      console.error('Error uploading attachment:', error);
      alert('Failed to upload attachment');
      throw error;
    }
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      Low: 'secondary',
      Medium: 'info',
      High: 'warning',
      Urgent: 'danger'
    };
    return <Badge bg={variants[priority] || 'secondary'}>{priority || 'N/A'}</Badge>;
  };

  const getMessageTypeBadge = (type) => {
    const typeConfig = {
      'initial': { bg: 'primary', label: 'Initial Complaint', icon: '📝' },
      'reply': { bg: 'success', label: 'Reply', icon: '💬' },
      'update': { bg: 'info', label: 'Update', icon: '🔄' },
      'resolution': { bg: 'warning', label: 'Resolution', icon: '✅' },
      'closed': { bg: 'secondary', label: 'Closed', icon: '🔒' },
      'escalation': { bg: 'danger', label: 'Escalation', icon: '⚠️' },
      'internal_note': { bg: 'dark', label: 'Internal Note', icon: '📌' },
      'follow_up': { bg: 'info', label: 'Follow-up', icon: '🔔' }
    };

    const config = typeConfig[type?.toLowerCase()] || { bg: 'light', label: type || 'Message', icon: '💬' };
    
    return (
      <Badge bg={config.bg} className="me-2">
        <span className="me-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">Loading complaint details...</p>
        </div>
      </Container>
    );
  }

  if (!complaint) {
    return (
      <Container fluid className="p-4">
        <Card>
          <Card.Body>
            <p className="text-muted text-center">Complaint not found</p>
            <div className="text-center">
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h4 className="mb-0">Complaint Details - {complaint.reference_no}</h4>
            </div>

            <div>
              <Button
                style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
                size="sm"
                onClick={handleEdit}
              >
                <Edit fontSize="small" className="me-1" /> Edit
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* LEFT SIDE */}
        <Col lg={8}>
          {/* Complaint Info */}
          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Complaint Information</h5></Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Reference No:</strong>
                  <p className="text-primary">{complaint.reference_no}</p>
                </Col>
                <Col md={6}>
                  <strong>Status:</strong>
                  <p>{complaint.last_status?.name || 'New'}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col><strong>Title:</strong><p>{complaint.title}</p></Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <strong>Description:</strong>
                  <p className="text-muted">{complaint.description}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}><strong>Channel:</strong><p>{complaint.channel || 'N/A'}</p></Col>
                <Col md={6}><strong>Priority:</strong><p>{getPriorityBadge(complaint.priority_level)}</p></Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}><strong>Confidentiality:</strong><p>{complaint.confidentiality_level || 'N/A'}</p></Col>
                <Col md={6}><strong>Due Date:</strong><p>{complaint.due_at ? new Date(complaint.due_at).toLocaleDateString() : 'N/A'}</p></Col>
              </Row>

              {complaint.remark && (
                <Row><Col><strong>Remarks:</strong><p className="text-muted">{complaint.remark}</p></Col></Row>
              )}
            </Card.Body>
          </Card>

          {/* TABS */}
          <Card className="mb-4">
            <Card.Body>
              <Tabs defaultActiveKey="messages">
                <Tab eventKey="messages" title={`Comments (${messages.length})`}>
                  <div className="py-4">
                    {/* Comment Input Box */}
                    <div className="fb-comment-box mb-4">
                      <div className="d-flex gap-3">
                        <div className="fb-avatar">
                          <AccountCircle style={{ fontSize: 42, color: '#1877f2' }} />
                        </div>
                        <div className="flex-grow-1">
                          <InputGroup>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              placeholder="💭 What's on your mind? Share your thoughts..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="fb-comment-input"
                              style={{ 
                                resize: 'none', 
                                borderRadius: '20px', 
                                backgroundColor: '#f0f2f5',
                                border: '2px solid transparent'
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  handleQuickComment();
                                }
                              }}
                            />
                          </InputGroup>
                          {newComment && (
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <small className="text-muted" style={{ fontSize: '11px' }}>
                                💡 Press Ctrl+Enter to post quickly
                              </small>
                              <div className="d-flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  onClick={() => setNewComment('')}
                                  style={{ borderRadius: '20px' }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  style={{ 
                                    backgroundColor: '#1877f2', 
                                    borderColor: '#1877f2',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    padding: '6px 20px'
                                  }}
                                  onClick={handleQuickComment}
                                >
                                  <Send fontSize="small" className="me-1" />
                                  Post Comment
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    {loadingMessages ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" size="sm" style={{ color: '#1877f2' }} />
                        <p className="text-muted mt-2">Loading comments...</p>
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="fb-comments-list">
                        {getTopLevelMessages().map((msg) => {
                          const replies = getMessageReplies(msg.id);
                          const isEditing = editingId === msg.id;
                          
                          return (
                            <div key={msg.id} className="fb-comment-item mb-3">
                              {/* Main Comment */}
                              <div className="d-flex gap-2">
                                <div className="fb-avatar">
                                  <AccountCircle style={{ fontSize: 40, color: '#65676b' }} />
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fb-comment-content">
                                    <div className="fb-comment-bubble">
                                      <div className="d-flex justify-content-between align-items-start mb-1">
                                        <div className="d-flex align-items-center gap-2">
                                          <strong className="fb-comment-author">
                                            {msg.sender?.full_name || msg.sender_name || 'System'}
                                          </strong>
                                          {msg.type && (
                                            <Badge 
                                              bg={msg.type === 'initial' ? 'primary' : msg.type === 'escalation' ? 'danger' : 'success'} 
                                              style={{ 
                                                fontSize: '9px',
                                                padding: '3px 8px',
                                                borderRadius: '10px',
                                                fontWeight: '600',
                                                letterSpacing: '0.3px'
                                              }}
                                            >
                                              {msg.type === 'initial' ? '📝 Initial' : msg.type === 'escalation' ? '⚠️ Escalated' : '💬 Reply'}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      {isEditing ? (
                                        <div className="mt-2">
                                          <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            autoFocus
                                            style={{
                                              borderRadius: '12px',
                                              border: '2px solid #1877f2',
                                              padding: '10px'
                                            }}
                                          />
                                          <div className="d-flex gap-2 mt-2">
                                            <Button 
                                              size="sm" 
                                              variant="outline-secondary" 
                                              onClick={cancelEditing}
                                              style={{ borderRadius: '16px' }}
                                            >
                                              Cancel
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              onClick={() => handleQuickEdit(msg.id)}
                                              style={{
                                                backgroundColor: '#1877f2',
                                                borderColor: '#1877f2',
                                                borderRadius: '16px',
                                                fontWeight: '600'
                                              }}
                                            >
                                              ✓ Save Changes
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="mb-0 mt-1" style={{ lineHeight: '1.6' }}>{msg.message}</p>
                                      )}
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="fb-comment-actions">
                                      <small className="text-muted" style={{ fontWeight: '500', fontSize: '11px' }}>
                                        🕒 {new Date(msg.created_at).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: 'numeric',
                                          minute: '2-digit'
                                        })}
                                      </small>
                                      <span className="text-muted mx-1">•</span>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="fb-action-btn"
                                        onClick={() => setReplyingTo(msg.id)}
                                      >
                                        💬 Reply
                                      </Button>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="fb-action-btn"
                                        onClick={() => startEditing(msg)}
                                      >
                                        ✏️ Edit
                                      </Button>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="fb-action-btn text-danger"
                                        onClick={() => handleDeleteMessage(msg.id)}
                                      >
                                        🗑️ Delete
                                      </Button>
                                    </div>

                                    {/* Reply Input */}
                                    {replyingTo === msg.id && (
                                      <div className="d-flex gap-2 mt-2">
                                        <div className="fb-avatar-small">
                                          <AccountCircle style={{ fontSize: 32, color: '#1877f2' }} />
                                        </div>
                                        <div className="flex-grow-1">
                                          <InputGroup>
                                            <Form.Control
                                              as="textarea"
                                              rows={2}
                                              placeholder="Write a reply..."
                                              value={replyText}
                                              onChange={(e) => setReplyText(e.target.value)}
                                              autoFocus
                                              style={{ resize: 'none', borderRadius: '18px', backgroundColor: '#f0f2f5' }}
                                            />
                                          </InputGroup>
                                          <div className="d-flex gap-2 mt-2">
                                            <Button
                                              size="sm"
                                              variant="light"
                                              onClick={() => {
                                                setReplyingTo(null);
                                                setReplyText('');
                                              }}
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              size="sm"
                                              style={{ backgroundColor: '#1877f2', borderColor: '#1877f2' }}
                                              onClick={() => handleQuickReply(msg.id)}
                                            >
                                              <Send fontSize="small" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Replies Section */}
                                    {replies.length > 0 && (
                                      <div className="fb-replies mt-3">
                                        {!showReplies[msg.id] && (
                                          <Button
                                            variant="link"
                                            size="sm"
                                            className="fb-show-replies"
                                            onClick={() => toggleReplies(msg.id)}
                                          >
                                            <Reply fontSize="small" className="me-2" />
                                            View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                          </Button>
                                        )}
                                        
                                        {showReplies[msg.id] && (
                                          <>
                                            <Button
                                              variant="link"
                                              size="sm"
                                              className="fb-show-replies mb-3"
                                              onClick={() => toggleReplies(msg.id)}
                                              style={{ backgroundColor: 'transparent' }}
                                            >
                                              ⬆️ Hide {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                            </Button>
                                            {replies.map((reply) => (
                                              <div key={reply.id} className="d-flex gap-2 mb-2">
                                                <div className="fb-avatar-small">
                                                  <AccountCircle style={{ fontSize: 32, color: '#65676b' }} />
                                                </div>
                                                <div className="flex-grow-1">
                                                  <div className="fb-comment-bubble-small">
                                                    <strong className="fb-comment-author-small">
                                                      {reply.sender?.full_name || reply.sender_name || 'System'}
                                                    </strong>
                                                    <p className="mb-0" style={{ lineHeight: '1.6' }}>{reply.message}</p>
                                                  </div>
                                                  <div className="fb-comment-actions" style={{ paddingLeft: '8px', marginTop: '4px' }}>
                                                    <small className="text-muted" style={{ fontWeight: '500', fontSize: '10px' }}>
                                                      {new Date(reply.created_at).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                      })}
                                                    </small>
                                                    <span className="text-muted mx-1">•</span>
                                                    <Button
                                                      variant="link"
                                                      size="sm"
                                                      className="fb-action-btn text-danger"
                                                      onClick={() => handleDeleteMessage(reply.id)}
                                                      style={{ padding: '2px 6px !important' }}
                                                    >
                                                      🗑️ Delete
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-5" style={{ 
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '16px',
                        padding: '40px'
                      }}>
                        <div style={{ 
                          background: 'linear-gradient(135deg, #1877f2 0%, #0d6efd 100%)',
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 20px',
                          boxShadow: '0 8px 24px rgba(24, 119, 242, 0.3)'
                        }}>
                          <Message style={{ fontSize: 40, color: '#fff' }} />
                        </div>
                        <h5 style={{ color: '#1c1e21', fontWeight: '700', marginBottom: '8px' }}>
                          No comments yet
                        </h5>
                        <p className="text-muted" style={{ fontSize: '14px' }}>
                          💬 Be the first to share your thoughts and start the conversation!
                        </p>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="attachments" title={`Attachments (${attachments.length})`}>
                  <div className="py-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Complaint Attachments</h5>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddAttachment}
                      >
                        <Add fontSize="small" className="me-1" />
                        Upload Files
                      </Button>
                    </div>
                    {loadingAttachments ? (
                      <div className="text-center">
                        <Spinner animation="border" size="sm" />
                        <p className="text-muted mt-2">Loading attachments...</p>
                      </div>
                    ) : attachments.length > 0 ? (
                      <>
                        <Alert variant="info" className="mb-3">
                          <AttachFile className="me-2" />
                          <strong>Total Attachments:</strong> {attachments.length} file(s)
                        </Alert>
                        <Table hover responsive className="mb-0">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>File Name</th>
                              <th>Type</th>
                              <th>Size</th>
                              <th>Uploaded</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attachments.map((att, index) => (
                              <tr key={att.id}>
                                <td>{index + 1}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <AttachFile className="me-2 text-muted" fontSize="small" />
                                    <strong>{att.file_name}</strong>
                                  </div>
                                  {att.description && (
                                    <small className="text-muted d-block ms-4">{att.description}</small>
                                  )}
                                </td>
                                <td>
                                  <Badge bg="light" text="dark">{att.file_type || 'N/A'}</Badge>
                                </td>
                                <td>{att.file_size ? `${(att.file_size / 1024).toFixed(2)} KB` : 'N/A'}</td>
                                <td>
                                  <small>{new Date(att.created_at).toLocaleDateString()}</small>
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline-primary"
                                      onClick={() => handleView(att.id)}
                                      title="View"
                                    >
                                      <Visibility fontSize="small" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline-success"
                                      onClick={() => handleDownload(att.id, att.file_name)}
                                      title="Download"
                                    >
                                      <Download fontSize="small" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline-danger"
                                      onClick={() => handleDeleteAttachment(att.id)}
                                      title="Delete"
                                    >
                                      <Delete fontSize="small" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </>
                    ) : (
                      <div className="text-center text-muted py-4">
                        <AttachFile style={{ fontSize: 48, opacity: 0.3 }} />
                        <p className="mt-3">No attachments</p>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="logs" title="Activity Log">
                  <div className="py-4 text-muted text-center">
                    {complaint.logs?.length ? (
                      complaint.logs.map(log => (
                        <div key={log.id} className="mb-3 p-3 border rounded text-start">
                          <strong>{log.action}</strong>
                          <br />
                          <small>{new Date(log.created_at).toLocaleString()}</small>
                        </div>
                      ))
                    ) : <p>No logs yet</p>}
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT SIDE */}
        <Col lg={4}>
          {/* Complainant */}
          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Complainant Details</h5></Card.Header>
            <Card.Body>
              <p><strong>Name:</strong> {complaint.complainant_name || complaint.complainant?.full_name || 'N/A'}</p>
              <p><strong>Phone:</strong> {complaint.complainant_phone || complaint.complainant?.office_phone || 'N/A'}</p>

              {complaint.complainant?.email && <p><strong>Email:</strong> {complaint.complainant.email}</p>}
              {complaint.complainant?.address && <p><strong>Address:</strong> {complaint.complainant.address}</p>}
            </Card.Body>
          </Card>

          {/* Timeline */}
          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Timeline</h5></Card.Header>
            <Card.Body>
              <p><strong>Created:</strong> {new Date(complaint.created_at).toLocaleString()}</p>
              {complaint.received_at && <p><strong>Received:</strong> {new Date(complaint.received_at).toLocaleString()}</p>}
              <p><strong>Updated:</strong> {new Date(complaint.updated_at).toLocaleString()}</p>

              {complaint.user_received && (
                <p><strong>Received By:</strong> {complaint.user_received.full_name}</p>
              )}
            </Card.Body>
          </Card>

          {/* Assignments */}
          {complaint.assignments?.length > 0 && (
            <Card className="mb-4">
              <Card.Header><h5 className="mb-0">Assignments</h5></Card.Header>
              <Card.Body>
                {complaint.assignments.map(assign => (
                  <div key={assign.id} className="mb-3 pb-3 border-bottom">
                    <p><strong>Assignee:</strong> {assign.assignee_user?.full_name}</p>
                    <p><strong>Division:</strong> {assign.assignee_division?.name}</p>
                    <small>Due: {assign.due_at ? new Date(assign.due_at).toLocaleDateString() : 'N/A'}</small>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Message Modal */}
      <MessageForm
        show={showMessageModal}
        handleClose={() => setShowMessageModal(false)}
        message={currentMessage}
        handleChange={handleMessageChange}
        handleSubmit={handleMessageSubmit}
        editMode={editingMessage}
      />

      {/* Attachment Modal */}
      <AttachmentForm
        show={showAttachmentModal}
        handleClose={() => setShowAttachmentModal(false)}
        attachment={currentAttachment}
        handleSubmit={handleAttachmentSubmit}
        editMode={editingAttachment}
      />
    </Container>
  );
};

export default Complaint;
