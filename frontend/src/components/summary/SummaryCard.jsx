import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, File, Trash2, ChevronDown, ChevronUp, LineChart } from 'lucide-react';
import { format } from 'date-fns';
import { summaryService } from '@/lib/api';
import { toast } from 'sonner';
import TestValueChart from './TestValueChart';

const SummaryCard = ({ summary, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTestChart, setShowTestChart] = useState(false);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this summary?')) {
      setIsDeleting(true);
      
      try {
        await summaryService.deleteSummary(summary._id);
        toast.success('Summary deleted successfully');
        onDeleted(summary._id);
      } catch (error) {
        console.error('Error deleting summary:', error);
        toast.error('Failed to delete summary');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  // Format the date
  const formattedDate = summary.createdAt
    ? format(new Date(summary.createdAt), 'MMM dd, yyyy h:mm a')
    : 'Unknown date';
  
  // Check if there are any test results to display
  const hasTestResults = summary.testResults && summary.testResults.length > 0;
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pb-4">
        <CardTitle className="text-indigo-700 text-lg flex items-center gap-2">
          <File className="h-5 w-5 text-indigo-600" />
          <div className="truncate">
            {summary.originalFilename || 'Medical Report Summary'}
          </div>
        </CardTitle>
        <div className="text-xs text-gray-500">
          Processed on {formattedDate}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <h3 className="text-sm font-semibold text-indigo-700 mb-2">
            Summary of Your Medical Report
          </h3>
          
          {summary.summary ? (
            <div className="text-sm text-gray-700">
              {summary.summary.split('. ').map((sentence, index) => (
                sentence.trim() && (
                  <p key={index} className="mb-2">
                    {sentence.trim().endsWith('.') ? sentence.trim() : `${sentence.trim()}.`}
                  </p>
                )
              ))}
            </div>
          ) : (
            <div className="flex items-center text-amber-600 text-sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              No summary available
            </div>
          )}
        </div>
        
        {hasTestResults && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between border-dashed border-indigo-200 text-indigo-700"
              onClick={() => setShowTestChart(!showTestChart)}
            >
              <div className="flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                {summary.testResults.length} Test Value{summary.testResults.length !== 1 ? 's' : ''} Found
              </div>
              {showTestChart ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {showTestChart && (
              <div className="mt-2">
                <TestValueChart testResults={summary.testResults} />
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          <p>This is an AI-generated summary and should not replace professional medical advice.</p>
          <p>Always consult with your healthcare provider for proper interpretation of medical reports.</p>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SummaryCard; 