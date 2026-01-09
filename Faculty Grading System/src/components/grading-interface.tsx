import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner@2.0.3";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  FileText,
  User,
  Hash,
  Calculator,
  Clock,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";
import { PDFViewer } from "./pdf-viewer";
import { projectId } from "../utils/supabase/info";
import { excelExportService, type GradingData } from "../utils/excel-export";
import { GradingBackButton } from "./navigation/BackButton";
import { useGradingNavigationState, useBrowserNavigation } from "../hooks/useNavigationState";
import { buildApiUrl, API_CONFIG } from "../config/api";

interface GradingInterfaceProps {
  user: any;
  facultyData: any;
  sectionId: string;
  accessToken: string;
}

interface PaperData {
  _id: string;
  id: string;
  paperId: string;
  studentName: string;
  rollNumber: string;
  dummyNumber: string;
  courseCode: string;
  totalMarks: number;
  obtainedMarks: number;
  questionMarks: { [key: string]: number };
  isGraded: boolean;
  timeSpent: number;
  status: string;
  paperFilename?: string;
}

interface Question {
  id: string;
  number: number;
  maxMarks: number;
  allocatedMarks: number;
  type: "2marks" | "16marks";
  hasOptions?: boolean;
  selectedOption?: "a" | "b" | "not_written";
  optionMarks?: {
    a: number;
    b: number;
  };
}

export function GradingInterface({
  user,
  facultyData,
  sectionId,
  accessToken,
}: GradingInterfaceProps) {
  const [papers, setPapers] = useState<PaperData[]>([]);
  const [currentPaperIndex, setCurrentPaperIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10); // Default to 10 pages
  const [viewedPages, setViewedPages] = useState<Set<number>>(new Set([1]));
  const [questionPaperPage, setQuestionPaperPage] = useState(1);
  const [answerKeyPage, setAnswerKeyPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [startTime] = useState(new Date());
  const [sessionTime, setSessionTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [excelCount, setExcelCount] = useState(0);

  // Navigation state management
  const { preserveGradingState, restoreGradingState, markUnsavedChanges } = useGradingNavigationState();
  const { setUnsavedChanges } = useBrowserNavigation();

  useEffect(() => {
    loadAssignedPapers();
    initializeQuestions();

    // Timer for session tracking
    const timer = setInterval(() => {
      setSessionTime(
        Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [sectionId]);

  // Restore grading state when component mounts
  useEffect(() => {
    const savedState = restoreGradingState();
    if (savedState && savedState.sectionId === sectionId) {
      setCurrentPaperIndex(savedState.currentPaperIndex || 0);
      setCurrentPage(savedState.currentPage || 1);
      setZoomLevel(savedState.zoomLevel || 1);
      
      // Restore question marks
      if (savedState.questionMarks) {
        setQuestions(prev => prev.map(q => ({
          ...q,
          allocatedMarks: savedState.questionMarks[q.id] ?? q.allocatedMarks
        })));
      }
    }
  }, [sectionId, restoreGradingState]);

  // Mark unsaved changes when grading data changes
  useEffect(() => {
    const hasGradedQuestions = questions.some(q => q.allocatedMarks !== null && q.allocatedMarks !== undefined);
    setUnsavedChanges(hasGradedQuestions);
  }, [questions, setUnsavedChanges]);

  const loadAssignedPapers = async () => {
    try {
      const employeeId = facultyData.employeeId || facultyData.registerNumber;
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.FACULTY_ASSIGNMENTS(employeeId)));
      const data = await response.json();

      if (data.success && data.assignments) {
        // Convert assignments to paper format
        const assignedPapers: PaperData[] = data.assignments.map((assignment: any) => ({
          _id: assignment._id,
          id: assignment._id,
          paperId: assignment.paperId,
          studentName: `Student ${assignment.dummyNumber}`,
          rollNumber: assignment.dummyNumber,
          dummyNumber: assignment.dummyNumber,
          courseCode: assignment.courseCode,
          totalMarks: 100,
          obtainedMarks: 0,
          questionMarks: {},
          isGraded: assignment.status === 'completed',
          timeSpent: 0,
          status: assignment.status,
          paperFilename: assignment.paperFilename
        }));

        setPapers(assignedPapers);
        
        // Set current paper to first ungraded paper
        const firstUngradedIndex = assignedPapers.findIndex(p => !p.isGraded);
        if (firstUngradedIndex !== -1) {
          setCurrentPaperIndex(firstUngradedIndex);
        }

        toast.success(`Loaded ${assignedPapers.length} assigned papers`);
      } else {
        toast.error('No papers assigned to you');
        setPapers([]);
      }
    } catch (error) {
      console.error('Error loading assigned papers:', error);
      toast.error('Failed to load assigned papers');
      setPapers([]);
    }
  };

  const initializeQuestions = () => {
    const mockQuestions: Question[] = [];

    // 10 questions of 2 marks each
    for (let i = 1; i <= 10; i++) {
      mockQuestions.push({
        id: `q${i}`,
        number: i,
        maxMarks: 2,
        allocatedMarks: null as any, // null means not graded yet
        type: "2marks",
      });
    }

    // 5 questions of 16 marks each (with optional parts)
    for (let i = 11; i <= 15; i++) {
      mockQuestions.push({
        id: `q${i}`,
        number: i,
        maxMarks: 16,
        allocatedMarks: null as any, // null means not graded yet
        type: "16marks",
        hasOptions: true,
        selectedOption: "not_written",
        optionMarks: {
          a: 0,
          b: 0,
        },
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
              allocatedMarks: marks === -1 ? -1 : Math.max(0, Math.min(marks, q.maxMarks)),
            }
          : q
      )
    );
  };

  const updateQuestionOption = (
    questionId: string,
    option: "a" | "b" | "not_written"
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              selectedOption: option,
              allocatedMarks: option === "not_written" ? 0 : q.allocatedMarks,
            }
          : q
      )
    );
  };

  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => {
      // Skip NA (-1) and ungraded (null/undefined) questions in total calculation
      if (q.allocatedMarks === -1 || q.allocatedMarks === null || q.allocatedMarks === undefined) return sum;
      return sum + q.allocatedMarks;
    }, 0);
  };

  // Check if all questions have been graded (including 0 marks)
  const areAllQuestionsGraded = () => {
    return questions.every((q) => {
      // Question is graded if it has marks allocated (including 0) or is marked as NA (-1)
      return q.allocatedMarks !== null && q.allocatedMarks !== undefined;
    });
  };

  // Count ungraded questions
  const getUngradedCount = () => {
    return questions.filter((q) => q.allocatedMarks === null || q.allocatedMarks === undefined).length;
  };

  const savePaperGrading = async () => {
    if (!currentPaper) return;

    setIsSaving(true);

    try {
      const obtainedMarks = calculateTotalMarks();
      const percentage = (obtainedMarks / currentPaper.totalMarks) * 100;

      // Prepare marks data
      const marksData = questions.map(q => ({
        questionNumber: q.number,
        maxMarks: q.maxMarks,
        marksObtained: q.allocatedMarks
      }));

      // Update assignment status in database
      const updateResponse = await fetch(`http://localhost:5000/api/faculty/assignments/${currentPaper._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          marks: marksData,
          correctionTime: Math.floor(sessionTime / 60) // Convert to minutes
        })
      });

      const updateResult = await updateResponse.json();

      if (!updateResult.success) {
        throw new Error(updateResult.error?.message || 'Failed to update assignment');
      }

      const gradingData: GradingData = {
        paperId: currentPaper.paperId,
        sectionId,
        studentName: currentPaper.studentName,
        rollNumber: currentPaper.rollNumber,
        questionMarks: questions.reduce(
          (acc, q) => {
            acc[q.id] = q.allocatedMarks;
            return acc;
          },
          {} as { [key: string]: number }
        ),
        totalMarks: currentPaper.totalMarks,
        obtainedMarks,
        timeSpent: sessionTime,
        gradedAt: new Date().toISOString(),
        percentage,
        dummyNumber: currentPaper.dummyNumber,
        courseCode: currentPaper.courseCode,
      };

      // Save to Excel export service
      excelExportService.addGradingData(gradingData);
      setExcelCount(excelExportService.getGradedCount(sectionId));

      // Update local state
      setPapers((prev) =>
        prev.map((p) =>
          p.id === currentPaper.id
            ? {
                ...p,
                isGraded: true,
                obtainedMarks,
                questionMarks: gradingData.questionMarks,
                timeSpent: sessionTime,
                status: 'completed'
              }
            : p
        )
      );

      toast.success(`Paper saved! ${currentPaper.dummyNumber} - ${obtainedMarks}/${currentPaper.totalMarks} (${percentage.toFixed(1)}%)`);

      // Check if all papers are completed
      const updatedPapers = papers.map((p) =>
        p.id === currentPaper.id ? { ...p, isGraded: true } : p
      );
      const allCompleted = updatedPapers.every(p => p.isGraded);

      if (allCompleted) {
        // Trigger report generation
        toast.success("All 4 papers completed! Generating reports...");
        
        const employeeId = facultyData.employeeId || facultyData.registerNumber;
        const reportResponse = await fetch(`http://localhost:5000/api/faculty/${employeeId}/check-completion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const reportResult = await reportResponse.json();
        
        if (reportResult.success && reportResult.allCompleted) {
          toast.success("Reports generated successfully! Available in admin portal.");
          // Auto-export to Excel when all papers are done
          setTimeout(() => {
            exportToExcel();
          }, 1000);
        }
      } else {
        // Move to next ungraded paper
        const nextUngradedIndex = updatedPapers.findIndex(
          (p, index) => index > currentPaperIndex && !p.isGraded
        );

        if (nextUngradedIndex !== -1) {
          setCurrentPaperIndex(nextUngradedIndex);
          resetQuestionMarks();
          setViewedPages(new Set([1]));
          setCurrentPage(1);
          setQuestionPaperPage(1);
          setAnswerKeyPage(1);
        }
      }
    } catch (error) {
      console.error("Save grading error:", error);
      toast.error("Failed to save grading. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetQuestionMarks = () => {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        allocatedMarks: 0,
        selectedOption: q.hasOptions ? "not_written" : undefined,
        optionMarks: q.hasOptions ? { a: 0, b: 0 } : undefined,
      }))
    );
  };

  const exportToExcel = () => {
    try {
      const courseCode = getCourseCode(sectionId);
      excelExportService.exportToExcel(sectionId, courseCode);
      toast.success("Grading results exported to Excel with 2 sheets successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export to Excel. Please try again.");
    }
  };

  const handlePageChange = (newPage: number) => {
    console.log('Main navigation changing to page:', newPage);
    setCurrentPage(newPage);
    setViewedPages((prev) => new Set([...prev, newPage]));
  };

  const allPagesViewed = viewedPages.size === totalPages;

  const goToPreviousPaper = () => {
    if (currentPaperIndex > 0) {
      setCurrentPaperIndex(currentPaperIndex - 1);
      resetQuestionMarks();
      setViewedPages(new Set([1]));
      setCurrentPage(1);
      setQuestionPaperPage(1);
      setAnswerKeyPage(1);
    }
  };

  const goToNextPaper = () => {
    if (currentPaperIndex < papers.length - 1 && allPagesViewed) {
      setCurrentPaperIndex(currentPaperIndex + 1);
      resetQuestionMarks();
      setViewedPages(new Set([1]));
      setCurrentPage(1);
      setQuestionPaperPage(1);
      setAnswerKeyPage(1);
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
            Please wait while we prepare the grading interface.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-500 to-purple-600 border-b border-purple-700 sticky top-0 z-20 shadow-md">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <GradingBackButton
                variant="ghost"
                className="text-white hover:bg-purple-400"
                onBeforeNavigate={async () => {
                  // Save current grading state before navigating
                  const gradingState = {
                    currentPaperIndex,
                    currentPage,
                    zoomLevel,
                    questionMarks: questions.reduce((acc, q) => {
                      if (q.allocatedMarks !== null) {
                        acc[q.id] = q.allocatedMarks;
                      }
                      return acc;
                    }, {} as Record<string, number>),
                    timeSpent: sessionTime,
                    sectionId,
                  };
                  preserveGradingState(gradingState);
                  return true;
                }}
              >
                Back to Dashboard
              </GradingBackButton>
              <Separator orientation="vertical" className="h-6 bg-purple-300" />
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Grading: {sectionId}
                </h1>
                <p className="text-sm text-purple-100">
                  Paper {currentPaperIndex + 1} of {papers.length}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <p className="font-medium text-white">Session Time</p>
                <p className="text-purple-100">{formatTime(sessionTime)}</p>
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

      <div className="w-full mx-auto px-4 py-4 bg-pink-50">
        {/* Progress Bar */}
        <Card className="mb-4 border-purple-200 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-purple-700">Section Progress</span>
              <div className="text-right">
                <span className="text-sm text-purple-600">
                  {progress} / {papers.length} papers graded
                </span>
                <br />
                <span className="text-xs text-purple-600">
                  {excelCount} saved to Excel
                </span>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-purple-200" />
          </CardContent>
        </Card>

        {/* Paper Information Bar - Compact with Total Marks */}
        <div className="bg-white border border-pink-200 rounded-lg p-3 mb-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-blue-600">Student: </span>
                <span className="font-medium text-blue-900">{currentPaper.studentName}</span>
              </div>
              <div>
                <span className="text-blue-600">Dummy No: </span>
                <span className="font-medium text-blue-900">{currentPaper.dummyNumber}</span>
              </div>
              <div>
                <span className="text-blue-600">Course: </span>
                <span className="font-medium text-blue-900">{currentPaper.courseCode}</span>
              </div>
              <div className="bg-pink-100 px-3 py-1 rounded border border-pink-300">
                <span className="text-blue-600">Total Marks: </span>
                <span className="font-bold text-pink-600">{calculateTotalMarks()} / {currentPaper.totalMarks}</span>
                <span className="text-xs text-blue-600 ml-2">
                  ({((calculateTotalMarks() / currentPaper.totalMarks) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <Badge
              variant={currentPaper.isGraded ? "default" : "secondary"}
              className={currentPaper.isGraded ? "bg-pink-500" : "bg-blue-400"}
            >
              {currentPaper.isGraded ? "Graded" : "Pending"}
            </Badge>
          </div>
        </div>

        {/* Question Marks - Sticky Horizontal Row */}
        <Card className="border-pink-200 shadow-md bg-white mb-3 sticky top-16 z-10">
          <CardContent className="p-0">
            <div className="flex items-stretch">
              {/* Part A - 2 marks questions (Questions 1-10) */}
              {questions.slice(0, 10).map((question, index) => (
                <div
                  key={question.id}
                  className="flex-1 bg-purple-200 px-3 py-3 flex flex-col items-center justify-center border-r border-white"
                >
                  <div className="text-xs font-bold text-gray-700 mb-1">PART A</div>
                  <div className="text-base font-bold text-gray-800 mb-1">{question.number}.</div>
                  <Select
                    value={
                      question.allocatedMarks === null || question.allocatedMarks === undefined
                        ? ""
                        : question.allocatedMarks === -1
                        ? "NA"
                        : question.allocatedMarks.toString()
                    }
                    onValueChange={(value) => {
                      if (value === "NA") {
                        updateQuestionMarks(question.id, -1);
                      } else {
                        updateQuestionMarks(question.id, parseInt(value));
                      }
                    }}
                  >
                    <SelectTrigger className={`w-16 h-9 text-center text-base font-bold border-2 ${
                      question.allocatedMarks === null || question.allocatedMarks === undefined
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-400 bg-white'
                    } focus:border-gray-700`}>
                      <SelectValue placeholder="?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NA">NA</SelectItem>
                      {Array.from({ length: question.maxMarks + 1 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className={`text-xs mt-1 font-semibold ${
                    question.allocatedMarks === null || question.allocatedMarks === undefined
                      ? 'text-red-600'
                      : question.allocatedMarks === 0
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}>
                    {question.allocatedMarks === null || question.allocatedMarks === undefined
                      ? "NOT YET"
                      : question.allocatedMarks === -1
                      ? "NA"
                      : `${question.allocatedMarks}/${question.maxMarks}`}
                  </div>
                </div>
              ))}

              {/* Part B - 16 marks questions (Questions 11-15) */}
              {questions.slice(10, 15).map((question, index) => (
                <div
                  key={question.id}
                  className="flex-1 bg-purple-300 px-3 py-3 flex flex-col items-center justify-center border-r border-white"
                >
                  <div className="text-xs font-bold text-gray-700 mb-1">PART B</div>
                  <div className="text-base font-bold text-gray-800 mb-1">{question.number}.</div>
                  <Select
                    value={
                      question.allocatedMarks === null || question.allocatedMarks === undefined
                        ? ""
                        : question.allocatedMarks === -1
                        ? "NA"
                        : question.allocatedMarks.toString()
                    }
                    onValueChange={(value) => {
                      if (value === "NA") {
                        updateQuestionMarks(question.id, -1);
                      } else {
                        updateQuestionMarks(question.id, parseInt(value));
                      }
                    }}
                  >
                    <SelectTrigger className={`w-16 h-9 text-center text-base font-bold border-2 ${
                      question.allocatedMarks === null || question.allocatedMarks === undefined
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-400 bg-white'
                    } focus:border-gray-700`}>
                      <SelectValue placeholder="?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NA">NA</SelectItem>
                      {Array.from({ length: question.maxMarks + 1 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className={`text-xs mt-1 font-semibold ${
                    question.allocatedMarks === null || question.allocatedMarks === undefined
                      ? 'text-red-600'
                      : question.allocatedMarks === 0
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}>
                    {question.allocatedMarks === null || question.allocatedMarks === undefined
                      ? "NOT YET"
                      : question.allocatedMarks === -1
                      ? "NA"
                      : `${question.allocatedMarks}/${question.maxMarks}`}
                  </div>
                </div>
              ))}

              {/* Total Marks Display */}
              <div className="flex-1 bg-purple-500 text-white px-3 py-3 flex flex-col items-center justify-center border-r border-white">
                <div className="text-xs font-semibold mb-1">TOTAL</div>
                <div className="text-2xl font-bold">{calculateTotalMarks()}</div>
                <div className="text-sm">/ {currentPaper.totalMarks}</div>
                <div className="text-xs mt-1">
                  {((calculateTotalMarks() / currentPaper.totalMarks) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex-1 bg-purple-600 text-white px-3 py-3 flex flex-col items-center justify-center">
                <Button
                  onClick={savePaperGrading}
                  disabled={isSaving || !areAllQuestionsGraded()}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-bold px-4 py-2 h-auto text-sm disabled:opacity-50 disabled:cursor-not-allowed mb-1"
                  title={!areAllQuestionsGraded() ? `Please grade ${getUngradedCount()} remaining question(s)` : ""}
                >
                  {isSaving ? "Saving..." : "Submit"}
                </Button>
                {!areAllQuestionsGraded() && (
                  <div className="text-xs text-red-200 font-semibold">
                    {getUngradedCount()} left
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>



        {/* 2-Column Layout: Left (References) | Right (Answer Sheet) - Equal Width */}
        <div className="grid grid-cols-2 gap-4 w-full min-h-screen">
          {/* LEFT COLUMN - Reference Materials with Tabs */}
          <div className="flex-1">
            <Card className="border-pink-200 shadow-sm bg-white h-full">
              <CardContent className="p-0 h-[calc(100vh-200px)]">
                {/* Tab Buttons at top */}
                <div className="flex gap-0 border-b border-pink-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    className={`flex-1 rounded-none py-3 ${viewedPages.size === 0 || currentPage <= totalPages / 2 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'hover:bg-pink-50'}`}
                  >
                    📋 Question Paper
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.ceil(totalPages / 2) + 1)}
                    className={`flex-1 rounded-none py-3 ${currentPage > totalPages / 2 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'hover:bg-pink-50'}`}
                  >
                    🔑 Answer Key
                  </Button>
                </div>
                
                {/* PDF Viewer */}
                <div className="p-4 h-[calc(100%-48px)]">
                  {currentPage <= Math.ceil(totalPages / 2) ? (
                    <PDFViewer
                      pdfUrl="/question-paper.pdf"
                      title="Question Paper"
                      size="large"
                      className="w-full h-full"
                      onPageChange={(page) => {
                        setQuestionPaperPage(page);
                        console.log('Question paper page changed to:', page);
                      }}
                    />
                  ) : (
                    <PDFViewer
                      pdfUrl="/answer-key.pdf"
                      title="Answer Key"
                      size="large"
                      className="w-full h-full"
                      onPageChange={(page) => {
                        setAnswerKeyPage(page);
                        console.log('Answer key page changed to:', page);
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Answer Sheet Display */}
          <div className="flex-1">
            <Card className="border-pink-200 shadow-sm bg-white h-full">
              <CardContent className="p-4 h-[calc(100vh-200px)]">
                {/* Answer Sheet PDF Viewer */}
                <PDFViewer
                  pdfUrl="/answer-sheet.pdf"
                  title="📄 Answer Sheet"
                  size="large"
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    setViewedPages((prev) => new Set([...prev, page]));
                  }}
                  className="w-full h-full"
                />

                {/* Paper Navigation */}
                <div className="flex justify-between items-center mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <Button
                    variant="outline"
                    onClick={goToPreviousPaper}
                    disabled={currentPaperIndex === 0}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous Paper
                  </Button>

                  <div className="text-center">
                    <p className="text-sm font-medium text-blue-900">
                      Paper {currentPaperIndex + 1} of {papers.length}
                    </p>
                    <p className="text-xs text-pink-500">
                      {papers.filter((p) => p.isGraded).length} completed
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={goToNextPaper}
                    disabled={currentPaperIndex === papers.length - 1}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    Next Paper
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>


        </div>
      </div>
    </div>
  );
}