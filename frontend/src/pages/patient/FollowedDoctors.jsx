import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doctorService, chatService } from '@/lib/api';
import { toast } from 'sonner';

const FollowedDoctorCard = ({ doctor, onUnfollow, onStartChat }) => {
  const navigate = useNavigate();
  
  if (!doctor || !doctor.doctor) return null;
  
  const doctorInfo = doctor.doctor;
  const doctorUser = doctorInfo.user;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 overflow-hidden">
            {doctorUser.profileImage ? (
              <img 
                src={doctorUser.profileImage} 
                alt={doctorUser.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-xl font-bold">
                {doctorUser.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-lg">{doctorUser.name}</CardTitle>
            <div className="text-sm text-muted-foreground">{doctorInfo.specialization}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Experience:</span> {doctorInfo.experience} years
          </div>
          <div className="text-sm">
            <span className="font-medium">Hospital:</span> {doctorInfo.hospital}
          </div>
          <div className="text-sm line-clamp-2">
            <span className="font-medium">Bio:</span> {doctorInfo.bio}
          </div>
          <div className="text-sm">
            <span className="font-medium">Following since:</span> {new Date(doctor.followedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/doctors/${doctorUser._id}`)}
        >
          View Profile
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            onClick={() => onStartChat(doctorUser._id)}
          >
            Chat
          </Button>
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={() => onUnfollow(doctorUser._id)}
          >
            Unfollow
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const FollowedDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch data immediately when the component mounts or when page changes
    fetchFollowedDoctors();
    
    // Set up a focus event listener to refetch data when returning to this page
    const handleFocus = () => {
      fetchFollowedDoctors();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [page]);

  const fetchFollowedDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorService.getFollowedDoctors({ page, limit: 9 });
      
      if (response.data && response.data.data && response.data.data.doctors) {
        setDoctors(response.data.data.doctors);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setDoctors([]);
        setTotalPages(1);
        console.error('Unexpected API response format:', response);
      }
    } catch (error) {
      console.error('Error fetching followed doctors:', error);
      setError('Failed to load your followed doctors. Please try again later.');
      toast.error('Failed to load your followed doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (doctorId) => {
    try {
      await doctorService.unfollowDoctor(doctorId);
      toast.success('You have unfollowed this doctor');
      
      // Remove the doctor from the list
      setDoctors(prevDoctors => 
        prevDoctors.filter(doctor => doctor.doctor.user._id !== doctorId)
      );
    } catch (error) {
      console.error('Unfollow error:', error);
      toast.error('Failed to unfollow doctor');
    }
  };

  const handleStartChat = async (doctorId) => {
    try {
      // Check if a chat already exists (just for validation)
      const userChats = await chatService.getUserChats();
      const existingChat = userChats.data.data.chats.find(chat => 
        chat.participant._id === doctorId
      );
      
      if (existingChat) {
        // Navigate to chat with this doctor
        toast.info('Opening existing chat');
      } else {
        // Start a new chat with the doctor if it doesn't exist
        await chatService.startNewChat(doctorId);
        toast.success('Chat created successfully');
      }
      
      // Navigate to the chat using the doctor's ID
      window.location.href = `/chat/${doctorId}`;
    } catch (error) {
      console.error('Start chat error:', error);
      toast.error('Failed to start chat with doctor');
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Doctors You Follow</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">You are not following any doctors yet.</p>
          <Button 
            className="mt-4" 
            onClick={() => {
              // Set view mode preference in localStorage before navigating
              localStorage.setItem('doctorViewMode', 'all');
              navigate('/doctors?view=all');
            }}
          >
            Find Doctors
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doctor => (
              <FollowedDoctorCard 
                key={doctor.followId} 
                doctor={doctor} 
                onUnfollow={handleUnfollow}
                onStartChat={handleStartChat}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-1">
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center mx-2">
                Page {page} of {totalPages}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FollowedDoctorsPage; 