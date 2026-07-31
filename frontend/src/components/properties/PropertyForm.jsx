import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Image,
  Badge,
} from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import useStore from '../store/useStore';

const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, createProperty, updateProperty, fetchProperty, loading } = useStore();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [propertyData, setPropertyData] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      location: '',
      price: '',
      status: 'draft',
    },
  });

  const status = watch('status');

  // Load property data if editing
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    setLoadingProperty(true);
    try {
      const data = await fetchProperty(id);
      if (data) {
        setPropertyData(data);
        setImagePreviews(data.images || []);
        reset({
          title: data.title,
          description: data.description,
          location: data.location,
          price: data.price,
          status: data.status,
        });
      } else {
        setError('Property not found');
      }
    } catch (err) {
      setError('Failed to load property');
    } finally {
      setLoadingProperty(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Max 10 images
    if (imageFiles.length + files.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(
        file.type
      );
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      if (!isValidType) setError(`${file.name}: Invalid file type`);
      if (!isValidSize) setError(`${file.name}: File too large (max 5MB)`);
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    // Create previews
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
    setImageFiles([...imageFiles, ...validFiles]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
  };

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    
    // Validation: At least one image required for new properties
    if (!isEditMode && imageFiles.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('location', data.location);
      formData.append('price', data.price);
      formData.append('status', data.status);

      // Append images
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      let result;
      if (isEditMode) {
        result = await updateProperty(id, formData);
      } else {
        result = await createProperty(formData);
      }

      if (result.success) {
        setSuccess(isEditMode ? 'Property updated successfully!' : 'Property created successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(result.message || 'Operation failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  // Check if user can create/edit
  if (user?.role !== 'owner' && user?.role !== 'admin') {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          You don't have permission to create or edit properties.
        </Alert>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Container>
    );
  }

  if (loadingProperty) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading property...</p>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">
            {isEditMode ? '✏️ Edit Property' : '🏠 Create New Property'}
          </h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={8}>
                {/* Title */}
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter property title"
                    {...register('title', {
                      required: 'Title is required',
                      minLength: {
                        value: 5,
                        message: 'Title must be at least 5 characters',
                      },
                      maxLength: {
                        value: 100,
                        message: 'Title cannot exceed 100 characters',
                      },
                    })}
                    isInvalid={!!errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Describe your property"
                    {...register('description', {
                      required: 'Description is required',
                      minLength: {
                        value: 20,
                        message: 'Description must be at least 20 characters',
                      },
                    })}
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Location */}
                <Form.Group className="mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Addis Ababa, Ethiopia"
                    {...register('location', {
                      required: 'Location is required',
                    })}
                    isInvalid={!!errors.location}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.location?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    {/* Price */}
                    <Form.Group className="mb-3">
                      <Form.Label>Price *</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter price"
                        {...register('price', {
                          required: 'Price is required',
                          min: {
                            value: 0,
                            message: 'Price cannot be negative',
                          },
                        })}
                        isInvalid={!!errors.price}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.price?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    {/* Status */}
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        {...register('status')}
                        isInvalid={!!errors.status}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Publish Now</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        {status === 'draft' 
                          ? 'Draft properties can be edited later' 
                          : 'Published properties will be visible to everyone'}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col md={4}>
                {/* Image Upload */}
                <Card className="shadow-sm">
                  <Card.Header>Images</Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Upload Images (Max 10)</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        disabled={imagePreviews.length >= 10}
                      />
                      <Form.Text className="text-muted">
                        {imagePreviews.length}/10 images uploaded
                      </Form.Text>
                    </Form.Group>

                    {imagePreviews.length > 0 && (
                      <div className="mt-3">
                        <div className="d-flex flex-wrap gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="position-relative">
                              <Image
                                src={preview}
                                thumbnail
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0 rounded-circle"
                                style={{ width: '20px', height: '20px', padding: '0', fontSize: '10px' }}
                                onClick={() => removeImage(index)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isEditMode && propertyData?.images?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-muted small">Existing images will be kept unless you upload new ones.</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Property' : 'Create Property'
                )}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PropertyForm;