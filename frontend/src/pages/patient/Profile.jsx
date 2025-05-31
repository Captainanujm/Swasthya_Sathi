import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/providers/AuthProvider';
import { patientService, authService } from '@/lib/api';
import { uploadImage } from '@/lib/cloudinary';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['male', 'female', 'other'];

const PatientProfile = () => {
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
  
  const [patientProfile, setPatientProfile] = useState({
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    height: '',
    weight: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    },
    allergies: [],
    chronicDiseases: [],
    medications: []
  });
  
  // String inputs for multiselect fields
  const [allergiesInput, setAllergiesInput] = useState('');
  const [diseasesInput, setDiseasesInput] = useState('');
  
  // Fetch patient profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await patientService.getProfile();
        const profile = response.data.data.patientProfile;
        
        // Ensure profile image is correctly applied from user context
        setBasicInfo({
          name: user?.name || '',
          phoneNumber: user?.phoneNumber || '',
          profileImage: user?.profileImage || ''
        });
        
        if (profile) {
          const formattedDOB = profile.dateOfBirth ? 
            new Date(profile.dateOfBirth).toISOString().split('T')[0] : '';
          
          setPatientProfile({
            ...profile,
            dateOfBirth: formattedDOB,
            address: profile.address || {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: ''
            },
            emergencyContact: profile.emergencyContact || {
              name: '',
              relationship: '',
              phoneNumber: ''
            },
            allergies: profile.allergies || [],
            chronicDiseases: profile.chronicDiseases || []
          });
          
          setAllergiesInput(profile.allergies ? profile.allergies.join(', ') : '');
          setDiseasesInput(profile.chronicDiseases ? profile.chronicDiseases.join(', ') : '');
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
  
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setPatientProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };
  
  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;
    setPatientProfile(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [name]: value
      }
    }));
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name, value) => {
    setPatientProfile(prev => ({
      ...prev,
      [name]: value
    }));
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
      
      // Create temporary local preview
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
      
      // Format allergies and diseases from comma-separated strings to arrays
      const allergies = allergiesInput
        ? allergiesInput.split(',').map(item => item.trim()).filter(Boolean)
        : [];
      
      const chronicDiseases = diseasesInput
        ? diseasesInput.split(',').map(item => item.trim()).filter(Boolean)
        : [];
      
      const updatedProfile = {
        ...patientProfile,
        allergies,
        chronicDiseases
      };
      
      await patientService.updateProfile(updatedProfile);
      toast.success('Medical profile updated');
      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update medical profile');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Profile Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic information and profile photo card */}
        <Card className="lg:col-span-1 shadow-lg border border-blue-100 overflow-hidden rounded-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-xl font-semibold text-indigo-700">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="text-center">
              <div 
                className="relative mx-auto h-32 w-32 rounded-full bg-muted overflow-hidden cursor-pointer group shadow-md" 
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
        
        {/* Medical Profile Card */}
        <Card className="lg:col-span-2 shadow-lg border border-blue-100 overflow-hidden rounded-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-xl font-semibold text-indigo-700">Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-indigo-800">Date of Birth</label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={patientProfile.dateOfBirth}
                  onChange={handleInputChange}
                  className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-indigo-800">Gender</label>
                <Select 
                  value={patientProfile.gender} 
                  onValueChange={(value) => handleSelectChange('gender', value)}
                >
                  <SelectTrigger className="mt-1 border-2 border-indigo-100 focus:border-indigo-300">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-bold text-indigo-800">Blood Group</label>
                <Select 
                  value={patientProfile.bloodGroup} 
                  onValueChange={(value) => handleSelectChange('bloodGroup', value)}
                >
                  <SelectTrigger className="mt-1 border-2 border-indigo-100 focus:border-indigo-300">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-bold text-indigo-800">Height (cm)</label>
                <Input
                  type="number"
                  name="height"
                  value={patientProfile.height || ''}
                  onChange={handleInputChange}
                  placeholder="Height in cm"
                  className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-indigo-800">Weight (kg)</label>
                <Input
                  type="number"
                  name="weight"
                  value={patientProfile.weight || ''}
                  onChange={handleInputChange}
                  placeholder="Weight in kg"
                  className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-indigo-700">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-indigo-800">Street Address</label>
                  <Input
                    name="street"
                    value={patientProfile.address.street}
                    onChange={handleAddressChange}
                    placeholder="Street address"
                    className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-indigo-800">City</label>
                  <Input
                    name="city"
                    value={patientProfile.address.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-indigo-800">State</label>
                  <Input
                    name="state"
                    value={patientProfile.address.state}
                    onChange={handleAddressChange}
                    placeholder="State/Province"
                    className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-indigo-800">Postal Code</label>
                  <Input
                    name="postalCode"
                    value={patientProfile.address.postalCode}
                    onChange={handleAddressChange}
                    placeholder="Postal code"
                    className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-indigo-800">Country</label>
                  <Input
                    name="country"
                    value={patientProfile.address.country}
                    onChange={handleAddressChange}
                    placeholder="Country"
                    className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-indigo-700">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-indigo-800">Name</label>
                  <Input
                    name="name"
                    value={patientProfile.emergencyContact.name}
                    onChange={handleEmergencyContactChange}
                    placeholder="Contact name"
                    className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-indigo-800">Relationship</label>
                  <Input
                    name="relationship"
                    value={patientProfile.emergencyContact.relationship}
                    onChange={handleEmergencyContactChange}
                    placeholder="Relationship to you"
                    className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-indigo-800">Phone Number</label>
                  <Input
                    name="phoneNumber"
                    value={patientProfile.emergencyContact.phoneNumber}
                    onChange={handleEmergencyContactChange}
                    placeholder="Contact phone number"
                    className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-indigo-700">Medical History</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-indigo-800">Allergies</label>
                  <Textarea
                    value={allergiesInput}
                    onChange={(e) => setAllergiesInput(e.target.value)}
                    placeholder="Enter allergies separated by commas (e.g., Peanuts, Penicillin)"
                    className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-indigo-800">Chronic Diseases</label>
                  <Textarea
                    value={diseasesInput}
                    onChange={(e) => setDiseasesInput(e.target.value)}
                    placeholder="Enter chronic diseases separated by commas (e.g., Asthma, Diabetes)"
                    className="mt-1 border-2 border-indigo-100 focus:border-indigo-300"
                  />
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
              {saving ? 'Saving...' : 'Save Medical Information'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PatientProfile; 