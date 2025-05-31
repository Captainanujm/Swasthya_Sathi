import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { adminService } from '@/lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  UserStatsBarChart, 
  DoctorApprovalPieChart, 
  UserRegistrationLineChart,
  ChatStatsDoughnutChart
} from '@/components/charts/AdminDashboardCharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await adminService.getDashboardStats();
        setStats(response.data.data.stats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center">Loading dashboard data...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Admin {user?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage doctors, patients, and system settings from this dashboard.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link 
                to="/admin/doctor-requests" 
                className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                View Pending Doctor Approvals
                {stats?.doctorApproval?.pending > 0 && (
                  <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs">
                    {stats.doctorApproval.pending}
                  </span>
                )}
              </Link>
              
              <Link 
                to="/admin/manage-doctors" 
                className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Manage All Doctors
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* User stats cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.users?.total || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.users?.doctors || 0}</p>
            {stats?.doctorApproval && (
              <div className="mt-2 text-sm text-muted-foreground">
                <span className="text-green-600">{stats.doctorApproval.approved} approved</span> • 
                <span className="text-yellow-600"> {stats.doctorApproval.pending} pending</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.users?.patients || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Chats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.messaging?.totalChats || 0}</p>
            {stats?.messaging?.messageVolume > 0 && (
              <p className="text-sm text-muted-foreground">
                {stats.messaging.messageVolume} messages this week
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* User Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <UserStatsBarChart stats={stats} />
          </CardContent>
        </Card>
        
        {/* Doctor Approval Status */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Approval Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <DoctorApprovalPieChart stats={stats} />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New User Registrations Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>New Registrations (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <UserRegistrationLineChart stats={stats} />
          </CardContent>
        </Card>
        
        {/* Chat Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Messaging Statistics</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ChatStatsDoughnutChart stats={stats} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard; 