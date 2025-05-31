import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { doctorService } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DoctorPending = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getProfile();
        const profile = response.data.data.profile;
        setProfile(profile);

        // If profile is approved, redirect to dashboard
        if (profile.approvalStatus === 'approved') {
          navigate('/dashboard');
        } else if (profile.approvalStatus === 'rejected') {
          // If rejected, could redirect to a different page or just stay here
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center">Checking your profile status...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Approval Pending</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-yellow-50 p-4 text-yellow-800">
            <h3 className="font-medium">Your doctor profile is awaiting approval</h3>
            <p className="mt-2">
              Our administrators are reviewing your credentials. This process typically takes 24-48
              hours. You'll receive an email once your profile is approved.
            </p>
          </div>

          {profile && (
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="font-medium">Your Profile Details</h3>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Specialization:</span>
                  <span>{profile.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Submitted On:</span>
                  <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className="capitalize rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                    {profile.approvalStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => navigate('/')}>
              Go to Home
            </Button>
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorPending; 