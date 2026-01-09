const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const database = require('../config/database');
const Faculty = require('../models/Faculty');
const VerificationLog = require('../models/VerificationLog');
const Assignment = require('../models/Assignment');
const { parseAssignmentExcel, isValidExcelFile } = require('../utils/excelParser');

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (isValidExcelFile(file.mimetype, file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed.'));
    }
  }
});

/**
 * GET /api/admin/faculties
 * Get all faculties with progress metrics
 */
router.get('/faculties', async (req, res, next) => {
  try {
    const db = database.getDb();
    
    // Get all faculties
    const faculties = await db.collection('faculties').find({}).toArray();
    
    // Calculate progress metrics for each faculty
    const facultiesWithProgress = await Promise.all(
      faculties.map(async (faculty) => {
        // Count assigned papers
        const assignedPapers = await db.collection('assignments').countDocuments({
          facultyId: faculty._id
        });
        
        // Count corrected papers (completed assignments)
        const correctedPapers = await db.collection('assignments').countDocuments({
          facultyId: faculty._id,
          status: 'completed'
        });
        
        // Calculate pending papers
        const pendingPapers = assignedPapers - correctedPapers;
        
        return {
          _id: faculty._id,
          name: faculty.name,
          email: faculty.email,
          employeeId: faculty.employeeId,
          department: faculty.department,
          status: faculty.status,
          assignedPapers,
          correctedPapers,
          pendingPapers,
          lastActive: faculty.lastActive,
          verificationReason: faculty.verificationReason
        };
      })
    );
    
    res.json({
      success: true,
      data: facultiesWithProgress,
      total: facultiesWithProgress.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/faculties/search
 * Search faculties by name
 */
router.get('/faculties/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: 'Search query is required'
        }
      });
    }
    
    const db = database.getDb();
    
    // Perform case-insensitive search using regex
    const faculties = await db.collection('faculties').find({
      name: { $regex: q, $options: 'i' }
    }).toArray();
    
    // Calculate progress metrics for each faculty
    const facultiesWithProgress = await Promise.all(
      faculties.map(async (faculty) => {
        // Count assigned papers
        const assignedPapers = await db.collection('assignments').countDocuments({
          facultyId: faculty._id
        });
        
        // Count corrected papers (completed assignments)
        const correctedPapers = await db.collection('assignments').countDocuments({
          facultyId: faculty._id,
          status: 'completed'
        });
        
        // Calculate pending papers
        const pendingPapers = assignedPapers - correctedPapers;
        
        return {
          _id: faculty._id,
          name: faculty.name,
          email: faculty.email,
          employeeId: faculty.employeeId,
          department: faculty.department,
          status: faculty.status,
          assignedPapers,
          correctedPapers,
          pendingPapers,
          lastActive: faculty.lastActive,
          verificationReason: faculty.verificationReason
        };
      })
    );
    
    res.json({
      success: true,
      data: facultiesWithProgress,
      count: facultiesWithProgress.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/faculties/:id/verify
 * Update faculty verification status
 */
router.put('/faculties/:id/verify', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    // Validate faculty ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FACULTY_ID',
          message: 'Invalid faculty ID format'
        }
      });
    }
    
    // Validate status
    if (!status || !['verified', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Status must be either "verified" or "blocked"'
        }
      });
    }
    
    const db = database.getDb();
    const facultyId = new ObjectId(id);
    
    // Check if faculty exists
    const faculty = await db.collection('faculties').findOne({ _id: facultyId });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FACULTY_NOT_FOUND',
          message: 'Faculty not found'
        }
      });
    }
    
    // Update faculty status
    const updateResult = await db.collection('faculties').updateOne(
      { _id: facultyId },
      {
        $set: {
          status: status,
          verificationReason: reason || '',
          updatedAt: new Date()
        }
      }
    );
    
    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update faculty status'
        }
      });
    }
    
    // Create verification log entry
    const verificationLog = new VerificationLog({
      facultyId: facultyId,
      adminId: req.adminId || null, // Will be set by auth middleware later
      action: status,
      reason: reason || '',
      timestamp: new Date()
    });
    
    await db.collection('verification_logs').insertOne(verificationLog.toDocument());
    
    res.json({
      success: true,
      message: `Faculty ${status === 'verified' ? 'verified' : 'blocked'} successfully`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/assignments
 * Get all assignments with faculty and paper details
 */
router.get('/assignments', async (req, res, next) => {
  try {
    const db = database.getDb();
    
    // Get all assignments
    const assignments = await db.collection('assignments').find({}).toArray();
    
    // Enrich assignments with faculty and paper data
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        // Get faculty details
        const faculty = await db.collection('faculties').findOne({
          _id: assignment.facultyId
        });
        
        // Get paper details from answerSheets.files
        const paper = await db.collection('answerSheets.files').findOne({
          _id: assignment.paperId
        });
        
        return {
          _id: assignment._id,
          facultyId: assignment.facultyId,
          facultyName: faculty ? faculty.name : 'Unknown',
          facultyEmployeeId: faculty ? faculty.employeeId : 'Unknown',
          paperId: assignment.paperId,
          paperFilename: paper ? paper.filename : 'Unknown',
          courseCode: assignment.courseCode,
          dummyNumber: assignment.dummyNumber,
          assignedBy: assignment.assignedBy,
          assignedAt: assignment.assignedAt,
          status: assignment.status,
          completedAt: assignment.completedAt,
          createdAt: assignment.createdAt,
          updatedAt: assignment.updatedAt
        };
      })
    );
    
    res.json({
      success: true,
      data: enrichedAssignments,
      total: enrichedAssignments.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/assignments/upload
 * Upload Excel file for paper assignments
 */
router.post('/assignments/upload', upload.single('file'), async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    // Parse Excel file
    const parseResult = parseAssignmentExcel(req.file.buffer);
    
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EXCEL_PARSE_ERROR',
          message: 'Failed to parse Excel file',
          details: parseResult.errors
        }
      });
    }

    const db = database.getDb();
    const assignmentData = parseResult.data;
    
    // Validate and process assignments
    const results = {
      success: true,
      assigned: 0,
      errors: [],
      details: []
    };

    // Start a session for transaction
    const session = db.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Collect all unique faculty IDs and paper IDs for batch validation
        const facultyIds = [...new Set(assignmentData.map(a => a.facultyId))];
        const paperIds = [...new Set(assignmentData.map(a => a.paperId))];

        // Validate all faculty IDs exist
        const existingFaculties = await db.collection('faculties').find({
          employeeId: { $in: facultyIds }
        }).toArray();
        
        const existingFacultyIds = new Set(existingFaculties.map(f => f.employeeId));
        const invalidFacultyIds = facultyIds.filter(id => !existingFacultyIds.has(id));
        
        if (invalidFacultyIds.length > 0) {
          throw new Error(`Invalid faculty IDs: ${invalidFacultyIds.join(', ')}`);
        }

        // Create a map of employeeId to ObjectId for faculties
        const facultyIdMap = new Map();
        existingFaculties.forEach(f => {
          facultyIdMap.set(f.employeeId, f._id);
        });

        // Validate all paper IDs exist in answerSheets.files collection
        const existingPapers = await db.collection('answerSheets.files').find({
          filename: { $in: paperIds }
        }).toArray();
        
        const existingPaperIds = new Set(existingPapers.map(p => p.filename));
        const invalidPaperIds = paperIds.filter(id => !existingPaperIds.has(id));
        
        if (invalidPaperIds.length > 0) {
          throw new Error(`Invalid paper IDs: ${invalidPaperIds.join(', ')}`);
        }

        // Create a map of filename to ObjectId for papers
        const paperIdMap = new Map();
        existingPapers.forEach(p => {
          paperIdMap.set(p.filename, p._id);
        });

        // Check for blocked faculty
        const blockedFaculties = existingFaculties.filter(f => f.status === 'blocked');
        if (blockedFaculties.length > 0) {
          const blockedIds = blockedFaculties.map(f => f.employeeId).join(', ');
          throw new Error(`Cannot assign papers to blocked faculty: ${blockedIds}`);
        }

        // Process each assignment
        for (const item of assignmentData) {
          const facultyObjectId = facultyIdMap.get(item.facultyId);
          const paperObjectId = paperIdMap.get(item.paperId);

          // Check for duplicate assignment
          const existingAssignment = await db.collection('assignments').findOne({
            facultyId: facultyObjectId,
            paperId: paperObjectId
          });

          if (existingAssignment) {
            results.errors.push(
              `Row ${item.rowNumber}: Duplicate assignment - Faculty ${item.facultyId} already assigned to Paper ${item.paperId}`
            );
            results.details.push({
              row: item.rowNumber,
              facultyId: item.facultyId,
              paperId: item.paperId,
              status: 'duplicate',
              message: 'Assignment already exists'
            });
            continue;
          }

          // Create new assignment
          const assignment = new Assignment({
            facultyId: facultyObjectId,
            paperId: paperObjectId,
            courseCode: item.courseCode,
            dummyNumber: item.dummyNumber,
            assignedBy: req.adminId || null, // Will be set by auth middleware
            assignedAt: new Date(),
            status: 'pending'
          });

          // Validate assignment
          const validation = assignment.validate();
          if (!validation.isValid) {
            results.errors.push(
              `Row ${item.rowNumber}: ${validation.errors.join(', ')}`
            );
            results.details.push({
              row: item.rowNumber,
              facultyId: item.facultyId,
              paperId: item.paperId,
              status: 'validation_failed',
              message: validation.errors.join(', ')
            });
            continue;
          }

          // Insert assignment
          await db.collection('assignments').insertOne(assignment.toDocument());
          
          results.assigned++;
          results.details.push({
            row: item.rowNumber,
            facultyId: item.facultyId,
            paperId: item.paperId,
            status: 'success',
            message: 'Assignment created successfully'
          });
        }
      });
    } finally {
      await session.endSession();
    }

    // Return results
    if (results.assigned === 0 && results.errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ASSIGNMENT_FAILED',
          message: 'No assignments were created',
          details: results.errors
        }
      });
    }

    res.json({
      success: true,
      assigned: results.assigned,
      errors: results.errors,
      details: results.details
    });

  } catch (error) {
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds 5MB limit'
          }
        });
      }
      return res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: error.message
        }
      });
    }
    
    next(error);
  }
});

/**
 * GET /api/admin/reports
 * Get all generated reports
 */
router.get('/reports', async (req, res, next) => {
  try {
    const db = database.getDb();
    
    const reports = await db.collection('reports')
      .find({})
      .sort({ generatedAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: reports,
      total: reports.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/reports/:employeeId/download/:type
 * Download report file (type: 'detailed' or 'summary')
 */
router.get('/reports/:employeeId/download/:type', async (req, res, next) => {
  try {
    const { employeeId, type } = req.params;
    const db = database.getDb();
    const path = require('path');
    
    // Get latest report for this faculty
    const report = await db.collection('reports')
      .findOne({ employeeId }, { sort: { generatedAt: -1 } });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'No reports found for this faculty'
        }
      });
    }
    
    const fileName = type === 'detailed' ? report.detailedReportFile : report.summaryReportFile;
    const filePath = path.join(__dirname, '../../reports', fileName);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Report file not found'
        }
      });
    }
    
    // Send file
    res.download(filePath, fileName);
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
