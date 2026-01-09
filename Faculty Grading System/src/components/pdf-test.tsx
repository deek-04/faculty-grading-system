import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

export function PDFTest() {
  const [testResults, setTestResults] = useState<{
    questionPaper: string;
    answerSheet: string;
    answerKey: string;
  }>({
    questionPaper: 'Testing...',
    answerSheet: 'Testing...',
    answerKey: 'Testing...'
  });

  useEffect(() => {
    testPDFAccess();
  }, []);

  const testPDFAccess = async () => {
    const files = [
      { key: 'questionPaper', url: '/question-paper.pdf' },
      { key: 'answerSheet', url: '/answer-sheet.pdf' },
      { key: 'answerKey', url: '/answer-key.pdf' }
    ];

    for (const file of files) {
      try {
        const response = await fetch(file.url, { method: 'HEAD' });
        const result = response.ok 
          ? `✅ Accessible (${response.status})` 
          : `❌ Not accessible (${response.status})`;
        
        setTestResults(prev => ({
          ...prev,
          [file.key]: result
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          [file.key]: `❌ Error: ${error}`
        }));
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>PDF File Access Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>Question Paper: {testResults.questionPaper}</div>
          <div>Answer Sheet: {testResults.answerSheet}</div>
          <div>Answer Key: {testResults.answerKey}</div>
        </div>
        <Alert className="mt-4">
          <AlertDescription>
            This test checks if the PDF files are accessible from the browser.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}