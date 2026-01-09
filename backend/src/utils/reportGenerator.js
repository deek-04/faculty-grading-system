const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * Generate detailed marks report for a faculty
 * Contains question-wise marks, correction time, and faculty details
 */
async function generateDetailedReport(db, facultyId, facultyData, assignments) {
  try {
    // Prepare data for Excel
    const reportData = [];
    
    for (const assignment of assignments) {
      if (assignment.status !== 'completed') continue;
      
      const row = {
        'Dummy Number': assignment.dummyNumber,
        'Course Code': assignment.courseCode,
      };
      
      // Add question-wise marks
      if (assignment.marks && Array.isArray(assignment.marks)) {
        assignment.marks.forEach((mark, index) => {
          row[`Question ${index + 1}`] = mark.marksObtained || 0;
          row[`Q${index + 1} Max`] = mark.maxMarks || 0;
        });
        
        // Calculate total
        const totalMarks = assignment.marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
        const maxMarks = assignment.marks.reduce((sum, m) => sum + (m.maxMarks || 0), 0);
        row['Total Marks'] = totalMarks;
        row['Max Marks'] = maxMarks;
      } else {
        row['Total Marks'] = 0;
        row['Max Marks'] = 0;
      }
      
      // Add correction details
      row['Correction Time (min)'] = assignment.correctionTime || 0;
      row['Faculty Name'] = facultyData.name;
      row['Faculty ID'] = facultyData.employeeId;
      row['Corrected Date'] = assignment.completedAt ? 
        new Date(assignment.completedAt).toLocaleDateString() : 'N/A';
      
      reportData.push(row);
    }
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    
    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Dummy Number
      { wch: 12 }, // Course Code
      { wch: 10 }, // Questions...
      { wch: 12 }, // Total Marks
      { wch: 20 }, // Correction Time
      { wch: 20 }, // Faculty Name
      { wch: 12 }, // Faculty ID
      { wch: 15 }  // Corrected Date
    ];
    worksheet['!cols'] = columnWidths;
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detailed Report');
    
    // Save file
    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const fileName = `detailed_report_${facultyData.employeeId}_${Date.now()}.xlsx`;
    const filePath = path.join(reportsDir, fileName);
    
    XLSX.writeFile(workbook, filePath);
    
    return {
      success: true,
      fileName,
      filePath,
      recordCount: reportData.length
    };
    
  } catch (error) {
    console.error('Error generating detailed report:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate summary report for a faculty
 * Contains only dummy number, course code, and total marks
 */
async function generateSummaryReport(db, facultyId, facultyData, assignments) {
  try {
    // Prepare data for Excel
    const reportData = [];
    
    for (const assignment of assignments) {
      if (assignment.status !== 'completed') continue;
      
      // Calculate total marks
      let totalMarks = 0;
      if (assignment.marks && Array.isArray(assignment.marks)) {
        totalMarks = assignment.marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
      }
      
      reportData.push({
        'Dummy Number': assignment.dummyNumber,
        'Course Code': assignment.courseCode,
        'Total Marks': totalMarks
      });
    }
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Dummy Number
      { wch: 12 }, // Course Code
      { wch: 12 }  // Total Marks
    ];
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary Report');
    
    // Save file
    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const fileName = `summary_report_${facultyData.employeeId}_${Date.now()}.xlsx`;
    const filePath = path.join(reportsDir, fileName);
    
    XLSX.writeFile(workbook, filePath);
    
    return {
      success: true,
      fileName,
      filePath,
      recordCount: reportData.length
    };
    
  } catch (error) {
    console.error('Error generating summary report:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate both reports for a faculty
 */
async function generateReportsForFaculty(db, employeeId) {
  try {
    // Get faculty data
    const faculty = await db.collection('faculties').findOne({ employeeId });
    if (!faculty) {
      return {
        success: false,
        error: 'Faculty not found'
      };
    }
    
    // Get all completed assignments
    const assignments = await db.collection('assignments')
      .find({ 
        facultyId: faculty._id,
        status: 'completed'
      })
      .toArray();
    
    if (assignments.length === 0) {
      return {
        success: false,
        error: 'No completed assignments found'
      };
    }
    
    // Generate both reports
    const detailedReport = await generateDetailedReport(db, faculty._id, faculty, assignments);
    const summaryReport = await generateSummaryReport(db, faculty._id, faculty, assignments);
    
    // Store report metadata in database
    await db.collection('reports').insertOne({
      facultyId: faculty._id,
      facultyName: faculty.name,
      employeeId: faculty.employeeId,
      detailedReportFile: detailedReport.fileName,
      summaryReportFile: summaryReport.fileName,
      totalPapers: assignments.length,
      generatedAt: new Date()
    });
    
    return {
      success: true,
      detailedReport,
      summaryReport,
      totalPapers: assignments.length
    };
    
  } catch (error) {
    console.error('Error generating reports:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  generateDetailedReport,
  generateSummaryReport,
  generateReportsForFaculty
};
