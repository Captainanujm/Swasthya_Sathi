import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { patientService } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { ArrowLeft, PlusCircle, Pill, FileText, ClipboardList, User, Heart, Calendar, RefreshCw } from 'lucide-react';

const ScanPatient = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [patientData, setPatientData] = useState(null);
  const [completeHistory, setCompleteHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [recordForm, setRecordForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    instructions: ''
  });
  
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Basic profile fetch for all users
        const response = await patientService.getScanProfile(patientId);
        setPatientData(response.data.data.patientProfile);
        
        // If user is a doctor, fetch complete history
        if (user && user.role === 'doctor') {
          try {
            const historyResponse = await patientService.getCompleteHistory(patientId);
            setCompleteHistory(historyResponse.data.data.patientHistory);
          } catch (historyErr) {
            console.error('Error fetching complete history:', historyErr);
            // Don't show error toast here, still display basic data
          }
        }
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient data. The QR code may be invalid or the patient profile does not exist.');
        toast.error('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId, user]);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const toggleAddRecord = () => {
    setShowAddRecord(!showAddRecord);
    setShowAddMedication(false);
  };
  
  const toggleAddMedication = () => {
    setShowAddMedication(!showAddMedication);
    setShowAddRecord(false);
  };
  
  const handleRecordChange = (e) => {
    const { name, value } = e.target;
    setRecordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleMedicationChange = (e) => {
    const { name, value } = e.target;
    setMedicationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddRecord = async (e) => {
    e.preventDefault();
    
    if (!user || user.role !== 'doctor') {
      toast.error('Only doctors can add medical records');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await patientService.addRecordViaQR(patientId, {
        recordType: 'medicalRecord',
        data: {
          title: recordForm.title,
          description: recordForm.description,
          date: recordForm.date
        }
      });
      
      toast.success('Medical record added successfully');
      setShowAddRecord(false);
      setRecordForm({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      // Refresh complete history data
      if (user.role === 'doctor') {
        try {
          const historyResponse = await patientService.getCompleteHistory(patientId);
          setCompleteHistory(historyResponse.data.data.patientHistory);
        } catch (error) {
          console.error('Error refreshing history data:', error);
        }
      }
    } catch (err) {
      console.error('Error adding medical record:', err);
      toast.error('Failed to add medical record');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddMedication = async (e) => {
    e.preventDefault();
    
    if (!user || user.role !== 'doctor') {
      toast.error('Only doctors can add medications');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await patientService.addRecordViaQR(patientId, {
        recordType: 'medication',
        data: {
          name: medicationForm.name,
          dosage: medicationForm.dosage,
          frequency: medicationForm.frequency,
          startDate: medicationForm.startDate,
          endDate: medicationForm.endDate || null,
          instructions: medicationForm.instructions
        }
      });
      
      toast.success('Medication added successfully');
      setShowAddMedication(false);
      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        instructions: ''
      });
      
      // Refresh complete history data
      if (user.role === 'doctor') {
        try {
          const historyResponse = await patientService.getCompleteHistory(patientId);
          setCompleteHistory(historyResponse.data.data.patientHistory);
        } catch (error) {
          console.error('Error refreshing history data:', error);
        }
      }
    } catch (err) {
      console.error('Error adding medication:', err);
      toast.error('Failed to add medication');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to refresh patient data
  const refreshPatientData = async () => {
    try {
      setLoading(true);
      
      // Refresh both basic and complete data
      const response = await patientService.getScanProfile(patientId);
      setPatientData(response.data.data.patientProfile);
      
      if (user && user.role === 'doctor') {
        const historyResponse = await patientService.getCompleteHistory(patientId);
        setCompleteHistory(historyResponse.data.data.patientHistory);
      }
      
      toast.success('Patient data refreshed');
    } catch (err) {
      console.error('Error refreshing data:', err);
      toast.error('Failed to refresh patient data');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleGoBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!patientData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Patient Not Found</h2>
              <p className="text-muted-foreground mb-4">The requested patient profile could not be found.</p>
              <Button onClick={handleGoBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Patient Profile</h1>
        <Button variant="outline" onClick={refreshPatientData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 overflow-hidden">
              {patientData.profileImage ? (
                <img 
                  src={patientData.profileImage} 
                  alt={patientData.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                  {patientData.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">{patientData.name}</CardTitle>
              <p className="text-sm text-muted-foreground">Swasthya Card ID: {patientData.cardNumber}</p>
            </div>
          </div>
        </CardHeader>
        
        {user && user.role === 'doctor' && completeHistory ? (
          // Enhanced view for doctors with tabs
          <div>
            {/* Tab navigation */}
            <div className="border-b flex overflow-x-auto">
              <button 
                className={`px-4 py-2 font-medium flex items-center ${activeTab === 'personal' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('personal')}
              >
                <User className="mr-2 h-4 w-4" />
                Personal Info
              </button>
              <button 
                className={`px-4 py-2 font-medium flex items-center ${activeTab === 'records' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('records')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Medical Records
              </button>
              <button 
                className={`px-4 py-2 font-medium flex items-center ${activeTab === 'medications' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('medications')}
              >
                <Pill className="mr-2 h-4 w-4" />
                Medications
              </button>
              <button 
                className={`px-4 py-2 font-medium flex items-center ${activeTab === 'chronic' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('chronic')}
              >
                <Heart className="mr-2 h-4 w-4" />
                Chronic Diseases
              </button>
            </div>

            {/* Tab content */}
            <CardContent className="py-4">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-medium">Blood Group</p>
                      <p className="text-xl font-semibold text-red-600">
                        {completeHistory.personalInfo.bloodGroup || 'Not Available'}
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-medium">Gender</p>
                      <p className="text-xl font-semibold">
                        {completeHistory.personalInfo.gender || 'Not Available'}
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-medium">Age</p>
                      <p className="text-xl font-semibold">
                        {completeHistory.personalInfo.age || 'Not Available'}
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-xl font-semibold">
                        {completeHistory.personalInfo.dateOfBirth 
                          ? formatDate(completeHistory.personalInfo.dateOfBirth) 
                          : 'Not Available'}
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-medium">Height</p>
                      <p className="text-xl font-semibold">
                        {completeHistory.personalInfo.height 
                          ? `${completeHistory.personalInfo.height} cm` 
                          : 'Not Available'}
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-medium">Weight</p>
                      <p className="text-xl font-semibold">
                        {completeHistory.personalInfo.weight 
                          ? `${completeHistory.personalInfo.weight} kg` 
                          : 'Not Available'}
                      </p>
                    </div>
                    
                    {completeHistory.personalInfo.bmi && (
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm font-medium">BMI</p>
                        <p className="text-xl font-semibold">
                          {completeHistory.personalInfo.bmi}
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-xl font-semibold">
                        {completeHistory.personalInfo.phoneNumber || 'Not Available'}
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm font-semibold overflow-hidden text-ellipsis">
                        {completeHistory.personalInfo.email || 'Not Available'}
                      </p>
                    </div>
                  </div>
                  
                  {completeHistory.emergencyContact && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Emergency Contact</h3>
                      <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                        <p><span className="font-medium">Name:</span> {completeHistory.emergencyContact.name}</p>
                        <p><span className="font-medium">Relationship:</span> {completeHistory.emergencyContact.relationship}</p>
                        <p><span className="font-medium">Phone:</span> {completeHistory.emergencyContact.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                  
                  {completeHistory.medicalInfo.allergies && completeHistory.medicalInfo.allergies.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Allergies</h3>
                      <div className="bg-red-50 p-3 rounded-md border border-red-200">
                        <ul className="list-disc list-inside">
                          {completeHistory.medicalInfo.allergies.map((allergy, index) => (
                            <li key={index} className="text-sm">{allergy}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Medical Records Tab */}
              {activeTab === 'records' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Medical Records</h3>
                  {completeHistory.medicalInfo.medicalRecords && 
                   completeHistory.medicalInfo.medicalRecords.length > 0 ? (
                    <div className="space-y-4">
                      {completeHistory.medicalInfo.medicalRecords.map((record, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold">{record.title}</h4>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(record.date || record.dateAdded)}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{record.description}</p>
                          {record.recordedBy && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Recorded by: Dr. {record.recordedBy.name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No medical records available</p>
                  )}
                </div>
              )}
              
              {/* Medications Tab */}
              {activeTab === 'medications' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Current Medications</h3>
                  {completeHistory.medicalInfo.medications && 
                   completeHistory.medicalInfo.medications.length > 0 ? (
                    <div className="space-y-4">
                      {completeHistory.medicalInfo.medications.map((medication, index) => (
                        <div key={index} className="border rounded-md p-3 bg-blue-50">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold">{medication.name}</h4>
                            <span className="text-xs px-2 py-1 bg-blue-100 rounded-full">
                              {medication.dosage}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-xs font-medium">Frequency</p>
                              <p className="text-sm">{medication.frequency}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium">Duration</p>
                              <p className="text-sm">
                                {formatDate(medication.startDate || medication.dateAdded)} 
                                {medication.endDate ? ` to ${formatDate(medication.endDate)}` : ' (Ongoing)'}
                              </p>
                            </div>
                          </div>
                          
                          {medication.instructions && (
                            <div className="mt-2">
                              <p className="text-xs font-medium">Instructions</p>
                              <p className="text-sm">{medication.instructions}</p>
                            </div>
                          )}
                          
                          {medication.prescribedBy && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Prescribed by: Dr. {medication.prescribedBy.name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No medications available</p>
                  )}
                </div>
              )}
              
              {/* Chronic Diseases Tab */}
              {activeTab === 'chronic' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Chronic Conditions</h3>
                  {completeHistory.medicalInfo.chronicDiseases && 
                   completeHistory.medicalInfo.chronicDiseases.length > 0 ? (
                    <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                      <ul className="list-disc list-inside space-y-2">
                        {completeHistory.medicalInfo.chronicDiseases.map((disease, index) => (
                          <li key={index} className="text-sm">
                            {typeof disease === 'string' ? disease : disease.name}
                            {typeof disease !== 'string' && disease.diagnosedDate && (
                              <span className="text-xs text-muted-foreground ml-2">
                                Diagnosed: {formatDate(disease.diagnosedDate)}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No chronic conditions recorded</p>
                  )}
                </div>
              )}
            </CardContent>
          </div>
        ) : (
          // Basic view for non-doctors
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-sm font-medium">Blood Group</p>
                <p className="text-xl font-semibold text-red-600">{patientData.bloodGroup || 'Not Available'}</p>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-sm font-medium">Gender</p>
                <p className="text-xl font-semibold">{patientData.gender || 'Not Available'}</p>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-sm font-medium">Age</p>
                <p className="text-xl font-semibold">{patientData.age || 'Not Available'}</p>
              </div>
            </div>
            
            {patientData.allergies && patientData.allergies.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Allergies</h3>
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                  <ul className="list-disc list-inside">
                    {patientData.allergies.map((allergy, index) => (
                      <li key={index} className="text-sm">{allergy}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        )}
        
        {user && user.role === 'doctor' && (
          <CardFooter className="border-t pt-4 flex flex-col">
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={toggleAddRecord}
              >
                <FileText className="mr-2 h-4 w-4" />
                {showAddRecord ? 'Cancel' : 'Add Medical Record'}
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={toggleAddMedication}
              >
                <Pill className="mr-2 h-4 w-4" />
                {showAddMedication ? 'Cancel' : 'Add Medication'}
              </Button>
            </div>
            
            {/* Add Medical Record Form */}
            {showAddRecord && (
              <form onSubmit={handleAddRecord} className="mt-4 border rounded-md p-4 w-full">
                <h3 className="text-lg font-semibold mb-4">Add Medical Record</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      value={recordForm.title}
                      onChange={handleRecordChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      value={recordForm.description}
                      onChange={handleRecordChange}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-1">
                      Date
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      required
                      value={recordForm.date}
                      onChange={handleRecordChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {loading ? 'Adding...' : 'Add Record'}
                  </Button>
                </div>
              </form>
            )}
            
            {/* Add Medication Form */}
            {showAddMedication && (
              <form onSubmit={handleAddMedication} className="mt-4 border rounded-md p-4 w-full">
                <h3 className="text-lg font-semibold mb-4">Add Medication</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Medication Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={medicationForm.name}
                      onChange={handleMedicationChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dosage" className="block text-sm font-medium mb-1">
                        Dosage
                      </label>
                      <input
                        id="dosage"
                        name="dosage"
                        type="text"
                        required
                        value={medicationForm.dosage}
                        onChange={handleMedicationChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g. 500mg"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="frequency" className="block text-sm font-medium mb-1">
                        Frequency
                      </label>
                      <input
                        id="frequency"
                        name="frequency"
                        type="text"
                        required
                        value={medicationForm.frequency}
                        onChange={handleMedicationChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g. Twice daily"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                        Start Date
                      </label>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        required
                        value={medicationForm.startDate}
                        onChange={handleMedicationChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                        End Date (Optional)
                      </label>
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={medicationForm.endDate}
                        onChange={handleMedicationChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="instructions" className="block text-sm font-medium mb-1">
                      Instructions
                    </label>
                    <textarea
                      id="instructions"
                      name="instructions"
                      value={medicationForm.instructions}
                      onChange={handleMedicationChange}
                      className="w-full p-2 border rounded-md"
                      rows={2}
                      placeholder="e.g. Take with food"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {loading ? 'Adding...' : 'Add Medication'}
                  </Button>
                </div>
              </form>
            )}
          </CardFooter>
        )}
      </Card>
      
      {!user || user.role !== 'doctor' ? (
        <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 text-center">
          <p className="text-sm text-yellow-700">
            Note: Only doctors can add medical records or medications through this QR scan.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ScanPatient; 