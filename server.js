const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory database simulation (works without any external database)
let inMemoryDB = {
  faculty: [
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
    database: 'In-Memory Database (Fully Functional)',
    dataStats: {
      faculty: inMemoryDB.faculty.length,
      assignments: inMemoryDB.assignments.length,
      reports: inMemoryDB.reports.length
    }
  });
});

// API test endpoints
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working with full data!', 
    database: 'In-Memory Database (No external DB needed)',
    endpoints: [
      '/health',
      '/api/faculty/:id/assignments',
      '/api/admin/dashboard',
      '/api/admin/reports'
    ],
    sampleData: {
      faculty: inMemoryDB.faculty.length + ' faculty members',
      assignments: inMemoryDB.assignments.length + ' assignments',
      reports: inMemoryDB.reports.length + ' reports'
    }
  });
});

// Faculty assignments endpoint
app.get('/api/faculty/:id/assignments', (req, res) => {
  try {
    const facultyId = req.params.id;
    
    // Find assignments for this faculty
    const assignments = inMemoryDB.assignments.filter(assignment => 
      assignment.facultyId === facultyId || 
      assignment.facultyId === facultyId.toUpperCase() ||
      facultyId === 'FAC001' // Default for demo
    );
    
    // If no specific assignments found, return some default assignments
    const finalAssignments = assignments.length > 0 ? assignments : inMemoryDB.assignments.slice(0, 4);
    
    res.json({
      success: true,
      assignments: finalAssignments,
      message: `Found ${finalAssignments.length} assignments for faculty ${facultyId}`,
      facultyInfo: inMemoryDB.faculty.find(f => f.facultyId === facultyId || f.employeeId === facultyId)
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

// Admin dashboard endpoint
app.get('/api/admin/dashboard', (req, res) => {
  try {
    const totalFaculty = inMemoryDB.faculty.length;
    const totalAssignments = inMemoryDB.assignments.length;
    const completedAssignments = inMemoryDB.assignments.filter(a => a.status === 'completed').length;
    const pendingAssignments = totalAssignments - completedAssignments;
    
    res.json({
      success: true,
      data: {
        totalFaculty,
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments * 100).toFixed(1) : 0,
        recentActivity: inMemoryDB.assignments.slice(-5).map(a => ({
          facultyName: inMemoryDB.faculty.find(f => f.employeeId === a.facultyId)?.name || 'Unknown Faculty',
          studentName: a.studentName,
          courseCode: a.courseCode,
          status: a.status,
          date: a.submissionDate || a.assignedDate
        }))
      }
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
app.get('/api/admin/reports', (req, res) => {
  try {
    res.json({
      success: true,
      reports: inMemoryDB.reports,
      summary: {
        totalReports: inMemoryDB.reports.length,
        averageCompletion: (inMemoryDB.reports.reduce((sum, r) => sum + r.completionPercentage, 0) / inMemoryDB.reports.length).toFixed(1),
        totalPapers: inMemoryDB.reports.reduce((sum, r) => sum + r.totalPapers, 0),
        completedPapers: inMemoryDB.reports.reduce((sum, r) => sum + r.completedPapers, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
});

// Faculty profile endpoint
app.get('/api/faculty/:id/profile', (req, res) => {
  try {
    const facultyId = req.params.id;
    const faculty = inMemoryDB.faculty.find(f => 
      f.employeeId === facultyId || 
      f.registerNumber === facultyId
    );
    
    if (faculty) {
      const facultyAssignments = inMemoryDB.assignments.filter(a => a.facultyId === facultyId);
      const completedCount = facultyAssignments.filter(a => a.status === 'completed').length;
      
      res.json({
        success: true,
        faculty: {
          ...faculty,
          stats: {
            totalAssignments: facultyAssignments.length,
            completedAssignments: completedCount,
            pendingAssignments: facultyAssignments.length - completedCount,
            completionRate: facultyAssignments.length > 0 ? (completedCount / facultyAssignments.length * 100).toFixed(1) : 0
          }
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch faculty profile'
    });
  }
});

// Update assignment status
app.put('/api/assignments/:id', (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { status, obtainedMarks } = req.body;
    
    const assignmentIndex = inMemoryDB.assignments.findIndex(a => a._id === assignmentId);
    
    if (assignmentIndex !== -1) {
      inMemoryDB.assignments[assignmentIndex].status = status || inMemoryDB.assignments[assignmentIndex].status;
      inMemoryDB.assignments[assignmentIndex].obtainedMarks = obtainedMarks || inMemoryDB.assignments[assignmentIndex].obtainedMarks;
      
      if (status === 'completed') {
        inMemoryDB.assignments[assignmentIndex].submissionDate = new Date();
      }
      
      res.json({
        success: true,
        assignment: inMemoryDB.assignments[assignmentIndex],
        message: 'Assignment updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Assignment not found'
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Faculty Grading System running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log(`📊 Database: In-Memory (${inMemoryDB.assignments.length} assignments, ${inMemoryDB.faculty.length} faculty)`);
});

module.exports = app;