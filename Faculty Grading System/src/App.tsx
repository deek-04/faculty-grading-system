import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Alert, AlertDescription } from './components/ui/alert';
import { toast, Toaster } from 'sonner@2.0.3';
import { Camera, Upload, Eye, EyeOff, User, BookOpen, Clock, AlertTriangle, Settings, LogOut, Shield } from 'lucide-react';
import { FacultyRegistration } from './components/faculty-registration';
import { FacultyLogin } from './components/faculty-login';
import { FacultyDashboard } from './components/faculty-dashboard';
import { GradingInterface } from './components/grading-interface';
import { MonitoringSystem } from './components/monitoring-system';
import { AdminLogin } from './components/admin-login';
import { AdminDashboard } from './components/admin-dashboard';
import { NavigationProvider } from './contexts/NavigationContext';
import { RouteGuard } from './components/navigation/RouteGuard';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface User {
  id: string;
  email: string;
  user_metadata: any;
}

interface FacultyData {
  registerNumber: string;
  name: string;
  mobile: string;
  department: string;
  sections: string[];
  profileFaceUrl?: string;
}

// Auth Page Component
function AuthPage({ 
  onFacultyLogin, 
  onAdminLogin, 
  onRegistration 
}: { 
  onFacultyLogin: (user: User, token: string, faculty: FacultyData) => void;
  onAdminLogin: (user: User, token: string, admin: any) => void;
  onRegistration: () => void;
}) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [userType, setUserType] = useState<'faculty' | 'admin'>('faculty');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSuccessfulLogin = (userData: User, token: string, faculty: FacultyData) => {
    onFacultyLogin(userData, token, faculty);
    navigate('/dashboard');
  };

  const handleSuccessfulAdminLogin = (userData: User, token: string, admin: any) => {
    onAdminLogin(userData, token, admin);
    navigate('/admin');
  };

  const handleSuccessfulRegistration = () => {
    onRegistration();
    setAuthMode('login');
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-purple-900 mb-2">Faculty Grading System</h1>
            <p className="text-purple-700">Secure and monitored exam grading platform</p>
          </div>

          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Button 
                  onClick={() => setUserType('faculty')}
                  variant={userType === 'faculty' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  <User className="h-4 w-4 mr-2" />
                  Faculty
                </Button>
                <Button 
                  onClick={() => setUserType('admin')}
                  variant={userType === 'admin' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            {userType === 'admin' ? (
              <CardContent className="pt-6">
                <AdminLogin 
                  onSuccess={handleSuccessfulAdminLogin}
                  loading={loading}
                  setLoading={setLoading}
                />
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'register')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  {authMode === 'login' ? (
                    <FacultyLogin 
                      onSuccess={handleSuccessfulLogin}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  ) : (
                    <FacultyRegistration 
                      onSuccess={handleSuccessfulRegistration}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  )}
                </CardContent>
              </>
            )}
          </Card>

          <div className="mt-6 text-center text-sm text-purple-700">
            <p>⚠️ This system uses face recognition and continuous monitoring</p>
            <p>All activities are logged for security purposes</p>
          </div>
        </div>
      </div>
    </>
  );
}

// Dashboard Page Component
function DashboardPage({ 
  user, 
  facultyData, 
  accessToken, 
  onLogout 
}: { 
  user: User; 
  facultyData: FacultyData; 
  accessToken: string; 
  onLogout: () => void;
}) {
  const navigate = useNavigate();

  const handleStartGrading = (sectionId: string) => {
    navigate(`/grading/${sectionId}`);
    toast.success('Starting grading session...');
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <MonitoringSystem user={user} accessToken={accessToken} />
        <FacultyDashboard 
          user={user}
          facultyData={facultyData}
          onStartGrading={handleStartGrading}
          onLogout={onLogout}
          accessToken={accessToken}
        />
      </div>
    </>
  );
}

// Grading Page Component
function GradingPage({ 
  user, 
  facultyData, 
  accessToken 
}: { 
  user: User; 
  facultyData: FacultyData; 
  accessToken: string;
}) {
  const { sectionId } = useParams<{ sectionId: string }>();

  if (!sectionId) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <MonitoringSystem user={user} accessToken={accessToken} />
        <GradingInterface 
          user={user}
          facultyData={facultyData}
          sectionId={sectionId}
          accessToken={accessToken}
        />
      </div>
    </>
  );
}

// Admin Page Component
function AdminPage({ 
  user, 
  adminData, 
  accessToken, 
  onLogout 
}: { 
  user: User; 
  adminData: any; 
  accessToken: string; 
  onLogout: () => void;
}) {
  console.log('AdminPage rendering with:', { user, adminData, accessToken });
  
  if (!user || !adminData) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-purple-700">Loading admin data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <AdminDashboard 
          user={user}
          adminData={adminData}
          onLogout={onLogout}
          accessToken={accessToken}
        />
      </div>
    </>
  );
}

// Protected Route Component
function ProtectedRoute({ 
  children, 
  isAuthenticated 
}: { 
  children: React.ReactNode; 
  isAuthenticated: boolean;
}) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [facultyData, setFacultyData] = useState<FacultyData | null>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && session.access_token) {
        setUser(session.user);
        setAccessToken(session.access_token);
        await loadFacultyData(session.user.id, session.access_token);
      }
    } catch (error) {
      console.log('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFacultyData = async (userId: string, token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2275d92e/dashboard/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFacultyData(data.faculty);
      }
    } catch (error) {
      console.log('Error loading faculty data:', error);
    }
  };

  const handleFacultyLogin = (userData: User, token: string, faculty: FacultyData) => {
    setUser(userData);
    setAccessToken(token);
    setFacultyData(faculty);
    toast.success('Login successful!');
  };

  const handleAdminLogin = (userData: User, token: string, admin: any) => {
    setUser(userData);
    setAccessToken(token);
    setAdminData(admin);
    toast.success('Admin login successful!');
  };

  const handleRegistration = () => {
    toast.success('Registration successful! Please login to continue.');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
      setFacultyData(null);
      setAdminData(null);
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch (error) {
      console.log('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <NavigationProvider>
        <RouteGuard>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                user ? (
                  adminData ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
                ) : (
                  <AuthPage 
                    onFacultyLogin={handleFacultyLogin}
                    onAdminLogin={handleAdminLogin}
                    onRegistration={handleRegistration}
                  />
                )
              } 
            />

            {/* Protected Faculty Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute isAuthenticated={!!user && !!facultyData}>
                  <DashboardPage 
                    user={user!}
                    facultyData={facultyData!}
                    accessToken={accessToken!}
                    onLogout={handleLogout}
                  />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/grading/:sectionId" 
              element={
                <ProtectedRoute isAuthenticated={!!user && !!facultyData}>
                  <GradingPage 
                    user={user!}
                    facultyData={facultyData!}
                    accessToken={accessToken!}
                  />
                </ProtectedRoute>
              } 
            />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute isAuthenticated={!!user && !!adminData}>
                  <AdminPage 
                    user={user!}
                    adminData={adminData!}
                    accessToken={accessToken!}
                    onLogout={handleLogout}
                  />
                </ProtectedRoute>
              } 
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RouteGuard>
      </NavigationProvider>
    </Router>
  );
}
