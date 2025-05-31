import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
  ArcElement,
  PieController,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  PieController
);

const DoctorPatientChart = ({ patients = [] }) => {
  const [chartType, setChartType] = useState('gender');
  
  // Calculate stats from patient data
  const calculatePatientStats = () => {
    // Gender distribution
    const genderCounts = {
      male: 0,
      female: 0,
      other: 0
    };
    
    // Age groups
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0
    };
    
    // Medical conditions (example categories)
    const medicalConditions = {
      'Heart Disease': 0,
      'Diabetes': 0,
      'Hypertension': 0,
      'Respiratory': 0,
      'Other': 0
    };
    
    // Process patient data
    patients.forEach(patient => {
      // Gender stats
      if (patient.gender) {
        const gender = patient.gender.toLowerCase();
        if (gender === 'male') genderCounts.male++;
        else if (gender === 'female') genderCounts.female++;
        else genderCounts.other++;
      }
      
      // Age groups
      if (patient.age || patient.dateOfBirth) {
        // Calculate age from date of birth if age not directly available
        const age = patient.age || calculateAge(patient.dateOfBirth);
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 50) ageGroups['36-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else ageGroups['65+']++;
      }
      
      // Medical conditions (simplified example)
      if (patient.medicalConditions) {
        if (Array.isArray(patient.medicalConditions)) {
          patient.medicalConditions.forEach(condition => {
            const conditionLower = condition.toLowerCase();
            if (conditionLower.includes('heart')) medicalConditions['Heart Disease']++;
            else if (conditionLower.includes('diabet')) medicalConditions['Diabetes']++;
            else if (conditionLower.includes('hypertension') || conditionLower.includes('blood pressure')) medicalConditions['Hypertension']++;
            else if (conditionLower.includes('asthma') || conditionLower.includes('respiratory')) medicalConditions['Respiratory']++;
            else medicalConditions['Other']++;
          });
        } else if (typeof patient.medicalConditions === 'string') {
          // For string format medical conditions
          const conditionLower = patient.medicalConditions.toLowerCase();
          if (conditionLower.includes('heart')) medicalConditions['Heart Disease']++;
          else if (conditionLower.includes('diabet')) medicalConditions['Diabetes']++;
          else if (conditionLower.includes('hypertension') || conditionLower.includes('blood pressure')) medicalConditions['Hypertension']++;
          else if (conditionLower.includes('asthma') || conditionLower.includes('respiratory')) medicalConditions['Respiratory']++;
          else medicalConditions['Other']++;
        }
      }
    });
    
    return { genderCounts, ageGroups, medicalConditions };
  };
  
  // Helper function to calculate age from date of birth
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Get stats
  const { genderCounts, ageGroups, medicalConditions } = calculatePatientStats();
  
  // Find most common age group and gender
  const getTopStats = () => {
    // Most common gender
    const genderValues = Object.values(genderCounts);
    const maxGenderValue = Math.max(...genderValues);
    const topGender = Object.keys(genderCounts).find(
      key => genderCounts[key] === maxGenderValue
    );
    
    // Most common age group
    const ageValues = Object.values(ageGroups);
    const maxAgeValue = Math.max(...ageValues);
    const topAgeGroup = Object.keys(ageGroups).find(
      key => ageGroups[key] === maxAgeValue
    );
    
    // Most common medical condition
    const conditionValues = Object.values(medicalConditions);
    const maxConditionValue = Math.max(...conditionValues);
    const topCondition = Object.keys(medicalConditions).find(
      key => medicalConditions[key] === maxConditionValue
    );
    
    const genderPercentage = patients.length > 0 
      ? Math.round((maxGenderValue / patients.length) * 100) 
      : 0;
      
    const agePercentage = patients.length > 0 
      ? Math.round((maxAgeValue / patients.length) * 100) 
      : 0;
      
    const conditionPercentage = patients.length > 0 
      ? Math.round((maxConditionValue / patients.length) * 100) 
      : 0;
    
    return {
      topGender: topGender ? topGender.charAt(0).toUpperCase() + topGender.slice(1) : 'N/A',
      topAgeGroup: topAgeGroup || 'N/A',
      topCondition: topCondition || 'N/A',
      genderPercentage,
      agePercentage,
      conditionPercentage
    };
  };
  
  const { 
    topGender, 
    topAgeGroup, 
    topCondition,
    genderPercentage,
    agePercentage,
    conditionPercentage
  } = getTopStats();
  
  // Check if there's actual data to display
  const hasGenderData = Object.values(genderCounts).some(count => count > 0);
  const hasAgeData = Object.values(ageGroups).some(count => count > 0);
  const hasConditionData = Object.values(medicalConditions).some(count => count > 0);
  
  // Chart data based on chart type
  const getChartData = () => {
    if (chartType === 'gender') {
      return {
        labels: ['Male', 'Female', 'Other'],
        datasets: [
          {
            data: [genderCounts.male, genderCounts.female, genderCounts.other],
            backgroundColor: [
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 206, 86, 0.8)',
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
    }
    
    if (chartType === 'age') {
      return {
        labels: Object.keys(ageGroups),
        datasets: [
          {
            label: 'Patients by Age Group',
            data: Object.values(ageGroups),
            backgroundColor: 'rgba(79, 70, 229, 0.7)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 1,
          },
        ],
      };
    }
    
    if (chartType === 'conditions') {
      return {
        labels: Object.keys(medicalConditions),
        datasets: [
          {
            label: 'Medical Conditions',
            data: Object.values(medicalConditions),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
    }
    
    // Default to gender chart
    return {
      labels: ['Male', 'Female', 'Other'],
      datasets: [
        {
          data: [genderCounts.male, genderCounts.female, genderCounts.other],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 206, 86, 0.8)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
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
        displayColors: true,
      },
      title: {
        display: true,
        text: chartType === 'gender' 
          ? 'Patient Gender Distribution' 
          : chartType === 'age' 
            ? 'Patient Age Distribution' 
            : 'Patient Medical Conditions',
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
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
    cutout: '60%', // For doughnut charts
  };
  
  // Bar chart specific options
  const barOptions = {
    ...options,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          precision: 0,
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
    },
  };
  
  // Render the appropriate chart based on type
  const renderChart = () => {
    const data = getChartData();
    
    if (chartType === 'age') {
      return <Bar data={data} options={barOptions} />;
    } else if (chartType === 'gender' || chartType === 'conditions') {
      return <Doughnut data={data} options={options} />;
    }
    
    // Default to doughnut
    return <Doughnut data={data} options={options} />;
  };
  
  // Function to determine if any real data is available
  const hasAnyData = () => {
    return hasGenderData || hasAgeData || hasConditionData;
  };
  
  return (
    <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300 bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pb-4">
        <CardTitle className="text-indigo-700 text-xl flex items-center">
          <Users className="mr-2 h-5 w-5 text-indigo-600" />
          Patient Demographics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-end space-x-2 mb-4">
          <button
            onClick={() => setChartType('gender')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${chartType === 'gender' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            disabled={!hasGenderData}
          >
            Gender
          </button>
          <button
            onClick={() => setChartType('age')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${chartType === 'age' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            disabled={!hasAgeData}
          >
            Age Groups
          </button>
          <button
            onClick={() => setChartType('conditions')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${chartType === 'conditions' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            disabled={!hasConditionData}
          >
            Conditions
          </button>
        </div>
        
        {hasAnyData() ? (
          <>
            <div className="h-[300px] w-full">
              {renderChart()}
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-blue-100 pt-4">
              {hasGenderData && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-indigo-500 mb-1 font-medium">Most Common Gender</p>
                  <p className="text-lg font-bold text-indigo-700">{topGender}</p>
                  <p className="text-xs text-gray-500">
                    {genderPercentage}% of your patients
                  </p>
                </div>
              )}
              
              {hasAgeData && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-indigo-500 mb-1 font-medium">Most Common Age Group</p>
                  <p className="text-lg font-bold text-indigo-700">{topAgeGroup}</p>
                  <p className="text-xs text-gray-500">
                    {agePercentage}% of your patients
                  </p>
                </div>
              )}
              
              {hasConditionData && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-indigo-500 mb-1 font-medium">Common Medical Condition</p>
                  <p className="text-lg font-bold text-indigo-700">{topCondition}</p>
                  <p className="text-xs text-gray-500">
                    {conditionPercentage}% of your patients
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] w-full text-center">
            <Users className="h-12 w-12 mb-3 text-indigo-300" />
            <p className="text-indigo-600 font-medium">No patient data available</p>
            <p className="text-sm text-gray-500 mt-1">Patient demographic data will appear here once available</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-3 py-1 inline-block">
            <p className="text-sm text-indigo-700 font-medium">
              Total Patients: <span className="font-bold">{patients.length}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorPatientChart; 