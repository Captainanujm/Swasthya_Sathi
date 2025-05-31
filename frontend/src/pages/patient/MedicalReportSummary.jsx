import { useState } from 'react';
import { FileText, BarChart } from 'lucide-react';
import SummaryList from '@/components/summary/SummaryList';
import TestValueVisualizer from '@/components/summary/TestValueVisualizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MedicalReportSummary = () => {
  const [activeTab, setActiveTab] = useState('summaries');

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-center md:text-left flex items-center gap-3">
          <FileText className="h-8 w-8 text-indigo-600" />
          Medical Report Analysis
        </h1>
        <p className="mt-2 text-gray-600 text-center md:text-left">
          Upload your medical reports to get summaries and visualize test results
        </p>
      </div>
      
      <Tabs 
        defaultValue="summaries" 
        value={activeTab} 
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 rounded-lg bg-gray-100 p-1">
          <TabsTrigger 
            value="summaries" 
            className="rounded-md py-3 font-medium text-sm"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Text Summaries</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="visualize" 
            className="rounded-md py-3 font-medium text-sm"
          >
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Test Value Charts</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summaries" className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Understanding Your Reports Made Easy
            </h2>
            <p className="text-gray-600">
              Our AI-powered system analyzes your medical reports and provides easy-to-understand summaries,
              highlighting key information like diagnoses, test results, and recommendations.
            </p>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <SummaryList />
          </div>
        </TabsContent>
        
        <TabsContent value="visualize" className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Visualize Your Test Results
            </h2>
            <p className="text-gray-600">
              Upload your lab reports to automatically extract test values and see them in an easy-to-understand 
              bar chart. Instantly identify high, normal, and low values with color-coded visualization.
            </p>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <TestValueVisualizer />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="text-lg font-semibold text-indigo-700 mb-3">
          Important Information
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-indigo-700">
          <li className="text-sm">
            Summaries and test value extraction are generated using AI and should not replace professional medical advice.
          </li>
          <li className="text-sm">
            Always consult with your healthcare provider for proper interpretation of your medical reports.
          </li>
          <li className="text-sm">
            Your uploads are processed securely and deleted from our servers after processing.
          </li>
          <li className="text-sm">
            Only PDF files are supported, with a maximum size of 10MB.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MedicalReportSummary; 