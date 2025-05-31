import React, { useEffect, useState } from 'react';
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
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

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
  Filler
);

const PatientStatsChart = ({ patientData, totalPatients }) => {
  const [chartType, setChartType] = useState('line');
  
  // Generate sample data for the chart (past 7 days)
  const generateChartData = () => {
    // Get dates for the last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Map patient registrations by date (if real data is provided, use it)
    // Otherwise, generate random data for demo
    const registrations = patientData?.dailyRegistrations || 
      Array.from({ length: 7 }, () => Math.floor(Math.random() * 5) + 1);

    return {
      labels: dates,
      datasets: [
        {
          label: 'New Patients',
          data: registrations,
          backgroundColor: chartType === 'line' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.7)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: 'rgba(79, 70, 229, 1)',
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: chartType === 'line',
        },
      ],
    };
  };

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
    },
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

  const data = generateChartData();

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-indigo-700">
            Patient Registrations
          </h3>
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-3 py-1 text-xs font-bold text-indigo-700">
            Total: {totalPatients || 0}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded-md text-xs font-medium ${chartType === 'line' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-md text-xs font-medium ${chartType === 'bar' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Bar
          </button>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        {chartType === 'line' ? (
          <Line data={data} options={options} />
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default PatientStatsChart; 