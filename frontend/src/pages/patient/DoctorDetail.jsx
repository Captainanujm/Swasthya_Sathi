import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService, chatService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

const DoctorDetail = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);
  
  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorService.getDoctorDetails(doctorId);
      const doctorData = response.data.data.doctor;
      
      // Log the data to debug the isFollowing property
      console.log('Doctor data from API:', doctorData);
      
      // Check for isFollowing in different possible formats from the API
      let isFollowed = false;
      
      // Check all possible ways the backend might represent "followed" status
      if (doctorData.hasOwnProperty('isFollowing')) {
        isFollowed = Boolean(doctorData.isFollowing);
      } else if (doctorData.hasOwnProperty('isFollowed')) {
        isFollowed = Boolean(doctorData.isFollowed);
      } else if (doctorData.hasOwnProperty('followed')) {
        isFollowed = Boolean(doctorData.followed);
      } else if (doctorData.hasOwnProperty('following')) {
        isFollowed = Boolean(doctorData.following);
      }
      
      // Set the doctor data with the correct isFollowing status
      setDoctor({
        ...doctorData,
        isFollowing: isFollowed
      });
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      setError('Failed to load doctor details. Please try again later.');
      toast.error('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow this doctor');
      navigate('/login');
      return;
    }
    
    try {
      await doctorService.followDoctor(doctor.user._id);
      toast.success(`You are now following Dr. ${doctor.user.name}`);
      
      // Update local state
      setDoctor({
        ...doctor,
        isFollowing: true,
        followers: doctor.followers + 1
      });
    } catch (error) {
      console.error('Follow error:', error);
      
      // If the error is because user is already following this doctor
      if (error.response && error.response.status === 400 && 
          error.response.data.message === 'You are already following this doctor') {
        // Just update the UI to show that the user is following the doctor
        setDoctor({
          ...doctor,
          isFollowing: true
        });
        // No need to increment followers count as they're already a follower
      } else {
        toast.error('Failed to follow doctor');
      }
    }
  };
  
  const handleUnfollow = async () => {
    try {
      await doctorService.unfollowDoctor(doctor.user._id);
      toast.success(`You have unfollowed Dr. ${doctor.user.name}`);
      
      // Update local state
      setDoctor({
        ...doctor,
        isFollowing: false,
        followers: doctor.followers - 1
      });
      
      // Set a flag in localStorage to indicate that the doctors list needs refresh
      // This will be used when navigating back to the Doctors page
      localStorage.setItem('refreshDoctorsList', 'true');
    } catch (error) {
      console.error('Unfollow error:', error);
      
      // If the error is because user is not following this doctor
      if (error.response && error.response.status === 400 && 
          error.response.data.message === 'You are not following this doctor') {
        // Just update the UI to show that the user is not following the doctor
        setDoctor({
          ...doctor,
          isFollowing: false
        });
      } else {
        toast.error('Failed to unfollow doctor');
      }
    }
  };
  
  const handleStartChat = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to chat with this doctor');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'patient') {
      toast.error('Only patients can start chats with doctors');
      return;
    }
    
    if (!doctor.isFollowing) {
      toast.error('You need to follow this doctor before starting a chat');
      return;
    }
    
    try {
      // Check if a chat already exists (just for validation)
      const userChats = await chatService.getUserChats();
      const existingChat = userChats.data.data.chats.find(chat => 
        chat.participant._id === doctor.user._id
      );
      
      if (existingChat) {
        toast.info('Opening existing chat');
      } else {
        // Create a new chat if it doesn't exist yet
        await chatService.startNewChat(doctor.user._id);
        toast.success('Chat created successfully');
      }
      
      // Navigate to chat with this doctor (using doctor's user ID, not chat ID)
      navigate(`/chat/${doctor.user._id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat with doctor');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (!doctor) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100">
          <p className="text-lg text-indigo-600 font-medium">Doctor not found.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-center md:text-left">Doctor Profile</h1>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Doctor Profile Card */}
          <div className="w-full md:w-1/3">
            <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                <div className="h-32 w-32 mx-auto rounded-full overflow-hidden bg-primary/10 shadow-md border-2 border-indigo-200">
                  {doctor.user.profileImage ? (
                    <img 
                      src={doctor.user.profileImage} 
                      alt={doctor.user.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-5xl font-bold">
                      {doctor.user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <CardTitle className="mt-4 text-xl text-indigo-700">{doctor.user.name}</CardTitle>
                <p className="text-indigo-600 font-medium">{doctor.specialization}</p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center mb-4">
                  <div className="flex justify-center items-center gap-2 mb-1">
                    <span className="text-lg font-semibold text-indigo-700">{doctor.rating || '0'}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill={star <= Math.round(doctor.rating || 0) ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-yellow-500"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-indigo-600 font-medium">
                    {doctor.followers} follower{doctor.followers !== 1 ? 's' : ''}
                  </p>
                </div>
                
                {isAuthenticated && user.role === 'patient' && (
                  <div className="flex flex-col gap-2">
                    {doctor.isFollowing ? (
                      <>
                        <Button 
                          variant="destructive" 
                          onClick={handleUnfollow}
                          className="hover:bg-red-600"
                        >
                          Unfollow
                        </Button>
                        <Button 
                          variant="default" 
                          onClick={handleStartChat}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          Start Chat
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="default" 
                        onClick={handleFollow}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        Follow Doctor
                      </Button>
                    )}
                  </div>
                )}
                
                {!isAuthenticated && (
                  <Button 
                    variant="outline" 
                    className="w-full border-indigo-200 text-indigo-700 hover:bg-blue-50" 
                    onClick={() => navigate('/login')}
                  >
                    Login to Follow
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Doctor Details */}
          <div className="w-full md:w-2/3">
            <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                <CardTitle className="text-indigo-700">Doctor Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">About</h3>
                  <p className="text-indigo-600">{doctor.bio}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Qualifications</h3>
                    <p className="text-indigo-600">{doctor.qualification}</p>
                  </div>
                  
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Experience</h3>
                    <p className="text-indigo-600">{doctor.experience} years</p>
                  </div>
                  
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Hospital</h3>
                    <p className="text-indigo-600">{doctor.hospital}</p>
                  </div>
                  
                  {doctor.consultationFee && (
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <h3 className="text-lg font-semibold mb-2 text-gray-800">Consultation Fee</h3>
                      <p className="text-indigo-600">₹{doctor.consultationFee}</p>
                    </div>
                  )}
                </div>
                
                {doctor.availableDays && doctor.availableDays.length > 0 && (
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Availability</h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.availableDays.map((day) => (
                        <span 
                          key={day} 
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-md border border-indigo-200 shadow-sm"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                    {doctor.availableHours && (
                      <p className="mt-2 text-sm text-indigo-600 font-medium">
                        Hours: {doctor.availableHours.from} - {doctor.availableHours.to}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail; 