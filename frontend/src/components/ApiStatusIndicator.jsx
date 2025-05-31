import { useState, useEffect } from 'react';
import { testConnection } from '@/lib/api';

const ApiStatusIndicator = () => {
  const [status, setStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);

  const checkConnection = async () => {
    try {
      const result = await testConnection();
      setStatus(result ? 'connected' : 'disconnected');
      setLastChecked(new Date());
    } catch (error) {
      console.error('API check error:', error);
      setStatus('disconnected');
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check connection when component mounts
    checkConnection();

    // Set up interval to check connection every 30 seconds
    const interval = setInterval(() => {
      checkConnection();
    }, 30000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Determine styles based on status
  const getStatusStyles = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  // Format the last checked time
  const formatLastChecked = () => {
    if (!lastChecked) return '';
    return `Last checked: ${lastChecked.toLocaleTimeString()}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 rounded-full bg-background p-2 shadow-md">
      <div
        className={`h-3 w-3 rounded-full ${getStatusStyles()}`}
        title={`API Status: ${status}`}
      ></div>
      <div className="text-xs">
        {status === 'connected' ? 'API Connected' : 'API Disconnected'}
        <span className="ml-1 text-muted-foreground">{formatLastChecked()}</span>
      </div>
      <button
        onClick={checkConnection}
        className="ml-2 rounded-md bg-primary px-2 py-1 text-xs text-white"
        title="Check API Connection"
      >
        Retry
      </button>
    </div>
  );
};

export default ApiStatusIndicator; 