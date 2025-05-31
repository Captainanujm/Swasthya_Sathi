import { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// Dashboard user stats bar chart
export const UserStatsBarChart = ({ stats }) => {
  const data = {
    labels: ['Total Users', 'Doctors', 'Patients'],
    datasets: [
      {
        label: 'User Statistics',
        data: [
          stats?.users?.total || 0,
          stats?.users?.doctors || 0,
          stats?.users?.patients || 0
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="w-full h-full">
      <Bar data={data} options={options} />
    </div>
  );
};

// Doctor approval status pie chart
export const DoctorApprovalPieChart = ({ stats }) => {
  const data = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        label: 'Doctor Approval Status',
        data: [
          stats?.doctorApproval?.approved || 0,
          stats?.doctorApproval?.pending || 0,
          stats?.doctorApproval?.rejected || 0
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 206, 86)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Doctor Approval Status',
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Pie data={data} options={options} />
    </div>
  );
};

// User registration line chart (7 days)
export const UserRegistrationLineChart = ({ stats }) => {
  if (!stats?.dailyStats || stats.dailyStats.length === 0) {
    return <div className="p-4 text-center">No registration data available</div>;
  }

  const data = {
    labels: stats.dailyStats.map(day => day._id.split('-').slice(1).join('/')),
    datasets: [
      {
        label: 'New Registrations',
        data: stats.dailyStats.map(day => day.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'New User Registrations (Last 7 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div className="w-full h-full">
      <Line data={data} options={options} />
    </div>
  );
};

// Chat and messaging statistics doughnut chart
export const ChatStatsDoughnutChart = ({ stats }) => {
  const data = {
    labels: ['Total Chats', 'Messages This Week'],
    datasets: [
      {
        label: 'Messaging Activity',
        data: [
          stats?.messaging?.totalChats || 0,
          stats?.messaging?.messageVolume || 0
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Messaging Statistics',
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Doughnut data={data} options={options} />
    </div>
  );
}; 