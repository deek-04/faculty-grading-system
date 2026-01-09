import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft, 
  User, 
  Hash, 
  Calculator, 
  Save, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { GradingLayout } from './grading-layout';

interface PDFGradingInterfaceProps {
  user: any;
  facultyData: any;
  sectionId: string;
  onBackToDashboard: () => void;
  accessToken: string;
}

interface Question {
  id: string;
  number: number;
  maxMarks: number;
  allocatedMarks: number;
  type: "2marks" | "16marks";
}

interface PaperData {
  id: string;
  studentName: string;
  rollNumber: string;
  totalMarks: number;
  obtainedMarks: number;
  isGraded: boolean;
}

export function PDFGradingInterface({
  user,
  facultyData,
  sectionId,
  onBackToDashboard,
  accessToken,
}: PDFGradingInterfaceProps) {
  const [papers, setPapers] = useState<PaperData[]>([]);
  const [currentPaperIndex, setCurrentPaperIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [startTime] = useState(new Date());
  const [sessionTime, setSessionTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    initializePapers();
    initializeQuestions();

    // Timer for session tracking
    const timer = setInterval(() => {
      setSessionTime(
        Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [sectionId]);

  const initializePapers = () => {
    const mockPapers: PaperData[] = [];
    for (let i = 1; i <= 70; i++) {
      mockPapers.push({
        id: `${sectionId}-${i}`,
        studentName: `Student ${i}`,
        rollNumber: `${sectionId}${i.toString().padStart(3, "0")}`,
        totalMarks: 100,
        obtainedMarks: 0,
        isGraded: Math.random() > 0.7,
      });
    }
    setPapers(mockPapers);
  };

  const initializeQuestions = () => {
    const mockQuestions: Question[] = [];

    // 10 questions of 2 marks each
    for (let i = 1; i <= 10; i++) {
      mockQuestions.push({
        id: `q${i}`,
        number: i,
        maxMarks: 2,
        allocatedMarks: 0,
        type: "2marks",
      });
    }

    // 5 questions of 16 marks each
    for (let i = 11; i <= 15; i++) {
      mockQuestions.push({
        id: `q${i}`,
        number: i,
        maxMarks: 16,
        allocatedMarks: 0,
        type: "16marks",
      });
    }

    setQuestions(mockQuestions);
  };

  const currentPaper = papers[currentPaperIndex];
  const progress = papers.filter((p) => p.isGraded).length;
  const progressPercentage = (progress / papers.length) * 100;

  const updateQuestionMarks = (questionId: string, marks: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              allocatedMarks: Math.max(0, Math.min(marks, q.maxMarks)),
            }
          : q
      )
    );
  };

  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => sum + q.allocatedMarks, 0);
  };

  const resetQuestionMarks = () => {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        allocatedMarks: 0,
      }))
    );
  };

  const savePaperGrading = async () => {
    if (!currentPaper) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setPapers((prev) =>
        prev.map((p) =>
          p.id === currentPaper.id
            ? {
                ...p,
                isGraded: true,
                obtainedMarks: calculateTotalMarks(),
              }
            : p
        )
      );

      toast.success("Paper graded and saved successfully!");

      // Move to next ungraded paper
      const nextUngradedIndex = papers.findIndex(
        (p, index) => index > currentPaperIndex && !p.isGraded
      );

      if (nextUngradedIndex !== -1) {
        setCurrentPaperIndex(nextUngradedIndex);
        resetQuestionMarks();
      } else {
        toast.info("All papers in this section have been graded!");
      }
    } catch (error) {
      toast.error("Failed to save grading. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const goToPreviousPaper = () => {
    if (currentPaperIndex > 0) {
      setCurrentPaperIndex(currentPaperIndex - 1);
      resetQuestionMarks();
    }
  };

  const goToNextPaper = () => {
    if (currentPaperIndex < papers.length - 1) {
      setCurrentPaperIndex(currentPaperIndex + 1);
      resetQuestionMarks();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentPaper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Papers...
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare the PDF grading interface.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBackToDashboard}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  PDF Grading: {sectionId}
                </h1>
                <p className="text-sm text-gray-500">
                  Paper {currentPaperIndex + 1} of {papers.length}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <p className="font-medium text-gray-900">Session Time</p>
                <p className="text-blue-600">{formatTime(sessionTime)}</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={facultyData.profileFaceUrl}
                  alt={facultyData.name}
                />
                <AvatarFallback>
                  {facultyData.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Section Progress</span>
              <span className="text-sm text-gray-600">
                {progress} / {papers.length} papers graded
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Student Info Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {currentPaper.studentName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Roll No: {currentPaper.rollNumber}
                    </p>
                  </div>
                  <Badge
                    variant={currentPaper.isGraded ? "default" : "secondary"}
                  >
                    {currentPaper.isGraded ? "Graded" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Paper {currentPaperIndex + 1} of {papers.length}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* PDF Viewing Layout */}
          <GradingLayout />

          {/* Grading Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Question Marks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Question Marks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div
                        key={question.id}
                        className="space-y-2 p-3 border rounded-lg"
                      >
                        <Label className="text-sm font-medium">
                          Question {question.number} ({question.type} - Max:{" "}
                          {question.maxMarks})
                        </Label>

                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max={question.maxMarks}
                            value={question.allocatedMarks}
                            onChange={(e) =>
                              updateQuestionMarks(
                                question.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">
                            / {question.maxMarks}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuestionMarks(question.id, 0)}
                            className="h-8 w-8 p-0"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>

                        {question.allocatedMarks > question.maxMarks && (
                          <p className="text-xs text-red-500">
                            Cannot exceed maximum marks
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Summary and Actions */}
            <div className="space-y-6">
              {/* Total Marks Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Marks Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Marks:</span>
                      <span className="font-semibold text-lg">
                        {calculateTotalMarks()} / {currentPaper.totalMarks}
                      </span>
                    </div>
                    <Progress
                      value={
                        (calculateTotalMarks() / currentPaper.totalMarks) * 100
                      }
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      Percentage:{" "}
                      {(
                        (calculateTotalMarks() / currentPaper.totalMarks) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Button
                    onClick={savePaperGrading}
                    disabled={isSaving || calculateTotalMarks() === 0}
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save & Next Paper
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={resetQuestionMarks}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Marks
                  </Button>

                  {/* Paper Navigation */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={goToPreviousPaper}
                      disabled={currentPaperIndex === 0}
                      className="flex-1"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={goToNextPaper}
                      disabled={currentPaperIndex === papers.length - 1}
                      className="flex-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 mr-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Grading Guidelines */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>PDF Grading Guidelines:</strong>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Use Question Paper and Answer Key as reference</li>
                    <li>Navigate through Answer Sheet pages using controls</li>
                    <li>Use zoom controls for better readability</li>
                    <li>Mark questions based on student answers</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}