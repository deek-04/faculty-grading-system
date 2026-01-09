import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize storage buckets
const initializeBuckets = async () => {
  const buckets = ['make-2275d92e-faces', 'make-2275d92e-id-cards', 'make-2275d92e-answer-sheets', 'make-2275d92e-snapshots'];
  
  for (const bucketName of buckets) {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false });
    }
  }
};

await initializeBuckets();

// Face Recognition Algorithm
interface FaceComparisonResult {
  match: boolean;
  confidence: number;
  anomalies: string[];
}

const analyzeFaceImage = async (imageBuffer: Uint8Array): Promise<{
  faceCount: number;
  faceDetected: boolean;
  isRealPerson: boolean;
  faceBox?: { x: number; y: number; width: number; height: number };
}> => {
  // Simplified face detection algorithm - in production, use TensorFlow.js or OpenCV
  // This is a mock implementation for demonstration
  const imageSize = imageBuffer.length;
  
  // Basic checks for image validity
  if (imageSize < 1000) {
    return { faceCount: 0, faceDetected: false, isRealPerson: false };
  }
  
  // Mock face detection based on image characteristics
  const hasJPEGHeader = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8;
  const hasPNGHeader = imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50;
  
  if (!hasJPEGHeader && !hasPNGHeader) {
    return { faceCount: 0, faceDetected: false, isRealPerson: false };
  }
  
  // Simulate face detection (in real implementation, use ML models)
  const mockFaceDetection = {
    faceCount: Math.random() > 0.1 ? 1 : Math.random() > 0.8 ? 2 : 0,
    faceDetected: Math.random() > 0.1,
    isRealPerson: Math.random() > 0.05,
    faceBox: { x: 100, y: 100, width: 200, height: 200 }
  };
  
  return mockFaceDetection;
};

const compareFaces = async (image1Buffer: Uint8Array, image2Buffer: Uint8Array): Promise<FaceComparisonResult> => {
  const face1Analysis = await analyzeFaceImage(image1Buffer);
  const face2Analysis = await analyzeFaceImage(image2Buffer);
  
  const anomalies: string[] = [];
  
  if (!face1Analysis.faceDetected || !face2Analysis.faceDetected) {
    anomalies.push('No face detected in one or both images');
  }
  
  if (face1Analysis.faceCount > 1 || face2Analysis.faceCount > 1) {
    anomalies.push('Multiple faces detected');
  }
  
  if (!face1Analysis.isRealPerson || !face2Analysis.isRealPerson) {
    anomalies.push('Photo/artificial face detected');
  }
  
  // Simplified face comparison (in production, use proper face recognition models)
  const similarity = Math.random(); // Mock similarity score
  const confidence = similarity * 100;
  const match = similarity > 0.7 && anomalies.length === 0;
  
  return { match, confidence, anomalies };
};

// Routes

// Faculty Registration
app.post('/make-server-2275d92e/register', async (c) => {
  try {
    const formData = await c.req.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const facultyData = JSON.parse(formData.get('facultyData') as string);
    const faceImage = formData.get('faceImage') as File;
    
    // Create user account
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: facultyData,
      email_confirm: true
    });
    
    if (authError) {
      return c.json({ error: `User creation failed: ${authError.message}` }, 400);
    }
    
    // Store face image
    const faceImageBuffer = new Uint8Array(await faceImage.arrayBuffer());
    const faceFileName = `${userData.user.id}/profile_face.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from('make-2275d92e-faces')
      .upload(faceFileName, faceImageBuffer, { contentType: 'image/jpeg' });
    
    if (uploadError) {
      console.log(`Face image upload error: ${uploadError.message}`);
    }
    
    // Store faculty data in KV store
    await kv.set(`faculty:${userData.user.id}`, {
      ...facultyData,
      userId: userData.user.id,
      faceImagePath: faceFileName,
      createdAt: new Date().toISOString()
    });
    
    return c.json({ 
      success: true, 
      message: 'Faculty registered successfully',
      userId: userData.user.id 
    });
    
  } catch (error) {
    console.log(`Registration error: ${error}`);
    return c.json({ error: `Registration failed: ${error}` }, 500);
  }
});

// Simple Faculty Login (bypasses verification)
app.post('/make-server-2275d92e/login-simple', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      return c.json({ error: `Authentication failed: ${authError.message}` }, 401);
    }
    
    const userId = authData.user.id;
    
    // Log simple login (without verification)
    await kv.set(`login_attempt:${userId}:${Date.now()}`, {
      userId,
      success: true,
      type: 'simple_login',
      verificationBypassed: true,
      timestamp: new Date().toISOString()
    });
    
    return c.json({
      success: true,
      accessToken: authData.session.access_token,
      user: authData.user,
      message: 'Login successful (verification bypassed)'
    });
    
  } catch (error) {
    console.log(`Simple login error: ${error}`);
    return c.json({ error: `Login failed: ${error}` }, 500);
  }
});

// Faculty Login with Face and ID Verification
app.post('/make-server-2275d92e/login-verify', async (c) => {
  try {
    const formData = await c.req.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const loginFaceImage = formData.get('loginFaceImage') as File;
    const idCardImage = formData.get('idCardImage') as File;
    
    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      return c.json({ error: `Authentication failed: ${authError.message}` }, 401);
    }
    
    const userId = authData.user.id;
    
    // Get stored face image
    const { data: profileFaceData } = await supabase.storage
      .from('make-2275d92e-faces')
      .download(`${userId}/profile_face.jpg`);
    
    if (!profileFaceData) {
      return c.json({ error: 'Profile face image not found' }, 404);
    }
    
    // Compare faces
    const loginFaceBuffer = new Uint8Array(await loginFaceImage.arrayBuffer());
    const profileFaceBuffer = new Uint8Array(await profileFaceData.arrayBuffer());
    
    const faceComparison = await compareFaces(profileFaceBuffer, loginFaceBuffer);
    
    if (!faceComparison.match) {
      // Log failed login attempt
      await kv.set(`login_attempt:${userId}:${Date.now()}`, {
        userId,
        success: false,
        reason: 'Face verification failed',
        anomalies: faceComparison.anomalies,
        timestamp: new Date().toISOString()
      });
      
      return c.json({ 
        error: 'Face verification failed',
        anomalies: faceComparison.anomalies 
      }, 403);
    }
    
    // Store login images
    const loginFaceFileName = `${userId}/login_faces/${Date.now()}.jpg`;
    const idCardFileName = `${userId}/id_cards/${Date.now()}.jpg`;
    
    await supabase.storage.from('make-2275d92e-faces').upload(loginFaceFileName, loginFaceBuffer);
    await supabase.storage.from('make-2275d92e-id-cards').upload(idCardFileName, new Uint8Array(await idCardImage.arrayBuffer()));
    
    // Log successful login
    await kv.set(`login_attempt:${userId}:${Date.now()}`, {
      userId,
      success: true,
      faceMatch: true,
      confidence: faceComparison.confidence,
      timestamp: new Date().toISOString()
    });
    
    return c.json({
      success: true,
      accessToken: authData.session.access_token,
      user: authData.user,
      faceMatch: true,
      confidence: faceComparison.confidence
    });
    
  } catch (error) {
    console.log(`Login verification error: ${error}`);
    return c.json({ error: `Login verification failed: ${error}` }, 500);
  }
});

// Start Monitoring Session
app.post('/make-server-2275d92e/start-monitoring', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const sessionId = `session:${user.id}:${Date.now()}`;
    
    await kv.set(sessionId, {
      userId: user.id,
      sessionId,
      startTime: new Date().toISOString(),
      status: 'active',
      anomalies: [],
      snapshots: []
    });
    
    return c.json({ success: true, sessionId });
    
  } catch (error) {
    console.log(`Start monitoring error: ${error}`);
    return c.json({ error: `Failed to start monitoring: ${error}` }, 500);
  }
});

// Process Monitoring Snapshot
app.post('/make-server-2275d92e/process-snapshot', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const formData = await c.req.formData();
    const sessionId = formData.get('sessionId') as string;
    const snapshotImage = formData.get('snapshotImage') as File;
    
    // Get session data
    const sessionData = await kv.get(sessionId);
    if (!sessionData) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    // Get profile face for comparison
    const { data: profileFaceData } = await supabase.storage
      .from('make-2275d92e-faces')
      .download(`${user.id}/profile_face.jpg`);
    
    if (!profileFaceData) {
      return c.json({ error: 'Profile face not found' }, 404);
    }
    
    // Analyze snapshot
    const snapshotBuffer = new Uint8Array(await snapshotImage.arrayBuffer());
    const profileFaceBuffer = new Uint8Array(await profileFaceData.arrayBuffer());
    
    const snapshotAnalysis = await analyzeFaceImage(snapshotBuffer);
    const faceComparison = await compareFaces(profileFaceBuffer, snapshotBuffer);
    
    // Detect anomalies
    const anomalies: string[] = [];
    const timestamp = new Date().toISOString();
    
    if (!snapshotAnalysis.faceDetected) {
      anomalies.push('No face detected');
    } else if (snapshotAnalysis.faceCount > 1) {
      anomalies.push('Multiple faces detected');
    } else if (!snapshotAnalysis.isRealPerson) {
      anomalies.push('Artificial face/photo detected');
    } else if (!faceComparison.match) {
      anomalies.push('Face mismatch detected');
    }
    
    // Store snapshot
    const snapshotFileName = `${user.id}/snapshots/${sessionId}/${Date.now()}.jpg`;
    await supabase.storage.from('make-2275d92e-snapshots').upload(snapshotFileName, snapshotBuffer);
    
    // Update session with new snapshot data
    const updatedSession = {
      ...sessionData,
      lastSnapshot: timestamp,
      snapshots: [...(sessionData.snapshots || []), {
        timestamp,
        fileName: snapshotFileName,
        faceDetected: snapshotAnalysis.faceDetected,
        faceCount: snapshotAnalysis.faceCount,
        isRealPerson: snapshotAnalysis.isRealPerson,
        faceMatch: faceComparison.match,
        confidence: faceComparison.confidence,
        anomalies
      }]
    };
    
    if (anomalies.length > 0) {
      updatedSession.anomalies = [...(sessionData.anomalies || []), {
        timestamp,
        type: anomalies,
        snapshotFile: snapshotFileName
      }];
    }
    
    await kv.set(sessionId, updatedSession);
    
    return c.json({
      success: true,
      anomalies,
      faceMatch: faceComparison.match,
      confidence: faceComparison.confidence,
      analysis: snapshotAnalysis
    });
    
  } catch (error) {
    console.log(`Process snapshot error: ${error}`);
    return c.json({ error: `Failed to process snapshot: ${error}` }, 500);
  }
});

// Get Faculty Dashboard Data
app.get('/make-server-2275d92e/dashboard/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userId = c.req.param('userId');
    const facultyData = await kv.get(`faculty:${userId}`);
    
    if (!facultyData) {
      return c.json({ error: 'Faculty data not found' }, 404);
    }
    
    // Get profile face URL
    const { data: faceUrl } = await supabase.storage
      .from('make-2275d92e-faces')
      .createSignedUrl(`${userId}/profile_face.jpg`, 3600);
    
    return c.json({
      success: true,
      faculty: facultyData,
      profileFaceUrl: faceUrl?.signedUrl
    });
    
  } catch (error) {
    console.log(`Dashboard data error: ${error}`);
    return c.json({ error: `Failed to get dashboard data: ${error}` }, 500);
  }
});

// Save Grading Data
app.post('/make-server-2275d92e/save-grading', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const gradingData = await c.req.json();
    const gradingId = `grading:${user.id}:${gradingData.sectionId}:${gradingData.paperId}:${Date.now()}`;
    
    await kv.set(gradingId, {
      ...gradingData,
      userId: user.id,
      gradingId,
      timestamp: new Date().toISOString()
    });
    
    return c.json({ success: true, gradingId });
    
  } catch (error) {
    console.log(`Save grading error: ${error}`);
    return c.json({ error: `Failed to save grading: ${error}` }, 500);
  }
});

// Generate Monitoring Report
app.get('/make-server-2275d92e/monitoring-report/:sessionId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const sessionId = c.req.param('sessionId');
    const sessionData = await kv.get(sessionId);
    
    if (!sessionData) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    // Generate detailed report
    const report = {
      sessionId,
      userId: user.id,
      startTime: sessionData.startTime,
      endTime: new Date().toISOString(),
      totalSnapshots: sessionData.snapshots?.length || 0,
      totalAnomalies: sessionData.anomalies?.length || 0,
      anomalyDetails: sessionData.anomalies || [],
      snapshotDetails: sessionData.snapshots || [],
      summary: {
        faceMatchFailures: sessionData.anomalies?.filter((a: any) => a.type.includes('Face mismatch detected')).length || 0,
        multipleFaceDetections: sessionData.anomalies?.filter((a: any) => a.type.includes('Multiple faces detected')).length || 0,
        noFaceDetections: sessionData.anomalies?.filter((a: any) => a.type.includes('No face detected')).length || 0,
        artificialFaceDetections: sessionData.anomalies?.filter((a: any) => a.type.includes('Artificial face/photo detected')).length || 0
      }
    };
    
    return c.json({ success: true, report });
    
  } catch (error) {
    console.log(`Monitoring report error: ${error}`);
    return c.json({ error: `Failed to generate report: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);