import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/providers/AuthProvider';
import { doctorService, authService } from '@/lib/api';
import { uploadImage } from '@/lib/cloudinary';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  const [basicInfo, setBasicInfo] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    profileImage: user?.profileImage || ''
  });
  
  const [doctorProfile, setDoctorProfile] = useState({
    specialization: '',
    experience: '',
    qualification: '',
    hospital: '',
    bio: '',
    consultationFee: '',
    availableHours: {
      from: '',
      to: ''
    },
    availableDays: []
  });
  
  // Fetch doctor profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getProfile();
        const profile = response.data.data.doctorProfile;
        
        // Ensure profile image is correctly applied from user context
        setBasicInfo({
          name: user?.name || '',
          phoneNumber: user?.phoneNumber || '',
          profileImage: user?.profileImage || ''
        });
        
        if (profile) {
          setDoctorProfile({
            specialization: profile.specialization || '',
            experience: profile.experience || '',
            qualification: profile.qualification || '',
            hospital: profile.hospital || '',
            bio: profile.bio || '',
            consultationFee: profile.consultationFee || '',
            availableHours: profile.availableHours || {
              from: '',
              to: ''
            },
            availableDays: profile.availableDays || []
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleHoursChange = (e) => {
    const { name, value } = e.target;
    setDoctorProfile(prev => ({
      ...prev,
      availableHours: {
        ...prev.availableHours,
        [name]: value
      }
    }));
  };
  
  const handleDayToggle = (day) => {
    setDoctorProfile(prev => {
      const availableDays = [...prev.availableDays];
      
      if (availableDays.includes(day)) {
        return {
          ...prev,
          availableDays: availableDays.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          availableDays: [...availableDays, day]
        };
      }
    });
  };
  
  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, JPG and PNG files are allowed');
      return;
    }
    
    if (file.size > maxSize) {
      toast.error('File size should not exceed 5MB');
      return;
    }
    
    try {
      setUploadingImage(true);
      
      // Create temporary local preview for immediate feedback
      const objectUrl = URL.createObjectURL(file);
      setBasicInfo(prev => ({
        ...prev,
        profileImage: objectUrl
      }));
      
      // Upload to Cloudinary
      const url = await uploadImage(file);
      
      // If upload successful, update the profile with the cloud URL
      setBasicInfo(prev => ({
        ...prev,
        profileImage: url
      }));
      
      // Update the user profile on the server
      await authService.updateProfile({ profileImage: url });
      
      // Update the user context
      updateUser({ profileImage: url });
      
      // Store in localStorage for persistence
      localStorage.setItem('lastProfileImage', url);
      
      toast.success('Profile photo updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Using temporary image until next refresh.');
      
      // Keep using the object URL as temporary fallback
      // It will be lost on refresh, but the user has visual feedback
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleSaveBasicInfo = async () => {
    try {
      setSaving(true);
      await authService.updateProfile(basicInfo);
      updateUser(basicInfo);
      toast.success('Basic information updated');
      navigate('/');
    } catch (error) {
      console.error('Error updating basic info:', error);
      toast.error('Failed to update basic information');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await doctorService.updateProfile(doctorProfile);
      toast.success('Professional profile updated');
      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update professional profile');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Doctor Profile Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic information and profile photo card */}
        <Card className="lg:col-span-1 shadow-lg border border-blue-100 overflow-hidden rounded-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-xl font-semibold text-indigo-700">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="text-center">
              <div 
                className="relative mx-auto h-32 w-32 rounded-full bg-muted overflow-hidden cursor-pointer group shadow-md border-2 border-indigo-100" 
                onClick={handlePhotoClick}
              >
                {basicInfo.profileImage ? (
                  <>
                    <img 
                      src={basicInfo.profileImage}
                      alt={user?.name || 'User'} 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:flex flex-col items-center justify-center text-white text-xs hidden">
                      <span>Change Photo</span>
                    </div>
                  </>
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700 text-white text-5xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                    <div className="absolute inset-0 bg-black/50 group-hover:flex flex-col items-center justify-center text-white text-xs hidden">
                      <span>Upload Photo</span>
                    </div>
                  </div>
                )}
                
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
                    <div className="animate-spin h-8 w-8 border-2 border-t-transparent border-white rounded-full"></div>
                  </div>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg,image/png,image/jpg" 
                onChange={handleFileChange}
              />
              
              <p className="mt-2 text-sm text-gray-600">
                Click to upload a new photo
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-indigo-800">Full Name</label>
                <Input
                  name="name"
                  value={basicInfo.name}
                  onChange={handleBasicInfoChange}
                  placeholder="Your full name"
                  className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-indigo-800">Phone Number</label>
                <Input
                  name="phoneNumber"
                  value={basicInfo.phoneNumber}
                  onChange={handleBasicInfoChange}
                  placeholder="Your phone number"
                  className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 pt-4 pb-6">
            <Button 
              onClick={handleSaveBasicInfo} 
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all duration-200"
            >
              {saving ? 'Saving...' : 'Save Basic Info'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Doctor Profile Card */}
        <Card className="lg:col-span-2 shadow-lg border border-blue-100 overflow-hidden rounded-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-xl font-semibold text-indigo-700">Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-indigo-800">Specialization</label>
                <Input
                  name="specialization"
                  value={doctorProfile.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Cardiology, Dermatology"
                  className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-indigo-800">Qualification</label>
                <Input
                  name="qualification"
                  value={doctorProfile.qualification}
                  onChange={handleInputChange}
                  placeholder="e.g., MBBS, MD"
                  className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-indigo-800">Years of Experience</label>
                <Input
                  name="experience"
                  type="number"
                  value={doctorProfile.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 5"
                  className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-indigo-800">Consultation Fee (₹)</label>
                <Input
                  name="consultationFee"
                  type="number"
                  value={doctorProfile.consultationFee}
                  onChange={handleInputChange}
                  placeholder="e.g., 500"
                  className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-bold text-indigo-800">Hospital/Clinic</label>
              <Textarea
                name="hospital"
                value={doctorProfile.hospital}
                onChange={handleInputChange}
                placeholder="Name and address of your primary practice"
                rows={2}
                className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
              />
            </div>
            
            <div>
              <label className="text-sm font-bold text-indigo-800">Bio</label>
              <Textarea
                name="bio"
                value={doctorProfile.bio}
                onChange={handleInputChange}
                placeholder="Brief professional description"
                rows={3}
                className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
              />
            </div>
            
            <div>
              <h3 className="text-md font-bold text-indigo-800 mb-2">Availability</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-bold text-indigo-800">From</label>
                  <Input
                    type="time"
                    name="from"
                    value={doctorProfile.availableHours.from}
                    onChange={handleHoursChange}
                    className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-indigo-800">To</label>
                  <Input
                    type="time"
                    name="to"
                    value={doctorProfile.availableHours.to}
                    onChange={handleHoursChange}
                    className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-bold text-indigo-800 block mb-2">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {weekdays.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                        doctorProfile.availableDays.includes(day)
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 pt-4 pb-6">
            <Button 
              onClick={handleSaveProfile} 
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all duration-200"
            >
              {saving ? 'Saving...' : 'Save Professional Info'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DoctorProfile; 