import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import api from '../../api/axios';

const OwnerDashboard = () => {
  const { properties, fetchProperties, deleteProperty, publishProperty } = useStore();
  const [ownerProperties, setOwnerProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchProperties({});
      } catch (err) {
        setError('Failed to load properties');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const { user } = useStore.getState();
    if (user && properties && properties.length > 0) {
      const filtered = properties.filter(
        p => p.owner?._id === user.id || p.owner === user.id
      );
      setOwnerProperties(filtered);
    } else if (user) {
      setOwnerProperties([]);
    }
  }, [properties]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      const result = await deleteProperty(id);
      if (result.success) {
        setOwnerProperties(ownerProperties.filter(p => p._id !== id));
        await fetchProperties({});
      }
    }
  };

  const handlePublish = async (id) => {
    const result = await publishProperty(id);
    if (result.success) {
      await fetchProperties({});
    }
  };

  // ✅ Restore property (Owner can restore their own deleted properties)
  const handleRestore = async (id) => {
    if (window.confirm('Are you sure you want to restore this property?')) {
      try {
        const response = await api.post(`/api/properties/${id}/restore`);
        if (response.data.success) {
          alert('✅ Property restored successfully!');
          await fetchProperties({});
        }
      } catch (error) {
        console.error('Restore error:', error);
        alert('❌ Failed to restore property');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        <Alert.Heading>Error Loading Properties</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Alert>
    );
  }

  // ✅ Separate active and deleted properties
  const activeProperties = ownerProperties.filter(p => !p.deletedAt);
  const deletedProperties = ownerProperties.filter(p => p.deletedAt);

  return (
    <Row>
      <Col md={12}>
        {/* ✅ Active Properties */}
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>✅ My Properties</span>
            <div>
              <Badge bg="success" className="me-2">{activeProperties.length} active</Badge>
              <Link to="/properties/create">
                <Button variant="primary" size="sm">+ Create New</Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Body>
            {activeProperties.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">You haven't created any properties yet.</p>
                <Link to="/properties/create">
                  <Button variant="outline-primary">Create Your First Property</Button>
                </Link>
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProperties.map((property) => (
                    <tr key={property._id}>
                      <td>
                        <Link to={`/properties/${property._id}`} className="text-decoration-none">
                          {property.title}
                        </Link>
                      </td>
                      <td>${property.price?.toLocaleString()}</td>
                      <td>
                        <Badge bg={property.status === 'published' ? 'success' : 'warning'}>
                          {property.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          {property.status === 'draft' && (
                            <>
                              <Link to={`/properties/edit/${property._id}`}>
                                <Button variant="warning" size="sm">✏️ Edit</Button>
                              </Link>
                              <Button variant="success" size="sm" onClick={() => handlePublish(property._id)}>
                                📤 Publish
                              </Button>
                            </>
                          )}
                          <Button variant="danger" size="sm" onClick={() => handleDelete(property._id)}>
                            🗑️ Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* ✅ Deleted Properties (with Restore button) */}
        {deletedProperties.length > 0 && (
          <Card className="border-danger">
            <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
              <span>🗑️ Deleted Properties</span>
              <Badge bg="light text-danger">{deletedProperties.length} deleted</Badge>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Deleted At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedProperties.map((property) => (
                    <tr key={property._id} className="table-secondary">
                      <td>
                        <span className="text-decoration-line-through">
                          {property.title}
                        </span>
                      </td>
                      <td>${property.price?.toLocaleString()}</td>
                      <td>
                        {property.deletedAt ? new Date(property.deletedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => handleRestore(property._id)}
                        >
                          🔄 Restore
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default OwnerDashboard;