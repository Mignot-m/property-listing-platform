import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import PropertyCard from './PropertyCard';
import useStore from '../store/useStore';

const PropertyList = () => {
  const { properties, fetchProperties, loading } = useStore();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 6,
    location: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    fetchProperties(filters);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading properties...</p>
      </div>
    );
  }

  return (
    <Container className="py-4">
      {/* Filters */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Form.Control
            type="text"
            name="location"
            placeholder="Search by location..."
            value={filters.location}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
        </Col>
      </Row>

      {/* Property Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-5">
          <h4>No properties found</h4>
          <p className="text-muted">Try adjusting your filters</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {properties.map((property) => (
            <Col key={property._id}>
              <PropertyCard property={property} />
            </Col>
          ))}
        </Row>
      )}

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => handlePageChange(filters.page - 1)}
          disabled={filters.page === 1}
        >
          Previous
        </button>
        <span>Page {filters.page}</span>
        <button
          className="btn btn-outline-primary"
          onClick={() => handlePageChange(filters.page + 1)}
          disabled={properties.length < filters.limit}
        >
          Next
        </button>
      </div>
    </Container>
  );
};

export default PropertyList;