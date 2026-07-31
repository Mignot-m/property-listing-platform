import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Image,
  Badge,
  Button,
  Spinner,
  Alert,
  Carousel,
} from 'react-bootstrap';
import useStore from '../store/useStore';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, favorites, addToFavorites, removeFromFavorites, fetchProperty } = useStore();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [id]);

  useEffect(() => {
    if (property) {
      setIsFavorited(favorites.includes(property._id));
    }
  }, [favorites, property]);

  const loadProperty = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProperty(id);
      if (data) {
        setProperty(data);
      } else {
        setError('Property not found');
      }
    } catch (err) {
      setError('Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (isFavorited) {
      await removeFromFavorites(property._id);
      setIsFavorited(false);
    } else {
      await addToFavorites(property._id);
      setIsFavorited(true);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      const { deleteProperty } = useStore.getState();
      const result = await deleteProperty(property._id);
      if (result.success) {
        navigate('/properties');
      }
    }
  };

  const handlePublish = async () => {
    const { publishProperty } = useStore.getState();
    const result = await publishProperty(property._id);
    if (result.success) {
      setProperty(result.data);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/properties" className="btn btn-primary">
          Back to Properties
        </Link>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Property not found</Alert>
        <Link to="/properties" className="btn btn-primary">
          Back to Properties
        </Link>
      </Container>
    );
  }

  const isOwner = user && (user.id === property.owner?._id || user.id === property.owner);
  const canEdit = isOwner && property.status === 'draft';
  const canPublish = isOwner && property.status === 'draft';

  return (
    <Container className="py-4">
      {/* Back Button */}
      <Link to="/properties" className="btn btn-outline-secondary mb-4">
        ← Back to Properties
      </Link>

      <Row>
        {/* Images Section */}
        <Col lg={7} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              {property.images && property.images.length > 0 ? (
                <Carousel>
                  {property.images.map((img, index) => (
                    <Carousel.Item key={index}>
                      <img
                        src={img}
                        alt={`${property.title} - ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '400px',
                          objectFit: 'cover',
                        }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-light"
                  style={{ height: '400px' }}
                >
                  <p className="text-muted">No images available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Info Section */}
        <Col lg={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h1 className="h3">{property.title}</h1>
                <Badge
                  bg={property.status === 'published' ? 'success' : 'warning'}
                  className="fs-6"
                >
                  {property.status}
                </Badge>
              </div>

              <p className="text-muted">
                <strong>Location:</strong> {property.location}
              </p>

              <h2 className="h4 text-primary">
                ${property.price?.toLocaleString()}
              </h2>

              <hr />

              <p className="mb-3">{property.description}</p>

              <hr />

              <div className="mb-3">
                <p className="mb-1">
                  <strong>Listed by:</strong> {property.owner?.name || 'Unknown'}
                </p>
                <p className="mb-1">
                  <strong>Email:</strong> {property.owner?.email || 'Not available'}
                </p>
                <p className="mb-1">
                  <strong>Views:</strong> {property.views || 0}
                </p>
                {property.publishedAt && (
                  <p className="mb-1">
                    <strong>Published:</strong>{' '}
                    {new Date(property.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <hr />

              {/* Actions */}
              <div className="d-flex flex-wrap gap-2">
                {/* Favorite Button - Only for logged in users */}
                {user && user.role === 'user' && (
                  <Button
                    variant={isFavorited ? 'danger' : 'outline-danger'}
                    onClick={handleFavorite}
                    className="flex-grow-1"
                  >
                    {isFavorited ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                  </Button>
                )}

                {/* Owner Actions */}
                {isOwner && (
                  <>
                    {canEdit && (
                      <Link to={`/properties/edit/${property._id}`}>
                        <Button variant="warning">✏️ Edit</Button>
                      </Link>
                    )}
                    {canPublish && (
                      <Button variant="success" onClick={handlePublish}>
                        📤 Publish
                      </Button>
                    )}
                    <Button variant="danger" onClick={handleDelete}>
                      🗑️ Delete
                    </Button>
                  </>
                )}

                {/* Admin Actions */}
                {user && user.role === 'admin' && (
                  <Button variant="danger" onClick={handleDelete}>
                    🗑️ Delete (Admin)
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PropertyDetail;