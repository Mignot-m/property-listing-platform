import { Link } from 'react-router-dom';
import { Card, Badge, Button } from 'react-bootstrap';
import useStore from '../store/useStore';

const PropertyCard = ({ property }) => {
  const { user, favorites, addToFavorites, removeFromFavorites } = useStore();

  const isFavorited = favorites.includes(property._id);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorited) {
      await removeFromFavorites(property._id);
    } else {
      await addToFavorites(property._id);
    }
  };

  return (
    <Card className="h-100 shadow-sm">
      <Link to={`/properties/${property._id}`} className="text-decoration-none text-dark">
        <Card.Img
          variant="top"
          src={property.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <Card.Body>
          <Card.Title className="text-dark">{property.title}</Card.Title>
          <Card.Text className="text-muted small">{property.location}</Card.Text>
          <Card.Text className="fw-bold fs-5">${property.price?.toLocaleString()}</Card.Text>
          <Card.Text className="text-muted small">
            By: {property.owner?.name || 'Unknown'}
          </Card.Text>
          <div className="d-flex justify-content-between align-items-center">
            <Badge bg={property.status === 'published' ? 'success' : 'warning'}>
              {property.status}
            </Badge>
            {user && user.role === 'user' && (
              <Button
                variant={isFavorited ? 'danger' : 'outline-danger'}
                size="sm"
                onClick={handleFavorite}
              >
                {isFavorited ? '❤️' : '🤍'}
              </Button>
            )}
          </div>
        </Card.Body>
      </Link>
    </Card>
  );
};

export default PropertyCard;