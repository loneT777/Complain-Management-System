import React from 'react';
import { Table, Button, Spinner, Badge } from 'react-bootstrap';
import { Edit, Delete, Chat } from '@mui/icons-material';
import { format } from 'date-fns';

const MessageTable = ({ messages, loading, handleEdit, handleDelete, handleViewThread }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  const getMessageTypeBadge = (type) => {
    if (!type) return <Badge bg="secondary">General</Badge>;
    
    const typeVariants = {
      'reply': 'primary',
      'update': 'info',
      'resolution': 'success',
      'escalation': 'warning',
      'internal': 'secondary'
    };

    return <Badge bg={typeVariants[type.toLowerCase()] || 'secondary'}>{type}</Badge>;
  };

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Complaint</th>
            <th>Message</th>
            <th>Type</th>
            <th>Parent ID</th>
            <th>Created At</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-muted py-4">
                No messages found
              </td>
            </tr>
          ) : (
            messages.map((message) => (
              <tr key={message.id}>
                <td>{message.id}</td>
                <td>
                  {message.complaint ? (
                    <div>
                      <strong>{message.complaint.reference_no || `#${message.complaint.id}`}</strong>
                      <br />
                      <small className="text-muted">{message.complaint.title}</small>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {message.message}
                </td>
                <td>{getMessageTypeBadge(message.type)}</td>
                <td>{message.parent_id || '-'}</td>
                <td>{formatDate(message.created_at)}</td>
                <td className="text-center">
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleViewThread(message.complaint_id)}
                    title="View Thread"
                  >
                    <Chat fontSize="small" />
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(message)}
                  >
                    <Edit fontSize="small" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(message.id)}
                  >
                    <Delete fontSize="small" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default MessageTable;
