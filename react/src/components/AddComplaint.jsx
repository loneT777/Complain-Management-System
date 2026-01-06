import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { ArrowBack, Save, Close, AttachFile } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Bootstrap color variant mapping to hex colors
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
    remark: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/public/categories');
      console.log('Categories response:', response.data);
      if (response.data.success) {
        setCategories(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComplaint((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleRemoveCategory = (categoryId) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const complaintData = {
        ...complaint,
        category_ids: selectedCategories,
      };

      await axios.post('http://localhost:8000/api/complaints', complaintData);
      alert('Complaint added successfully!');
      navigate('/complaints');
    } catch (error) {
      console.error('Error adding complaint:', error);
      alert('Failed to add complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-4">

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">New complaint</h5>
            </Card.Header>

            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Priority Level Radio Buttons at Top */}
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
                                  complaint.priority_level === priority.value
                                    ? bootstrapColors[priority.variant].light
                                    : '#f8f9fa',
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
                  {/* Title */}
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        Title <span className="text-danger">*</span>
                      </Form.Label>
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

                  {/* Description */}
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        Description <span className="text-danger">*</span>
                      </Form.Label>
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

                  {/* Categories */}
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Categories</Form.Label>

                      <div className="mb-2">
                        {selectedCategories.length > 0 ? (
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
                                    <Close
                                      fontSize="small"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => handleRemoveCategory(catId)}
                                    />
                                  </Badge>
                                )
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-muted small">No categories selected</div>
                        )}
                      </div>

                      <Form.Select
                        value=""
                        onChange={(e) => {
                          const value = e.target.value;
                          console.log('Selected category:', value);
                          if (value) {
                            handleCategoryToggle(parseInt(value));
                          }
                        }}
                      >
                        <option value="">Select a category to add...</option>
                        {categories
                          .filter((c) => !selectedCategories.includes(c.id))
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.category_name}
                              {category.parent ? ` (${category.parent.category_name})` : ''}
                            </option>
                          ))}
                      </Form.Select>

                      <Form.Text className="text-muted">
                        Select multiple categories that apply to this complaint
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  {/* Complainant Name */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Complainant Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="complainant_name"
                        value={complaint.complainant_name}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  {/* Confidentiality */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Confidentiality Level</Form.Label>
                      <Form.Select
                        name="confidentiality_level"
                        value={complaint.confidentiality_level}
                        onChange={handleChange}
                      >
                        <option value="">Select confidentiality</option>
                        <option value="Public">Public</option>
                        <option value="Confidential">Confidential</option>
                        <option value="Highly Confidential">Highly Confidential</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Channel */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Channel</Form.Label>
                      <Form.Select
                        name="channel"
                        value={complaint.channel}
                        onChange={handleChange}
                      >
                        <option value="">Select channel</option>
                        <option value="Phone">Phone</option>
                        <option value="Email">Email</option>
                        <option value="In-Person">In-Person</option>
                        <option value="Online Portal">Online Portal</option>
                        <option value="Letter">Letter</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Attachments (future) */}
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        Attachments{' '}
                      </Form.Label>
                      <div
                        className="border rounded p-4 text-center"
                        style={{
                          backgroundColor: '#f8f9fa',
                          cursor: 'not-allowed',
                          opacity: 0.7,
                        }}
                      >
                        <AttachFile style={{ fontSize: '3rem', color: '#6c757d' }} />
                        <p className="mb-0 text-muted">File attachment</p>
                      </div>
                    </Form.Group>
                  </Col>

                  {/* Remarks */}
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

                {/* Buttons */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/complaints')}
                    disabled={loading}
                  >
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

        {/* Right Panel */}
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
