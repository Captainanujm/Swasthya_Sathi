import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { doctorService, testConnection } from '@/lib/api';

const TestBackend = () => {
  const { isAuthenticated, user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [followedDoctors, setFollowedDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Test connection to backend
  const handleTestConnection = async () => {
    try {
      setLoading(true);
      setConnectionStatus('testing');
      const success = await testConnection();
      
      if (success) {
        setConnectionStatus('connected');
        toast.success('Backend connection successful!');
      } else {
        setConnectionStatus('failed');
        toast.error('Backend connection failed!');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus('failed');
      toast.error('Backend connection test failed with error!');
    } finally {
      setLoading(false);
    }
  };
  
  // Get all doctors
  const handleGetAllDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getAllDoctors({ limit: 100 });
      const doctors = response.data.data.doctors;
      setAllDoctors(doctors);
      
      // Log results to see what we're getting
      console.log('All doctors:', doctors);
      
      toast.success(`Retrieved ${doctors.length} doctors`);
    } catch (error) {
      console.error('Error fetching all doctors:', error);
      toast.error('Failed to fetch all doctors');
    } finally {
      setLoading(false);
    }
  };
  
  // Get followed doctors
  const handleGetFollowedDoctors = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to view followed doctors');
      return;
    }
    
    try {
      setLoading(true);
      const response = await doctorService.getFollowedDoctors({ limit: 100 });
      const doctors = response.data.data.doctors;
      setFollowedDoctors(doctors);
      
      // Log results to see what we're getting
      console.log('Followed doctors:', doctors);
      
      toast.success(`You are following ${doctors.length} doctors`);
    } catch (error) {
      console.error('Error fetching followed doctors:', error);
      toast.error('Failed to fetch followed doctors');
    } finally {
      setLoading(false);
    }
  };
  
  // Follow doctor test
  const handleFollowDoctor = async (doctorId) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to follow a doctor');
      return;
    }
    
    try {
      setLoading(true);
      await doctorService.followDoctor(doctorId);
      toast.success('Doctor followed successfully!');
      
      // Refresh the doctor lists
      handleGetAllDoctors();
      handleGetFollowedDoctors();
    } catch (error) {
      console.error('Error following doctor:', error);
      
      // If the error is because already following
      if (error.response && error.response.status === 400 && 
          error.response.data.message === 'You are already following this doctor') {
        toast.info('You are already following this doctor');
      } else {
        toast.error('Failed to follow doctor');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Unfollow doctor test
  const handleUnfollowDoctor = async (doctorId) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to unfollow a doctor');
      return;
    }
    
    try {
      setLoading(true);
      await doctorService.unfollowDoctor(doctorId);
      toast.success('Doctor unfollowed successfully!');
      
      // Refresh the doctor lists
      handleGetAllDoctors();
      handleGetFollowedDoctors();
    } catch (error) {
      console.error('Error unfollowing doctor:', error);
      
      // If the error is because not following
      if (error.response && error.response.status === 400 && 
          error.response.data.message === 'You are not following this doctor') {
        toast.info('You are not following this doctor');
      } else {
        toast.error('Failed to unfollow doctor');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Backend Connection Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              {connectionStatus === 'connected' && (
                <p className="text-green-500">✅ Connected to backend</p>
              )}
              {connectionStatus === 'failed' && (
                <p className="text-red-500">❌ Failed to connect to backend</p>
              )}
              {connectionStatus === 'testing' && (
                <p className="text-yellow-500">⏳ Testing connection...</p>
              )}
              {!connectionStatus && (
                <p className="text-muted-foreground">Click the button to test connection</p>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Authentication Status</h3>
              {isAuthenticated ? (
                <div>
                  <p className="text-green-500">✅ Logged in</p>
                  <p>User: {user?.name}</p>
                  <p>Role: {user?.role}</p>
                </div>
              ) : (
                <p className="text-red-500">❌ Not logged in</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleTestConnection} 
              disabled={loading || connectionStatus === 'testing'}
              className="w-full"
            >
              Test Backend Connection
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Doctor Follow Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Button 
                  onClick={handleGetAllDoctors} 
                  disabled={loading}
                  variant="outline"
                  className="w-full mb-2"
                >
                  Get All Doctors
                </Button>
                <p className="text-sm text-muted-foreground">
                  Retrieved: {allDoctors.length} doctors
                </p>
              </div>
              
              <div>
                <Button 
                  onClick={handleGetFollowedDoctors} 
                  disabled={loading || !isAuthenticated}
                  variant="outline"
                  className="w-full mb-2"
                >
                  Get Followed Doctors
                </Button>
                <p className="text-sm text-muted-foreground">
                  Following: {followedDoctors.length} doctors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {allDoctors.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">All Doctors</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allDoctors.map(doctor => (
              <Card key={doctor._id} className="relative">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{doctor.user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2"><span className="font-medium">Hospital:</span> {doctor.hospital}</p>
                  <p className="text-sm mb-2"><span className="font-medium">Followers:</span> {doctor.followers}</p>
                  <p className="text-sm mb-4">
                    <span className="font-medium">Follow Status:</span>
                    {doctor.isFollowing ? (
                      <span className="ml-1 text-green-500">Following ✓</span>
                    ) : (
                      <span className="ml-1 text-muted-foreground">Not Following</span>
                    )}
                  </p>
                </CardContent>
                <CardFooter>
                  {doctor.isFollowing ? (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleUnfollowDoctor(doctor.user._id)}
                      disabled={loading}
                      className="w-full"
                    >
                      Unfollow
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleFollowDoctor(doctor.user._id)}
                      disabled={loading}
                      className="w-full"
                    >
                      Follow
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestBackend; 