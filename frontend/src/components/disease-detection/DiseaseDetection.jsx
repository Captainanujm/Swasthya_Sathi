import { useState, useRef, useEffect } from 'react';
import { diseaseService } from '@/lib/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import TroubleshootingGuide from './TroubleshootingGuide';

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [serviceStatus, setServiceStatus] = useState('checking'); // 'checking', 'running', 'not_running'
  const [checkingService, setCheckingService] = useState(false);
  const fileInputRef = useRef(null);

  const checkServiceStatus = async () => {
    setCheckingService(true);
    try {
      const isRunning = await diseaseService.checkFlaskService();
      setServiceStatus(isRunning ? 'running' : 'not_running');
      
      if (!isRunning) {
        toast.error('AI analysis service is currently unavailable', {
          description: 'Please try again later'
        });
      } else {
        toast.success('AI analysis service is now available');
      }
    } catch (error) {
      console.error('Error checking service status:', error);
      setServiceStatus('not_running');
    } finally {
      setCheckingService(false);
    }
  };

  // Check Flask service status on component mount
  useEffect(() => {
    checkServiceStatus();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Reset previous results and errors
      setResult(null);
      setHasError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (serviceStatus !== 'running') {
      toast.error('AI analysis service is currently unavailable', {
        description: 'Please try again later'
      });
      return;
    }
    
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }
    
    setLoading(true);
    setHasError(false);
    
    try {
      const response = await diseaseService.uploadImage(selectedImage);
      setResult(response.data.data);
      toast.success('Image analyzed successfully');
    } catch (error) {
      console.error('Error analyzing image:', error);
      setHasError(true);
      
      // Enhanced error handling
      let errorMessage = 'Failed to analyze image';
      
      if (error.response) {
        // If the server responded with an error
        errorMessage = error.response.data?.message || 
                       `Server error (${error.response.status}): Please try again with a different image`;
      } else if (error.request) {
        // If the request was made but no response received
        errorMessage = 'No response from the AI service. Please check your connection and try again.';
      } else {
        // Something else caused the error
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setHasError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6 w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Skin Disease Detection</h2>
        <p className="text-muted-foreground mt-2">
          Upload an image of a skin condition for AI-powered analysis
        </p>
        
        {serviceStatus === 'not_running' && (
          <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded-md">
            <div className="flex items-center justify-between">
              <div>⚠️ AI analysis service is currently unavailable. Please try again later.</div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
                onClick={checkServiceStatus}
                disabled={checkingService}
              >
                <RefreshCw size={14} className={`${checkingService ? 'animate-spin' : ''}`} />
                {checkingService ? 'Checking...' : 'Check Again'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Upload Section */}
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current.click()}
          >
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-64 max-w-full object-contain rounded-lg" 
              />
            ) : (
              <div className="text-center p-6">
                <div className="text-4xl text-muted-foreground mb-2">📷</div>
                <p className="text-muted-foreground">Click to upload an image</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports JPG, PNG (Max 5MB)
                </p>
              </div>
            )}
          </div>
          
          <input 
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            ref={fileInputRef}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedImage || loading}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="w-1/3"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Results Section */}
        <div className="border rounded-lg p-4 bg-background">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Detected Disease</h3>
                <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {result.confidence.toFixed(2)}% confidence
                </div>
              </div>
              
              <div className="text-2xl font-bold text-primary">{result.disease}</div>
              
              <div>
                <h4 className="font-semibold mb-2">Recommended Remedies:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {result.remedies.map((remedy, index) => (
                    <li key={index} className="text-sm">{remedy}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Precautions:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {result.precautions.map((precaution, index) => (
                    <li key={index} className="text-sm">{precaution}</li>
                  ))}
                </ul>
              </div>
              
              {result.recommendedDoctors?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommended Doctors:</h4>
                  <div className="space-y-2">
                    {result.recommendedDoctors.map((doctor) => (
                      <div key={doctor.id} className="flex items-center gap-2 p-2 border rounded-lg bg-card">
                        <img 
                          src={doctor.profileImage || '/placeholder-avatar.jpg'} 
                          alt={doctor.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-xs text-muted-foreground">{doctor.specialties?.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">🔍</div>
                <p>Upload an image and click "Analyze" to get results</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>For accurate diagnosis, please consult with a healthcare professional.</p>
      </div>
      
      {/* Troubleshooting Guide */}
      <TroubleshootingGuide isVisible={hasError} />
    </Card>
  );
};

export default DiseaseDetection; 