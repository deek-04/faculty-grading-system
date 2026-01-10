const express = require('express');
const path = require('path');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Atlas connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://deek04:faculty123@cluster0.mongodb.net/faculty-grading?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('faculty-grading');
    console.log('✅ Connected to MongoDB Atlas');
    
    // Initialize sample data
    await initializeSampleData();
  } catch (error) {
    console.log('❌ MongoDB connection failed, using fallback data:', error.message);
    // Keep fallback data for development
  }
}

// Initialize sample data in MongoDB
async function initializeSampleData() {
  try {
    // Check if data already exists
    const existingAssignments = await db.collection('assignments').countDocuments();
    if (existingAssignments > 0) {
      console.log('📊 Sample data already exists in MongoDB');
      return;
    }

    console.log('🔄 Initializing sample data in MongoDB Atlas...');

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
      },
      {
        employeeId: 'FAC003',
        registerNumber: 'FAC003', 
        name: 'Prof. Michael Brown',
        email: 'michael.brown@university.edu',
        department: 'Mathematics',
        sections: ['MATH101-A', 'MATH101-B']
      }
    ];

    // Sample assignments
    const assignments = [
      {
        _id: 'assignment1',
        paperId: 'PAPER001',
        facultyId: 'FAC001',
        dummyNumber: 'D001',
        studentName: 'Alice Johnson',
        courseCode: 'CS101',
        section: 'A',
        status: 'pending',
        paperFilename: 'answer-sheet-1.pdf',
        totalMarks: 100,
        obtainedMarks: 0,
        assignedDate: new Date('2024-01-15'),
        submissionDate: null
      },
      {
        _id: 'assignment2',
        paperId: 'PAPER002', 
        facultyId: 'FAC001',
        dummyNumber: 'D002',
        studentName: 'Bob Smith',
        courseCode: 'CS101',
        section: 'A',
        status: 'pending',
        paperFilename: 'answer-sheet-2.pdf',
        totalMarks: 100,
        obtainedMarks: 0,
        assignedDate: new Date('2024-01-15'),
        submissionDate: null
      },
      {
        _id: 'assignment3',
        paperId: 'PAPER003',
        facultyId: 'FAC001', 
        dummyNumber: 'D003',
        studentName: 'Carol Davis',
        courseCode: 'CS101',
        section: 'A',
        status: 'completed',
        paperFilename: 'answer-sheet-3.pdf',
        totalMarks: 100,
        obtainedMarks: 85,
        assignedDate: new Date('2024-01-14'),
        submissionDate: new Date('2024-01-16')
      },
      {
        _id: 'assignment4',
        paperId: 'PAPER004',
        facultyId: 'FAC001',
        dummyNumber: 'D004', 
        studentName: 'David Wilson',
        courseCode: 'CS101',
        section: 'A',
        status: 'completed',
        paperFilename: 'answer-sheet-4.pdf',
        totalMarks: 100,
        obtainedMarks: 92,
        assignedDate: new Date('2024-01-14'),
        submissionDate: new Date('2024-01-16')
      },
      {
        _id: 'assignment5',
        paperId: 'PAPER005',
        facultyId: 'FAC002',
        dummyNumber: 'D005',
        studentName: 'Eva Martinez',
        courseCode: 'IT201',
        section: 'A', 
        status: 'pending',
        paperFilename: 'answer-sheet-5.pdf',
        totalMarks: 100,
        obtainedMarks: 0,
        assignedDate: new Date('2024-01-15'),
        submissionDate: null
      },
      {
        _id: 'assignment6',
        paperId: 'PAPER006',
        facultyId: 'FAC002',
        dummyNumber: 'D006',
        studentName: 'Frank Thompson',
        courseCode: 'IT201',
        section: 'A',
        status: 'completed',
        paperFilename: 'answer-sheet-6.pdf',
        totalMarks: 100,
        obtainedMarks: 88,
        assignedDate: new Date('2024-01-14'),
        submissionDate: new Date('2024-01-16')
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
      },
      {
        _id: 'report3',
        facultyId: 'FAC003',
        facultyName: 'Prof. Michael Brown',
        courseCode: 'MATH101',
        section: 'A',
        totalPapers: 20,
        completedPapers: 18,
        pendingPapers: 2,
        averageMarks: 75.8,
        completionPercentage: 90,
        lastUpdated: new Date()
      }
    ];

    // Insert sample data into MongoDB
    await db.collection('faculty').deleteMany({}); // Clear existing
    await db.collection('assignments').deleteMany({});
    await db.collection('reports').deleteMany({});
    
    await db.collection('faculty').insertMany(facultyData);
    await db.collection('assignments').insertMany(assignments);
    await db.collection('reports').insertMany(reports);
    
    console.log('✅ Sample data initialized in MongoDB Atlas');
    console.log(`📊 Created: ${facultyData.length} faculty, ${assignments.length} assignments, ${reports.length} reports`);
  } catch (error) {
    console.log('❌ Failed to initialize sample data:', error.message);
  }
}

// Fallback data (if MongoDB fails)
const fallbackData = {
  faculty: [
    {
      employeeId: 'FAC001',
      registerNumber: 'FAC001',
      name: 'Dr. John Smith',
      email: 'john.smith@university.edu',
      department: 'Computer Science',
      sections: ['CS101-A', 'CS101-B']
    }
  ],
  assignments: [
    {
      _id: 'assignment1',
      paperId: 'PAPER001',
      facultyId: 'FAC001',
      dummyNumber: 'D001',
      studentName: 'Alice Johnson',
      courseCode: 'CS101',
      section: 'A',
      status: 'pending',
      paperFilename: 'answer-sheet-1.pdf',
      totalMarks: 100,
      obtainedMarks: 0,
      assignedDate: new Date('2024-01-15')
    }
  ],
  reports: [
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
    }
  ]
};

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
    database: db ? 'MongoDB Atlas Connected' : 'Using Fallback Data',
    mongoUri: MONGODB_URI ? 'Configured' : 'Not Configured'
  });
});

// API test endpoints
app.get('/api/test', async (req, res) => {
  let dataStats = {};
  
  try {
    if (db) {
      dataStats = {
        faculty: await db.collection('faculty').countDocuments(),
        assignments: await db.collection('assignments').countDocuments(),
        reports: await db.collection('reports').countDocuments()
      };
    } else {
      dataStats = {
        faculty: fallbackData.faculty.length,
        assignments: fallbackData.assignments.length,
        reports: fallbackData.reports.length
      };
    }
  } catch (error) {
    dataStats = { error: error.message };
  }
  
  res.json({ 
    message: 'API is working with database!', 
    database: db ? 'MongoDB Atlas Connected' : 'Using Fallback Data',
    endpoints: [
      '/health',
      '/api/faculty/:id/assignments',
      '/api/admin/dashboard',
      '/api/admin/reports'
    ],
    dataStats
  });
});

// Faculty assignments endpoint
app.get('/api/faculty/:id/assignments', async (req, res) => {
  try {
    const facultyId = req.params.id;
    let assignments = [];
    
    if (db) {
      // Use MongoDB Atlas
      assignments = await db.collection('assignments')
        .find({ facultyId: facultyId })
        .toArray();
      
      // If no assignments for specific faculty, get some default ones
      if (assignments.length === 0) {
        assignments = await db.collection('assignments')
          .find({ facultyId: 'FAC001' })
          .toArray();
      }
    } else {
      // Use fallback data
      assignments = fallbackData.assignments.filter(a => 
        a.facultyId === facultyId || facultyId === 'FAC001'
      );
    }
    
    res.json({
      success: true,
      assignments: assignments,
      message: `Found ${assignments.length} assignments for faculty ${facultyId}`,
      database: db ? 'MongoDB Atlas' : 'Fallback Data'
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments',
      message: error.message
    });
  }
});

// Faculty profile endpoint
app.get('/api/faculty/:id/profile', async (req, res) => {
  try {
    const facultyId = req.params.id;
    let faculty = null;
    
    if (db) {
      faculty = await db.collection('faculty').findOne({ 
        $or: [
          { employeeId: facultyId },
          { registerNumber: facultyId }
        ]
      });
    } else {
      faculty = fallbackData.faculty.find(f => 
        f.employeeId === facultyId || f.registerNumber === facultyId
      );
    }
    
    if (faculty) {
      let facultyAssignments = [];
      if (db) {
        facultyAssignments = await db.collection('assignments').find({ facultyId: facultyId }).toArray();
      } else {
        facultyAssignments = fallbackData.assignments.filter(a => a.facultyId === facultyId);
      }
      
      const completedCount = facultyAssignments.filter(a => a.status === 'completed').length;
      
      res.json({
        success: true,
        data: {
          ...faculty,
          _id: faculty.employeeId,
          stats: {
            totalAssignments: facultyAssignments.length,
            completedAssignments: completedCount,
            pendingAssignments: facultyAssignments.length - completedCount,
            completionRate: facultyAssignments.length > 0 ? (completedCount / facultyAssignments.length * 100).toFixed(1) : 0
          }
        }
      });
    } else {
      // Return default faculty data if not found
      res.json({
        success: true,
        data: {
          _id: facultyId,
          employeeId: facultyId,
          registerNumber: facultyId,
          name: `Faculty ${facultyId}`,
          email: `${facultyId.toLowerCase()}@university.edu`,
          department: 'Computer Science',
          sections: ['CS101-A'],
          stats: {
            totalAssignments: 0,
            completedAssignments: 0,
            pendingAssignments: 0,
            completionRate: 0
          }
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch faculty profile'
    });
  }
});

// Admin dashboard endpoint
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    let stats = {};
    
    if (db) {
      const totalFaculty = await db.collection('faculty').countDocuments();
      const totalAssignments = await db.collection('assignments').countDocuments();
      const completedAssignments = await db.collection('assignments').countDocuments({ status: 'completed' });
      const pendingAssignments = totalAssignments - completedAssignments;
      
      stats = {
        totalFaculty,
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments * 100).toFixed(1) : 0
      };
    } else {
      stats = {
        totalFaculty: fallbackData.faculty.length,
        totalAssignments: fallbackData.assignments.length,
        completedAssignments: fallbackData.assignments.filter(a => a.status === 'completed').length,
        pendingAssignments: fallbackData.assignments.filter(a => a.status === 'pending').length,
        completionRate: 60.0
      };
    }
    
    res.json({
      success: true,
      data: stats,
      database: db ? 'MongoDB Atlas' : 'Fallback Data'
    });
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
    let reports = [];
    
    if (db) {
      reports = await db.collection('reports').find({}).toArray();
    } else {
      reports = fallbackData.reports;
    }
    
    res.json({
      success: true,
      reports: reports,
      database: db ? 'MongoDB Atlas' : 'Fallback Data'
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
});

// Update assignment status
app.put('/api/assignments/:id', async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { status, obtainedMarks } = req.body;
    
    if (db) {
      const updateData = {};
      if (status) updateData.status = status;
      if (obtainedMarks !== undefined) updateData.obtainedMarks = obtainedMarks;
      if (status === 'completed') updateData.submissionDate = new Date();
      
      const result = await db.collection('assignments').updateOne(
        { _id: assignmentId },
        { $set: updateData }
      );
      
      if (result.matchedCount > 0) {
        const updatedAssignment = await db.collection('assignments').findOne({ _id: assignmentId });
        res.json({
          success: true,
          assignment: updatedAssignment,
          message: 'Assignment updated successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }
    } else {
      res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update assignment'
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
    console.log(`🗄️  Database: ${db ? 'MongoDB Atlas Connected' : 'Using Fallback Data'}`);
  });
});

module.exports = app;