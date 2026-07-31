// Navigation bar with role-based links, user authentication state, and logout
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import useStore from '../store/useStore';

const Navbar = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ Get role-specific dashboard link
  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin': return '/admin-dashboard';
      case 'owner': return '/owner-dashboard';
      default: return '/user-dashboard';
    }
  };

  // ✅ Get role display name
  const getRoleDisplay = () => {
    if (!user) return '';
    switch (user.role) {
      case 'admin': return '🛡️ Admin';
      case 'owner': return '🏠 Owner';
      default: return '👤 User';
    }
  };

  return (
    <BootstrapNavbar expand="lg" className="navbar-custom sticky-top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold">
          🏠 Property Platform
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2">
            {/* ✅ Main navigation - Properties (renamed from Browse) */}
            <Nav.Link as={Link} to="/properties">Properties</Nav.Link>

            {user ? (
              <>
                {/* ✅ Dashboard link - goes to role-specific dashboard */}
                <Nav.Link as={Link} to={getDashboardLink()}>
                  📊 Dashboard
                </Nav.Link>

                {/* Owner-specific link */}
                {user.role === 'owner' && (
                  <Nav.Link as={Link} to="/properties/create">
                    ➕ New Property
                  </Nav.Link>
                )}

                {/* User info and logout */}
                <span className="badge bg-primary rounded-pill px-3 py-2">
                  {getRoleDisplay()}
                </span>
                <span className="fw-medium text-dark">{user.name}</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                  className="rounded-pill px-4"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <Button variant="outline-primary" size="sm" className="rounded-pill px-4">
                    Login
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="primary" size="sm" className="rounded-pill px-4">
                    Register
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;