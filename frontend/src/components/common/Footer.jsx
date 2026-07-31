// Footer component with quick links, contact info, and copyright
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white-50 mt-5 py-4">
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="text-white">🏠 Property Platform</h5>
            <p className="small">
              Your trusted platform for buying, selling, and renting properties in Ethiopia.
            </p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="text-white">Quick Links</h5>
            <Nav className="flex-column">
              <Nav.Link as={Link} to="/" className="text-white-50 small p-0">Home</Nav.Link>
              <Nav.Link as={Link} to="/properties" className="text-white-50 small p-0">Properties</Nav.Link>
              <Nav.Link as={Link} to="/dashboard" className="text-white-50 small p-0">Dashboard</Nav.Link>
            </Nav>
          </Col>
          <Col md={4}>
            <h5 className="text-white">Contact</h5>
            <p className="small">
              📧 support@propertyplatform.com<br />
              📞 +251 911 123 456<br />
              📍 Addis Ababa, Ethiopia
            </p>
          </Col>
        </Row>
        <hr className="border-secondary" />
        <Row>
          <Col className="text-center small">
            &copy; {currentYear} Property Platform. All rights reserved.
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;