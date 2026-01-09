// PDF file references for the existing files in the project
export const PDF_FILES = {
  questionPaper: '/question-paper.pdf',
  answerSheet: '/answer-sheet.pdf',
  answerKey: '/answer-key.pdf'
} as const;

export interface PDFFileInfo {
  id: string;
  title: string;
  url: string;
  type: 'question_paper' | 'answer_sheet' | 'answer_key';
}

export const getPDFFiles = (): PDFFileInfo[] => {
  return [
    {
      id: 'question-paper',
      title: 'Question Paper',
      url: PDF_FILES.questionPaper,
      type: 'question_paper'
    },
    {
      id: 'answer-sheet',
      title: 'Answer Sheet',
      url: PDF_FILES.answerSheet,
      type: 'answer_sheet'
    },
    {
      id: 'answer-key',
      title: 'Answer Key',
      url: PDF_FILES.answerKey,
      type: 'answer_key'
    }
  ];
};

export const validatePDFFile = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.includes('pdf');
  } catch (error) {
    console.error('Error validating PDF file:', error);
    return false;
  }
};

export const loadPDFFiles = async (): Promise<{
  questionPaper: string;
  answerSheet: string;
  answerKey: string;
  errors: string[];
}> => {
  const errors: string[] = [];
  const result = {
    questionPaper: PDF_FILES.questionPaper,
    answerSheet: PDF_FILES.answerSheet,
    answerKey: PDF_FILES.answerKey,
    errors
  };

  // Validate each PDF file
  try {
    const validations = await Promise.allSettled([
      validatePDFFile(PDF_FILES.questionPaper),
      validatePDFFile(PDF_FILES.answerSheet),
      validatePDFFile(PDF_FILES.answerKey)
    ]);

    if (validations[0].status === 'rejected' || !validations[0].value) {
      errors.push('Question paper PDF not found or invalid');
    }
    if (validations[1].status === 'rejected' || !validations[1].value) {
      errors.push('Answer sheet PDF not found or invalid');
    }
    if (validations[2].status === 'rejected' || !validations[2].value) {
      errors.push('Answer key PDF not found or invalid');
    }
  } catch (error) {
    errors.push('Error validating PDF files');
  }

  return result;
};