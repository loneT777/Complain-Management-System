import React from 'react';
import { Table, Button, Spinner, Badge } from 'react-bootstrap';
import { Edit, Delete, Download, Visibility } from '@mui/icons-material';
import { format } from 'date-fns';

const AttachmentTable = ({ attachments, complaints, loading, handleEdit, handleDelete, handleDownload }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const getComplaintRef = (complaintId) => {
    const complaint = complaints.find(c => c.id === complaintId);
    return complaint ? complaint.reference_no : '-';
  };

  const getFileIcon = (extension) => {
    const ext = extension?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['zip', 'rar', '7z'].includes(ext)) return '🗜️';
    return '📎';
  };

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>File</th>
            <th>Complaint</th>
            <th>Description</th>
            <th>Type</th>
            <th>Uploaded</th>
            <th className="text-center" style={{ width: '200px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {attachments.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-muted py-4">
                No attachments found
              </td>
            </tr>
          ) : (
            attachments.map((attachment) => (
              <tr key={attachment.id}>
                <td>{attachment.id}</td>
                <td>
                  <span className="me-2">{getFileIcon(attachment.extension)}</span>
                  {attachment.file_name}
                </td>
                <td>
                  <Badge bg="secondary">{getComplaintRef(attachment.complaint_id)}</Badge>
                </td>
                <td>
                  <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachment.description || '-'}
                  </div>
                </td>
                <td>
                  <Badge bg="info">{attachment.extension?.toUpperCase() || 'N/A'}</Badge>
                </td>
                <td>
                  {attachment.uploaded_at 
                    ? format(new Date(attachment.uploaded_at), 'MMM dd, yyyy HH:mm')
                    : '-'}
                </td>
                <td className="text-center">
                  {handleDownload && (
                    <Button
                      variant="success"
                      size="sm"
                      className="me-1"
                      onClick={() => handleDownload(attachment)}
                      title="Download"
                    >
                      <Download fontSize="small" />
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-1"
                    onClick={() => handleEdit(attachment)}
                    title="Edit"
                  >
                    <Edit fontSize="small" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(attachment.id)}
                    title="Delete"
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

export default AttachmentTable;
