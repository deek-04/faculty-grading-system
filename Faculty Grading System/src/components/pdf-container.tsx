import React from 'react';
import { PDFViewer } from './pdf-viewer';

interface PDFContainerProps {
  questionPaperUrl: string;
  answerSheetUrl: string;
  answerKeyUrl: string;
}

export function PDFContainer({ 
  questionPaperUrl, 
  answerSheetUrl, 
  answerKeyUrl 
}: PDFContainerProps) {
  return (
    <div className="space-y-6">
      {/* Top Row - Question Paper and Answer Key */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PDFViewer
          pdfUrl={questionPaperUrl}
          title="Question Paper"
          className="h-fit"
        />
        <PDFViewer
          pdfUrl={answerKeyUrl}
          title="Answer Key"
          className="h-fit"
        />
      </div>
      
      {/* Bottom Row - Answer Sheet (Full Width) */}
      <div className="w-full">
        <PDFViewer
          pdfUrl={answerSheetUrl}
          title="Answer Sheet"
          className="w-full"
        />
      </div>
    </div>
  );
}