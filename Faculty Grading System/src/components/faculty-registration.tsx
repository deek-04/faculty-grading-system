import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { Camera, Upload, X, Plus } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface FacultyRegistrationProps {
  onSuccess: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function FacultyRegistration({ onSuccess, loading, setLoading }: FacultyRegistrationProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    registerNumber: '',
    name: '',
    mobile: '',
    department: ''
  });
  const [sections, setSections] = useState<string[]>([]);
  const [newSection, setNewSection] = useState('');
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [faceImagePreview, setFaceImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const departments = [
    'Computer Science Engineering',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Information Technology',
    'Chemical Engineering',
    'Biotechnology'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.registerNumber) newErrors.registerNumber = 'Register number is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Invalid mobile number';
    
    if (!formData.department) newErrors.department = 'Department is required';
    if (sections.length === 0) newErrors.sections = 'At least one section is required';
    if (!faceImage) newErrors.faceImage = 'Face capture is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSection = () => {
    if (newSection.trim() && !sections.includes(newSection.trim())) {
      setSections(prev => [...prev, newSection.trim()]);
      setNewSection('');
      if (errors.sections) {
        setErrors(prev => ({ ...prev, sections: '' }));
      }
    }
  };

  const removeSection = (section: string) => {
    setSections(prev => prev.filter(s => s !== section));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
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
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'face-capture.jpg', { type: 'image/jpeg' });
            setFaceImage(file);
            setFaceImagePreview(URL.createObjectURL(blob));
            stopCamera();
            if (errors.faceImage) {
              setErrors(prev => ({ ...prev, faceImage: '' }));
            }
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFaceImage(file);
      setFaceImagePreview(URL.createObjectURL(file));
      if (errors.faceImage) {
        setErrors(prev => ({ ...prev, faceImage: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors and try again');
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('facultyData', JSON.stringify({
        registerNumber: formData.registerNumber,
        name: formData.name,
        mobile: formData.mobile,
        department: formData.department,
        sections
      }));
      formDataToSend.append('faceImage', faceImage!);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2275d92e/register`,
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
        onSuccess();
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.log('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
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
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>

        <div>
          <Label htmlFor="registerNumber">Register Number</Label>
          <Input
            id="registerNumber"
            value={formData.registerNumber}
            onChange={(e) => handleInputChange('registerNumber', e.target.value)}
            className={errors.registerNumber ? 'border-red-500' : ''}
          />
          {errors.registerNumber && <p className="text-sm text-red-500 mt-1">{errors.registerNumber}</p>}
        </div>

        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            id="mobile"
            value={formData.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            className={errors.mobile ? 'border-red-500' : ''}
          />
          {errors.mobile && <p className="text-sm text-red-500 mt-1">{errors.mobile}</p>}
        </div>

        <div>
          <Label htmlFor="department">Department</Label>
          <Select onValueChange={(value) => handleInputChange('department', value)}>
            <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
        </div>
      </div>

      {/* Sections */}
      <div>
        <Label>Teaching Sections</Label>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Enter section (e.g., CSE-A)"
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSection())}
          />
          <Button type="button" onClick={addSection} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {sections.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {sections.map((section) => (
              <Badge key={section} variant="secondary" className="flex items-center gap-1">
                {section}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeSection(section)}
                />
              </Badge>
            ))}
          </div>
        )}
        {errors.sections && <p className="text-sm text-red-500 mt-1">{errors.sections}</p>}
      </div>

      {/* Face Capture */}
      <div>
        <Label>Face Capture</Label>
        <div className="mt-2 space-y-4">
          {!faceImagePreview ? (
            <div className="space-y-2">
              {!isCameraActive ? (
                <div className="flex gap-2">
                  <Button type="button" onClick={startCamera} variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Use Camera
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
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
                    className="w-full max-w-md rounded-lg border"
                  />
                  <div className="flex gap-2">
                    <Button type="button" onClick={capturePhoto}>
                      Capture Photo
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
                src={faceImagePreview} 
                alt="Face capture" 
                className="w-full max-w-md rounded-lg border"
              />
              <Button 
                type="button" 
                onClick={() => {
                  setFaceImage(null);
                  setFaceImagePreview(null);
                }} 
                variant="outline"
              >
                Retake Photo
              </Button>
            </div>
          )}
        </div>
        {errors.faceImage && <p className="text-sm text-red-500 mt-1">{errors.faceImage}</p>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </Button>

      <Alert>
        <AlertDescription>
          ⚠️ Your face image will be used for secure authentication and monitoring during grading sessions.
        </AlertDescription>
      </Alert>
    </form>
  );
}