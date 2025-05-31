import { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { summaryService } from '@/lib/api';
import { toast } from 'sonner';

const PDFUploader = ({ onSummaryGenerated }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Check if file is a PDF
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      // Pass the file directly to the service which will create the FormData
      const response = await summaryService.uploadPDF(selectedFile);
      
      if (response.data && response.data.data && response.data.data.summary) {
        toast.success('PDF processed successfully');
        setSelectedFile(null);
        
        // Pass the generated summary to parent component
        onSummaryGenerated(response.data.data.summary);
      } else {
        toast.error('Failed to process PDF');
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error(error.response?.data?.message || 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerFileInput}
        >
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileInputChange}
          />
          
          <Upload className="h-12 w-12 mx-auto mb-4 text-indigo-500" />
          
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            Upload Medical Report (PDF)
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop your PDF file here, or click to browse
          </p>
          
          <Button
            type="button"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={(e) => {
              e.stopPropagation();
              handleTriggerFileInput();
            }}
          >
            Browse Files
          </Button>
          
          <p className="text-xs text-gray-400 mt-4">
            Max file size: 10MB
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-4">
            <File className="h-8 w-8 text-indigo-500 mr-3" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={handleCancel}
              disabled={isUploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Processing...
                </>
              ) : (
                'Generate Summary'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 text-gray-700"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader; 