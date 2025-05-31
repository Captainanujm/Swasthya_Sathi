import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doctorService, patientService } from '@/lib/api';
import { toast } from 'sonner';
import { User, ArrowLeft, Heart, Clock, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [followInfo, setFollowInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        
        // Fetch patient details from the API
        const response = await doctorService.getPatientDetails(patientId);
        
        console.log('Patient details response:', response.data);
        
        // Set patient data
        if (response.data && response.data.data && response.data.data.patient) {
          // Get the patient data and set it directly without adding dummy data
          setPatient(response.data.data.patient);
          setFollowInfo(response.data.data.followInfo);
        } else {
          toast.error('Failed to load patient data');
        }
      } catch (error) {
        console.error('Error fetching patient details:', error);
        console.error('Error details:', error.response ? error.response.data : 'No response data');
        toast.error('Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }
  
  // If no patient data was found
  if (!patient) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button 
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Card className="shadow-lg border border-red-100 rounded-xl">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="mb-4 text-red-500">
              <User className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Patient Not Found</h2>
            <p className="text-gray-600">
              The patient you are looking for doesn't exist or you don't have permission to view their details.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="mt-6 bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Patient Profile Card */}
        <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl md:col-span-1">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pb-4">
            <CardTitle className="flex items-center text-indigo-700 text-xl">
              <User className="mr-2 h-5 w-5 text-indigo-600" />
              Patient Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-primary/10 shadow-md border-2 border-indigo-200 mb-4">
                {patient.profileImage ? (
                  <img 
                    src={patient.profileImage} 
                    alt={patient.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-3xl font-bold">
                    {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-1">{patient.name}</h2>
              <p className="text-indigo-600 mb-4">{patient.email}</p>
              
              <div className="w-full grid gap-3">
                {patient.gender && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                    <span className="text-sm text-gray-500">Gender</span>
                    <span className="text-sm font-medium text-gray-800 capitalize">{patient.gender}</span>
                  </div>
                )}
                
                {patient.age && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                    <span className="text-sm text-gray-500">Age</span>
                    <span className="text-sm font-medium text-gray-800">{patient.age} years</span>
                  </div>
                )}
                
                {patient.phoneNumber && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="text-sm font-medium text-gray-800">{patient.phoneNumber}</span>
                  </div>
                )}
                
                {followInfo && followInfo.followedAt && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50">
                    <span className="text-sm text-gray-500">Following since</span>
                    <span className="text-sm font-medium text-indigo-700">
                      {format(new Date(followInfo.followedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pt-4 pb-6">
            <Button
              onClick={() => navigate('/chat/' + patientId)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
            >
              Start Chat
            </Button>
          </CardFooter>
        </Card>
        
        {/* Health Information */}
        <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl md:col-span-2">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pb-4">
            <CardTitle className="flex items-center text-indigo-700 text-xl">
              <Heart className="mr-2 h-5 w-5 text-indigo-600" />
              Health Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {patient.medicalConditions && patient.medicalConditions.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Medical Conditions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patient.medicalConditions.map((condition, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Medical Conditions
                </h3>
                <p className="text-gray-500 italic">No medical conditions recorded</p>
              </div>
            )}
            
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Allergies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Allergies
                </h3>
                <p className="text-gray-500 italic">No allergies recorded</p>
              </div>
            )}
            
            {patient.medications && patient.medications.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Medications
                </h3>
                <div className="grid gap-3">
                  {patient.medications.map((medication, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="font-medium text-gray-800">{medication.name}</div>
                      <div className="text-sm text-gray-600">
                        <span>{medication.dosage}</span>
                        {medication.frequency && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{medication.frequency}</span>
                          </>
                        )}
                      </div>
                      {medication.notes && (
                        <div className="text-sm text-gray-500 mt-1">{medication.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Medications
                </h3>
                <p className="text-gray-500 italic">No medications recorded</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Additional patient information cards can be added here */}
      </div>
    </div>
  );
};

export default PatientDetail; 