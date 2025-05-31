import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { format, subDays, isValid, parseISO } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PatientJoinChart = ({ patients = [] }) => {
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'
  const [chartData, setChartData] = useState({ labels: [], counts: [] });
  
  useEffect(() => {
    // Generate chart data based on patients and selected date range
    generateChartData(patients, dateRange);
  }, [patients, dateRange]);
  
  // Parse patient follow/join timestamps and group by date
  const generateChartData = (patientList, range) => {
    // Default to showing last 7 days if no data
    const today = new Date();
    let labels = [];
    let dateMap = {};
    
    // Create date labels based on selected range
    if (range === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'MMM dd');
        labels.push(dateStr);
        dateMap[dateStr] = 0;
      }
    } else if (range === 'month') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'MMM dd');
        labels.push(dateStr);
        dateMap[dateStr] = 0;
      }
    } else if (range === 'year') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const dateStr = format(date, 'MMM yyyy');
        labels.push(dateStr);
        dateMap[dateStr] = 0;
      }
    }
    
    // Count patients by join date
    patientList.forEach(patient => {
      // Try to get the follow/join timestamp from different possible properties
      let joinDate = null;
      
      if (patient.followedAt && isValid(new Date(patient.followedAt))) {
        joinDate = new Date(patient.followedAt);
      } else if (patient.createdAt && isValid(new Date(patient.createdAt))) {
        joinDate = new Date(patient.createdAt);
      } else if (patient.timestamp && isValid(new Date(patient.timestamp))) {
        joinDate = new Date(patient.timestamp);
      } else if (patient.joinedAt && isValid(new Date(patient.joinedAt))) {
        joinDate = new Date(patient.joinedAt);
      } else if (patient.followTimestamp && isValid(new Date(patient.followTimestamp))) {
        joinDate = new Date(patient.followTimestamp);
      } else if (patient.follow && patient.follow.createdAt && isValid(new Date(patient.follow.createdAt))) {
        joinDate = new Date(patient.follow.createdAt);
      }
      
      if (joinDate) {
        let dateKey;
        if (range === 'week' || range === 'month') {
          dateKey = format(joinDate, 'MMM dd');
        } else {
          dateKey = format(joinDate, 'MMM yyyy');
        }
        
        // Only count if the date is within our range
        if (dateMap.hasOwnProperty(dateKey)) {
          dateMap[dateKey]++;
        }
      }
    });
    
    // Convert map to arrays for the chart
    const counts = labels.map(label => dateMap[label]);
    
    setChartData({ labels, counts });
  };
  
  // Prepare data for the chart
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Patients Joined',
        data: chartData.counts,
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: dateRange === 'month' ? 16 : undefined, // Adjust bar thickness based on date range
      },
    ],
  };
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, sans-serif',
            weight: 'bold',
          },
          color: '#4F46E5',
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(79, 70, 229, 0.9)',
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
      title: {
        display: true,
        text: 'Patient Join Timeline',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 'bold',
        },
        color: '#4F46E5',
        padding: {
          bottom: 15
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: {
            family: 'Inter, sans-serif',
          },
          callback: function(value) {
            if (value % 1 === 0) {
              return value;
            }
          },
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        title: {
          display: true,
          text: 'Number of Patients',
          font: {
            family: 'Inter, sans-serif',
            weight: 'medium',
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
          },
          maxRotation: 45,
          minRotation: 45,
        },
        title: {
          display: true,
          text: 'Date',
          font: {
            family: 'Inter, sans-serif',
            weight: 'medium',
          }
        }
      },
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  };
  
  // Find the date with most joins
  const findPeakJoinDate = () => {
    if (chartData.counts.length === 0) return null;
    
    const maxCount = Math.max(...chartData.counts);
    if (maxCount === 0) return null;
    
    const maxIndex = chartData.counts.indexOf(maxCount);
    return {
      date: chartData.labels[maxIndex],
      count: maxCount
    };
  };
  
  const peakData = findPeakJoinDate();
  
  // Calculate total patients with join dates
  const patientsWithJoinDates = chartData.counts.reduce((sum, count) => sum + count, 0);
  
  return (
    <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300 bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pb-4">
        <CardTitle className="text-indigo-700 text-xl flex items-center">
          <Users className="mr-2 h-5 w-5 text-indigo-600" />
          Patient Join Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-end space-x-2 mb-4">
          <button
            onClick={() => setDateRange('week')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${dateRange === 'week' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${dateRange === 'month' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${dateRange === 'year' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Last Year
          </button>
        </div>
        
        {patientsWithJoinDates > 0 ? (
          <>
            <div className="h-[300px] w-full">
              <Bar data={data} options={options} />
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-blue-100 pt-4">
              {peakData && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-indigo-500 mb-1 font-medium">Most Active Day</p>
                  <p className="text-lg font-bold text-indigo-700">{peakData.date}</p>
                  <p className="text-xs text-gray-500">
                    {peakData.count} patient{peakData.count !== 1 ? 's' : ''} joined on this day
                  </p>
                </div>
              )}
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                <p className="text-xs text-indigo-500 mb-1 font-medium">Tracked Patients</p>
                <p className="text-lg font-bold text-indigo-700">{patientsWithJoinDates}</p>
                <p className="text-xs text-gray-500">
                  {(patients.length - patientsWithJoinDates) > 0 
                    ? `${patients.length - patientsWithJoinDates} patient(s) have no join date` 
                    : 'All patients have join dates'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] w-full text-center">
            <Users className="h-12 w-12 mb-3 text-indigo-300" />
            <p className="text-indigo-600 font-medium">No patient join data available</p>
            <p className="text-sm text-gray-500 mt-1">Patient join timestamps will appear here once available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientJoinChart; 