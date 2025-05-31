import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminService } from '@/lib/api';
import { toast } from 'sonner';

const DoctorRequests = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  useEffect(() => {
    const fetchPendingDoctors = async () => {
      try {
        setLoading(true);
        const response = await adminService.getPendingDoctors();
        setPendingDoctors(response.data.data.pendingDoctors);
      } catch (error) {
        console.error('Error fetching pending doctors:', error);
        toast.error('Failed to load pending doctor requests');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingDoctors();
  }, []);
  
  const handleApprove = async (doctorId) => {
    try {
      setProcessingId(doctorId);
      await adminService.updateDoctorStatus(doctorId, { approvalStatus: 'approved' });
      
      // Update the local state
      setPendingDoctors(prevDoctors => 
        prevDoctors.filter(doctor => doctor._id !== doctorId)
      );
      
      toast.success('Doctor approved successfully');
    } catch (error) {
      console.error('Error approving doctor:', error);
      toast.error('Failed to approve doctor');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async (doctorId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      setProcessingId(doctorId);
      await adminService.updateDoctorStatus(doctorId, { 
        approvalStatus: 'rejected',
        rejectionReason 
      });
      
      // Update the local state
      setPendingDoctors(prevDoctors => 
        prevDoctors.filter(doctor => doctor._id !== doctorId)
      );
      
      toast.success('Doctor rejected');
      setShowRejectionInput(false);
      setRejectionReason('');
      setSelectedDoctor(null);
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      toast.error('Failed to reject doctor');
    } finally {
      setProcessingId(null);
    }
  };
  
  const openRejectionDialog = (doctor) => {
    setSelectedDoctor(doctor);
    setShowRejectionInput(true);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center">Loading doctor requests...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Doctor Approval Requests</h1>
      
      {pendingDoctors.length === 0 ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-yellow-50 p-4 text-yellow-800">
              <p>No pending doctor approval requests at this time.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingDoctors.map(doctor => (
            <Card key={doctor._id}>
              <CardHeader>
                <CardTitle>{doctor.user.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>Dr. {doctor.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{doctor.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Specialization:</span>
                    <span>{doctor.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">License Number:</span>
                    <span>{doctor.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Experience:</span>
                    <span>{doctor.experience} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Applied On:</span>
                    <span>{new Date(doctor.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {showRejectionInput && selectedDoctor && selectedDoctor._id === doctor._id ? (
                  <div className="mb-4">
                    <label htmlFor="rejectionReason" className="mb-2 block text-sm font-medium">
                      Reason for Rejection
                    </label>
                    <textarea
                      id="rejectionReason"
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejection"
                    />
                    <div className="mt-2 flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowRejectionInput(false);
                          setRejectionReason('');
                          setSelectedDoctor(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleReject(doctor._id)}
                        disabled={processingId === doctor._id}
                      >
                        {processingId === doctor._id ? 'Processing...' : 'Confirm Rejection'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => openRejectionDialog(doctor)}
                      disabled={processingId === doctor._id}
                    >
                      Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(doctor._id)}
                      disabled={processingId === doctor._id}
                    >
                      {processingId === doctor._id ? 'Processing...' : 'Approve'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorRequests; 