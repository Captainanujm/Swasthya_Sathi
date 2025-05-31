import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { patientService } from '@/lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { User, Plus, X, Edit2, Save, Pill, FileText, Upload, File, Trash2, Calendar, ExternalLink, Download, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { uploadImage } from '@/lib/cloudinary';
import { formatFileSize, formatDate } from '@/lib/utils';

// Local storage key for medical records
const MEDICAL_RECORDS_STORAGE_KEY = 'patientMedicalRecords';

const MedicalSummary = () => {
  const { user } = useAuth();
  const [medicalData, setMedicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [medicationDialogOpen, setMedicationDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const fileInputRef = useRef(null);
  const [medicationDetails, setMedicationDetails] = useState({
    name: '',
    dosage: '',
    frequency: '',
    purpose: '',
    startDate: '',
    endDate: ''
  });
  // Flag to track if we've processed the local storage records
  const [recordsProcessed, setRecordsProcessed] = useState(false);
  
  // Use a separate state to track if we should render the dialog at all
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  
  // Fetch medical data
  useEffect(() => {
    fetchMedicalData();
  }, []);
  
  // Load medical records from localStorage
  useEffect(() => {
    // Skip if we've already processed the records or if data isn't loaded yet
    if (recordsProcessed || !medicalData || !medicalData.medicalInfo) {
      return;
    }
    
    // If medicalInfo doesn't exist, initialize it
    if (!medicalData.medicalInfo) {
      setMedicalData(prevData => ({
        ...prevData,
        medicalInfo: {}
      }));
      return;
    }
    
    // Load saved medical records from localStorage
    const savedRecords = localStorage.getItem(MEDICAL_RECORDS_STORAGE_KEY);
    
    if (savedRecords) {
      try {
        const parsedRecords = JSON.parse(savedRecords);
        
        // Get existing backend records (including doctor-added records)
        const backendRecords = medicalData.medicalInfo.medicalRecords || [];
        
        // Ensure we only merge file-type records from localStorage
        // and keep all doctor-added records from the backend
        const doctorAddedRecords = backendRecords.filter(record => !record.type && record.title);
        const fileRecords = parsedRecords.filter(record => record.type);
        
        // Add unique IDs to any records that don't have them
        const fileRecordsWithIds = fileRecords.map(record => {
          if (!record.id) {
            return {
              ...record,
              id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
            };
          }
          return record;
        });
        
        // Make sure we save the updated records with IDs back to localStorage
        localStorage.setItem(
          MEDICAL_RECORDS_STORAGE_KEY, 
          JSON.stringify(fileRecordsWithIds)
        );
        
        // Update the medical data with merged records
        setMedicalData(prevData => ({
          ...prevData,
          medicalInfo: {
            ...prevData.medicalInfo,
            medicalRecords: [...doctorAddedRecords, ...fileRecordsWithIds]
          }
        }));
      } catch (error) {
        console.error('Error parsing saved medical records:', error);
      }
    }
    
    // Mark as processed to prevent infinite loops
    setRecordsProcessed(true);
  }, [medicalData, recordsProcessed]);
  
  const fetchMedicalData = async () => {
    try {
      setLoading(true);
      const response = await patientService.getMedicalSummary();
      setMedicalData(response.data.data.medicalSummary);
      // Reset the processed flag when fetching new data
      setRecordsProcessed(false);
    } catch (error) {
      console.error('Error fetching medical summary:', error);
      toast.error('Failed to load medical data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMedicationChange = (e) => {
    const { name, value } = e.target;
    setMedicationDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const openAddMedicationDialog = () => {
    // Reset form state
    setSelectedMedication(null);
    setMedicationDetails({
      name: '',
      dosage: '',
      frequency: '',
      purpose: '',
      startDate: '',
      endDate: ''
    });
    
    // Show the form
    setShowMedicationForm(true);
  };
  
  const openEditMedicationDialog = (medication) => {
    // Set form data
    setSelectedMedication(medication);
    setMedicationDetails({
      name: medication.name || '',
      dosage: medication.dosage || '',
      frequency: medication.frequency || '',
      purpose: medication.purpose || '',
      startDate: medication.startDate || '',
      endDate: medication.endDate || ''
    });
    
    // Show the form
    setShowMedicationForm(true);
  };
  
  const closeMedicationForm = () => {
    setShowMedicationForm(false);
  };
  
  const handleSaveMedication = async () => {
    try {
      setSaving(true);
      
      if (!medicationDetails.name) {
        toast.error('Medication name is required');
        return;
      }
      
      // Create a copy of the current medical data
      const updatedMedicalData = { ...medicalData };
      
      // Initialize medications array if it doesn't exist
      if (!updatedMedicalData.medicalInfo) {
        updatedMedicalData.medicalInfo = {};
      }
      
      if (!updatedMedicalData.medicalInfo.medications) {
        updatedMedicalData.medicalInfo.medications = [];
      }
      
      // Format the medication data properly
      const formattedMedication = {
        ...medicationDetails,
        startDate: medicationDetails.startDate ? new Date(medicationDetails.startDate).toISOString() : null,
        endDate: medicationDetails.endDate ? new Date(medicationDetails.endDate).toISOString() : null
      };
      
      // If editing an existing medication, update it
      if (selectedMedication) {
        const index = updatedMedicalData.medicalInfo.medications.findIndex(
          med => med === selectedMedication || 
                (med.name === selectedMedication.name && 
                 (!med.prescribedBy || med.prescribedBy.name === selectedMedication.prescribedBy?.name))
        );
        
        if (index !== -1) {
          // Preserve any prescriber information if it exists
          if (updatedMedicalData.medicalInfo.medications[index].prescribedBy) {
            formattedMedication.prescribedBy = updatedMedicalData.medicalInfo.medications[index].prescribedBy;
          }
          
          updatedMedicalData.medicalInfo.medications[index] = formattedMedication;
        }
      } 
      // Otherwise, add a new one
      else {
        updatedMedicalData.medicalInfo.medications.push(formattedMedication);
      }
      
      // Update the backend
      await patientService.updateMedications(updatedMedicalData.medicalInfo.medications);
      
      // Update local state
      setMedicalData(updatedMedicalData);
      
      // Close the form using our new method
      closeMedicationForm();
      
      // Show success message
      toast.success(selectedMedication ? 'Medication updated' : 'Medication added');
      
    } catch (error) {
      console.error('Error saving medication:', error);
      toast.error('Failed to save medication');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteMedication = async (medication) => {
    try {
      setSaving(true);
      
      // Create a copy of the current medical data
      const updatedMedicalData = { ...medicalData };
      
      // Filter out the medication to delete
      updatedMedicalData.medicalInfo.medications = updatedMedicalData.medicalInfo.medications.filter(
        med => med.name !== medication.name
      );
      
      // Update the backend
      await patientService.updateMedications(updatedMedicalData.medicalInfo.medications);
      
      // Update local state
      setMedicalData(updatedMedicalData);
      
      // Show success message
      toast.success('Medication removed');
      
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast.error('Failed to delete medication');
    } finally {
      setSaving(false);
    }
  };
  
  const handleFileClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and image files are allowed');
      return;
    }
    
    if (file.size > maxSize) {
      toast.error('File size should not exceed 10MB');
      return;
    }
    
    try {
      setUploadingFile(true);
      
      // Upload to Cloudinary
      const url = await uploadImage(file);
      
      // Create a copy of the current medical data
      const updatedMedicalData = { ...medicalData };
      
      // Initialize medical records array if it doesn't exist
      if (!updatedMedicalData.medicalInfo) {
        updatedMedicalData.medicalInfo = {};
      }
      
      if (!updatedMedicalData.medicalInfo.medicalRecords) {
        updatedMedicalData.medicalInfo.medicalRecords = [];
      }
      
      // Format current date nicely for display
      const now = new Date();
      const formattedDate = now.toISOString();
      
      // Add the new record with a unique ID
      const recordId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newRecord = {
        id: recordId,
        url,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: formattedDate,
        displayDate: formatDate(now)
      };
      
      // Get current file records from localStorage
      let fileRecords = [];
      const savedRecords = localStorage.getItem(MEDICAL_RECORDS_STORAGE_KEY);
      if (savedRecords) {
        try {
          fileRecords = JSON.parse(savedRecords);
        } catch (error) {
          console.error('Error parsing saved records:', error);
        }
      }
      
      // Check for duplicates by comparing name, size, and upload time
      const isDuplicate = fileRecords.some(record => 
        record.name === newRecord.name && 
        record.size === newRecord.size &&
        Math.abs(new Date(record.uploadedAt) - now) < 5000 // Within 5 seconds
      );
      
      if (isDuplicate) {
        toast.info('This file appears to be a duplicate. Skipping upload.');
        setUploadingFile(false);
        return;
      }
      
      // Add the new record to file records
      fileRecords.push(newRecord);
      
      // Store updated file records in localStorage
      localStorage.setItem(
        MEDICAL_RECORDS_STORAGE_KEY, 
        JSON.stringify(fileRecords)
      );
      
      // Get doctor-added records from the backend
      const doctorAddedRecords = updatedMedicalData.medicalInfo.medicalRecords.filter(
        record => !record.type && record.title
      );
      
      // Merge doctor-added records with file records
      updatedMedicalData.medicalInfo.medicalRecords = [...doctorAddedRecords, ...fileRecords];
      
      // Update local state
      setMedicalData(updatedMedicalData);
      
      toast.success('Medical record uploaded');
      
      // Clear the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload medical record');
    } finally {
      setUploadingFile(false);
    }
  };
  
  // Function to open file in a new tab
  const handleOpenFile = (record, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!record || !record.url) {
      toast.error('Cannot open file: Invalid file record');
      return;
    }
    
    // Log the record opening for debugging
    console.log('Opening record:', record);
    
    // Use a timeout to ensure we don't have multiple windows opening at once
    setTimeout(() => {
      window.open(record.url, '_blank', 'noopener,noreferrer');
    }, 100);
  };
  
  // Function to download file securely
  const handleDownloadFile = async (record, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!record || !record.url) {
      toast.error('Cannot download file: Invalid file record');
      return;
    }
    
    try {
      toast.info(`Preparing download for ${record.name}...`);
      
      // Fetch the file from the URL
      const response = await fetch(record.url);
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = record.name || 'download';
      
      // Append to body, click, and then remove
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the blob URL
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };
  
  const handleDeleteRecord = async (record) => {
    try {
      setSaving(true);
      
      // Only allow deleting file records, not doctor-added records
      if (!record.type) {
        toast.error('Cannot delete records added by a doctor');
        return;
      }
      
      // Create a copy of the current medical data
      const updatedMedicalData = { ...medicalData };
      
      // Filter out the record to delete from the displayed records
      // Use id if available, otherwise fall back to url
      updatedMedicalData.medicalInfo.medicalRecords = updatedMedicalData.medicalInfo.medicalRecords.filter(
        r => (r.id && record.id) ? r.id !== record.id : r.url !== record.url
      );
      
      // Update file records in localStorage
      const savedRecords = localStorage.getItem(MEDICAL_RECORDS_STORAGE_KEY);
      if (savedRecords) {
        try {
          const fileRecords = JSON.parse(savedRecords).filter(
            r => (r.id && record.id) ? r.id !== record.id : r.url !== record.url
          );
          localStorage.setItem(
            MEDICAL_RECORDS_STORAGE_KEY, 
            JSON.stringify(fileRecords)
          );
        } catch (error) {
          console.error('Error updating saved records:', error);
        }
      }
      
      // Update local state
      setMedicalData(updatedMedicalData);
      
      // Show success message
      toast.success('Medical record removed');
      
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete medical record');
    } finally {
      setSaving(false);
    }
  };
  
  const getFileIcon = (type) => {
    if (type === 'application/pdf') {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (type.startsWith('image/')) {
      return <File className="h-6 w-6 text-blue-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  // Render the medication form directly in the page instead of using Dialog
  const renderMedicationForm = () => {
    if (!showMedicationForm) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMedicationForm}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-100 rounded-xl shadow-lg w-full max-w-md p-6 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
              <h3 className="text-xl font-semibold text-indigo-700">
                {selectedMedication ? 'Edit Medication' : 'Add New Medication'}
              </h3>
              <p className="text-gray-600 text-sm">
                {selectedMedication ? 'Update the details of your medication.' : 'Enter the details of your medication to keep track of your prescriptions.'}
              </p>
            </div>
            
            {/* Close button */}
            <button 
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
              onClick={closeMedicationForm}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            
            {/* Form */}
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Medication Name*</label>
                <Input
                  id="name"
                  name="name"
                  value={medicationDetails.name}
                  onChange={handleMedicationChange}
                  placeholder="Medication name"
                  required
                  className="border-2 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="dosage" className="text-sm font-medium text-gray-700">Dosage</label>
                <Input
                  id="dosage"
                  name="dosage"
                  value={medicationDetails.dosage}
                  onChange={handleMedicationChange}
                  placeholder="e.g., 10mg, 1 tablet"
                  className="border-2 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="frequency" className="text-sm font-medium text-gray-700">Frequency</label>
                <Input
                  id="frequency"
                  name="frequency"
                  value={medicationDetails.frequency}
                  onChange={handleMedicationChange}
                  placeholder="e.g., Once daily, Every 8 hours"
                  className="border-2 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="purpose" className="text-sm font-medium text-gray-700">Purpose</label>
                <Input
                  id="purpose"
                  name="purpose"
                  value={medicationDetails.purpose}
                  onChange={handleMedicationChange}
                  placeholder="What is this medication for?"
                  className="border-2 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date</label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={medicationDetails.startDate}
                    onChange={handleMedicationChange}
                    className="border-2 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={medicationDetails.endDate}
                    onChange={handleMedicationChange}
                    className="border-2 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                  />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
              <Button 
                variant="outline" 
                onClick={closeMedicationForm}
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors mt-2 sm:mt-0"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveMedication} 
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all duration-200"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Medical Summary</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchMedicalData} 
          disabled={loading}
          className="border-2 border-indigo-400 text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>
      
      <div className="mb-8">
        <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center text-xl font-semibold text-indigo-700">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-blue-700 mr-4 shadow-md">
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.charAt(0) || 'P'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-gray-800"><span className="font-bold text-indigo-800">Name:</span> {user?.name}</p>
                  <p className="text-gray-800"><span className="font-bold text-indigo-800">Email:</span> {user?.email}</p>
                  {medicalData?.personalInfo?.bloodGroup && (
                    <p className="text-gray-800"><span className="font-bold text-indigo-800">Blood Group:</span> {medicalData.personalInfo.bloodGroup}</p>
                  )}
                </div>
              </div>
              <div className="text-gray-800">
                {medicalData?.personalInfo?.age && (
                  <p><span className="font-bold text-indigo-800">Age:</span> {medicalData.personalInfo.age} years</p>
                )}
                {medicalData?.personalInfo?.height && (
                  <p><span className="font-bold text-indigo-800">Height:</span> {medicalData.personalInfo.height} cm</p>
                )}
                {medicalData?.personalInfo?.weight && (
                  <p><span className="font-bold text-indigo-800">Weight:</span> {medicalData.personalInfo.weight} kg</p>
                )}
              </div>
            </div>
            
            {medicalData?.medicalInfo?.allergies && medicalData.medicalInfo.allergies.length > 0 && (
              <div className="mt-6 p-4 bg-white/60 rounded-lg shadow-sm">
                <h3 className="mb-2 font-bold text-indigo-800">Allergies</h3>
                <ul className="list-disc pl-5 text-gray-800">
                  {medicalData.medicalInfo.allergies.map((allergy, index) => (
                    <li key={index}>{allergy}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {!medicalData && (
              <p className="mt-4 text-center text-gray-700">Medical data not available. Please update your profile.</p>
            )}
          </CardContent>
          <CardFooter className="pt-4 pb-6">
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all duration-200"
              onClick={() => window.location.href = "/profile"}
            >
              Update Profile Information
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        
        <Card className="shadow-lg border-2 border-indigo-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardTitle className="flex items-center text-xl font-semibold text-indigo-700">
              <Pill className="mr-2 h-5 w-5 text-indigo-600" />
              Medications
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openAddMedicationDialog}
              className="border-2 border-indigo-400 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Plus className="mr-1 h-4 w-4" /> Add Medication
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {medicalData?.medicalInfo?.medications && medicalData.medicalInfo.medications.length > 0 ? (
              <ul className="space-y-3">
                {medicalData.medicalInfo.medications.map((medication, index) => (
                  <li key={index} className="rounded-md border border-gray-200 p-4 relative hover:shadow-md transition-all duration-200">
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-indigo-50 hover:text-indigo-700 transition-colors" onClick={() => openEditMedicationDialog(medication)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors" onClick={() => handleDeleteMedication(medication)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="pr-16">
                      <p className="font-medium text-indigo-700">{medication.name}</p>
                      {medication.dosage && (
                        <p className="text-sm text-gray-600">
                          Dosage: {medication.dosage}
                        </p>
                      )}
                      {medication.frequency && (
                        <p className="text-sm text-gray-600">
                          Frequency: {medication.frequency}
                        </p>
                      )}
                      {medication.purpose && (
                        <p className="text-sm text-gray-600">
                          Purpose: {medication.purpose}
                        </p>
                      )}
                      {medication.instructions && (
                        <p className="text-sm text-gray-600">
                          Instructions: {medication.instructions}
                        </p>
                      )}
                      {(medication.startDate || medication.endDate) && (
                        <p className="text-sm text-gray-600">
                          {medication.startDate && `From: ${formatDate(new Date(medication.startDate))}`}
                          {medication.startDate && medication.endDate && ' · '}
                          {medication.endDate && `To: ${formatDate(new Date(medication.endDate))}`}
                        </p>
                      )}
                      {medication.prescribedBy && (
                        <p className="text-sm mt-1">
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                            Prescribed by Dr. {medication.prescribedBy.name}
                          </span>
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Pill className="h-12 w-12 text-indigo-300 mb-3" />
                <p className="text-gray-600 mb-4">No medications listed</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openAddMedicationDialog}
                  className="border-2 border-indigo-400 text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Your First Medication
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Medical Records Card */}
        <Card className="shadow-lg border-2 border-blue-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center text-xl font-semibold text-blue-700">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              Medical Records
            </CardTitle>
            <div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="application/pdf,image/jpeg,image/png,image/jpg" 
                onChange={handleFileChange}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFileClick}
                disabled={uploadingFile}
                className="border-2 border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {uploadingFile ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-1 h-4 w-4" /> Upload Record
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto pt-6">
            {medicalData?.medicalInfo?.medicalRecords && medicalData.medicalInfo.medicalRecords.length > 0 ? (
              <ul className="space-y-3">
                {medicalData.medicalInfo.medicalRecords.map((record, index) => {
                  // Check if this is a file-type record or doctor-added record
                  const isDoctorAdded = !record.type && record.title;
                  // Use unique record ID if available, otherwise fall back to index
                  const recordKey = record.id || `record-${index}`;
                  
                  return (
                    <li key={recordKey} className="rounded-md border border-gray-200 p-4 relative hover:bg-blue-50/50 transition-all duration-200 hover:shadow-md">
                      {!isDoctorAdded && (
                        <div className="absolute top-3 right-3 flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors" 
                            onClick={(e) => handleDownloadFile(record, e)}
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors" 
                            onClick={() => handleDeleteRecord(record)}
                            title="Delete record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      {isDoctorAdded ? (
                        // Doctor-added record format
                        <div>
                          <div className="flex items-start">
                            <div className="mr-3 mt-1 flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-white">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-blue-700">{record.title}</p>
                              {record.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {record.description}
                                </p>
                              )}
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>
                                  {formatDate(new Date(record.date || record.dateAdded))}
                                </span>
                              </div>
                              {record.recordedBy && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Recorded by Dr. {record.recordedBy.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // File record format
                        <div 
                          onClick={(e) => handleOpenFile(record, e)} 
                          className="flex items-start group p-1 pr-16 cursor-pointer"
                          role="button"
                          tabIndex={0}
                          aria-label={`Open file: ${record.name}`}
                          data-record-id={record.id || ''}
                          data-record-url={record.url || ''}
                        >
                          <div className="mr-3 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                            {getFileIcon(record.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="font-medium text-blue-700 group-hover:underline transition-colors">
                                {record.name}
                              </p>
                              <ExternalLink className="ml-1 h-3 w-3 opacity-50 group-hover:opacity-100 text-blue-600" />
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span>{formatFileSize(record.size)}</span>
                              <span className="mx-2">•</span>
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>
                                  {record.displayDate || formatDate(new Date(record.uploadedAt))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-blue-300 mb-4" />
                <h3 className="text-lg font-medium mb-1 text-blue-700">No medical records yet</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload your previous medical records, test results, or prescriptions.
                </p>
                <Button 
                  onClick={handleFileClick} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all duration-200"
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload your first record
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Replace the Dialog component with our custom modal */}
      {renderMedicationForm()}
    </div>
  );
};

export default MedicalSummary; 