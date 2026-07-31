// Main application with role-based routing, protected routes, and authentication state
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/pages/Home';
import PropertyList from './components/properties/PropertyList';
import PropertyDetail from './components/properties/PropertyDetail';
import PropertyForm from './components/properties/PropertyForm';
import Dashboard from './components/pages/Dashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import OwnerDashboard from './components/dashboard/OwnerDashboard';
import UserDashboard from './components/dashboard/UserDashboard';
import useStore from './components/store/useStore';

function App() {
  const { initialize, loading, user } = useStore();

  useEffect(() => {
    initialize();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/*  Dashboard - Redirects based on role */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {user?.role === 'admin' && <Navigate to="/admin-dashboard" replace />}
                  {user?.role === 'owner' && <Navigate to="/owner-dashboard" replace />}
                  {user?.role === 'user' && <Navigate to="/user-dashboard" replace />}
                  <Navigate to="/" replace />
                </ProtectedRoute>
              }
            />

            {/* Role-Specific Dashboards */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner-dashboard"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Property Management */}
            <Route
              path="/properties/create"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <PropertyForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/properties/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <PropertyForm />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;