import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Camera, Upload, Eye, EyeOff, CreditCard } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface FacultyLoginProps {
  onSuccess: (user: any, token: string, facultyData: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function FacultyLogin({ onSuccess, loading, setLoading }: FacultyLoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginFaceImage, setLoginFaceImage] = useState<File | null>(null);
  const [loginFacePreview, setLoginFacePreview] = useState<string | null>(null);
  const [idCardImage, setIdCardImage] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<'credentials' | 'verification'>('credentials');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraType, setCameraType] = useState<'face' | 'idcard' | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceFileInputRef = useRef<HTMLInputElement>(null);
  const idFileInputRef = useRef<HTMLInputElement>(null);

  const validateCredentials = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVerification = () => {
    const newErrors: Record<string, string> = {};
    
    if (!loginFaceImage) newErrors.loginFaceImage = 'Face verification is required';
    if (!idCardImage) newErrors.idCardImage = 'ID card scan is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const startCamera = async (type: 'face' | 'idcard') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setCameraType(type);
      }
    } catch (error) {
      toast.error('Unable to access camera');
      console.log('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      setCameraType(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraType) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `${cameraType}-capture.jpg`, { type: 'image/jpeg' });
            
            if (cameraType === 'face') {
              setLoginFaceImage(file);
              setLoginFacePreview(URL.createObjectURL(blob));
              if (errors.loginFaceImage) {
                setErrors(prev => ({ ...prev, loginFaceImage: '' }));
              }
            } else {
              setIdCardImage(file);
              setIdCardPreview(URL.createObjectURL(blob));
              if (errors.idCardImage) {
                setErrors(prev => ({ ...prev, idCardImage: '' }));
              }
            }
            
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'face' | 'idcard') => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (type === 'face') {
        setLoginFaceImage(file);
        setLoginFacePreview(URL.createObjectURL(file));
        if (errors.loginFaceImage) {
          setErrors(prev => ({ ...prev, loginFaceImage: '' }));
        }
      } else {
        setIdCardImage(file);
        setIdCardPreview(URL.createObjectURL(file));
        if (errors.idCardImage) {
          setErrors(prev => ({ ...prev, idCardImage: '' }));
        }
      }
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCredentials()) {
      return;
    }

    setLoading(true);
    
    try {
      // Check if it's one of our faculty members (using email as username)
      const facultyCredentials: Record<string, { password: string; employeeId: string }> = {
        'rajesh.kumar@university.edu': { password: 'fac001', employeeId: 'FAC001' },
        'priya.sharma@university.edu': { password: 'fac002', employeeId: 'FAC002' },
        'amit.patel@university.edu': { password: 'fac003', employeeId: 'FAC003' },
        'sneha.reddy@university.edu': { password: 'fac004', employeeId: 'FAC004' },
        'vikram.singh@university.edu': { password: 'fac005', employeeId: 'FAC005' },
        'faculty@example.com': { password: 'password123', employeeId: 'FAC001' } // Demo account
      };

      const email = formData.email.trim().toLowerCase();
      const credentials = facultyCredentials[email];

      console.log('Login attempt:', { email, hasCredentials: !!credentials, passwordMatch: credentials && formData.password === credentials.password });

      if (credentials && formData.password === credentials.password) {
        // Valid faculty login - fetch their data from backend
        try {
          const response = await fetch(`/api/faculty/${credentials.employeeId}/profile`);
          const data = await response.json();

          if (data.success) {
            const faculty = data.data;
            const mockUser = { id: faculty._id, email: faculty.email };
            const mockToken = `token-${credentials.employeeId}`;
            const facultyData = {
              userId: faculty._id,
              name: faculty.name,
              registerNumber: faculty.employeeId,
              employeeId: faculty.employeeId,
              mobile: '9000000000',
              department: faculty.department,
              email: faculty.email,
              status: faculty.status,
              assignedPapers: faculty.assignedPapers,
              correctedPapers: faculty.correctedPapers,
              pendingPapers: faculty.pendingPapers
            };
            toast.success(`Welcome ${faculty.name}!`);
            onSuccess(mockUser, mockToken, facultyData);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('Backend fetch error:', error);
          // If backend fails, create mock data
          const mockUser = { id: `mock-${credentials.employeeId}`, email: email };
          const mockToken = `token-${credentials.employeeId}`;
          const facultyData = {
            userId: `mock-${credentials.employeeId}`,
            name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            registerNumber: credentials.employeeId,
            employeeId: credentials.employeeId,
            mobile: '9000000000',
            department: 'Computer Science',
            email: email,
            status: 'verified',
            assignedPapers: 0,
            correctedPapers: 0,
            pendingPapers: 0
          };
          toast.success(`Welcome! (Backend unavailable, using demo mode)`);
          onSuccess(mockUser, mockToken, facultyData);
          setLoading(false);
          return;
        }
      }

      // Try remote authentication
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2275d92e/login-simple`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        const dashboardResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2275d92e/dashboard/${data.user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${data.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          onSuccess(data.user, data.accessToken, dashboardData.faculty);
        } else {
          throw new Error('Failed to load faculty data');
        }
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.log('Login error:', error);
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateVerification()) {
      toast.error('Please complete face and ID card verification');
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('loginFaceImage', loginFaceImage!);
      formDataToSend.append('idCardImage', idCardImage!);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2275d92e/login-verify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: formDataToSend
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Get faculty data from dashboard endpoint
        const dashboardResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2275d92e/dashboard/${data.user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${data.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          onSuccess(data.user, data.accessToken, dashboardData.faculty);
        } else {
          throw new Error('Failed to load faculty data');
        }
      } else {
        toast.error(data.error || 'Login failed');
        if (data.anomalies && data.anomalies.length > 0) {
          toast.error(`Verification issues: ${data.anomalies.join(', ')}`);
        }
      }
    } catch (error) {
      console.log('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'credentials') {
    return (
      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={errors.password ? 'border-red-500' : ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <Alert>
          <AlertDescription>
            ⚠️ Verification is temporarily disabled. Enter your credentials to login directly.
          </AlertDescription>
        </Alert>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerificationSubmit} className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Identity Verification</h3>
        <p className="text-sm text-gray-600">Complete face and ID card verification to login</p>
      </div>

      {/* Face Verification */}
      <div>
        <Label>Face Verification</Label>
        <div className="mt-2 space-y-4">
          {!loginFacePreview ? (
            <div className="space-y-2">
              {!isCameraActive || cameraType !== 'face' ? (
                <div className="flex gap-2">
                  <Button type="button" onClick={() => startCamera('face')} variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Use Camera
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => faceFileInputRef.current?.click()} 
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    className="w-full max-w-sm rounded-lg border"
                  />
                  <div className="flex gap-2">
                    <Button type="button" onClick={capturePhoto}>
                      Capture Face
                    </Button>
                    <Button type="button" onClick={stopCamera} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <img 
                src={loginFacePreview} 
                alt="Face verification" 
                className="w-full max-w-sm rounded-lg border"
              />
              <Badge variant="secondary" className="text-green-600">Face Captured ✓</Badge>
              <Button 
                type="button" 
                onClick={() => {
                  setLoginFaceImage(null);
                  setLoginFacePreview(null);
                }} 
                variant="outline"
                size="sm"
              >
                Retake
              </Button>
            </div>
          )}
        </div>
        {errors.loginFaceImage && <p className="text-sm text-red-500 mt-1">{errors.loginFaceImage}</p>}
      </div>

      {/* ID Card Verification */}
      <div>
        <Label>ID Card Verification</Label>
        <div className="mt-2 space-y-4">
          {!idCardPreview ? (
            <div className="space-y-2">
              {!isCameraActive || cameraType !== 'idcard' ? (
                <div className="flex gap-2">
                  <Button type="button" onClick={() => startCamera('idcard')} variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Scan ID Card
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => idFileInputRef.current?.click()} 
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload ID Card
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    className="w-full max-w-sm rounded-lg border"
                  />
                  <div className="flex gap-2">
                    <Button type="button" onClick={capturePhoto}>
                      Capture ID Card
                    </Button>
                    <Button type="button" onClick={stopCamera} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <img 
                src={idCardPreview} 
                alt="ID card verification" 
                className="w-full max-w-sm rounded-lg border"
              />
              <Badge variant="secondary" className="text-green-600">ID Card Captured ✓</Badge>
              <Button 
                type="button" 
                onClick={() => {
                  setIdCardImage(null);
                  setIdCardPreview(null);
                }} 
                variant="outline"
                size="sm"
              >
                Retake
              </Button>
            </div>
          )}
        </div>
        {errors.idCardImage && <p className="text-sm text-red-500 mt-1">{errors.idCardImage}</p>}
      </div>

      <div className="flex gap-2">
        <Button 
          type="button" 
          onClick={() => setCurrentStep('credentials')} 
          variant="outline"
          className="w-full"
        >
          Back
        </Button>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Verifying...' : 'Login'}
        </Button>
      </div>

      <input
        ref={faceFileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileUpload(e, 'face')}
        className="hidden"
      />
      <input
        ref={idFileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileUpload(e, 'idcard')}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      <Alert>
        <AlertDescription>
          ⚠️ Both face and ID card verification are required for secure login. All verification attempts are logged.
        </AlertDescription>
      </Alert>
    </form>
  );
}