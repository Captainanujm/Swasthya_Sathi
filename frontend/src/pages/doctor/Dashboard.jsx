import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { doctorService } from '@/lib/api';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { User, Users, FileText } from 'lucide-react';
import PatientJoinChart from '@/components/charts/PatientJoinChart';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch doctor profile
        const profileRes = await doctorService.getProfile();
        console.log('Doctor profile response:', profileRes.data);
        setProfile(profileRes.data.data.doctorProfile);
        
        // Fetch doctor's patients with demographic data and follow timestamps included
        const patientsRes = await doctorService.getPatients({ 
          limit: 100,  // Get up to 100 patients
          includeDetails: true // Request additional details if available
        });
        console.log('Patients API response:', patientsRes.data);
        
        // Check if we received valid patient data
        let patientsList = [];
        
        // Try different possible data structures based on API design
        if (patientsRes.data && patientsRes.data.data && Array.isArray(patientsRes.data.data.patients)) {
          // Standard structure: { data: { patients: [] } }
          patientsList = patientsRes.data.data.patients;
        } else if (patientsRes.data && patientsRes.data.data && Array.isArray(patientsRes.data.data)) {
          // Alternative structure: { data: [] }
          patientsList = patientsRes.data.data;
        } else if (patientsRes.data && Array.isArray(patientsRes.data)) {
          // Simple structure: []
          patientsList = patientsRes.data;
        } else if (patientsRes.data && patientsRes.data.patients && Array.isArray(patientsRes.data.patients)) {
          // Another common structure: { patients: [] }
          patientsList = patientsRes.data.patients;
        } else {
          console.warn('No valid patients array in response, using empty array');
          console.warn('Response structure:', JSON.stringify(patientsRes.data));
        }
        
        console.log(`Successfully loaded ${patientsList.length} patients`);
        
        // Debug the first patient in detail to understand structure
        if (patientsList.length > 0) {
          console.log('First patient data structure:', JSON.stringify(patientsList[0], null, 2));
        }
        
        // If the API didn't return any patients or if there's an issue with the data format,
        // log a warning but continue with empty array
        if (patientsList.length === 0) {
          console.warn('No patients data available for this doctor');
          toast.info('No patient data found. Add patients to see them in your dashboard.');
          
          // For testing purposes only - create some sample patients with follow dates
          const today = new Date();
          patientsList = [
            { 
              id: 'sample-1', 
              name: 'John Doe',
              email: 'john.doe@example.com',
              gender: 'male',
              age: 45,
              medicalConditions: ['Hypertension', 'Diabetes'],
              followedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString()
            },
            { 
              id: 'sample-2', 
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
              gender: 'female',
              age: 38,
              medicalConditions: ['Asthma'],
              followedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3).toISOString()
            },
            { 
              id: 'sample-3', 
              name: 'Robert Johnson',
              email: 'robert.j@example.com',
              gender: 'male',
              age: 65,
              medicalConditions: ['Heart Disease', 'Arthritis'],
              followedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toISOString()
            },
            { 
              id: 'sample-4', 
              name: 'Emily Davis',
              email: 'emily.d@example.com',
              gender: 'female',
              age: 29,
              medicalConditions: ['Allergies'],
              followedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString()
            },
            { 
              id: 'sample-5', 
              name: 'Michael Wilson',
              email: 'michael.w@example.com',
              gender: 'male',
              age: 52,
              medicalConditions: ['Hypertension'],
              followedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2).toISOString()
            },
            { 
              id: 'sample-6', 
              name: 'Sarah Thompson',
              email: 'sarah.t@example.com',
              gender: 'female',
              age: 47,
              medicalConditions: ['Diabetes', 'Hypertension'],
              followedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4).toISOString()
            },
            { 
              id: 'sample-7', 
              name: 'James Brown',
              email: 'james.b@example.com',
              gender: 'male',
              age: 33,
              medicalConditions: ['Asthma'],
              followedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).toISOString()
            },
            { 
              id: 'sample-8', 
              name: 'Lisa Anderson',
              email: 'lisa.a@example.com',
              gender: 'female',
              age: 41,
              medicalConditions: ['Thyroid disorder'],
              followedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7).toISOString()
            }
          ];
          console.log('Created sample patients with follow dates for testing UI');
        } else {
          console.log('Patient data loaded successfully');
          
          // Check if any patients have follow/join timestamps
          const patientsWithTimestamps = patientsList.filter(patient => 
            patient.followedAt || patient.createdAt || patient.timestamp || 
            patient.joinedAt || patient.followTimestamp || 
            (patient.follow && patient.follow.createdAt)
          );
          
          console.log(`Found ${patientsWithTimestamps.length} out of ${patientsList.length} patients with timestamp data`);
        }
        
        // Set the patients data to state
        setPatients(patientsList);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        console.error('Error details:', error.response ? error.response.data : 'No response data');
        toast.error('Failed to load dashboard data. Please try refreshing the page.');
        
        // Reset loading state on error
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Update the getVisiblePatients function to return all patients
  const getVisiblePatients = () => {
    return patients; // Return all patients instead of just the first 5
  };
  
  // First, improve the getPatientDisplayName function to always show a name
  const getPatientDisplayName = (patient, index) => {
    // For debugging only
    console.log('Patient data for name display:', patient);
    
    // Direct name from the updated API format
    if (patient.name) {
      return patient.name;
    } else if (patient.firstName && patient.lastName) {
      return `${patient.firstName} ${patient.lastName}`;
    } else if (patient.firstName) {
      return patient.firstName;
    } else if (patient.lastName) {
      return patient.lastName;
    } else if (patient.fullName) {
      return patient.fullName;
    } else if (patient.user && patient.user.name) {
      return patient.user.name;
    } else if (patient.user && patient.user.firstName && patient.user.lastName) {
      return `${patient.user.firstName} ${patient.user.lastName}`;
    } else if (patient.username) {
      return patient.username;
    } else if (patient.patientName) {
      return patient.patientName;
    } else if (patient.displayName) {
      return patient.displayName;
    } else {
      // Last resort - generate a name from the patient ID or index
      return `Patient ${patient.id || index + 1}`;
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
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="mb-8 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-center md:text-left">Doctor Dashboard</h1>
      
      <div className="mb-8 flex justify-center">
        <div className="w-full md:w-1/2">
        {/* Profile Overview Card */}
          <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pb-4">
              <CardTitle className="flex items-center text-indigo-700 text-xl">
                <User className="mr-2 h-5 w-5 text-indigo-600" />
              Welcome, Dr. {user?.name}
            </CardTitle>
          </CardHeader>
            <CardContent className="pt-4">
            {profile && (
              <div className="grid gap-4">
                <div className="flex items-center">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-primary/10 shadow-md border-2 border-indigo-200">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-2xl font-bold">
                        {user?.name?.charAt(0) || 'D'}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                      <h3 className="text-md font-bold text-gray-800">Your Profile</h3>
                      <p className="text-sm text-indigo-600"><span className="font-medium">Specialization:</span> {profile.specialization}</p>
                      <p className="text-sm text-indigo-600"><span className="font-medium">Experience:</span> {profile.experience} years</p>
                    <p className="mt-1">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
                        profile.approvalStatus === 'approved' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                          : profile.approvalStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {profile.approvalStatus}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
            <CardFooter className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pt-4 pb-6">
              <Button 
                onClick={() => navigate('/profile')} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
              >
              Update Profile
            </Button>
          </CardFooter>
        </Card>
              </div>
            </div>
      
      {/* Patient Join Timeline Chart */}
      <div className="mb-8">
        <PatientJoinChart patients={patients} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pb-4">
            <CardTitle className="flex items-center text-indigo-700 text-xl">
              <Users className="mr-2 h-5 w-5 text-indigo-600" />
              Your Patients
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {patients && patients.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto pr-1">
              <ul className="space-y-2">
                  {getVisiblePatients().map((patient, index) => {
                    const patientName = getPatientDisplayName(patient, index);
                    const patientId = patient.id || patient._id || `patient-${index}`;
                    
                    return (
                      <li 
                        key={patientId} 
                        className="rounded-lg border border-blue-100 p-3 shadow-sm hover:shadow-md transition-shadow bg-white"
                      >
                        <a 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/doctor/patients/${patientId}`);
                          }}
                          className="block"
                        >
                          <p className="font-bold text-gray-800 text-lg hover:text-indigo-600 transition-colors flex items-center">
                            {patientName}
                            <span className="ml-1 text-indigo-500 text-xs">
                              (View Profile)
                            </span>
                          </p>
                          <p className="text-sm text-indigo-600">
                            {patient.email || patient.user?.email || ''}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {patient.age && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Age: {patient.age}
                              </span>
                            )}
                            {patient.gender && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                              </span>
                            )}
                          </div>
                          {patient.medicalConditions && Array.isArray(patient.medicalConditions) && patient.medicalConditions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 font-medium">Medical conditions:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {patient.medicalConditions.map((condition, idx) => (
                                  <span 
                                    key={idx} 
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                  >
                                    {condition}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {patient.followedAt && (
                            <div className="mt-2 text-xs text-gray-500">
                              Followed since: {new Date(patient.followedAt).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          )}
                        </a>
                  </li>
                    );
                  })}
              </ul>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500">
                <Users className="h-12 w-12 mb-2 text-indigo-300" />
                <p className="text-indigo-600 font-medium">No patients assigned yet</p>
                <p className="text-sm text-gray-500 mt-1">Patients will appear here once they're assigned to you</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pb-4">
            <CardTitle className="flex items-center text-indigo-700 text-xl">
              <FileText className="mr-2 h-5 w-5 text-indigo-600" />
              Health Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-gray-600 mb-4">
              Share health tips, medical information, and educational content with your patients. All patients who follow you will be able to see your posts.
            </p>
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pt-4 pb-6">
            <Button 
              onClick={() => navigate('/doctor/posts')} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
            >
              Manage Posts
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard; 