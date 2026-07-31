import { useEffect, useState } from 'react';
import { Row, Col, Card, ListGroup, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

const UserDashboard = () => {
  const { favorites, fetchFavorites, properties, fetchProperties } = useStore();
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('🔄 UserDashboard: Loading data...');
        // Fetch properties first
        await fetchProperties({});
        // Then fetch favorites
        await fetchFavorites();
        console.log('✅ UserDashboard: Data loaded successfully');
      } catch (err) {
        console.error('❌ UserDashboard: Error:', err);
        setError('Failed to load your favorites');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Get full property objects for favorites
  useEffect(() => {
    console.log('📊 UserDashboard: Favorites:', favorites);
    console.log('📊 UserDashboard: Properties:', properties);
    
    if (favorites.length > 0 && properties.length > 0) {
      const favProps = properties.filter(p => favorites.includes(p._id));
      console.log('📊 UserDashboard: Favorite properties:', favProps);
      setFavoriteProperties(favProps);
    } else {
      setFavoriteProperties([]);
    }
  }, [favorites, properties]);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your favorites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        <Alert.Heading>Error Loading Favorites</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Row>
      <Col md={8}>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>❤️ My Favorites</span>
            <Badge bg="info">{favorites.length} items</Badge>
          </Card.Header>
          <Card.Body>
            {favorites.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">You haven't added any properties to your favorites yet.</p>
                <Link to="/properties">
                  <Button variant="primary" size="sm">Browse Properties</Button>
                </Link>
              </div>
            ) : (
              <ListGroup variant="flush">
                {favoriteProperties.map((property) => (
                  <ListGroup.Item key={property._id} className="d-flex justify-content-between align-items-center">
                    <Link to={`/properties/${property._id}`} className="text-decoration-none flex-grow-1">
                      <div>
                        <strong>{property.title}</strong>
                        <br />
                        <small className="text-muted">
                          ${property.price?.toLocaleString()} • {property.location}
                        </small>
                      </div>
                    </Link>
                    <Badge bg={property.status === 'published' ? 'success' : 'warning'}>
                      {property.status}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Header>Quick Actions</Card.Header>
          <Card.Body>
            <div className="d-grid gap-2">
              <Link to="/properties">
                <Button variant="primary" className="w-100">🔍 Browse Properties</Button>
              </Link>
              <Link to="/">
                <Button variant="outline-secondary" className="w-100">🏠 Home</Button>
              </Link>
            </div>
            <hr />
            <p className="text-muted small mb-0">
              💡 Tip: Click the heart icon on any property to add or remove it from your favorites.
            </p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default UserDashboard;