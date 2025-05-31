import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';
import { testConnection } from '@/lib/api';

// Authentication and Layout Components
import AuthProvider from '@/providers/AuthProvider';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ApiStatusIndicator from '@/components/ApiStatusIndicator';
import ProfileRouter from '@/components/auth/ProfileRouter';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Doctor Pages
import CreateDoctorProfile from '@/pages/doctor/CreateProfile';
import DoctorDashboard from '@/pages/doctor/Dashboard';
import DoctorPending from '@/pages/doctor/Pending';
import DoctorProfile from '@/pages/doctor/Profile';
import DoctorPosts from '@/pages/doctor/Posts';
import PatientDetail from '@/pages/doctor/PatientDetail';

// Patient Pages
import MedicalSummary from '@/pages/patient/MedicalSummary';
import SwasthyaCard from '@/pages/patient/SwasthyaCard';
import Doctors from '@/pages/patient/Doctors';
import FollowedDoctors from '@/pages/patient/FollowedDoctors';
import DoctorDetail from '@/pages/patient/DoctorDetail';
import PatientProfile from '@/pages/patient/Profile';
import ScanPatient from '@/pages/patient/ScanPatient';
import Care from '@/pages/patient/Care';
import PatientPosts from '@/pages/patient/Posts';
import MedicalReportSummary from '@/pages/patient/MedicalReportSummary';
import LookupPatient from '@/pages/patient/LookupPatient';
import DiseaseDetection from '@/pages/patient/DiseaseDetection';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import DoctorRequests from '@/pages/admin/DoctorRequests';
import ManageDoctors from '@/pages/admin/ManageDoctors';

// Shared Pages
import Chat from '@/pages/chat/Chat';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';

// Testing Page
import TestBackend from '@/pages/TestBackend';

// Legal Pages
import TermsOfService from '@/pages/legal/TermsOfService';
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';

function App() {
  const [loading, setLoading] = useState(true);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    // Check for API connection
    const checkApiConnection = async () => {
      try {
        const result = await testConnection();
        setApiReady(result);
      } catch (error) {
        console.error('API connection check failed:', error);
        setApiReady(false);
      }
    };

    // Simulate loading of application resources and check API connection
    Promise.all([
      new Promise((resolve) => setTimeout(resolve, 800)), // Simulate loading
      checkApiConnection()
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold text-primary mb-4">
            ...Swasthya Sathi...
          </div>
          <div className="text-sm text-muted-foreground">
            Connecting to backend services
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <Toaster position="bottom-center" />
        <ApiStatusIndicator />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            
            {/* Test Route */}
            <Route path="/test-backend" element={<TestBackend />} />
            
            {/* Doctor Routes */}
            <Route path="/doctor/create-profile" element={<CreateDoctorProfile />} />
            <Route path="/doctor/pending" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorPending />
              </ProtectedRoute>
            } />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor/patients/:patientId" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <PatientDetail />
                </ProtectedRoute>
              } 
            />
            
            {/* Patient Routes */}
            <Route 
              path="/medical-summary" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <MedicalSummary />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/swasthya-card" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <SwasthyaCard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/care" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Care />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/medical-reports" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <MedicalReportSummary />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/disease-detection" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <DiseaseDetection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={<ProfileRouter />} 
            />
            <Route 
              path="/doctors" 
              element={<Doctors />} 
            />
            <Route 
              path="/doctors/:doctorId" 
              element={<DoctorDetail />} 
            />
            <Route 
              path="/followed-doctors" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <FollowedDoctors />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/scan-patient/:patientId" 
              element={<ScanPatient />} 
            />
            
            {/* Add the new route for Swasthya ID lookup */}
            <Route 
              path="/lookup-patient" 
              element={<LookupPatient />} 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/doctor-requests" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DoctorRequests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/manage-doctors" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageDoctors />
                </ProtectedRoute>
              } 
            />
            
            {/* Shared Routes */}
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute allowedRoles={['doctor', 'patient']}>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat/:userId" 
              element={
                <ProtectedRoute allowedRoles={['doctor', 'patient']}>
                  <Chat />
                </ProtectedRoute>
              } 
            />

            {/* Post Routes */}
            <Route 
              path="/posts" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientPosts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor/posts" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorPosts />
                </ProtectedRoute>
              } 
            />
            
            {/* Add routes for legal pages */}
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
