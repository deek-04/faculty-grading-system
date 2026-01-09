import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Camera, 
  Activity,
  Shield,
  Clock
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface MonitoringSystemProps {
  user: any;
  accessToken: string;
}

interface MonitoringStatus {
  isActive: boolean;
  sessionId: string | null;
  lastSnapshot: Date | null;
  anomalies: string[];
  faceMatch: boolean;
  confidence: number;
  snapshotCount: number;
}

export function MonitoringSystem({ user, accessToken }: MonitoringSystemProps) {
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus>({
    isActive: false,
    sessionId: null,
    lastSnapshot: null,
    anomalies: [],
    faceMatch: true,
    confidence: 0,
    snapshotCount: 0
  });
  const [currentSnapshot, setCurrentSnapshot] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startMonitoring();
    return () => {
      stopMonitoring();
    };
  }, []);

  const startMonitoring = async () => {
    try {
      // Start monitoring session
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2275d92e/start-monitoring`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        setMonitoringStatus(prev => ({
          ...prev,
          isActive: true,
          sessionId: data.sessionId
        }));

        // Start camera
        await initializeCamera();
        
        // Start periodic snapshots (every 30 seconds)
        intervalRef.current = setInterval(() => {
          captureAndProcessSnapshot();
        }, 30000);

        toast.success('Security monitoring started');
      }
    } catch (error) {
      console.log('Monitoring start error:', error);
      toast.error('Failed to start monitoring');
    }
  };

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setMonitoringStatus(prev => ({
      ...prev,
      isActive: false,
      sessionId: null
    }));
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 320, 
          height: 240,
          frameRate: 15
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.log('Camera initialization error:', error);
      toast.error('Camera access required for monitoring');
    }
  };

  const captureAndProcessSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current || !monitoringStatus.sessionId) {
      return;
    }

    try {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      // Capture frame
      canvasRef.current.width = videoRef.current.videoWidth || 320;
      canvasRef.current.height = videoRef.current.videoHeight || 240;
      context.drawImage(videoRef.current, 0, 0);

      // Convert to blob
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('sessionId', monitoringStatus.sessionId!);
        formData.append('snapshotImage', blob, 'snapshot.jpg');

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2275d92e/process-snapshot`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            body: formData
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          // Update monitoring status
          setMonitoringStatus(prev => ({
            ...prev,
            lastSnapshot: new Date(),
            anomalies: data.anomalies || [],
            faceMatch: data.faceMatch,
            confidence: data.confidence,
            snapshotCount: prev.snapshotCount + 1
          }));

          // Update current snapshot display
          setCurrentSnapshot(URL.createObjectURL(blob));

          // Handle anomalies
          if (data.anomalies && data.anomalies.length > 0) {
            const anomalyMessage = `Security Alert: ${data.anomalies.join(', ')}`;
            toast.error(anomalyMessage);
            
            // Log to console for debugging
            console.log('Monitoring anomaly detected:', {
              timestamp: new Date().toISOString(),
              anomalies: data.anomalies,
              faceMatch: data.faceMatch,
              confidence: data.confidence
            });
          }
        }
      }, 'image/jpeg', 0.7);
    } catch (error) {
      console.log('Snapshot processing error:', error);
    }
  };

  const getStatusColor = () => {
    if (!monitoringStatus.isActive) return 'text-gray-500';
    if (monitoringStatus.anomalies.length > 0) return 'text-red-500';
    if (!monitoringStatus.faceMatch) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (!monitoringStatus.isActive) return 'Inactive';
    if (monitoringStatus.anomalies.length > 0) return 'Alert';
    if (!monitoringStatus.faceMatch) return 'Warning';
    return 'Secure';
  };

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentSnapshot || undefined} />
                  <AvatarFallback>
                    <Camera className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                  monitoringStatus.isActive ? 'bg-green-500' : 'bg-gray-400'
                } border-2 border-white`} />
              </div>
              
              <div>
                <p className="text-xs font-medium">Security Monitor</p>
                <p className={`text-xs ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(false)}
                className="h-6 w-6 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 bg-white/95 backdrop-blur-sm border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-sm">Security Monitor</h3>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {/* Live Feed */}
            <div className="relative">
              <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                {currentSnapshot ? (
                  <img 
                    src={currentSnapshot} 
                    alt="Live monitoring" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="absolute top-2 left-2">
                <Badge 
                  variant={monitoringStatus.isActive ? "default" : "secondary"}
                  className={`text-xs ${
                    monitoringStatus.isActive 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : ''
                  }`}
                >
                  <Activity className="h-3 w-3 mr-1" />
                  {monitoringStatus.isActive ? 'LIVE' : 'OFF'}
                </Badge>
              </div>
            </div>

            {/* Status Information */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Status</p>
                <p className={`font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Snapshots</p>
                <p className="font-medium">{monitoringStatus.snapshotCount}</p>
              </div>
              <div>
                <p className="text-gray-500">Face Match</p>
                <p className={`font-medium ${monitoringStatus.faceMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {monitoringStatus.faceMatch ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Confidence</p>
                <p className="font-medium">{monitoringStatus.confidence.toFixed(1)}%</p>
              </div>
            </div>

            {/* Last Update */}
            {monitoringStatus.lastSnapshot && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>
                  Last: {monitoringStatus.lastSnapshot.toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Anomaly Alerts */}
            {monitoringStatus.anomalies.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-xs text-red-800">
                  <strong>Security Alert:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {monitoringStatus.anomalies.map((anomaly, index) => (
                      <li key={index}>{anomaly}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Normal Status */}
            {monitoringStatus.isActive && monitoringStatus.anomalies.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Monitoring secure</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden elements for capture */}
      <video 
        ref={videoRef} 
        className="hidden" 
        autoPlay 
        muted 
        playsInline
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}