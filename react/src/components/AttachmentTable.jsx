import React, { useState } from 'react';
import { Table, Button, Spinner, Badge, Collapse } from 'react-bootstrap';
import { Edit, Delete, Download, Visibility, ExpandMore, ExpandLess } from '@mui/icons-material';
import { format } from 'date-fns';

const AttachmentTable = ({ attachments, complaints, loading, handleEdit, handleDelete, handleDownload, handleView }) => {
  const [expandedGroups, setExpandedGroups] = useState({});

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

  // Data is already grouped by complaint from API
  // Just format it for display
  const groupedArray = attachments.map((attachment) => ({
    key: attachment.id,
    complaint_id: attachment.id,
    uploaded_at: attachment.uploaded_at,
    description: attachment.description,
    user_id: attachment.user_id,
    reference_no: attachment.reference_no,
    files: attachment.files || []
  }));

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead className="table-light">
          <tr>
            <th style={{ width: '50px' }}></th>
            <th>ID</th>
            <th>Files</th>
            <th>Complaint</th>
            <th>Description</th>
            <th>Uploaded</th>
            <th className="text-center" style={{ width: '200px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groupedArray.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-muted py-4">
                No attachments found
              </td>
            </tr>
          ) : (
            groupedArray.map((group) => {
              const isExpanded = expandedGroups[group.key];
              const firstFile = group.files[0];
              const fileCount = group.files.length;

              return (
                <React.Fragment key={group.key}>
                  <tr>
                    <td className="text-center">
                      {fileCount > 1 && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => toggleGroup(group.key)}
                          className="p-0"
                        >
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </Button>
                      )}
                    </td>
                    <td>
                      {group.complaint_id}
                    </td>
                    <td>
                      {fileCount > 1 ? (
                        <div>
                          <strong>Multiple Files ({fileCount})</strong>
                          {!isExpanded && (
                            <div className="text-muted small mt-1">
                              {group.files.slice(0, 2).map((f, i) => (
                                <div key={i}>
                                  {getFileIcon(f.extension)} {f.file_name}
                                </div>
                              ))}
                              {fileCount > 2 && <div>... and {fileCount - 2} more</div>}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <span className="me-2">{getFileIcon(firstFile.extension)}</span>
                          {firstFile.file_name}
                        </>
                      )}
                    </td>
                    <td>
                      <Badge bg="secondary">{group.reference_no || getComplaintRef(group.complaint_id)}</Badge>
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {group.description || '-'}
                      </div>
                    </td>
                    <td>
                      {group.uploaded_at 
                        ? format(new Date(group.uploaded_at), 'MMM dd, yyyy HH:mm')
                        : '-'}
                    </td>
                    <td className="text-center">
                      {fileCount === 1 ? (
                        <>
                          <Button
                            variant="info"
                            size="sm"
                            className="me-1"
                            onClick={() => handleView(firstFile)}
                            title="View"
                          >
                            <Visibility fontSize="small" />
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-1"
                            onClick={() => handleDownload(firstFile)}
                            title="Download"
                          >
                            <Download fontSize="small" />
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleEdit(firstFile)}
                            title="Edit"
                          >
                            <Edit fontSize="small" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(firstFile.id)}
                            title="Delete"
                          >
                            <Delete fontSize="small" />
                          </Button>
                        </>
                      ) : (
                        <Badge bg="secondary">Expand to see actions</Badge>
                      )}
                    </td>
                  </tr>
                  {isExpanded && fileCount > 1 && group.files.map((file, index) => (
                    <tr key={file.id} className="table-secondary">
                      <td></td>
                      <td className="ps-4"></td>
                      <td className="ps-4">
                        <span className="me-2">{getFileIcon(file.extension)}</span>
                        {file.file_name}
                      </td>
                      <td>
                        <Badge bg="info">{file.extension?.toUpperCase() || 'N/A'}</Badge>
                      </td>
                      <td colSpan="2"></td>
                      <td className="text-center">
                        <Button
                          variant="info"
                          size="sm"
                          className="me-1"
                          onClick={() => handleView(file)}
                          title="View"
                        >
                          <Visibility fontSize="small" />
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-1"
                          onClick={() => handleDownload(file)}
                          title="Download"
                        >
                          <Download fontSize="small" />
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEdit(file)}
                          title="Edit"
                        >
                          <Edit fontSize="small" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                          title="Delete"
                        >
                          <Delete fontSize="small" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default AttachmentTable;
