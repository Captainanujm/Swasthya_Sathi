import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { patientService } from '@/lib/api';
import { Loader2, Search, User, Pill, CalendarDays, Heart, ListChecks, AlertCircle, Info, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const LookupPatient = () => {
  const [swasthyaId, setSwasthyaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState(null);

  const handleLookup = async () => {
    if (!swasthyaId) {
      toast.error('Please enter a Swasthya ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await patientService.getPatientBySwasthyaId(swasthyaId);
      setPatientData(response.data.data.patientDetails);
      toast.success('Patient details retrieved successfully');
    } catch (error) {
      console.error('Error looking up patient:', error);
      const errorMessage = error.response?.data?.message || 'Failed to find patient with this ID';
      setError(errorMessage);
      toast.error(errorMessage);
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="shadow-lg border border-blue-100 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-4">
          <CardTitle className="text-2xl flex items-center">
            <Search className="mr-2 h-6 w-6" />
            Swasthya ID Lookup
          </CardTitle>
          <CardDescription className="text-white opacity-90">
            Enter a Swasthya ID to view complete medical details
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input 
              placeholder="Enter 6-digit Swasthya ID" 
              value={swasthyaId}
              onChange={(e) => setSwasthyaId(e.target.value)}
              className="border-2 border-indigo-100 focus:border-indigo-300"
            />
            <Button 
              onClick={handleLookup} 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Looking up...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Look up Patient
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}
          
          {patientData && (
            <div className="mt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="h-32 w-32 rounded-full bg-indigo-100 overflow-hidden mb-4 border-4 border-white shadow-md">
                    {patientData.personalInfo.profileImage ? (
                      <img 
                        src={patientData.personalInfo.profileImage} 
                        alt={patientData.personalInfo.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-indigo-500 text-white text-3xl font-bold">
                        {patientData.personalInfo.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-indigo-800">{patientData.personalInfo.name}</h2>
                  <p className="text-gray-600 text-sm mb-2">{patientData.personalInfo.email}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-indigo-50 border-indigo-200 text-indigo-700">
                      ID: {patientData.personalInfo.cardNumber}
                    </Badge>
                    {patientData.personalInfo.bloodGroup && (
                      <Badge className="bg-red-500 hover:bg-red-600">
                        {patientData.personalInfo.bloodGroup}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-indigo-800 mb-2">Personal Information</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium">{patientData.personalInfo.gender || 'Not specified'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">{patientData.personalInfo.age || 'Not specified'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Height:</span>
                        <span className="font-medium">{patientData.personalInfo.height ? `${patientData.personalInfo.height} cm` : 'Not specified'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium">{patientData.personalInfo.weight ? `${patientData.personalInfo.weight} kg` : 'Not specified'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">BMI:</span>
                        <span className="font-medium">{patientData.personalInfo.bmi || 'Not specified'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="w-full md:w-2/3">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="allergies">
                      <AccordionTrigger className="text-indigo-800 hover:text-indigo-600">
                        <div className="flex items-center">
                          <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                          Allergies
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {patientData.medicalInfo.allergies.length > 0 ? (
                          <div className="pl-7 space-y-1">
                            {patientData.medicalInfo.allergies.map((allergy, index) => (
                              <Badge key={index} variant="outline" className="bg-red-50 border-red-200 text-red-700 mr-2 mb-2">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="pl-7 text-gray-600">No allergies recorded</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="chronic">
                      <AccordionTrigger className="text-indigo-800 hover:text-indigo-600">
                        <div className="flex items-center">
                          <Heart className="mr-2 h-5 w-5 text-pink-500" />
                          Chronic Conditions
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {patientData.medicalInfo.chronicDiseases.length > 0 ? (
                          <div className="pl-7 space-y-1">
                            {patientData.medicalInfo.chronicDiseases.map((disease, index) => (
                              <Badge key={index} variant="outline" className="bg-pink-50 border-pink-200 text-pink-700 mr-2 mb-2">
                                {disease}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="pl-7 text-gray-600">No chronic conditions recorded</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="medications">
                      <AccordionTrigger className="text-indigo-800 hover:text-indigo-600">
                        <div className="flex items-center">
                          <Pill className="mr-2 h-5 w-5 text-green-500" />
                          Medications
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {patientData.medicalInfo.medications.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Medication</TableHead>
                                  <TableHead>Dosage</TableHead>
                                  <TableHead>Frequency</TableHead>
                                  <TableHead>Prescribed By</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {patientData.medicalInfo.medications.map((med, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{med.name}</TableCell>
                                    <TableCell>{med.dosage || 'Not specified'}</TableCell>
                                    <TableCell>{med.frequency || 'Not specified'}</TableCell>
                                    <TableCell>{med.prescribedBy?.name || 'Not specified'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="pl-7 text-gray-600">No medications recorded</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="records">
                      <AccordionTrigger className="text-indigo-800 hover:text-indigo-600">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-blue-500" />
                          Medical Records
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {patientData.medicalInfo.medicalRecords.length > 0 ? (
                          <div className="space-y-4">
                            {patientData.medicalInfo.medicalRecords.map((record, index) => (
                              <Card key={index} className="border border-blue-100">
                                <CardHeader className="py-3 px-4">
                                  <div className="flex justify-between items-center">
                                    <CardTitle className="text-base font-bold text-indigo-800">{record.title}</CardTitle>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                      {formatDate(record.date)}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="py-2 px-4">
                                  <p className="text-sm text-gray-700">{record.description}</p>
                                </CardContent>
                                <CardFooter className="py-2 px-4 bg-gray-50 text-xs text-gray-500">
                                  Recorded by: {record.recordedBy?.name || 'Unknown'}
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="pl-7 text-gray-600">No medical records available</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {patientData.emergencyContact && (
                      <AccordionItem value="emergency">
                        <AccordionTrigger className="text-indigo-800 hover:text-indigo-600">
                          <div className="flex items-center">
                            <Info className="mr-2 h-5 w-5 text-amber-500" />
                            Emergency Contact
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-7 space-y-2">
                            <p className="flex justify-between">
                              <span className="font-medium text-gray-600">Name:</span>
                              <span>{patientData.emergencyContact.name}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="font-medium text-gray-600">Relationship:</span>
                              <span>{patientData.emergencyContact.relationship}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="font-medium text-gray-600">Phone:</span>
                              <span>{patientData.emergencyContact.phoneNumber}</span>
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LookupPatient; 