import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AlertTriangle } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TestValueChart = ({ testResults }) => {
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    if (testResults && testResults.length > 0) {
      prepareChartData(testResults);
    }
  }, [testResults]);
  
  const prepareChartData = (results) => {
    // Sort test results by name for better visualization
    const sortedResults = [...results].sort((a, b) => a.name.localeCompare(b.name));
    
    // Prepare data for the chart
    const labels = sortedResults.map(result => result.name);
    const values = sortedResults.map(result => result.value);
    
    // Prepare background colors based on status
    const backgroundColors = sortedResults.map(result => {
      switch (result.status) {
        case 'normal':
          return 'rgba(34, 197, 94, 0.7)'; // Green for normal
        case 'high':
          return 'rgba(239, 68, 68, 0.7)'; // Red for high
        case 'low':
          return 'rgba(234, 179, 8, 0.7)'; // Yellow for low
        default:
          return 'rgba(107, 114, 128, 0.7)'; // Gray for unknown
      }
    });
    
    // Prepare border colors (slightly darker versions of background colors)
    const borderColors = sortedResults.map(result => {
      switch (result.status) {
        case 'normal':
          return 'rgb(22, 163, 74)'; // Darker green
        case 'high':
          return 'rgb(220, 38, 38)'; // Darker red
        case 'low':
          return 'rgb(202, 138, 4)'; // Darker yellow
        default:
          return 'rgb(75, 85, 99)'; // Darker gray
      }
    });
    
    // Create datasets for the chart
    setChartData({
      labels,
      datasets: [
        {
          label: 'Test Values',
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    });
  };
  
  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const result = testResults[index];
            const value = context.parsed.y;
            const unit = result.unit || '';
            const range = result.referenceRange.min !== null && result.referenceRange.max !== null
              ? `(Reference: ${result.referenceRange.min}-${result.referenceRange.max} ${unit})`
              : '';
            
            let statusText = '';
            switch (result.status) {
              case 'normal':
                statusText = '✓ Normal';
                break;
              case 'high':
                statusText = '⚠ High';
                break;
              case 'low':
                statusText = '⚠ Low';
                break;
              default:
                statusText = 'Status unknown';
            }
            
            return [`Value: ${value} ${unit}`, range, statusText];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Test Name',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };
  
  if (!testResults || testResults.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
        <p className="text-gray-500">No test results found in this report</p>
      </div>
    );
  }
  
  // Render chart or loading state
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Test Result Values</h3>
      
      <div className="mb-4">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-green-500 mr-1"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-red-500 mr-1"></div>
            <span>High</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-yellow-500 mr-1"></div>
            <span>Low</span>
          </div>
        </div>
      </div>
      
      {chartData ? (
        <div className="h-64">
          <Bar options={options} data={chartData} />
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>These values are automatically extracted from your report and may not be 100% accurate.</p>
        <p>Always consult with your healthcare provider for proper interpretation.</p>
      </div>
    </div>
  );
};

export default TestValueChart; 