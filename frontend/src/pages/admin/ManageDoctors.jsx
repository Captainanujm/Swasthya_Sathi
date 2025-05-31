import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [specialties, setSpecialties] = useState([]);

  const fetchDoctors = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...filters
      };
      
      const response = await adminService.getAllDoctors(params);
      setDoctors(response.data.data.doctors);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(response.data.pagination.page);
      
      // Extract unique specialties for filter dropdown
      const uniqueSpecialties = [...new Set(response.data.data.doctors.map(doctor => doctor.specialization))];
      setSpecialties(uniqueSpecialties.filter(Boolean));
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filters = {};
    if (searchTerm) filters.name = searchTerm;
    if (statusFilter) filters.status = statusFilter;
    if (specialtyFilter) filters.specialization = specialtyFilter;
    
    fetchDoctors(currentPage, filters);
  }, [currentPage, searchTerm, statusFilter, specialtyFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleToggleActiveStatus = async (doctorId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      
      // Optimistic UI update
      setDoctors(prevDoctors => 
        prevDoctors.map(doctor => 
          doctor._id === doctorId 
            ? { ...doctor, user: { ...doctor.user, isActive: newStatus } } 
            : doctor
        )
      );
      
      await adminService.toggleDoctorActiveStatus(doctorId, newStatus);
      toast.success(`Doctor ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling doctor status:', error);
      toast.error('Failed to update doctor status');
      // Revert the optimistic update
      fetchDoctors(currentPage);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Manage Doctors</h1>
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Doctor Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="search" className="block text-sm font-medium mb-1">Search by Name</label>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search doctors..."
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div className="w-[200px]">
                <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              {specialties.length > 0 && (
                <div className="w-[200px]">
                  <label htmlFor="specialty" className="block text-sm font-medium mb-1">Specialty</label>
                  <select
                    id="specialty"
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map((specialty, index) => (
                      <option key={index} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex items-end">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  Filter
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {loading ? (
        <p className="text-center py-8">Loading doctors...</p>
      ) : doctors.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded-lg">
          <p className="text-gray-500">No doctors found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Doctor</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Specialty</th>
                  <th className="p-3 text-left">Hospital</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Account</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                            {doctor.user?.profileImage && (
                              <img 
                                src={doctor.user.profileImage} 
                                alt={doctor.user.name}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{doctor.user?.name}</div>
                          <div className="text-sm text-gray-500">ID: {doctor._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{doctor.user?.email}</td>
                    <td className="p-3">{doctor.specialization}</td>
                    <td className="p-3">{doctor.hospital}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doctor.approvalStatus === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : doctor.approvalStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.approvalStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doctor.user?.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleToggleActiveStatus(doctor._id, doctor.user?.isActive)}
                          className={`px-3 py-1 text-xs rounded-md ${
                            doctor.user?.isActive
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {doctor.user?.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        
                        {doctor.approvalStatus === 'pending' && (
                          <Link
                            to={`/admin/doctor-requests`}
                            className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs"
                          >
                            Review
                          </Link>
                        )}
                        
                        <Link
                          to={`/doctors/${doctor._id}`}
                          className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-xs"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="join">
                <button
                  className="join-item btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  «
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`join-item btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  className="join-item btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageDoctors; 