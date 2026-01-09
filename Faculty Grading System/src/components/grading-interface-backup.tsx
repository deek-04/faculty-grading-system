import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner@2.0.3";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  FileText,
  User,
  Hash,
  Calculator,
  Clock,
  CheckCircle,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize,
  BookOpen,
  Key,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { projectId } from "../utils/supabase/info";
import { demoStore } from "../utils/demo-store";
import { PDFViewer } from "./pdf-viewer";
import { GradingLayout } from "./grading-layout";

interface GradingInterfaceProps {
  user: any;
  facultyData: any;
  sectionId: string;
  onBackToDashboard: () => void;
  accessToken: string;
}

interface PaperData {
  id: string;
  studentName: string;
  rollNumber: string;
  answerSheetUrl: string;
  totalMarks: number;
  obtainedMarks: number;
  questionMarks: { [key: string]: number };
  isGraded: boolean;
  timeSpent: number;
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
  onBackToDashboard,
  accessToken,
}: GradingInterfaceProps) {
  const [papers, setPapers] = useState<PaperData[]>([]);
  const [currentPaperIndex, setCurrentPaperIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [answerImageUrls, setAnswerImageUrls] = useState<string[]>([]);
  const [answerPdfUrl, setAnswerPdfUrl] = useState<string | undefined>(undefined);
  const [totalPages, setTotalPages] = useState(42); // Defaults to 42; replaced by uploaded images count if available
  const [viewedPages, setViewedPages] = useState<Set<number>>(
    new Set([1]),
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [startTime] = useState(new Date());
  const [sessionTime, setSessionTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [mockAnswerSheetUrl, setMockAnswerSheetUrl] =
    useState<string>("");
  const [refQuestionUrl, setRefQuestionUrl] = useState<string | undefined>(undefined);
  const [refAnswerKeyUrl, setRefAnswerKeyUrl] = useState<string | undefined>(undefined);
  const [showReferencePopup, setShowReferencePopup] =
    useState(false);
  const [referenceTab, setReferenceTab] = useState<
    "question" | "answer"
  >("question");
  const openReference = (tab: "question" | "answer") => {
    setReferenceTab(tab);
    setShowReferencePopup(true);
  };

  useEffect(() => {
    initializePapers();
    initializeQuestions();
    loadMockAnswerSheet();
    loadAdminUploads();

    // Timer for session tracking
    const timer = setInterval(() => {
      setSessionTime(
        Math.floor(
          (new Date().getTime() - startTime.getTime()) / 1000,
        ),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [sectionId]);

  const loadMockAnswerSheet = async () => {
    // Use the Unsplash image for answer sheets
    setMockAnswerSheetUrl(
      "https://images.unsplash.com/photo-1644479590153-8b4fbdb29cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGFtJTIwYW5zd2VyJTIwc2hlZXQlMjBzdHVkZW50JTIwaGFuZHdyaXRpbmd8ZW58MXx8fHwxNzU3ODMxODU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    );
  };

  const loadAdminUploads = () => {
    // Read the latest demo uploads for this faculty (if any)
    const uploads = demoStore.getPapersForFaculty(user?.id);
    if (uploads.length > 0) {
      const latest = uploads[0];
      setRefQuestionUrl(latest.questionPaperUrl);
      setRefAnswerKeyUrl(latest.answerKeyUrl);
      const imagesByMime = (latest.answerPapers || [])
        .filter(ref => (ref.mimeType || '').startsWith('image/'))
        .map(ref => ref.url);
      const imagesByName = latest.answerPaperUrls.filter(u => /\.(png|jpg|jpeg|gif|webp)$/i.test(u));
      const images = imagesByMime.length > 0 ? imagesByMime : imagesByName;
      // Prefer a PDF answer paper if present
      const pdfByMime = (latest.answerPapers || []).find(ref => (ref.mimeType || '') === 'application/pdf');
      const pdfByName = latest.answerPaperUrls.find(u => /\.pdf$/i.test(u));
      const pdfUrl = pdfByMime?.url || pdfByName;
      if (images.length > 0) {
        setAnswerImageUrls(images);
        setTotalPages(images.length);
        // Reset navigation to first page of the uploaded answer set
        setCurrentPage(1);
        setViewedPages(new Set([1]));
      }
      if (pdfUrl) {
        setAnswerPdfUrl(pdfUrl);
        // Keep totalPages as default (42) unless images provided; PDF viewer handles its own pages
        setCurrentPage(1);
        setViewedPages(new Set([1]));
      }
    }
  };

  const initializePapers = () => {
    // Generate mock papers for the section
    const mockPapers: PaperData[] = [];
    for (let i = 1; i <= 70; i++) {
      mockPapers.push({
        id: `${sectionId}-${i}`,
        studentName: `Student ${i}`,
        rollNumber: `${sectionId}${i.toString().padStart(3, "0")}`,
        answerSheetUrl: mockAnswerSheetUrl,
        totalMarks: 100,
        obtainedMarks: 0,
        questionMarks: {},
        isGraded: Math.random() > 0.7, // Some papers already graded
        timeSpent: 0,
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

    // 5 questions of 16 marks each (with optional parts)
    for (let i = 11; i <= 15; i++) {
      mockQuestions.push({
        id: `q${i}`,
        number: i,
        maxMarks: 16,
        allocatedMarks: 0,
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

  const updateQuestionMarks = (
    questionId: string,
    marks: number,
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              allocatedMarks: Math.max(
                0,
                Math.min(marks, q.maxMarks),
              ),
            }
          : q,
      ),
    );
  };

  const updateQuestionOption = (
    questionId: string,
    option: "a" | "b" | "not_written",
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              selectedOption: option,
              allocatedMarks:
                option === "not_written" ? 0 : q.allocatedMarks,
            }
          : q,
      ),
    );
  };

  const updateOptionMarks = (
    questionId: string,
    option: "a" | "b",
    marks: number,
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId && q.optionMarks
          ? {
              ...q,
              optionMarks: {
                ...q.optionMarks,
                [option]: Math.max(0, Math.min(marks, 8)),
              },
              allocatedMarks:
                q.selectedOption === option
                  ? Math.max(0, Math.min(marks, 8))
                  : q.allocatedMarks,
            }
          : q,
      ),
    );
  };

  const calculateTotalMarks = () => {
    return questions.reduce(
      (sum, q) => sum + q.allocatedMarks,
      0,
    );
  };

  const savePaperGrading = async () => {
    if (!currentPaper) return;

    setIsSaving(true);

    try {
      const gradingData = {
        paperId: currentPaper.id,
        sectionId,
        studentName: currentPaper.studentName,
        rollNumber: currentPaper.rollNumber,
        questionMarks: questions.reduce(
          (acc, q) => {
            acc[q.id] = q.allocatedMarks;
            return acc;
          },
          {} as { [key: string]: number },
        ),
        totalMarks: currentPaper.totalMarks,
        obtainedMarks: calculateTotalMarks(),
        timeSpent: sessionTime,
        gradedAt: new Date().toISOString(),
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2275d92e/save-grading`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(gradingData),
        },
      );

      if (response.ok) {
        // Update local state
        setPapers((prev) =>
          prev.map((p) =>
            p.id === currentPaper.id
              ? {
                  ...p,
                  isGraded: true,
                  obtainedMarks: calculateTotalMarks(),
                  questionMarks: gradingData.questionMarks,
                  timeSpent: sessionTime,
                }
              : p,
          ),
        );

        toast.success("Paper graded and saved successfully!");

        // Move to next ungraded paper
        const nextUngradedIndex = papers.findIndex(
          (p, index) =>
            index > currentPaperIndex && !p.isGraded,
        );

        if (nextUngradedIndex !== -1) {
          setCurrentPaperIndex(nextUngradedIndex);
          resetQuestionMarks();
        } else {
          toast.info(
            "All papers in this section have been graded!",
          );
        }
      } else {
        throw new Error("Failed to save grading");
      }
    } catch (error) {
      console.log("Save grading error:", error);
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
        selectedOption: q.hasOptions
          ? "not_written"
          : undefined,
        optionMarks: q.hasOptions ? { a: 0, b: 0 } : undefined,
      })),
    );
  };

  const handlePageChange = (newPage: number) => {
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
    }
  };

  const goToNextPaper = () => {
    if (
      currentPaperIndex < papers.length - 1 &&
      allPagesViewed
    ) {
      setCurrentPaperIndex(currentPaperIndex + 1);
      resetQuestionMarks();
      setViewedPages(new Set([1]));
      setCurrentPage(1);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBackToDashboard}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator
                orientation="vertical"
                className="h-6"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Grading: {sectionId}
                </h1>
                <p className="text-sm text-gray-500">
                  Paper {currentPaperIndex + 1} of{" "}
                  {papers.length}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <p className="font-medium text-gray-900">
                  Session Time
                </p>
                <p className="text-blue-600">
                  {formatTime(sessionTime)}
                </p>
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
              <span className="text-sm font-medium">
                Section Progress
              </span>
              <span className="text-sm text-gray-600">
                {progress} / {papers.length} papers graded
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Reference Popup Button */}
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30">
          <Button
            onClick={() =>
              setShowReferencePopup(!showReferencePopup)
            }
            className="rounded-full w-12 h-12 p-0 shadow-lg"
            variant="default"
          >
            {showReferencePopup ? (
              <X className="h-5 w-5" />
            ) : (
              <BookOpen className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Reference Popup */}
        {showReferencePopup && (
          <div className="fixed left-20 top-1/2 transform -translate-y-1/2 z-20 w-96 bg-white rounded-lg shadow-xl border">
            <div className="p-4">
              <Tabs
                value={referenceTab}
                onValueChange={(value) =>
                  setReferenceTab(
                    value as "question" | "answer",
                  )
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="question"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Question Paper
                  </TabsTrigger>
                  <TabsTrigger
                    value="answer"
                    className="flex items-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    Answer Key
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="question" className="mt-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      <h3 className="font-medium">
                        Question Paper
                      </h3>
                      {refQuestionUrl ? (
                        <div className="space-y-2">
                          <a href={refQuestionUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Open uploaded question paper</a>
                          <iframe src={refQuestionUrl} className="w-full h-80 border rounded" />
                        </div>
                      ) : (
                        <div className="text-sm space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Part A (2 marks each)
                          </h4>
                          <div className="mt-2 space-y-1">
                            {Array.from(
                              { length: 10 },
                              (_, i) => (
                                <p
                                  key={i}
                                  className="text-gray-700"
                                >
                                  {i + 1}. Sample question{" "}
                                  {i + 1} topic (2 marks)
                                </p>
                              ),
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Part B (16 marks each)
                          </h4>
                          <div className="mt-2 space-y-2">
                            {Array.from(
                              { length: 5 },
                              (_, i) => (
                                <div
                                  key={i}
                                  className="text-gray-700"
                                >
                                  <p className="font-medium">
                                    {i + 11}. Choose any one:
                                  </p>
                                  <p className="ml-4">
                                    (a) Option A question
                                    detailed description (8
                                    marks)
                                  </p>
                                  <p className="ml-4">
                                    (b) Option B question
                                    detailed description (8
                                    marks)
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="answer" className="mt-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      <h3 className="font-medium">
                        Answer Key
                      </h3>
                      {refAnswerKeyUrl ? (
                        <div className="space-y-2">
                          <a href={refAnswerKeyUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Open uploaded answer key</a>
                          <iframe src={refAnswerKeyUrl} className="w-full h-80 border rounded" />
                        </div>
                      ) : (
                        <div className="text-sm space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Part A Answers
                          </h4>
                          <div className="mt-2 space-y-1">
                            {Array.from(
                              { length: 10 },
                              (_, i) => (
                                <p
                                  key={i}
                                  className="text-gray-700"
                                >
                                  {i + 1}. Expected answer for
                                  question {i + 1}
                                </p>
                              ),
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Part B Answers
                          </h4>
                          <div className="mt-2 space-y-2">
                            {Array.from(
                              { length: 5 },
                              (_, i) => (
                                <div
                                  key={i}
                                  className="text-gray-700"
                                >
                                  <p className="font-medium">
                                    {i + 11}. Model answers:
                                  </p>
                                  <p className="ml-4">
                                    (a) Expected answer for
                                    option A with key points
                                  </p>
                                  <p className="ml-4">
                                    (b) Expected answer for
                                    option B with key points
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Main Content */}
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
                      variant={
                        currentPaper.isGraded
                          ? "default"
                          : "secondary"
                      }
                    >
                      {currentPaper.isGraded
                        ? "Graded"
                        : "Pending"}
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
                            Question {question.number} (
                            {question.type} - Max:{" "}
                            {question.maxMarks})
                          </Label>

                          {question.hasOptions && (
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">
                                Student attempted:
                              </Label>
                              <Select
                                value={question.selectedOption}
                                onValueChange={(value) =>
                                  updateQuestionOption(
                                    question.id,
                                    value as
                                      | "a"
                                      | "b"
                                      | "not_written",
                                  )
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not_written">
                                    Not Written
                                  </SelectItem>
                                  <SelectItem value="a">
                                    Option A (8 marks)
                                  </SelectItem>
                                  <SelectItem value="b">
                                    Option B (8 marks)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max={
                                question.hasOptions &&
                                question.selectedOption !==
                                  "not_written"
                                  ? 8
                                  : question.maxMarks
                              }
                              value={question.allocatedMarks}
                              onChange={(e) =>
                                updateQuestionMarks(
                                  question.id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-20"
                              disabled={
                                question.hasOptions &&
                                question.selectedOption ===
                                  "not_written"
                              }
                            />
                            <span className="text-sm text-gray-500">
                              /{" "}
                              {question.hasOptions &&
                              question.selectedOption !==
                                "not_written"
                                ? 8
                                : question.maxMarks}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateQuestionMarks(
                                  question.id,
                                  0,
                                )
                              }
                              className="h-8 w-8 p-0"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </div>

                          {question.allocatedMarks >
                            (question.hasOptions &&
                            question.selectedOption !==
                              "not_written"
                              ? 8
                              : question.maxMarks) && (
                            <p className="text-xs text-red-500">
                              Cannot exceed maximum marks
                            </p>
                          )}

                          {question.hasOptions &&
                            question.selectedOption ===
                              "not_written" && (
                              <p className="text-xs text-gray-500 italic">
                                Marked as not written by student
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
                        value={(calculateTotalMarks() / currentPaper.totalMarks) * 100}
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        Percentage: {((calculateTotalMarks() / currentPaper.totalMarks) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <Button
                      onClick={savePaperGrading}
                      disabled={
                        isSaving ||
                        calculateTotalMarks() === 0
                      }
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
                      <li>Mark optional questions properly</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Answer Sheet Display - Main Content */}
            <div className="lg:col-span-3">
            <Card className="h-fit">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
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
                    variant={
                      currentPaper.isGraded
                        ? "default"
                        : "secondary"
                    }
                  >
                    {currentPaper.isGraded
                      ? "Graded"
                      : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setZoomLevel(
                        Math.max(0.5, zoomLevel - 0.1),
                      )
                    }
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setZoomLevel(Math.min(2, zoomLevel + 0.1))
                    }
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {/* Page Navigation */}
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(
                        Math.max(1, currentPage - 1),
                      )
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous Page
                  </Button>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Badge
                      variant={
                        viewedPages.has(currentPage)
                          ? "default"
                          : "secondary"
                      }
                    >
                      {viewedPages.has(currentPage) ? (
                        <Eye className="h-3 w-3 mr-1" />
                      ) : (
                        <EyeOff className="h-3 w-3 mr-1" />
                      )}
                      {viewedPages.has(currentPage)
                        ? "Viewed"
                        : "Not Viewed"}
                    </Badge>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(
                        Math.min(totalPages, currentPage + 1),
                      )
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next Page
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Pages Overview */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      Pages Viewed: {viewedPages.size} /{" "}
                      {totalPages}
                    </span>
                    <Progress
                      value={
                        (viewedPages.size / totalPages) * 100
                      }
                      className="h-2 w-32"
                    />
                  </div>
                  {!allPagesViewed && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        You must view all {totalPages} pages
                        before moving to the next paper.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Answer Sheet PDF Viewer */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <PDFViewer
                    pdfUrl="/answer-sheet.pdf"
                    title="Answer Sheet - Student Submission"
                    externalPage={currentPage}
                    showNavigation={false}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      setViewedPages(prev => new Set([...prev, page]));
                    }}
                    className="border-0"
                  />
                </div>

                {/* Paper Navigation */}
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={goToPreviousPaper}
                    disabled={currentPaperIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous Paper
                  </Button>

                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Paper {currentPaperIndex + 1} of{" "}
                      {papers.length}
                    </p>
                    <p className="text-xs text-gray-500">
                      {papers.filter((p) => p.isGraded).length}{" "}
                      completed
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={goToNextPaper}
                    disabled={
                      currentPaperIndex === papers.length - 1 ||
                      !allPagesViewed
                    }
                    title={
                      !allPagesViewed
                        ? "View all pages before proceeding"
                        : ""
                    }
                  >
                    Next Paper
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Marks Allocation Panel - Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-24">
              {/* Question Paper */}
              <div className="space-y-4">
                <PDFViewer
                  pdfUrl="/question-paper.pdf"
                  title="Question Paper"
                  className="h-fit"
                />
                
                <PDFViewer
                  pdfUrl="/answer-key.pdf"
                  title="Answer Key"
                  className="h-fit"
                />
              </div>

              {/* Current Marks Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Marks Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      Total Marks:
                    </span>
                    <span className="font-semibold">
                      {currentPaper.totalMarks}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Allocated:</span>
                    <span className="font-semibold text-blue-600">
                      {calculateTotalMarks()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Percentage:</span>
                    <span className="font-semibold text-green-600">
                      {(
                        (calculateTotalMarks() /
                          currentPaper.totalMarks) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (calculateTotalMarks() /
                        currentPaper.totalMarks) *
                      100
                    }
                    className="h-2"
                  />
                </CardContent>
              </Card>

              {/* Question-wise Marks */}
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
                            Question {question.number} (
                            {question.type} - Max:{" "}
                            {question.maxMarks})
                          </Label>

                          {question.hasOptions && (
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">
                                Student attempted:
                              </Label>
                              <Select
                                value={question.selectedOption}
                                onValueChange={(value) =>
                                  updateQuestionOption(
                                    question.id,
                                    value as
                                      | "a"
                                      | "b"
                                      | "not_written",
                                  )
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not_written">
                                    Not Written
                                  </SelectItem>
                                  <SelectItem value="a">
                                    Option A (8 marks)
                                  </SelectItem>
                                  <SelectItem value="b">
                                    Option B (8 marks)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max={
                                question.hasOptions &&
                                question.selectedOption !==
                                  "not_written"
                                  ? 8
                                  : question.maxMarks
                              }
                              value={question.allocatedMarks}
                              onChange={(e) =>
                                updateQuestionMarks(
                                  question.id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-20"
                              disabled={
                                question.hasOptions &&
                                question.selectedOption ===
                                  "not_written"
                              }
                            />
                            <span className="text-sm text-gray-500">
                              /{" "}
                              {question.hasOptions &&
                              question.selectedOption !==
                                "not_written"
                                ? 8
                                : question.maxMarks}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateQuestionMarks(
                                  question.id,
                                  0,
                                )
                              }
                              className="h-8 w-8 p-0"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </div>

                          {question.allocatedMarks >
                            (question.hasOptions &&
                            question.selectedOption !==
                              "not_written"
                              ? 8
                              : question.maxMarks) && (
                            <p className="text-xs text-red-500">
                              Cannot exceed maximum marks
                            </p>
                          )}

                          {question.hasOptions &&
                            question.selectedOption ===
                              "not_written" && (
                              <p className="text-xs text-gray-500 italic">
                                Marked as not written by student
                              </p>
                            )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Button
                    onClick={savePaperGrading}
                    disabled={
                      isSaving ||
                      calculateTotalMarks() === 0 ||
                      !allPagesViewed
                    }
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
                </CardContent>
              </Card>

              {/* Grading Guidelines */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Guidelines:</strong>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>
                      Review all {totalPages} pages before
                      finalizing
                    </li>
                    <li>Mark optional questions properly</li>
                    <li>Double-check mark calculations</li>
                    <li>Maximum 60 papers per day</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </div>
      </div>
    </div>
  );
}