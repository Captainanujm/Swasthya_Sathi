import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { doctorService, testConnection } from '@/lib/api';
import { toast } from 'sonner';

export const DoctorCard = ({ doctor, onFollow, onUnfollow, isAuthenticated, navigate }) => {
  // Safely access user properties
  const user = doctor.user || {};
  const userId = user._id || doctor._id;
  const userName = user.name || '';
  const userProfileImage = user.profileImage || '';
  
  const handleFollowClick = async () => {
    try {
      if (doctor.isFollowing) {
        await onUnfollow(userId);
      } else {
        await onFollow(userId);
      }
    } catch (error) {
      console.error('Follow action error:', error);
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border border-blue-100 rounded-xl overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-primary/10 overflow-hidden shadow-md border-2 border-indigo-200">
            {userProfileImage ? (
              <img 
                src={userProfileImage} 
                alt={userName} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xl font-bold">
                {userName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-lg text-indigo-700">{userName}</CardTitle>
            <div className="text-sm text-indigo-600 font-medium">{doctor.specialization}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 pt-4">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-gray-800">Experience:</span> <span className="text-indigo-600">{doctor.experience} years</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-800">Hospital:</span> <span className="text-indigo-600">{doctor.hospital}</span>
          </div>
          <div className="text-sm line-clamp-2">
            <span className="font-medium text-gray-800">Bio:</span> <span className="text-indigo-600">{doctor.bio}</span>
          </div>
          <div className="flex gap-3 pt-1 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-medium">{doctor.rating || '0'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
            <div className="text-indigo-600 font-medium">
              {doctor.followers} follower{doctor.followers !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/doctors/${userId}`)}
          className="hover:bg-white hover:text-indigo-700 border-indigo-200"
        >
          View Profile
        </Button>
        {isAuthenticated && (
          <Button 
            variant={doctor.isFollowing ? "destructive" : "default"}
            onClick={handleFollowClick}
            className={doctor.isFollowing ? 
              "hover:bg-red-600" : 
              "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            }
          >
            {doctor.isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [followedDoctors, setFollowedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [specializations, setSpecializations] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'followed'
  const [testing, setTesting] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { 
        page,
        limit: 9,
        excludeFollowed: 'true' // Always exclude followed doctors when authenticated
      };
      
      if (searchTerm) params.name = searchTerm;
      if (specialtyFilter) params.specialization = specialtyFilter;
      
      // Skip API call if not authenticated - this ensures we don't see a mix of followed/unfollowed doctors
      if (!isAuthenticated) {
        setDoctors([]);
        setTotalPages(0);
        setLoading(false);
        return;
      }
      
      const response = await doctorService.getAllDoctors(params);
      
      const processedDoctors = response.data.data.doctors.map(doctor => ({
        ...doctor,
        isFollowing: false // Since followed doctors are excluded, mark all as not followed
      }));
      
      setDoctors(processedDoctors);
      setTotalPages(response.data.totalPages);
      
      if (!specializations.length) {
        const uniqueSpecializations = [...new Set(processedDoctors.map(doc => doc.specialization))];
        setSpecializations(uniqueSpecializations);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again later.');
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, page, searchTerm, specialtyFilter, specializations.length]);

  const fetchFollowedDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorService.getFollowedDoctors({ 
        page, 
        limit: 9,
        specialization: specialtyFilter || undefined,
        name: searchTerm || undefined
      });
      
      const processedDoctors = response.data.data.doctors.map(item => {
        const doctorData = item.doctor;
        if (!doctorData) return null;
        return {
          ...doctorData,
          isFollowing: true,
          followedAt: item.followedAt,
          followId: item.followId
        };
      }).filter(Boolean);
      
      setFollowedDoctors(processedDoctors);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching followed doctors:', error);
      setError('Failed to load followed doctors. Please try again later.');
      toast.error('Failed to load your followed doctors');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, specialtyFilter]);

  useEffect(() => {
    const viewParam = searchParams.get('view');
    const storedViewMode = localStorage.getItem('doctorViewMode');
    
    // If there's a stored preference, use it and remove it from storage
    if (storedViewMode) {
      localStorage.removeItem('doctorViewMode');
      setViewMode(storedViewMode);
      
      // Update URL to match the stored preference
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('view', storedViewMode);
      setSearchParams(newSearchParams, { replace: true });
    }
    // Otherwise use the URL parameter if available
    else if (viewParam === 'all' || viewParam === 'followed') {
      setViewMode(viewParam);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', viewMode);
    setSearchParams(newSearchParams, { replace: true });
    
    // When view mode changes, reset page number and clear previous data
    setPage(1);
    if (viewMode === 'all') {
      setFollowedDoctors([]); // Clear followed doctors data when viewing all doctors
      fetchDoctors();
    } else if (viewMode === 'followed' && isAuthenticated) {
      setDoctors([]); // Clear all doctors data when viewing followed doctors
      fetchFollowedDoctors();
    }
  }, [viewMode, setSearchParams, fetchDoctors, fetchFollowedDoctors, isAuthenticated]);

  const memoizedFetchDoctors = useCallback(() => {
    if (viewMode === 'all') {
      fetchDoctors();
    }
  }, [fetchDoctors]);

  const memoizedFetchFollowedDoctors = useCallback(() => {
    if (viewMode === 'followed' && isAuthenticated) {
      fetchFollowedDoctors();
    }
  }, [fetchFollowedDoctors, isAuthenticated]);

  // Check for refreshDoctorsList flag in localStorage
  useEffect(() => {
    const checkRefreshFlag = () => {
      const refreshFlag = localStorage.getItem('refreshDoctorsList');
      if (refreshFlag === 'true') {
        // Clear the flag
        localStorage.removeItem('refreshDoctorsList');
        
        // Refresh both lists
        fetchDoctors();
        if (isAuthenticated) {
          fetchFollowedDoctors();
        }
      }
    };
    
    // Check when component mounts
    checkRefreshFlag();
    
    // Also set up a focus event listener to check when returning to this page
    window.addEventListener('focus', checkRefreshFlag);
    
    return () => {
      window.removeEventListener('focus', checkRefreshFlag);
    };
  }, [fetchDoctors, fetchFollowedDoctors, isAuthenticated]);

  const handleFollow = async (doctorId) => {
    try {
      await doctorService.followDoctor(doctorId);
      toast.success('You are now following this doctor');
      
      // Remove the doctor from the 'all' view since they are now followed
      setDoctors(prevDoctors => 
        prevDoctors.filter(doctor => {
          const userIdField = doctor.user?._id || doctor._id;
          return userIdField !== doctorId;
        })
      );
      
      // Always fetch followed doctors to update that list, regardless of current view
      fetchFollowedDoctors();
    } catch (error) {
      console.error('Follow error:', error);
      if (error.response?.status === 400 && 
          error.response.data.message === 'You are already following this doctor') {
        setDoctors(prevDoctors => 
          prevDoctors.filter(doctor => {
            const userIdField = doctor.user?._id || doctor._id;
            return userIdField !== doctorId;
          })
        );
        toast.info('You are already following this doctor');
        // Refresh followed doctors in case this one is missing
        fetchFollowedDoctors();
      } else {
        toast.error('Failed to follow doctor');
      }
    }
  };

  const handleUnfollow = async (doctorId) => {
    try {
      await doctorService.unfollowDoctor(doctorId);
      toast.success('You have unfollowed this doctor');
      
      if (viewMode === 'followed') {
        // Remove from followed doctors list
        setFollowedDoctors(prevDoctors => 
          prevDoctors.filter(doctor => {
            const userIdField = doctor.user?._id || doctor._id;
            return userIdField !== doctorId;
          })
        );
      }
      
      // After unfollowing, refresh the "All Doctors" list to show this doctor again
      fetchDoctors();
    } catch (error) {
      console.error('Unfollow error:', error);
      if (error.response?.status === 400 && 
          error.response.data.message === 'You are not following this doctor') {
        toast.info('You are not following this doctor');
      } else {
        toast.error('Failed to unfollow doctor');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleSpecialtyChange = (e) => {
    setSpecialtyFilter(e.target.value);
    setPage(1);
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const success = await testConnection();
      if (success && isAuthenticated) {
        const response = await doctorService.getFollowedDoctors({ limit: 100 });
        toast.success(`You are following ${response.data.data.doctors.length} doctors`);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-2 md:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Find Doctors</h1>
        
        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            <Button 
              variant={viewMode === 'all' ? 'default' : 'outline'} 
              onClick={() => setViewMode('all')}
              className={viewMode === 'all' ? 
                "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : 
                "border-indigo-200 text-indigo-700 hover:bg-blue-50"
              }
            >
              All Doctors
            </Button>
            <Button 
              variant={viewMode === 'followed' ? 'default' : 'outline'} 
              onClick={() => setViewMode('followed')}
              className={viewMode === 'followed' ? 
                "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : 
                "border-indigo-200 text-indigo-700 hover:bg-blue-50"
              }
            >
              Followed Doctors
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={testing}
              className="border-indigo-200 text-indigo-700 hover:bg-blue-50"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        )}
      </div>
      
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md rounded-xl p-4 border border-blue-100">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search doctors by name..."
              className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-64">
            <select
              className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={specialtyFilter}
              onChange={handleSpecialtyChange}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Search
          </Button>
        </form>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8 font-medium">{error}</div>
      ) : viewMode === 'all' && doctors.length === 0 ? (
        <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100">
          <p className="text-lg text-indigo-600 font-medium">No doctors found matching your criteria.</p>
        </div>
      ) : viewMode === 'followed' && followedDoctors.length === 0 ? (
        <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100">
          <p className="text-lg text-indigo-600 font-medium">You are not following any doctors yet.</p>
          <Button 
            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={() => setViewMode('all')}
          >
            Find Doctors to Follow
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(viewMode === 'all' ? doctors : followedDoctors).map(doctor => (
              <DoctorCard 
                key={doctor._id || doctor.user?._id} 
                doctor={doctor} 
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                isAuthenticated={isAuthenticated}
                navigate={navigate}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-1">
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="border-indigo-200 text-indigo-700 hover:bg-blue-50"
              >
                Previous
              </Button>
              
              <div className="flex items-center mx-2 font-medium text-indigo-700">
                Page {page} of {totalPages}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="border-indigo-200 text-indigo-700 hover:bg-blue-50"
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

export default DoctorsPage;