import { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import api from '../../api/axios';

const AdminDashboard = () => {
  const { properties, fetchProperties, deleteProperty } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProperties, setAllProperties] = useState([]);

  // ✅ Load ALL properties including deleted ones
  const loadAllProperties = async () => {
    try {
      const response = await api.get('/api/properties', { 
        params: { includeDeleted: 'true' } 
      });
      console.log('📊 All properties (including deleted):', response.data.data);
      setAllProperties(response.data.data || []);
    } catch (err) {
      console.error('Error loading all properties:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchProperties({});
        await loadAllProperties();
      } catch (err) {
        console.error('❌ Error loading properties:', err);
        setError('Failed to load properties');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // ✅ Delete property (soft delete)
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      const result = await deleteProperty(id);
      if (result.success) {
        await loadAllProperties();
        await fetchProperties({});
      }
    }
  };

  // ✅ Restore property (Admin only)
  const handleRestore = async (id) => {
    if (window.confirm('Are you sure you want to restore this property?')) {
      try {
        const response = await api.post(`/api/properties/${id}/restore`);
        if (response.data.success) {
          alert('✅ Property restored successfully!');
          await loadAllProperties();
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
        <p className="mt-3">Loading all properties...</p>
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
  const activeProperties = allProperties.filter(p => !p.deletedAt);
  const deletedProperties = allProperties.filter(p => p.deletedAt);

  return (
    <Row>
      <Col md={12}>
        {/* ✅ Active Properties */}
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>✅ Active Properties</span>
            <div>
              <Badge bg="success" className="me-2">{activeProperties.length} active</Badge>
              {/* ✅ Admin can CREATE properties */}
              <Link to="/properties/create">
                <Button variant="primary" size="sm">+ Create New</Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Body>
            {activeProperties.length === 0 ? (
              <p className="text-muted text-center">No active properties found.</p>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Owner</th>
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
                      <td>{property.owner?.name || 'Unknown'}</td>
                      <td>${property.price?.toLocaleString()}</td>
                      <td>
                        <Badge bg={property.status === 'published' ? 'success' : 'warning'}>
                          {property.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          {/* ✅ Admin can EDIT any property (draft only) */}
                          {property.status === 'draft' && (
                            <Link to={`/properties/edit/${property._id}`}>
                              <Button variant="warning" size="sm">✏️ Edit</Button>
                            </Link>
                          )}
                          {/* ✅ Admin can PUBLISH any draft property */}
                          {property.status === 'draft' && (
                            <Button 
                              variant="success" 
                              size="sm" 
                              onClick={async () => {
                                try {
                                  await api.post(`/api/properties/${property._id}/publish`);
                                  await loadAllProperties();
                                  await fetchProperties({});
                                } catch (err) {
                                  console.error('Publish error:', err);
                                  alert('❌ Failed to publish property');
                                }
                              }}
                            >
                              📤 Publish
                            </Button>
                          )}
                          {/* ✅ Admin can DELETE any property */}
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDelete(property._id)}
                          >
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

        {/* ✅ Deleted Properties with Restore Button */}
        {deletedProperties.length > 0 ? (
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
                    <th>Owner</th>
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
                      <td>{property.owner?.name || 'Unknown'}</td>
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
        ) : (
          <Card className="border-secondary">
            <Card.Header className="bg-secondary text-white">
              <span>🗑️ Deleted Properties</span>
            </Card.Header>
            <Card.Body>
              <p className="text-muted text-center mb-0">No deleted properties.</p>
            </Card.Body>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default AdminDashboard;