import { useState } from 'react';
import PageTitle from '@/components/layout/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PDFUploader from '@/components/summary/PDFUploader';
import SummaryList from '@/components/summary/SummaryList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BrainCircuit } from 'lucide-react';

export default function Documents() {
  const [activeTab, setActiveTab] = useState('view');
  const [latestSummary, setLatestSummary] = useState(null);

  const handleUploadSuccess = (summary) => {
    setLatestSummary(summary);
    setActiveTab('latest');
  };

  return (
    <div className="container max-w-6xl py-6">
      <PageTitle
        title="Medical Documents"
        subtitle="Upload and summarize your medical reports"
        icon={<FileText className="h-6 w-6" />}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mt-6"
      >
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="upload">Upload Document</TabsTrigger>
          <TabsTrigger value="latest" disabled={!latestSummary}>
            Latest Summary
          </TabsTrigger>
          <TabsTrigger value="view">My Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <PDFUploader onUploadSuccess={handleUploadSuccess} />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">1. Upload Medical Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload any medical PDF document including reports, prescriptions, 
                      or medical histories.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">2. AI-Powered Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Our advanced AI model analyzes your document and extracts the 
                      most important information.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">3. Simplified Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      Get a clear, simplified summary that highlights key medical findings
                      and information from your document.
                    </p>
                  </div>
                  
                  <div className="pt-2 text-xs text-muted-foreground border-t">
                    <p>
                      <strong>Note:</strong> While our AI provides accurate summaries, 
                      always consult with healthcare professionals for medical advice.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="latest">
          {latestSummary && (
            <div className="space-y-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Latest Generated Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Document: {latestSummary.fileName}</h3>
                      <p className="text-xs text-muted-foreground">
                        Processed on {new Date(latestSummary.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="bg-card p-4 rounded-md border">
                      <h4 className="text-sm font-medium mb-2">Summary</h4>
                      <p className="text-sm">{latestSummary.summaryText}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        {latestSummary.metadata?.wordCount && (
                          <span className="text-xs text-muted-foreground">
                            Document contains approximately {latestSummary.metadata.wordCount} words
                          </span>
                        )}
                      </div>
                      
                      <a
                        href={latestSummary.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View original document
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="view">
          <SummaryList />
        </TabsContent>
      </Tabs>
    </div>
  );
} 