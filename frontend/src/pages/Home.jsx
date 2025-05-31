import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Function to handle user-specific navigation
  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate('/register');
    } else if (user.role === 'patient') {
      navigate('/doctors');
    } else if (user.role === 'doctor') {
      navigate('/dashboard');
    } else if (user.role === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  // Function to navigate to explore
  const handleExplore = () => {
    navigate('/doctors');
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <section className="mb-24 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-blue-100 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="md:w-3/5 flex flex-col items-center md:items-start text-center md:text-left pr-0 md:pr-8">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Your Health, Our Priority
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Connect with trusted healthcare professionals, manage your medical records,
              and take control of your health journey all in one place.
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
              >
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExplore}
                className="border-2 border-indigo-500 text-indigo-700 font-medium px-8 py-3 rounded-lg hover:bg-indigo-50 transition-all duration-200 flex items-center"
              >
                Explore Doctors
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </div>
          </div>
          <div className="md:w-2/5 flex justify-center mt-8 md:mt-0">
            <img src="/images/doco.png" alt="Doctor" className="max-w-full h-auto rounded-lg transform hover:scale-105 transition-transform duration-300" />
          </div>
        </div>
      </section>

      {isAuthenticated && (
        <section className="mb-12">
          <div className="rounded-lg bg-card p-6 shadow-md">
            <h2 className="mb-4 text-3xl font-bold text-center">{user?.name}</h2>
            
            {user?.role === 'patient' && (
              <div className="mt-4 grid gap-4 grid-cols-2">
                <Link 
                  to="/profile" 
                  className="rounded-md bg-primary/10 p-6 text-center hover:bg-primary/20 border-2 border-purple-500 shadow-lg flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-purple-700">Manage Your Profile</span>
                  <span className="text-xs text-gray-500 mt-1">Personal Details</span>
                </Link>
                <Link 
                  to="/medical-summary" 
                  className="rounded-md bg-primary/10 p-6 text-center hover:bg-primary/20 border-2 border-green-500 shadow-lg flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-green-700">Medical Summary</span>
                  <span className="text-xs text-gray-500 mt-1">Health Records</span>
                </Link>
                <Link 
                  to="/swasthya-card" 
                  className="rounded-md bg-primary/10 p-6 text-center hover:bg-primary/20 border-2 border-blue-500 shadow-lg flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-blue-700">Access Swasthya Card</span>
                  <span className="text-xs text-gray-500 mt-1">Official Health ID</span>
                </Link>
                <Link 
                  to="/care" 
                  className="rounded-md bg-primary/10 p-6 text-center hover:bg-primary/20 border-2 border-amber-500 shadow-lg flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-amber-500 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-amber-700">Medication Reminders</span>
                  <span className="text-xs text-gray-500 mt-1">Care Schedule</span>
                </Link>
                <Link 
                  to="/doctors" 
                  className="rounded-md bg-primary/10 p-6 text-center hover:bg-primary/20 border-2 border-red-500 shadow-lg flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-red-700">Find Doctors</span>
                  <span className="text-xs text-gray-500 mt-1">Healthcare Professionals</span>
                </Link>
                <Link 
                  to="/followed-doctors" 
                  className="rounded-md bg-primary/10 p-6 text-center hover:bg-primary/20 border-2 border-indigo-500 shadow-lg flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-500 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-indigo-700">Followed Doctors</span>
                  <span className="text-xs text-gray-500 mt-1">Your Specialists</span>
                </Link>
              </div>
            )}
            
            {user?.role === 'doctor' && (
              <div className="mt-4">
                <Link 
                  to="/dashboard" 
                  className="inline-block w-full rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-center text-white font-medium hover:shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
                >
                  Go to Doctor Dashboard
                </Link>
              </div>
            )}
            
            {user?.role === 'admin' && (
              <div className="mt-4">
                <Link 
                  to="/admin/dashboard" 
                  className="inline-block w-full rounded-md bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-center text-white font-medium hover:shadow-lg transition-all duration-200 hover:from-red-700 hover:to-red-800"
                >
                  Go to Admin Dashboard
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="grid gap-8 md:grid-cols-3">
        <div className="rounded-lg bg-card p-8 shadow-lg border-2 border-teal-400 transition-all duration-200 hover:shadow-xl">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="mb-3 text-xl font-semibold text-center text-teal-700">For Patients</h3>
          <p className="mb-6 text-muted-foreground text-center">Access medical records, connect with doctors, and manage appointments in one secure platform.</p>
          {!isAuthenticated && (
            <div className="flex justify-center">
              <Link 
                to="/doctors" 
                className="inline-flex items-center justify-center rounded-md bg-teal-100 px-6 py-3 text-sm font-medium text-teal-800 hover:bg-teal-200 transition-colors"
              >
                <span>Browse Doctors</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
        
        <div className="rounded-lg bg-card p-8 shadow-lg border-2 border-indigo-400 transition-all duration-200 hover:shadow-xl">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-3 text-xl font-semibold text-center text-indigo-700">For Doctors</h3>
          <p className="mb-6 text-muted-foreground text-center">Streamline patient management, maintain medical records, and provide better care with our integrated tools.</p>
          {!isAuthenticated && (
            <div className="flex justify-center">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center rounded-md bg-indigo-100 px-6 py-3 text-sm font-medium text-indigo-800 hover:bg-indigo-200 transition-colors"
              >
                <span>Join as Doctor</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
        
        <div className="rounded-lg bg-card p-8 shadow-lg border-2 border-amber-400 transition-all duration-200 hover:shadow-xl">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="mb-3 text-xl font-semibold text-center text-amber-700">Swasthya ID Lookup</h3>
          <p className="mb-6 text-muted-foreground text-center">Access complete medical details of any patient by entering their Swasthya ID. For healthcare providers and emergency services.</p>
          <div className="flex justify-center">
            <Link 
              to="/lookup-patient" 
              className="inline-flex items-center justify-center rounded-md bg-amber-100 px-6 py-3 text-sm font-medium text-amber-800 hover:bg-amber-200 transition-colors"
            >
              <span>Lookup Patient</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
