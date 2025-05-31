import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TroubleshootingGuide = ({ isVisible }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="mt-6 border border-yellow-300 bg-yellow-50 rounded-lg p-4">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-yellow-800">
          Troubleshooting Guide
        </h3>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-3 text-sm text-yellow-800">
          <div>
            <h4 className="font-medium">Server Error (500)</h4>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Make sure the image is a valid JPG, PNG, or JPEG format</li>
              <li>Try using a smaller image (less than 2MB)</li>
              <li>Ensure the image clearly shows the skin condition</li>
              <li>Try restarting your browser or clearing cache</li>
              <li>If the problem persists, please try again later</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium">Connection Error</h4>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Check your internet connection</li>
              <li>Make sure the backend server is running</li>
              <li>Your connection might be blocked by a firewall</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium">Best Practices for Images</h4>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Use good lighting when taking the photo</li>
              <li>Focus directly on the affected skin area</li>
              <li>Avoid very dark or blurry images</li>
              <li>Remove any jewelry or clothing that obscures the condition</li>
              <li>Square or 4:3 aspect ratio images work best</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TroubleshootingGuide; 