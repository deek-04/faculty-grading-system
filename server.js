const express = require('express');
const path = require('path');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://deek04:faculty123@cluster0.mongodb.net/faculty-grading?retryWrites=true&w=majority';

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('faculty-grading');
    console.log('✅ Connected to MongoDB');
    
    // Initialize sample data
    await initializeSampleData();
  } catch (error) {
    console.log('❌ MongoDB connection failed, using mock data:', error.message);
  }
}

// Initialize sample data
async function initializeSampleData() {
  try {
    // Check if data already exists
    const existingAssignments = await db.collection('assignments').countDocuments();
    if (existingAssignments > 0) {
      console.log('📊 Sample data already exists');
      return;
    }

    // Sample faculty data
    const facultyData = [
      {
        employeeId: 'FAC001',
        registerNumber: 'FAC001',
        name: 'Dr. John Smith',
        email: 'john.smith@university.edu',
        department: 'Computer Science',
        sections: ['CS101-A', 'CS101-B']
      },
      {
        employeeId: 'FAC002', 
        registerNumber: 'FAC002',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        department: 'Information Technology',
        sections: ['IT201-A', 'IT201-B']
      }
    ];

    // Sample assignments
    const assignments = [
      {
        _id: 'assignment1',
        paperId: 'PAPER001',
        facultyId: 'FAC001',
        dummyNumber: 'D001',
        studentName: 'Student A',
        courseCode: 'CS101',
        section: 'A',
        status: 'pending',
        paperFilename: 'answer-sheet-1.pdf',
        totalMarks: 100,
        obtainedMarks: 0,
        assignedDate: new Date(),
        submissionDate: null
      },
      {
        _id: 'assignment2',
        paperId: 'PAPER002', 
        facultyId: 'FAC001',
        dummyNumber: 'D002',
        studentName: 'Student B',
        courseCode: 'CS101',
        section: 'A',
        status: 'pending',
        paperFilename: 'answer-sheet-2.pdf',
        totalMarks: 100,
        obtainedMarks: 0,
        assignedDate: new Date(),
        submissionDate: null
      },
      {
        _id: 'assignment3',
        paperId: 'PAPER003',
        facultyId: 'FAC001', 
        dummyNumber: 'D003',
        studentName: 'Student C',
        courseCode: 'CS101',
        section: 'A',
        status: 'completed',
        paperFilename: 'answer-sheet-3.pdf',
        totalMarks: 100,
        obtainedMarks: 85,
        assignedDate: new Date(Date.now() - 86400000), // 1 day ago
        submissionDate: new Date()
      }
    ];

    // Sample correction reports
    const reports = [
      {
        _id: 'report1',
        facultyId: 'FAC001',
        facultyName: 'Dr. John Smith',
        courseCode: 'CS101',
        section: 'A',
        totalPapers: 25,
        completedPapers: 15,
        pendingPapers: 10,
        averageMarks: 78.5,
        completionPercentage: 60,
        lastUpdated: new Date()
      },
      {
        _id: 'report2',
        facultyId: 'FAC002',
        facultyName: 'Dr. Sarah Johnson', 
        courseCode: 'IT201',
        section: 'A',
        totalPapers: 30,
        completedPapers: 25,
        pendingPapers: 5,
        averageMarks: 82.3,
        completionPercentage: 83,
        lastUpdated: new Date()
      }
    ];

    // Insert sample data
    await db.collection('faculty').insertMany(facultyData);
    await db.collection('assignments').insertMany(assignments);
    await db.collection('reports').insertMany(reports);
    
    console.log('✅ Sample data initialized successfully');
  } catch (error) {
    console.log('❌ Failed to initialize sample data:', error.message);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'Faculty Grading System/dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Faculty Grading System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: db ? 'Connected' : 'Disconnected'
  });
});

// API test endpoints
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    database: db ? 'Connected' : 'Using mock data',
    endpoints: [
      '/health',
      '/api/faculty/:id/assignments',
      '/api/admin/dashboard',
      '/api/admin/reports'
    ]
  });
});

// Faculty assignments endpoint
app.get('/api/faculty/:id/assignments', async (req, res) => {
  try {
    const facultyId = req.params.id;
    
    if (db) {
      // Use real database
      const assignments = await db.collection('assignments')
        .find({ facultyId: facultyId })
        .toArray();
      
      res.json({
        success: true,
        assignments: assignments,
        message: `Found ${assignments.length} assignments for faculty ${facultyId}`
      });
    } else {
      // Fallback to mock data
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
        message: 'Using mock data - database not connected'
      });
    }
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments',
      message: error.message
    });
  }
});

// Admin dashboard endpoint
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    if (db) {
      const totalFaculty = await db.collection('faculty').countDocuments();
      const totalAssignments = await db.collection('assignments').countDocuments();
      const completedAssignments = await db.collection('assignments').countDocuments({ status: 'completed' });
      const pendingAssignments = totalAssignments - completedAssignments;
      
      res.json({
        success: true,
        data: {
          totalFaculty,
          totalAssignments,
          completedAssignments,
          pendingAssignments,
          completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments * 100).toFixed(1) : 0
        }
      });
    } else {
      // Mock admin data
      res.json({
        success: true,
        data: {
          totalFaculty: 5,
          totalAssignments: 50,
          completedAssignments: 30,
          pendingAssignments: 20,
          completionRate: 60.0
        },
        message: 'Using mock data - database not connected'
      });
    }
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

// Admin reports endpoint
app.get('/api/admin/reports', async (req, res) => {
  try {
    if (db) {
      const reports = await db.collection('reports').find({}).toArray();
      res.json({
        success: true,
        reports: reports
      });
    } else {
      // Mock reports data
      const mockReports = [
        {
          _id: 'report1',
          facultyName: 'Dr. John Smith',
          courseCode: 'CS101',
          section: 'A',
          totalPapers: 25,
          completedPapers: 15,
          pendingPapers: 10,
          averageMarks: 78.5,
          completionPercentage: 60,
          lastUpdated: new Date()
        },
        {
          _id: 'report2',
          facultyName: 'Dr. Sarah Johnson',
          courseCode: 'IT201', 
          section: 'A',
          totalPapers: 30,
          completedPapers: 25,
          pendingPapers: 5,
          averageMarks: 82.3,
          completionPercentage: 83,
          lastUpdated: new Date()
        }
      ];
      
      res.json({
        success: true,
        reports: mockReports,
        message: 'Using mock data - database not connected'
      });
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Faculty Grading System/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Faculty Grading System running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔌 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
  });
});

module.exports = app;