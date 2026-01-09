import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner@2.0.3';
import { 
  Shield, 
  LogOut,
  GraduationCap,
  FileText,
  Users,
  BookOpen,
  Upload,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Plus,
  Menu,
  X,
  BarChart3
} from 'lucide-react';
import { demoStore } from '../utils/demo-store';

interface AdminDashboardProps {
  user: any;
  adminData: any;
  onLogout: () => void;
  accessToken: string;
}

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  mobile: string;
  sections: string[];
}

interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
}

interface Paper {
  id: string;
  courseId: string;
  courseName: string;
  questionPaperUrl: string;
  answerKeyUrl: string;
  assignedFaculty: string;
  status: 'pending' | 'in_progress' | 'completed';
  totalPapers: number;
  gradedPapers: number;
}

export function AdminDashboard({ 
  user, 
  adminData, 
  onLogout, 
  accessToken 
}: AdminDashboardProps) {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('papers');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // 256px = w-64
  const [isResizing, setIsResizing] = useState(false);

  // Handle sidebar resize
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  
  // Dialog states
  const [addFacultyOpen, setAddFacultyOpen] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [uploadPaperOpen, setUploadPaperOpen] = useState(false);
  
  // Form states
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    mobile: '',
    registerNumber: ''
  });
  
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    department: ''
  });

  // Upload dialog state
  const [uploadCourseId, setUploadCourseId] = useState<string>('');
  const [uploadQuestionFile, setUploadQuestionFile] = useState<File | null>(null);
  const [uploadAnswerFiles, setUploadAnswerFiles] = useState<FileList | null>(null);
  const [uploadAnswerKeyFile, setUploadAnswerKeyFile] = useState<File | null>(null);
  const [uploadFacultyId, setUploadFacultyId] = useState<string>('');
  
  // Excel upload state
  const [uploadExcelOpen, setUploadExcelOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    loadData();
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    // Fetch real faculty data from backend
    try {
      const response = await fetch('http://localhost:5000/api/admin/faculties');
      const data = await response.json();
      
      if (data.success) {
        // Transform backend data to match frontend interface
        const facultyList = data.data.map((f: any) => ({
          id: f._id,
          name: f.name,
          email: f.email,
          department: f.department,
          mobile: f.mobile || 'N/A',
          sections: [], // Not used anymore
          assignedPapers: f.assignedPapers || 0,
          correctedPapers: f.correctedPapers || 0,
          pendingPapers: f.pendingPapers || 0,
          employeeId: f.employeeId,
          status: f.status
        }));
        setFaculty(facultyList);
      }
    } catch (error) {
      console.log('Error loading faculty:', error);
      // Fallback to empty array
      setFaculty([]);
    }
    
    // Fetch real assignments data
    try {
      const assignmentsResponse = await fetch('http://localhost:5000/api/admin/assignments');
      const assignmentsData = await assignmentsResponse.json();
      
      if (assignmentsData.success) {
        // Group assignments by course
        const courseMap = new Map();
        assignmentsData.data.forEach((assignment: any) => {
          if (!courseMap.has(assignment.courseCode)) {
            courseMap.set(assignment.courseCode, {
              id: assignment.courseCode,
              name: assignment.courseCode,
              code: assignment.courseCode,
              department: 'N/A'
            });
          }
        });
        setCourses(Array.from(courseMap.values()));
        
        // Set papers data (assignments grouped by course)
        const papersMap = new Map();
        assignmentsData.data.forEach((assignment: any) => {
          const key = `${assignment.courseCode}-${assignment.facultyEmployeeId}`;
          if (!papersMap.has(key)) {
            papersMap.set(key, {
              id: key,
              courseId: assignment.courseCode,
              courseName: assignment.courseCode,
              questionPaperUrl: '',
              answerKeyUrl: '',
              assignedFaculty: assignment.facultyName,
              status: assignment.status,
              totalPapers: 0,
              gradedPapers: 0
            });
          }
          const paper = papersMap.get(key);
          paper.totalPapers++;
          if (assignment.status === 'completed') {
            paper.gradedPapers++;
          }
        });
        setPapers(Array.from(papersMap.values()));
      }
    } catch (error) {
      console.log('Error loading assignments:', error);
    }
  };

  const handleAddFaculty = async () => {
    if (!newFaculty.name || !newFaculty.email || !newFaculty.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real app, this would be an API call
    toast.success('Faculty added successfully');
    setAddFacultyOpen(false);
    setNewFaculty({
      name: '',
      email: '',
      password: '',
      department: '',
      mobile: '',
      registerNumber: ''
    });
    loadData();
  };

  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real app, this would be an API call
    toast.success('Course added successfully');
    setAddCourseOpen(false);
    setNewCourse({
      name: '',
      code: '',
      department: ''
    });
    loadData();
  };

  const handleUploadPaper = async () => {
    if (!uploadCourseId) {
      toast.error('Select a course');
      return;
    }
    if (!uploadQuestionFile && !uploadAnswerFiles && !uploadAnswerKeyFile) {
      toast.error('Add at least one file');
      return;
    }

    try {
      // Convert files to object URLs for demo usage
      const questionUrl = uploadQuestionFile ? URL.createObjectURL(uploadQuestionFile) : undefined;
      const answerKeyUrl = uploadAnswerKeyFile ? URL.createObjectURL(uploadAnswerKeyFile) : undefined;
      const answerUrls: string[] = [];
      const answerRefs: { url: string; mimeType: string }[] = [];
      if (uploadAnswerFiles) {
        for (let i = 0; i < uploadAnswerFiles.length; i++) {
          const f = uploadAnswerFiles.item(i)!;
          const url = URL.createObjectURL(f);
          answerUrls.push(url);
          answerRefs.push({ url, mimeType: f.type || '' });
        }
      }

      const course = courses.find(c => c.id === uploadCourseId);
      const courseName = course ? `${course.name}` : 'Selected Course';

      demoStore.addPaper({
        courseId: uploadCourseId,
        courseName,
        assignedFacultyId: uploadFacultyId || undefined,
        questionPaperUrl: questionUrl,
        answerKeyUrl,
        answerPaperUrls: answerUrls,
        answerPapers: answerRefs,
      });

      toast.success('Papers saved for demo. Faculty can view them now.');
      setUploadPaperOpen(false);
      // reset
      setUploadCourseId('');
      setUploadQuestionFile(null);
      setUploadAnswerFiles(null);
      setUploadAnswerKeyFile(null);
      setUploadFacultyId('');
    } catch (e) {
      console.log(e);
      toast.error('Failed to save papers locally');
    }
  };

  const handleUploadExcel = async () => {
    if (!excelFile) {
      toast.error('Please select an Excel file');
      return;
    }

    setUploadingExcel(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', excelFile);

      const response = await fetch('http://localhost:5000/api/admin/assignments/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setUploadResult(data);
        toast.success(`Successfully assigned ${data.assigned} papers!`);
        
        if (data.errors.length > 0) {
          toast.warning(`${data.errors.length} errors occurred`);
        }
      } else {
        toast.error(data.error?.message || 'Upload failed');
        setUploadResult({ success: false, error: data.error });
      }
    } catch (error) {
      console.log('Excel upload error:', error);
      toast.error('Failed to upload Excel file. Make sure backend is running.');
    } finally {
      setUploadingExcel(false);
    }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Please select an Excel file (.xlsx or .xls)');
        return;
      }
      setExcelFile(file);
      setUploadResult(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const navigationItems = [
    {
      id: 'papers',
      label: 'Papers & Assignments',
      icon: FileText,
      value: 'papers'
    },
    {
      id: 'faculty',
      label: 'Faculty Management',
      icon: Users,
      value: 'faculty'
    },
    {
      id: 'courses',
      label: 'Course Management',
      icon: BookOpen,
      value: 'courses'
    },
    {
      id: 'reports',
      label: 'Correction Reports',
      icon: BarChart3,
      value: 'reports'
    }
  ];

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/reports');
      const data = await response.json();
      if (data.success) {
        // Group reports by employeeId and keep only the latest one for each faculty
        const latestReports = data.data.reduce((acc: any[], report: any) => {
          const existingIndex = acc.findIndex(r => r.employeeId === report.employeeId);
          
          if (existingIndex === -1) {
            // No report for this faculty yet, add it
            acc.push(report);
          } else {
            // Compare dates and keep the latest one
            const existingDate = new Date(acc[existingIndex].generatedAt);
            const currentDate = new Date(report.generatedAt);
            
            if (currentDate > existingDate) {
              acc[existingIndex] = report;
            }
          }
          
          return acc;
        }, []);
        
        // Sort by generated date (newest first)
        latestReports.sort((a, b) => 
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
        );
        
        setReports(latestReports);
      }
    } catch (error) {
      console.log('Error loading reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleDownloadReport = (employeeId: string, type: 'detailed' | 'summary') => {
    const url = `http://localhost:5000/api/admin/reports/${employeeId}/download/${type}`;
    window.open(url, '_blank');
    toast.success(`Downloading ${type} report...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform lg:translate-x-0 lg:static lg:inset-0 flex-shrink-0 relative
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarCollapsed ? 'w-20' : ''}
          ${isResizing ? 'transition-none select-none' : 'transition-all duration-300 ease-in-out'}
        `}
        style={{ 
          width: sidebarCollapsed ? '80px' : `${sidebarWidth}px`,
          minWidth: sidebarCollapsed ? '80px' : '200px',
          maxWidth: sidebarCollapsed ? '80px' : '400px'
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Portal</h1>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <Shield className="h-8 w-8 text-blue-600 mx-auto" />
          )}
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden lg:flex"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.value);
                  setSidebarOpen(false); // Close mobile sidebar on selection
                  if (item.value === 'reports') {
                    loadReports(); // Load reports when reports tab is clicked
                  }
                }}
                className={`
                  w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon className={`
                  h-5 w-5 transition-colors duration-200
                  ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                  ${sidebarCollapsed ? '' : 'mr-3'}
                `} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={onLogout} className="w-full" title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Resize Handle */}
        {!sidebarCollapsed && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 hover:w-1.5 transition-all hidden lg:block"
            onMouseDown={handleMouseDown}
            style={{
              background: isResizing ? '#3B82F6' : 'transparent'
            }}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header for mobile */}
        <header className="bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="text-sm text-gray-500">{currentTime.toLocaleString()}</p>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find(item => item.value === activeTab)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{currentTime.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{faculty.length}</div>
                <p className="text-xs text-muted-foreground">Active members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">Active courses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Papers Uploaded</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{papers.length}</div>
                <p className="text-xs text-muted-foreground">Question papers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {papers.reduce((sum, p) => sum + p.gradedPapers, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Papers graded</p>
              </CardContent>
            </Card>
          </div>

          {/* Content based on active tab */}
          <div className="space-y-6">

            {/* Papers Content */}
            {activeTab === 'papers' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Papers & Assignments</CardTitle>
                    <CardDescription>Manage question papers and assignments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={uploadExcelOpen} onOpenChange={setUploadExcelOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Assignment Excel
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Upload Assignment Excel Sheet</DialogTitle>
                          <DialogDescription>
                            Upload an Excel file with faculty-paper assignments
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Alert>
                            <AlertDescription>
                              <strong>Excel Format Required:</strong>
                              <br />
                              Columns: Faculty ID, Paper ID, Course Code, Dummy Number
                              <br />
                              Example: FAC001, PAP001, CS101, CS101-2024-0001
                            </AlertDescription>
                          </Alert>
                          
                          <div>
                            <Label>Select Excel File (.xlsx or .xls)</Label>
                            <Input 
                              type="file" 
                              accept=".xlsx,.xls" 
                              onChange={handleExcelFileChange}
                              disabled={uploadingExcel}
                            />
                            {excelFile && (
                              <p className="text-sm text-gray-600 mt-2">
                                Selected: {excelFile.name}
                              </p>
                            )}
                          </div>

                          {uploadResult && (
                            <Alert className={uploadResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                              <AlertDescription>
                                {uploadResult.success ? (
                                  <div>
                                    <p className="font-semibold text-green-800">
                                      ✅ Successfully assigned {uploadResult.assigned} papers!
                                    </p>
                                    {uploadResult.errors.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-sm text-red-600 font-medium">Errors:</p>
                                        <ul className="text-sm text-red-600 list-disc list-inside">
                                          {uploadResult.errors.slice(0, 5).map((error: string, i: number) => (
                                            <li key={i}>{error}</li>
                                          ))}
                                          {uploadResult.errors.length > 5 && (
                                            <li>... and {uploadResult.errors.length - 5} more errors</li>
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-red-800">
                                    ❌ {uploadResult.error?.message || 'Upload failed'}
                                  </p>
                                )}
                              </AlertDescription>
                            </Alert>
                          )}

                          <Button 
                            onClick={handleUploadExcel} 
                            className="w-full"
                            disabled={!excelFile || uploadingExcel}
                          >
                            {uploadingExcel ? 'Uploading...' : 'Upload Assignments'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={uploadPaperOpen} onOpenChange={setUploadPaperOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Paper
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Question Paper</DialogTitle>
                        <DialogDescription>
                          Upload question paper, answer papers, and answer key
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Select Course</Label>
                          <Select value={uploadCourseId} onValueChange={setUploadCourseId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses.map(course => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.name} ({course.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Question Paper</Label>
                          <Input type="file" accept="application/pdf" onChange={(e) => setUploadQuestionFile(e.target.files?.[0] || null)} />
                        </div>
                        <div>
                          <Label>Answer Papers (PDF or Images)</Label>
                          <Input type="file" accept="application/pdf,image/*" multiple onChange={(e) => setUploadAnswerFiles(e.target.files)} />
                        </div>
                        <div>
                          <Label>Answer Key</Label>
                          <Input type="file" accept="application/pdf" onChange={(e) => setUploadAnswerKeyFile(e.target.files?.[0] || null)} />
                        </div>
                        <div>
                          <Label>Assign to Faculty</Label>
                          <Select value={uploadFacultyId} onValueChange={setUploadFacultyId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select faculty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mock-faculty-1">Demo Faculty</SelectItem>
                              {faculty.map(f => (
                                <SelectItem key={f.id} value={f.id}>
                                  {f.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleUploadPaper} className="w-full">
                          Save for Demo
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Assigned Faculty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {papers.map(paper => (
                      <TableRow key={paper.id}>
                        <TableCell>
                          <div className="font-medium">{paper.courseName}</div>
                        </TableCell>
                        <TableCell>{paper.assignedFaculty}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(paper.status)}>
                            {paper.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {paper.gradedPapers}/{paper.totalPapers}
                            </span>
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600"
                                style={{ width: `${(paper.gradedPapers / paper.totalPapers) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            )}

            {/* Faculty Content */}
            {activeTab === 'faculty' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Faculty Management</CardTitle>
                    <CardDescription>Manage faculty members</CardDescription>
                  </div>
                  <Dialog open={addFacultyOpen} onOpenChange={setAddFacultyOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Faculty
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Faculty</DialogTitle>
                        <DialogDescription>
                          Register a new faculty member
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Name *</Label>
                          <Input 
                            value={newFaculty.name}
                            onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input 
                            type="email"
                            value={newFaculty.email}
                            onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Password *</Label>
                          <Input 
                            type="password"
                            value={newFaculty.password}
                            onChange={(e) => setNewFaculty({...newFaculty, password: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Register Number</Label>
                          <Input 
                            value={newFaculty.registerNumber}
                            onChange={(e) => setNewFaculty({...newFaculty, registerNumber: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Department</Label>
                          <Input 
                            value={newFaculty.department}
                            onChange={(e) => setNewFaculty({...newFaculty, department: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Mobile</Label>
                          <Input 
                            value={newFaculty.mobile}
                            onChange={(e) => setNewFaculty({...newFaculty, mobile: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleAddFaculty} className="w-full">
                          Add Faculty
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faculty.map(f => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.name}</TableCell>
                        <TableCell>{f.email}</TableCell>
                        <TableCell>{f.department}</TableCell>
                        <TableCell>{f.mobile}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            )}

            {/* Courses Content */}
            {activeTab === 'courses' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Course Management</CardTitle>
                    <CardDescription>Manage courses</CardDescription>
                  </div>
                  <Dialog open={addCourseOpen} onOpenChange={setAddCourseOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Course</DialogTitle>
                        <DialogDescription>
                          Register a new course
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Course Name *</Label>
                          <Input 
                            value={newCourse.name}
                            onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Course Code *</Label>
                          <Input 
                            value={newCourse.code}
                            onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Department</Label>
                          <Input 
                            value={newCourse.department}
                            onChange={(e) => setNewCourse({...newCourse, department: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleAddCourse} className="w-full">
                          Add Course
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map(course => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>{course.department}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            )}

            {/* Reports Content */}
            {activeTab === 'reports' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Generated Reports</CardTitle>
                    <CardDescription>Download faculty correction reports</CardDescription>
                  </div>
                  <Button onClick={loadReports} disabled={loadingReports}>
                    {loadingReports ? 'Loading...' : 'Refresh Reports'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingReports ? (
                  <div className="text-center py-8 text-gray-500">Loading reports...</div>
                ) : reports.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No reports generated yet. Reports are automatically created when faculty complete all assigned papers.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faculty Name</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Papers Corrected</TableHead>
                        <TableHead>Generated Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map(report => (
                        <TableRow key={report._id}>
                          <TableCell className="font-medium">{report.facultyName}</TableCell>
                          <TableCell>{report.employeeId}</TableCell>
                          <TableCell>{report.totalPapers}</TableCell>
                          <TableCell>{new Date(report.generatedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleDownloadReport(report.employeeId, 'detailed')}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Detailed
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDownloadReport(report.employeeId, 'summary')}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Summary
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            )}

            {/* Faculty Progress Overview */}
            {activeTab === 'reports' && reports.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Faculty Progress Overview</CardTitle>
                <CardDescription>Current grading status for all faculty</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faculty Name</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faculty.map((f: any) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.name}</TableCell>
                        <TableCell>{f.employeeId}</TableCell>
                        <TableCell>{f.assignedPapers || 0}</TableCell>
                        <TableCell className="text-green-600">{f.correctedPapers || 0}</TableCell>
                        <TableCell className="text-orange-600">{f.pendingPapers || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600"
                                style={{ 
                                  width: `${f.assignedPapers > 0 ? (f.correctedPapers / f.assignedPapers) * 100 : 0}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {f.assignedPapers > 0 ? Math.round((f.correctedPapers / f.assignedPapers) * 100) : 0}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            )}

            {/* Old Reports Content - Remove this section */}
            {false && activeTab === 'reports' && (
            <Card>
              <CardHeader>
                <CardTitle>Correction Reports</CardTitle>
                <CardDescription>View and manage faculty grading progress</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Papers Graded</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {papers.map(paper => (
                      <TableRow key={paper.id}>
                        <TableCell className="font-medium">{paper.courseName}</TableCell>
                        <TableCell>{paper.assignedFaculty}</TableCell>
                        <TableCell>
                          {paper.gradedPapers}/{paper.totalPapers}
                        </TableCell>
                        <TableCell>Today at 14:30</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Report
                            </Button>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


