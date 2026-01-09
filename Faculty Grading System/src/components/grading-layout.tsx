import React, { useState, useEffect } from 'react';
import { PDFViewer } from './pdf-viewer';
import { PDFTest } from './pdf-test';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { loadPDFFiles } from '../utils/pdf-files';

interface GradingLayoutProps {
  className?: string;
}

export function GradingLayout({ className = '' }: GradingLayoutProps) {
  const [pdfFiles, setPdfFiles] = useState<{
    questionPaper: string;
    answerSheet: string;
    answerKey: string;
    errors: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializePDFs();
  }, []);

  const initializePDFs = async () => {
    try {
      setIsLoading(true);
      const files = await loadPDFFiles();
      setPdfFiles(files);
    } catch (error) {
      console.error('Error initializing PDFs:', error);
      setPdfFiles({
        questionPaper: '/question paper.pdf',
        answerSheet: '/Answer sheet.pdf',
        answerKey: '/key.pdf',
        errors: ['Failed to initialize PDF files']
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <span className="text-lg">Loading PDF documents...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pdfFiles) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            Failed to load PDF documents. Please refresh the page and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Grading Documents</span>
            <div className="flex items-center gap-2">
              {pdfFiles.errors.length === 0 ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  All documents loaded
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {pdfFiles.errors.length} error(s)
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        {pdfFiles.errors.length > 0 && (
          <CardContent>
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                <strong>Document Loading Issues:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {pdfFiles.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* PDF Access Test */}
      <PDFTest />

      {/* Simple iframe test */}
      <Card>
        <CardHeader>
          <CardTitle>Direct PDF Access Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Question Paper (iframe):</h4>
              <iframe 
                src="/question-paper.pdf" 
                className="w-full h-64 border"
                title="Question Paper"
              />
            </div>
            <div>
              <h4 className="font-medium">Answer Key (iframe):</h4>
              <iframe 
                src="/answer-key.pdf" 
                className="w-full h-64 border"
                title="Answer Key"
              />
            </div>
            <div>
              <h4 className="font-medium">Answer Sheet (iframe):</h4>
              <iframe 
                src="/answer-sheet.pdf" 
                className="w-full h-64 border"
                title="Answer Sheet"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three-Panel PDF Layout */}
      <div className="space-y-6">
        {/* Top Row - Question Paper and Answer Key */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PDFViewer
            pdfUrl={pdfFiles.questionPaper}
            title="Question Paper"
            className="h-fit"
          />
          <PDFViewer
            pdfUrl={pdfFiles.answerKey}
            title="Answer Key"
            className="h-fit"
          />
        </div>
        
        {/* Bottom Row - Answer Sheet (Full Width) */}
        <div className="w-full">
          <PDFViewer
            pdfUrl={pdfFiles.answerSheet}
            title="Answer Sheet - Student Submission"
            className="w-full"
          />
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Grading Instructions</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use the Question Paper as reference for the exam questions</li>
                <li>• Compare student answers in the Answer Sheet with the Answer Key</li>
                <li>• Navigate through pages using the Previous/Next buttons</li>
                <li>• Use zoom controls (+/-) to adjust document size for better readability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}