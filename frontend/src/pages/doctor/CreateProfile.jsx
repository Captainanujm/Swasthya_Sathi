import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { doctorService } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

const CreateDoctorProfile = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    specialization: '',
    qualification: '',
    experience: '',
    licenseNumber: '',
    hospital: '',
    bio: '',
    consultationFee: '',
    phoneNumber: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await doctorService.createProfile(formData);
      updateUser({ profile: response.data.data.profile });
      toast.success('Profile submitted for approval');
      navigate('/doctor/pending');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    toast.info('Profile saved as draft');
    // In a real app, we could save to localStorage or to the backend with a draft status
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mx-auto max-w-2xl shadow-lg border border-blue-100 overflow-hidden rounded-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-xl text-indigo-800">Create Doctor Profile</CardTitle>
          <CardDescription className="text-gray-700">Complete your professional profile to start serving patients</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-5">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="specialization" className="text-sm font-bold text-indigo-800">
                  Specialization
                </label>
                <input
                  id="specialization"
                  name="specialization"
                  className="w-full rounded-md border-2 border-indigo-100 focus:border-indigo-300 bg-background px-3 py-2 text-sm"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="qualification" className="text-sm font-bold text-indigo-800">
                  Qualification
                </label>
                <input
                  id="qualification"
                  name="qualification"
                  className="w-full rounded-md border-2 border-indigo-100 focus:border-indigo-300 bg-background px-3 py-2 text-sm"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="experience" className="text-sm font-bold text-indigo-800">
                  Years of Experience
                </label>
                <input
                  id="experience"
                  name="experience"
                  type="number"
                  className="w-full rounded-md border-2 border-indigo-100 focus:border-indigo-300 bg-background px-3 py-2 text-sm"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="licenseNumber" className="text-sm font-bold text-indigo-800">
                  License Number
                </label>
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  className="w-full rounded-md border-2 border-indigo-100 focus:border-indigo-300 bg-background px-3 py-2 text-sm"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="hospital" className="text-sm font-bold text-indigo-800">
                Hospital/Clinic Name
              </label>
              <textarea
                id="hospital"
                name="hospital"
                rows={1}
                className="w-full rounded-md border-2 border-indigo-100 focus:border-indigo-300 bg-background px-3 py-2 text-sm"
                value={formData.hospital}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="bio" className="text-sm font-bold text-indigo-800">
                Professional Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={2}
                className="w-full rounded-md border-2 border-indigo-100 focus:border-indigo-300 bg-background px-3 py-2 text-sm"
                value={formData.bio}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="consultationFee" className="text-sm font-bold text-indigo-800">
                  Consultation Fee (₹)
                </label>
                <input
                  id="consultationFee"
                  name="consultationFee"
                  type="number"
                  className="w-full rounded-md border-2 border-indigo-100 focus:border-indigo-300 bg-background px-3 py-2 text-sm"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="phoneNumber" className="text-sm font-bold text-indigo-800">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  className="w-full rounded-md border-2 border-indigo-100 focus:border-indigo-300 bg-background px-3 py-2 text-sm"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between bg-gradient-to-r from-blue-50 to-indigo-50 py-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="border-blue-200 hover:bg-blue-50 text-indigo-700"
            >
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateDoctorProfile; 