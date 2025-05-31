import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // If authentication is still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-pulse text-xl text-primary">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have the required role, redirect to appropriate page
  if (user && !allowedRoles.includes(user.role)) {
    // Redirect based on user's role
    switch (user.role) {
      case 'doctor':
        return <Navigate to="/dashboard" replace />;
      case 'patient':
        return <Navigate to="/" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // If user is authenticated and has the required role, render the children
  return <>{children}</>;
};

export default ProtectedRoute; 