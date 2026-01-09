import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  User, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  LogOut,
  GraduationCap,
  FileText,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';

interface FacultyDashboardProps {
  user: any;
  facultyData: any;
  onStartGrading: (sectionId: string) => void;
  onLogout: () => void;
  accessToken: string;
}

interface SectionStats {
  totalPapers: number;
  gradedPapers: number;
  remainingPapers: number;
  dailyLimit: number;
  gradedToday: number;
}

export function FacultyDashboard({ 
  user, 
  facultyData, 
  onStartGrading, 
  onLogout, 
  accessToken 
}: FacultyDashboardProps) {
  const [sectionStats, setSectionStats] = useState<Record<string, SectionStats>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentStats, setAssignmentStats] = useState<any>(null);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    initializeSectionStats();
    loadAssignments();
    return () => clearInterval(timer);
  }, []);

  const loadAssignments = async () => {
    if (!facultyData.employeeId && !facultyData.registerNumber) {
      setLoadingAssignments(false);
      return;
    }

    try {
      const employeeId = facultyData.employeeId || facultyData.registerNumber;
      const response = await fetch(`http://localhost:5000/api/faculty/${employeeId}/assignments`);
      const data = await response.json();

      if (data.success) {
        setAssignments(data.assignments);
        setAssignmentStats(data.stats);
      }
    } catch (error) {
      console.log('Error loading assignments:', error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const initializeSectionStats = () => {
    // No longer needed - using real assignment data
    setSectionStats({});
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const canStartGrading = (section: string) => {
    const stats = sectionStats[section];
    return stats && stats.gradedToday < stats.dailyLimit && stats.remainingPapers > 0;
  };

  // Use real assignment data instead of dummy stats
  const totalStats = {
    totalPapers: assignmentStats?.total || 0,
    gradedPapers: assignmentStats?.completed || 0,
    gradedToday: 0, // Remove this dummy metric
    remainingPapers: assignmentStats?.pending || 0
  };

  const overallProgress = totalStats.totalPapers > 0 
    ? (totalStats.gradedPapers / totalStats.totalPapers) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Faculty Grading System</h1>
                <p className="text-sm text-gray-500">{currentTime.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{facultyData.name}</p>
                <p className="text-xs text-gray-500">{facultyData.registerNumber || facultyData.employeeId}</p>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={facultyData.profileFaceUrl} alt={facultyData.name} />
                <AvatarFallback>
                  {facultyData.name?.split(' ').map((n: string) => n[0]).join('') || 'F'}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {facultyData.name?.split(' ')[0] || 'Faculty'}!
          </h2>
          <p className="text-gray-600">
            Department: {facultyData.department || 'N/A'} | Mobile: {facultyData.mobile || 'N/A'}
          </p>
        </div>

        {/* Overall Statistics - Real Data Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalPapers}</div>
              <p className="text-xs text-muted-foreground">
                Assigned to you
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graded Papers</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalStats.gradedPapers}</div>
              <p className="text-xs text-muted-foreground">
                {overallProgress.toFixed(1)}% completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalStats.remainingPapers}</div>
              <p className="text-xs text-muted-foreground">
                Papers to grade
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{overallProgress.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">
                Overall completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress Bar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Progress</span>
                <span className={`font-medium ${getProgressColor(overallProgress)}`}>
                  {overallProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {totalStats.gradedPapers} of {totalStats.totalPapers} papers completed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Papers Section - Single Card with All Papers */}
        {assignments.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Assigned Papers for Correction
                  </CardTitle>
                  <CardDescription>
                    {assignmentStats?.total || assignments.length} papers assigned | {assignmentStats?.completed || 0} completed | {assignmentStats?.pending || assignments.length} pending
                  </CardDescription>
                </div>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  {assignments[0]?.courseCode} - {assignments[0]?.paperMetadata?.courseName}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress Overview */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium text-blue-600">
                    {assignmentStats ? ((assignmentStats.completed / assignmentStats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <Progress 
                  value={assignmentStats ? (assignmentStats.completed / assignmentStats.total) * 100 : 0} 
                  className="h-2" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Graded</p>
                  <p className="font-semibold text-green-600">{assignmentStats?.completed || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Remaining</p>
                  <p className="font-semibold text-orange-600">{assignmentStats?.pending || assignments.length}</p>
                </div>
              </div>

              <Separator />

              {/* Paper List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Papers:</h4>
                <div className="space-y-2">
                  {assignments.map((assignment, index) => (
                    <div 
                      key={assignment._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{assignment.paperFilename}</p>
                          <p className="text-xs text-gray-500">Dummy: {assignment.dummyNumber}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={
                          assignment.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                          assignment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          'bg-gray-100 text-gray-800 border-gray-300'
                        }
                      >
                        {assignment.status === 'pending' ? 'Pending' :
                         assignment.status === 'in_progress' ? 'In Progress' :
                         'Completed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => onStartGrading('papers')}
                className="w-full"
                size="lg"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Start Grading
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Important Notices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Important Notices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Monitoring Active:</strong> Your face is being monitored during grading sessions. 
                Any anomalies will be logged in detailed reports.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertDescription>
                <strong>Daily Limit:</strong> You can grade maximum 60 papers per day per section. 
                This limit resets at midnight.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertDescription>
                <strong>Grading Guidelines:</strong> Ensure proper lighting and clear visibility of answer sheets. 
                All grading activities are timestamped and recorded.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}