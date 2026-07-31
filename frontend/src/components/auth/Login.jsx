// User login form with role-based dashboard redirect and authentication state
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import useStore from '../store/useStore';

const Login = () => {
  const { register: registerField, handleSubmit, formState: { errors } } = useForm();
  const { login, loading, user } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // If user is already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      console.log('👤 User already logged in:', user);
      redirectUser(user);
    }
  }, [user]);

  const redirectUser = (user) => {
    if (user.role === 'admin') {
      navigate('/admin-dashboard', { replace: true });
    } else if (user.role === 'owner') {
      navigate('/owner-dashboard', { replace: true });
    } else {
      navigate('/user-dashboard', { replace: true });
    }
  };

  const onSubmit = async (data) => {
    setError('');
    const result = await login(data.email, data.password);
    console.log(' Login result:', result);
    
    if (result.success) {
      //  Get the updated user from store and redirect
      const { user: loggedInUser } = useStore.getState();
      console.log('👤 User after login:', loggedInUser);
      redirectUser(loggedInUser);
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="auth-card">
        <Card.Body>
          <Card.Title className="text-center">Welcome Back</Card.Title>
          <Card.Subtitle className="text-center text-muted">Login to your account</Card.Subtitle>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                {...registerField('email', { required: 'Email is required' })}
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
                placeholder="Enter password"
                {...registerField('password', { required: 'Password is required' })}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <small>
              Don't have an account? <Link to="/register">Register</Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;