import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

interface GradingInterfaceProps {
  user: any;
  facultyData: any;
  sectionId: string;
  onBackToDashboard: () => void;
  accessToken: string;
}

export function GradingInterface({
  user,
  facultyData,
  sectionId,
  onBackToDashboard,
  accessToken,
}: GradingInterfaceProps) {
  const [currentPaperIndex, setCurrentPaperIndex] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [startTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(
        Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [sectionId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Grading: {sectionId}
                </h1>
                <p className="text-sm text-gray-500">
                  Paper {currentPaperIndex + 1} of 70
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

      <div className="w-full mx-auto px-2 py-4">
        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Section Progress</span>
              <span className="text-sm text-gray-600">0 / 70 papers graded</span>
            </div>
            <Progress value={0} className="h-2" />
          </CardContent>
        </Card>

        {/* Temporary Message */}
        <Card>
          <CardHeader>
            <CardTitle>PDF Grading Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                PDF Viewer Loading...
              </h2>
              <p className="text-gray-600 mb-4">
                The PDF viewing functionality is being initialized.
              </p>
              <p className="text-sm text-gray-500">
                This interface will show Question Paper, Answer Sheet, and Answer Key
                with page-by-page navigation once the PDF viewer is ready.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}