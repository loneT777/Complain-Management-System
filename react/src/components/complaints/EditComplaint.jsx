import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { ArrowBack, Save, Close, AttachFile, Title as TitleIcon, Description, Category, Person, Lock, Phone, Notes, Flag, ContactPhone } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [complaint, setComplaint] = useState({
    title: '',
    description: '',
    channel: '',
    priority_level: '',
    confidentiality_level: '',
    complainant_name: '',
    complainant_phone: '',
    remark: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchComplaintData();
  }, [id]);

  const fetchComplaintData = async () => {
    setFetchingData(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/complaints/${id}`);
      const data = response.data;
      
      setComplaint({
        title: data.title || '',
        description: data.description || '',
        channel: data.channel || '',
        priority_level: data.priority_level || '',
        confidentiality_level: data.confidentiality_level || '',
        complainant_name: data.complainant_name || '',
        complainant_phone: data.complainant_phone || '',
        remark: data.remark || ''
      });

      // If complaint has categories, set them
      if (data.categories && Array.isArray(data.categories)) {
        setSelectedCategories(data.categories.map(cat => cat.id));
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      alert('Failed to load complaint data');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/public/categories');
      if (response.data.success) {
        setCategories(response.data.data);
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

      await axios.put(`http://localhost:8000/api/complaints/${id}`, complaintData);
      alert('Complaint updated successfully!');
      navigate(`/complaint/${id}`);
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Failed to update complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <p>Loading complaint data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button
                variant="link"
                className="text-decoration-none p-0 me-3"
                onClick={() => navigate(`/complaint/${id}`)}
              >
                <ArrowBack className="me-1" fontSize="small" /> Back to Complaint
              </Button>
              <span className="mx-2">/</span>
              <h4 className="mb-0">Edit Complaint</h4>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Complaint Information</h5>
            </Card.Header>

            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <TitleIcon fontSize="small" className="me-1" /> Title <span className="text-danger">*</span>
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

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <Description fontSize="small" className="me-1" /> Description <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="description"
                        value={complaint.description}
                        onChange={handleChange}
                        placeholder="Enter detailed description of the complaint"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label><Category fontSize="small" className="me-1" /> Categories</Form.Label>
                      <div className="mb-2">
                        {selectedCategories.length > 0 ? (
                          <div className="d-flex flex-wrap gap-2">
                            {selectedCategories.map((catId) => {
                              const category = categories.find((c) => c.id === catId);
                              return category ? (
                                <Badge
                                  key={catId}
                                  bg="primary"
                                  className="d-flex align-items-center gap-1"
                                  style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
                                >
                                  {category.category_name}
                                  <Close
                                    fontSize="small"
                                    style={{ cursor: 'pointer', fontSize: '1rem' }}
                                    onClick={() => handleRemoveCategory(catId)}
                                  />
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <div className="text-muted small">No categories selected</div>
                        )}
                      </div>
                      <Form.Select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleCategoryToggle(parseInt(e.target.value));
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="">Select a category to add...</option>
                        {categories
                          .filter((cat) => !selectedCategories.includes(cat.id))
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.category_name}
                              {category.parent && ` (${category.parent.category_name})`}
                            </option>
                          ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Select multiple categories that apply to this complaint
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label><Person fontSize="small" className="me-1" /> Complainant Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="complainant_name"
                        value={complaint.complainant_name}
                        onChange={handleChange}
                        placeholder="Enter complainant name"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label><Phone fontSize="small" className="me-1" /> Complainant Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="complainant_phone"
                        value={complaint.complainant_phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label><ContactPhone fontSize="small" className="me-1" /> Channel</Form.Label>
                      <Form.Select
                        name="channel"
                        value={complaint.channel}
                        onChange={handleChange}
                      >
                        <option value="">Select channel</option>
                        <option value="Phone">Phone</option>
                        <option value="Email">Email</option>
                        <option value="In Person">In Person</option>
                        <option value="Online Portal">Online Portal</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Letter">Letter</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label><Flag fontSize="small" className="me-1" /> Priority Level</Form.Label>
                      <Form.Select
                        name="priority_level"
                        value={complaint.priority_level}
                        onChange={handleChange}
                      >
                        <option value="">Select priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label><Lock fontSize="small" className="me-1" /> Confidentiality Level</Form.Label>
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

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <AttachFile fontSize="small" className="me-1" /> Attachments <Badge bg="secondary" className="ms-2">Future Feature</Badge>
                      </Form.Label>
                      <div 
                        className="border rounded p-4 text-center"
                        style={{ 
                          backgroundColor: '#f8f9fa',
                          cursor: 'not-allowed',
                          opacity: 0.7
                        }}
                      >
                        <AttachFile style={{ fontSize: '3rem', color: '#6c757d' }} />
                        <p className="mb-0 text-muted">File attachment feature coming soon</p>
                        <small className="text-muted">You will be able to upload documents, images, and other files</small>
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label><Notes fontSize="small" className="me-1" /> Remarks</Form.Label>
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
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(`/complaint/${id}`)}
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
                    {loading ? 'Updating...' : 'Update Complaint'}
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
                <li className="mb-2">Update the complaint details as needed</li>
                <li className="mb-2">Title and Description are required fields</li>
                <li className="mb-2">Adjust priority level if necessary</li>
                <li className="mb-2">Update complainant information</li>
                <li className="mb-2">Modify categories or add new ones</li>
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Priority Guidelines</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong className="text-danger">Urgent:</strong>
                <p className="mb-0 small">Requires immediate attention</p>
              </div>
              <div className="mb-3">
                <strong className="text-warning">High:</strong>
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

export default EditComplaint;
