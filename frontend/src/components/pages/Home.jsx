import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

const Home = () => {
  const { user } = useStore();

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col className="text-center">
          <h1 className="display-3 fw-bold">🏠 Find Your Dream Property</h1>
          <p className="lead text-muted">
            Discover the best properties in Ethiopia. Buy, sell, or rent with ease.
          </p>
          <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
            <Link to="/properties">
              <Button variant="primary" size="lg">Browse Properties</Button>
            </Link>
            {!user && (
              <Link to="/register">
                <Button variant="outline-primary" size="lg">Get Started</Button>
              </Link>
            )}
          </div>
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="mb-5">
        <Col className="text-center">
          <h2 className="mb-4">Why Choose Us?</h2>
        </Col>
      </Row>
      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <div className="display-1 mb-3">🏘️</div>
              <Card.Title>Wide Selection</Card.Title>
              <Card.Text className="text-muted">
                Browse through hundreds of properties from verified owners.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <div className="display-1 mb-3">🔒</div>
              <Card.Title>Secure Transactions</Card.Title>
              <Card.Text className="text-muted">
                Safe and secure platform with verified users and properties.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <div className="display-1 mb-3">⭐</div>
              <Card.Title>Easy to Use</Card.Title>
              <Card.Text className="text-muted">
                Simple and intuitive interface for finding your dream property.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Role Cards Section */}
      <Row className="mb-5">
        <Col className="text-center">
          <h2 className="mb-4">Who Are You?</h2>
        </Col>
      </Row>
      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm border-primary">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0">🏠 Property Owner</h4>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                List your properties, upload images, manage listings, and reach potential buyers.
              </Card.Text>
              <ul className="list-unstyled">
                <li>✅ List properties</li>
                <li>✅ Upload images</li>
                <li>✅ Track views</li>
                <li>✅ Publish listings</li>
              </ul>
              {!user ? (
                <Link to="/register">
                  <Button variant="primary" className="w-100">Get Started as Owner</Button>
                </Link>
              ) : user.role === 'owner' && (
                <Link to="/properties/create">
                  <Button variant="primary" className="w-100">Create New Property</Button>
                </Link>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm border-success">
            <Card.Header className="bg-success text-white text-center">
              <h4 className="mb-0">👤 Regular User</h4>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                Find your dream property, save favorites, and contact property owners.
              </Card.Text>
              <ul className="list-unstyled">
                <li>✅ Browse properties</li>
                <li>✅ Save favorites</li>
                <li>✅ View details</li>
                <li>✅ Contact owners</li>
              </ul>
              {!user ? (
                <Link to="/register">
                  <Button variant="success" className="w-100">Get Started as User</Button>
                </Link>
              ) : user.role === 'user' && (
                <Link to="/properties">
                  <Button variant="success" className="w-100">Browse Properties</Button>
                </Link>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm border-danger">
            <Card.Header className="bg-danger text-white text-center">
              <h4 className="mb-0">🛡️ Admin</h4>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                Manage users, properties, and monitor platform activity with full control.
              </Card.Text>
              <ul className="list-unstyled">
                <li>✅ View all properties</li>
                <li>✅ Manage users</li>
                <li>✅ Disable listings</li>
                <li>✅ Platform metrics</li>
              </ul>
              {!user ? (
                <Link to="/register">
                  <Button variant="danger" className="w-100">Get Started as Admin</Button>
                </Link>
              ) : user.role === 'admin' && (
                <Link to="/dashboard">
                  <Button variant="danger" className="w-100">Go to Dashboard</Button>
                </Link>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Section */}
      <Row className="mt-5 py-4 bg-light rounded">
        <Col md={3} className="text-center">
          <h2 className="display-4 fw-bold text-primary">100+</h2>
          <p className="text-muted">Properties Listed</p>
        </Col>
        <Col md={3} className="text-center">
          <h2 className="display-4 fw-bold text-success">50+</h2>
          <p className="text-muted">Happy Owners</p>
        </Col>
        <Col md={3} className="text-center">
          <h2 className="display-4 fw-bold text-warning">200+</h2>
          <p className="text-muted">Active Users</p>
        </Col>
        <Col md={3} className="text-center">
          <h2 className="display-4 fw-bold text-info">95%</h2>
          <p className="text-muted">Satisfaction Rate</p>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;