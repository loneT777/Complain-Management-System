import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { Save, Close, AttachFile, Upload, X as XIcon, Description } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';

const AddComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const fileInputRef = useRef(null);
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  const bootstrapColors = {
    secondary: { hex: '#6c757d', light: '#e2e3e5' },
    info: { hex: '#0dcaf0', light: '#cff4fc' },
    warning: { hex: '#ffc107', light: '#fff3cd' },
    danger: { hex: '#dc3545', light: '#f8d7da' }
  };

  const priorityLevels = [
    { value: 'Low', variant: 'secondary', label: 'Low' },
    { value: 'Medium', variant: 'info', label: 'Medium' },
    { value: 'Urgent', variant: 'warning', label: 'Urgent' },
    { value: 'Very Urgent', variant: 'danger', label: 'Very Urgent' }
  ];

  const [complaint, setComplaint] = useState({
    title: '',
    description: '',
    channel: '',
    priority_level: 'Medium',
    confidentiality_level: '',
    complainant_name: '',
    complainant_phone: '',
    remark: '',
    attachments: []
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/public/categories');
      console.log('Categories response:', response.data);
      
      let categoryData = [];
      if (response.data.success && Array.isArray(response.data.data)) {
        categoryData = response.data.data;
      } else if (Array.isArray(response.data)) {
        categoryData = response.data;
      }
      
      console.log('Processed categories:', categoryData);
      setCategories(categoryData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to fetch categories. Please refresh the page.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComplaint((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]));
  };

  const handleRemoveCategory = (categoryId) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }, []);

  const processFiles = useCallback((files) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    const validFiles = [];
    const errorMessages = [];

    const totalFiles = attachmentPreviews.length + files.length;
    if (totalFiles > 5) {
      setErrors((prev) => ({
        ...prev,
        attachments: `You can only upload up to 5 files. Currently selected: ${attachmentPreviews.length}`
      }));
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        errorMessages.push(`${file.name}: File size must be less than 5MB`);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        errorMessages.push(`${file.name}: Only PDF, Word, Excel, and image files are allowed`);
        return;
      }

      validFiles.push(file);
    });

    if (errorMessages.length > 0) {
      setErrors((prev) => ({
        ...prev,
        attachments: errorMessages.join('\n')
      }));
    }

    if (validFiles.length > 0) {
      setComplaint((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles]
      }));

      const newPreviews = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name
      }));
      
      setAttachmentPreviews(prev => [...prev, ...newPreviews]);

      if (errors.attachments && errorMessages.length === 0) {
        setErrors((prev) => ({ ...prev, attachments: '' }));
      }
    }
  }, [attachmentPreviews.length, errors]);

  const handleRemoveFile = useCallback((index) => {
    setComplaint((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));

    setAttachmentPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      prev.filter((_, i) => i === index).forEach(preview => {
        if (preview.preview) {
          URL.revokeObjectURL(preview.preview);
        }
      });
      return newPreviews;
    });

    if (complaint.attachments.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [complaint.attachments.length]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  }, [processFiles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get user data to include their person_id as complainant
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      const formData = new FormData();
      
      formData.append('title', complaint.title);
      formData.append('description', complaint.description);
      formData.append('priority_level', complaint.priority_level);
      
      if (complaint.channel) formData.append('channel', complaint.channel);
      if (complaint.confidentiality_level) formData.append('confidentiality_level', complaint.confidentiality_level);
      if (complaint.complainant_name) formData.append('complainant_name', complaint.complainant_name);
      if (complaint.complainant_phone) formData.append('complainant_phone', complaint.complainant_phone);
      if (complaint.remark) formData.append('remark', complaint.remark);
      if (userData?.person_id) formData.append('complainant_id', userData.person_id);

      selectedCategories.forEach((catId, index) => {
        formData.append(`category_ids[${index}]`, catId);
      });

      complaint.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      const response = await axios.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success || response.status === 201 || response.status === 200) {
        alert('Complaint added successfully!');
        navigate('/complaints');
      } else {
        setError(response.data.message || 'Failed to add complaint. Please try again.');
      }
    } catch (error) {
      console.error('Error adding complaint:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add complaint. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h4 className="mb-0">New Complaint</h4>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <div className="alert alert-danger">{error}</div>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">New complaint</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-4">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="mb-3" style={{ fontWeight: '600', display: 'block' }}>
                        Priority Level <span className="text-danger">*</span>
                      </Form.Label>
                      <div className="d-flex gap-3 flex-wrap">
                        {priorityLevels.map((priority) => (
                          <div key={priority.value}>
                            <label
                              htmlFor={`priority_${priority.value}`}
                              style={{
                                cursor: 'pointer',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                backgroundColor:
                                  complaint.priority_level === priority.value ? bootstrapColors[priority.variant].light : '#f8f9fa',
                                border: `2px solid ${bootstrapColors[priority.variant].hex}`,
                                color: bootstrapColors[priority.variant].hex,
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <input
                                className="form-check-input m-0"
                                type="radio"
                                name="priority_level"
                                id={`priority_${priority.value}`}
                                value={priority.value}
                                checked={complaint.priority_level === priority.value}
                                onChange={handleChange}
                                required
                                style={{ cursor: 'pointer' }}
                              />
                              <span>{priority.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={complaint.title}
                        onChange={handleChange}
                        placeholder="Enter complaint title"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="description"
                        value={complaint.description}
                        onChange={handleChange}
                        placeholder="Enter detailed description"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Categories</Form.Label>
                      <div className="mb-2">
                        {selectedCategories.length > 0 && (
                          <div className="d-flex flex-wrap gap-2">
                            {selectedCategories.map((catId) => {
                              const category = categories.find((c) => c.id === catId);
                              return (
                                category && (
                                  <Badge
                                    key={catId}
                                    bg="primary"
                                    className="d-flex align-items-center gap-1"
                                    style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
                                  >
                                    {category.category_name}
                                    <Close fontSize="small" style={{ cursor: 'pointer' }} onClick={() => handleRemoveCategory(catId)} />
                                  </Badge>
                                )
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <Form.Select
                        value=""
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            handleCategoryToggle(parseInt(value));
                          }
                        }}
                      >
                        <option value="">Select multiple categories that apply to this complaint</option>
                        {categories
                          .filter((c) => !selectedCategories.includes(c.id))
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.category_name}
                              {category.parent ? ` (${category.parent.category_name})` : ''}
                            </option>
                          ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Complainant Name</Form.Label>
                      <Form.Control type="text" name="complainant_name" value={complaint.complainant_name} onChange={handleChange} />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Complainant Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="complainant_phone"
                        value={complaint.complainant_phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Confidentiality Level</Form.Label>
                      <Form.Select name="confidentiality_level" value={complaint.confidentiality_level} onChange={handleChange}>
                        <option value="">Select confidentiality</option>
                        <option value="Public">Public</option>
                        <option value="Confidential">Confidential</option>
                        <option value="Highly Confidential">Highly Confidential</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Channel</Form.Label>
                      <Form.Select name="channel" value={complaint.channel} onChange={handleChange}>
                        <option value="">Select channel</option>
                        <option value="Phone">Phone</option>
                        <option value="Email">Email</option>
                        <option value="In-Person">In-Person</option>
                        <option value="Online Portal">Online Portal</option>
                        <option value="Letter">Letter</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Attachments (Max 5 files)</Form.Label>
                      <div
                        className={`border rounded p-4 text-center ${isDragging ? 'border-primary bg-light' : 'border-secondary'}`}
                        style={{
                          borderStyle: 'dashed',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          minHeight: '120px'
                        }}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          multiple
                          style={{ display: 'none' }}
                        />
                        {attachmentPreviews.length > 0 ? (
                          <div className="text-start">
                            <div className="mb-2 fw-bold">
                              Selected Files ({attachmentPreviews.length}/5):
                            </div>
                            {attachmentPreviews.map((preview, index) => (
                              <div
                                key={index}
                                className="d-flex align-items-center justify-content-between mb-2 p-2 bg-light rounded"
                              >
                                <div className="d-flex align-items-center">
                                  <Description fontSize="small" className="me-2 text-primary" />
                                  <div>
                                    <div className="fw-bold">{preview.name}</div>
                                    <div className="text-muted small">
                                      {preview.file ? `${(preview.file.size / 1024 / 1024).toFixed(2)} MB` : 'File'}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFile(index);
                                  }}
                                  style={{ borderRadius: '0.3rem' }}
                                >
                                  <XIcon fontSize="small" />
                                </Button>
                              </div>
                            ))}
                            {attachmentPreviews.length < 5 && (
                              <div className="text-center mt-3">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                  }}
                                  style={{ borderRadius: '0.3rem' }}
                                >
                                  <AttachFile fontSize="small" className="me-1" />
                                  Add More Files
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="d-flex flex-column align-items-center">
                            <Upload
                              style={{
                                fontSize: '2rem',
                                color: '#6c757d',
                                marginBottom: '0.5rem'
                              }}
                            />
                            <div className="fw-bold">
                              {isDragging ? 'Drop files here' : 'Drag & drop files here or click to browse'}
                            </div>
                            <div className="text-muted small mt-1">
                              Allowed: PDF, Word, Excel, Images (Max 5MB each, up to 5 files)
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.attachments && (
                        <div className="text-danger small mt-1">{errors.attachments}</div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Remarks</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="remark"
                        value={complaint.remark}
                        onChange={handleChange}
                        placeholder="Enter any additional remarks"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button variant="outline-secondary" onClick={() => navigate('/complaints')} disabled={loading}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    style={{ backgroundColor: '#3a4c4a', borderColor: '#3a4c4a' }}
                    disabled={loading}
                  >
                    <Save className="me-1" fontSize="small" />
                    {loading ? 'Saving...' : 'Save Complaint'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Instructions</h5>
            </Card.Header>
            <Card.Body>
              <ul className="mb-0">
                <li>Fill in the complaint details carefully</li>
                <li>Title and Description are required</li>
                <li>Select appropriate priority level</li>
                <li>Provide complainant information if available</li>
                <li>Add any relevant remarks</li>
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Priority Guidelines</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong className="text-danger">Very Urgent:</strong>
                <p className="mb-0 small">Requires immediate attention</p>
              </div>
              <div className="mb-3">
                <strong className="text-warning">Urgent:</strong>
                <p className="mb-0 small">Should be addressed within 24 hours</p>
              </div>
              <div className="mb-3">
                <strong className="text-info">Medium:</strong>
                <p className="mb-0 small">Should be addressed within 3-5 days</p>
              </div>
              <div>
                <strong className="text-secondary">Low:</strong>
                <p className="mb-0 small">Can be addressed within a week</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddComplaint;