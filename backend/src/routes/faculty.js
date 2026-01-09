const express = require('express');
const { ObjectId } = require('mongodb');
const database = require('../config/database');

const router = express.Router();

/**
 * GET /api/faculty/:employeeId/assignments
 * Get assignments for a specific faculty member
 */
router.get('/:employeeId/assignments', async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMPLOYEE_ID',
          message: 'Employee ID is required'
        }
      });
    }
    
    const db = database.getDb();
    
    // Find faculty by employee ID
    const faculty = await db.collection('faculties').findOne({ employeeId });
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FACULTY_NOT_FOUND',
          message: 'Faculty not found'
        }
      });
    }
    
    // Check if faculty is verified
    if (faculty.status !== 'verified') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FACULTY_NOT_VERIFIED',
          message: `Faculty status is ${faculty.status}. Only verified faculty can access assignments.`
        }
      });
    }
    
    // Get all assignments for this faculty
    const assignments = await db.collection('assignments')
      .find({ facultyId: faculty._id })
      .toArray();
    
    // Enrich assignments with paper details
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        // Get paper details from GridFS
        const paper = await db.collection('answerSheets.files').findOne({
          _id: assignment.paperId
        });
        
        return {
          _id: assignment._id,
          paperId: assignment.paperId,
          paperFilename: paper ? paper.filename : 'Unknown',
          paperMetadata: paper ? paper.metadata : {},
          courseCode: assignment.courseCode,
          dummyNumber: assignment.dummyNumber,
          assignedAt: assignment.assignedAt,
          status: assignment.status,
          completedAt: assignment.completedAt
        };
      })
    );
    
    // Group by course code
    const groupedByCourse = enrichedAssignments.reduce((acc, assignment) => {
      const course = assignment.courseCode;
      if (!acc[course]) {
        acc[course] = [];
      }
      acc[course].push(assignment);
      return acc;
    }, {});
    
    // Calculate statistics
    const stats = {
      total: enrichedAssignments.length,
      pending: enrichedAssignments.filter(a => a.status === 'pending').length,
      inProgress: enrichedAssignments.filter(a => a.status === 'in_progress').length,
      completed: enrichedAssignments.filter(a => a.status === 'completed').length,
      courses: Object.keys(groupedByCourse).length
    };
    
    res.json({
      success: true,
      faculty: {
        _id: faculty._id,
        name: faculty.name,
        employeeId: faculty.employeeId,
        department: faculty.department
      },
      stats,
      assignments: enrichedAssignments,
      groupedByCourse
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/faculty/:employeeId/profile
 * Get faculty profile information
 */
router.get('/:employeeId/profile', async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMPLOYEE_ID',
          message: 'Employee ID is required'
        }
      });
    }
    
    const db = database.getDb();
    
    // Find faculty by employee ID
    const faculty = await db.collection('faculties').findOne({ employeeId });
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FACULTY_NOT_FOUND',
          message: 'Faculty not found'
        }
      });
    }
    
    // Get assignment counts
    const assignedPapers = await db.collection('assignments').countDocuments({
      facultyId: faculty._id
    });
    
    const correctedPapers = await db.collection('assignments').countDocuments({
      facultyId: faculty._id,
      status: 'completed'
    });
    
    const pendingPapers = await db.collection('assignments').countDocuments({
      facultyId: faculty._id,
      status: 'pending'
    });
    
    res.json({
      success: true,
      data: {
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        employeeId: faculty.employeeId,
        department: faculty.department,
        status: faculty.status,
        assignedPapers,
        correctedPapers,
        pendingPapers,
        lastActive: faculty.lastActive
      }
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/faculty/assignments/:id/status
 * Update assignment status (start grading or complete)
 */
router.put('/assignments/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, marks, correctionTime } = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ASSIGNMENT_ID',
          message: 'Invalid assignment ID'
        }
      });
    }
    
    const db = database.getDb();
    const assignmentId = new ObjectId(id);
    
    // Get assignment
    const assignment = await db.collection('assignments').findOne({ _id: assignmentId });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found'
        }
      });
    }
    
    // Prepare update
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    if (status === 'in_progress' && !assignment.startedAt) {
      updateData.startedAt = new Date();
    }
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
      if (marks) {
        updateData.marks = marks;
      }
      if (correctionTime) {
        updateData.correctionTime = correctionTime;
      }
    }
    
    // Update assignment
    await db.collection('assignments').updateOne(
      { _id: assignmentId },
      { $set: updateData }
    );
    
    res.json({
      success: true,
      message: 'Assignment status updated successfully'
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/faculty/:employeeId/check-completion
 * Check if all papers completed and generate reports
 */
router.post('/:employeeId/check-completion', async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    
    const db = database.getDb();
    const { generateReportsForFaculty } = require('../utils/reportGenerator');
    
    // Find faculty
    const faculty = await db.collection('faculties').findOne({ employeeId });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FACULTY_NOT_FOUND',
          message: 'Faculty not found'
        }
      });
    }
    
    // Get all assignments for this faculty
    const assignments = await db.collection('assignments')
      .find({ facultyId: faculty._id })
      .toArray();
    
    if (assignments.length === 0) {
      return res.json({
        success: true,
        allCompleted: false,
        message: 'No assignments found'
      });
    }
    
    // Check if all completed
    const allCompleted = assignments.every(a => a.status === 'completed');
    
    if (allCompleted) {
      // Generate reports
      const reportResult = await generateReportsForFaculty(db, employeeId);
      
      if (reportResult.success) {
        return res.json({
          success: true,
          allCompleted: true,
          message: 'All papers completed! Reports generated successfully.',
          totalPapers: assignments.length,
          reports: {
            detailed: reportResult.detailedReport.fileName,
            summary: reportResult.summaryReport.fileName
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          error: {
            code: 'REPORT_GENERATION_FAILED',
            message: reportResult.error
          }
        });
      }
    }
    
    res.json({
      success: true,
      allCompleted: false,
      completed: assignments.filter(a => a.status === 'completed').length,
      total: assignments.length
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
