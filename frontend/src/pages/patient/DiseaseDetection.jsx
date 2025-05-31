import { motion } from 'framer-motion';
import DiseaseDetection from '@/components/disease-detection/DiseaseDetection';

const DiseaseDetectionPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">AI Skin Disease Detection</h1>
        <p className="text-muted-foreground mt-2">
          Use our AI-powered tool to analyze skin conditions and get instant feedback
        </p>
      </header>

      {/* Disease Detection Component */}
      <DiseaseDetection />

      {/* Information Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">How It Works</h3>
          <p className="text-muted-foreground">
            Our AI model analyzes your skin image using advanced computer vision and machine learning algorithms
            trained on thousands of dermatological images.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Important Note</h3>
          <p className="text-muted-foreground">
            This tool is for informational purposes only and should not replace professional medical advice.
            Always consult with a healthcare provider for proper diagnosis.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-4">👨‍⚕️</div>
          <h3 className="text-xl font-bold mb-2">Next Steps</h3>
          <p className="text-muted-foreground">
            After detection, we recommend connecting with one of our suggested specialists for a proper 
            consultation and treatment plan.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DiseaseDetectionPage; 