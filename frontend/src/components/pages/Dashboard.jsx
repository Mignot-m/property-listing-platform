import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import useStore from '../store/useStore';
import OwnerDashboard from '../dashboard/OwnerDashboard';
import AdminDashboard from '../dashboard/AdminDashboard';
import UserDashboard from '../dashboard/UserDashboard';

const Dashboard = () => {
  const { user, loading } = useStore();

  console.log('📊 Dashboard: Rendering...');
  console.log('👤 User:', user);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Please login to view dashboard.</Alert>
      </Container>
    );
  }

  console.log('👤 User role:', user.role);

  // Simple switch
  let DashboardComponent;
  if (user.role === 'admin') {
    DashboardComponent = <AdminDashboard />;
  } else if (user.role === 'owner') {
    DashboardComponent = <OwnerDashboard />;
  } else {
    DashboardComponent = <UserDashboard />;
  }

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Body>
          <h2>Welcome, {user.name}!</h2>
          <p className="text-muted">Role: {user.role}</p>
        </Card.Body>
      </Card>
      {DashboardComponent}
    </Container>
  );
};

export default Dashboard;