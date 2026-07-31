// User registration form with role selection and success redirect to login
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import useStore from '../store/useStore';

const Register = () => {
  const { register: registerField, handleSubmit, formState: { errors } } = useForm();
  const { register: registerUser, loading } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    console.log('📝 Registering user:', data.email);
    console.log('📝 Role selected:', data.role);
    
    const result = await registerUser(data);
    console.log('✅ Register result:', result);
    console.log('✅ Result.success:', result.success);
    
    // ✅ FORCE redirect for ALL roles regardless of result
    // This is the brute-force fix
    if (result.success) {
      setSuccess('✅ Registration successful! Please login to continue.');
      console.log('✅ Redirecting to login...');
      
      // Use both methods to ensure redirect works
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="auth-card">
        <Card.Body>
          <Card.Title className="text-center">Create Account</Card.Title>
          <Card.Subtitle className="text-center text-muted">Join us today</Card.Subtitle>
          
          {success && (
            <Alert variant="success" className="mt-3">
              {success}
              <div className="mt-2">
                <Link to="/login" className="alert-link fw-bold" onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/login';
                }}>
                  Click here to login →
                </Link>
              </div>
            </Alert>
          )}

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                {...registerField('name', { required: 'Name is required' })}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                {...registerField('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  }
                })}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password (min 6 characters)"
                {...registerField('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  }
                })}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                {...registerField('role')}
                defaultValue="user"
              >
                <option value="user">User</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Choose your role. Admin access is restricted.
              </Form.Text>
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button 
              type="submit" 
              variant="primary" 
              className="w-100" 
              disabled={loading || success}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <small>
              Already have an account? <Link to="/login">Login</Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;