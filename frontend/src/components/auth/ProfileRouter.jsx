import { useAuth } from '@/providers/AuthProvider';
import DoctorProfile from '@/pages/doctor/Profile';
import PatientProfile from '@/pages/patient/Profile';
import { Navigate } from 'react-router-dom';

const ProfileRouter = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-pulse text-xl text-primary">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'doctor') {
    return <DoctorProfile />;
  } else if (user.role === 'patient') {
    return <PatientProfile />;
  } else {
    return <Navigate to="/" replace />;
  }
};

export default ProfileRouter; 