const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'Faculty Grading System/build')));

// API Routes
app.use('/api', require('./backend/src/routes/faculty'));
app.use('/api/admin', require('./backend/src/routes/admin'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Faculty Grading System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API test endpoints for demo
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    endpoints: [
      '/health',
      '/api/faculty/:id/assignments',
      '/api/admin/dashboard'
    ]
  });
});

// Mock data endpoints for demo (when database is not connected)
app.get('/api/faculty/:id/assignments', (req, res) => {
  const mockAssignments = [
    {
      _id: '1',
      paperId: 'PAPER001',
      dummyNumber: 'D001',
      courseCode: 'CS101',
      status: 'pending',
      paperFilename: 'answer-sheet-1.pdf'
    },
    {
      _id: '2', 
      paperId: 'PAPER002',
      dummyNumber: 'D002',
      courseCode: 'CS101',
      status: 'pending',
      paperFilename: 'answer-sheet-2.pdf'
    }
  ];
  
  res.json({
    success: true,
    assignments: mockAssignments,
    message: 'Demo data - replace with real database'
  });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Faculty Grading System/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Faculty Grading System running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});

module.exports = app;