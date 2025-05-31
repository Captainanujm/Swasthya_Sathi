import { useState, useEffect } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { summaryService } from '@/lib/api';
import { toast } from 'sonner';
import SummaryCard from './SummaryCard';
import PDFUploader from './PDFUploader';

const SummaryList = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  
  useEffect(() => {
    fetchSummaries();
  }, []);
  
  const fetchSummaries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await summaryService.getSummaries();
      
      if (response.data && response.data.data && response.data.data.summaries) {
        setSummaries(response.data.data.summaries);
      } else {
        setSummaries([]);
      }
    } catch (error) {
      console.error('Error fetching summaries:', error);
      setError('Failed to load summaries. Please try again later.');
      toast.error('Failed to load summaries');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSummaryGenerated = (newSummary) => {
    setSummaries(prevSummaries => [newSummary, ...prevSummaries]);
    setShowUploader(false);
  };
  
  const handleSummaryDeleted = (deletedId) => {
    setSummaries(prevSummaries => 
      prevSummaries.filter(summary => summary._id !== deletedId)
    );
  };
  
  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Summaries</h3>
        <p className="text-gray-500">{error}</p>
        <Button
          onClick={fetchSummaries}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      {showUploader ? (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Upload Medical Report
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUploader(false)}
              className="text-gray-500"
            >
              Cancel
            </Button>
          </div>
          <PDFUploader onSummaryGenerated={handleSummaryGenerated} />
        </div>
      ) : (
        <div className="mb-6">
          <Button
            onClick={() => setShowUploader(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6"
          >
            <Plus className="h-5 w-5 mr-2" />
            Upload New Medical Report
          </Button>
        </div>
      )}
      
      {summaries.length > 0 ? (
        <div className="space-y-6">
          {summaries.map(summary => (
            <SummaryCard
              key={summary._id}
              summary={summary}
              onDeleted={handleSummaryDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Summaries Yet</h3>
          <p className="text-gray-500 mb-4">
            Upload your medical reports to get easy-to-understand summaries
          </p>
          <p className="text-sm text-gray-400">
            Summaries are generated using AI to help you understand your medical reports
          </p>
        </div>
      )}
    </div>
  );
};

export default SummaryList; 