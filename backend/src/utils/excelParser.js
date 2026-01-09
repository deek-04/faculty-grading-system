const XLSX = require('xlsx');

/**
 * Excel Parser Utility
 * Parses uploaded Excel files for paper assignments
 */

/**
 * Parse Excel file and extract assignment data
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {Object} - { success, data, errors }
 */
function parseAssignmentExcel(fileBuffer) {
  try {
    // Read the Excel file from buffer
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        data: [],
        errors: ['Excel file is empty or has no sheets']
      };
    }
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: ''
    });
    
    if (jsonData.length === 0) {
      return {
        success: false,
        data: [],
        errors: ['Excel file has no data rows']
      };
    }
    
    // Validate structure and extract data
    const result = validateAndExtractData(jsonData);
    
    return result;
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [`Failed to parse Excel file: ${error.message}`]
    };
  }
}

/**
 * Validate Excel structure and extract assignment data
 * @param {Array} jsonData - Parsed JSON data from Excel
 * @returns {Object} - { success, data, errors }
 */
function validateAndExtractData(jsonData) {
  const errors = [];
  const data = [];
  
  // Define required columns (case-insensitive)
  const requiredColumns = ['faculty id', 'paper id', 'course code', 'dummy number'];
  
  // Check if first row has required columns
  const firstRow = jsonData[0];
  const columnNames = Object.keys(firstRow).map(col => col.toLowerCase().trim());
  
  const missingColumns = requiredColumns.filter(
    reqCol => !columnNames.some(col => col === reqCol)
  );
  
  if (missingColumns.length > 0) {
    return {
      success: false,
      data: [],
      errors: [`Missing required columns: ${missingColumns.join(', ')}`]
    };
  }
  
  // Find actual column names (preserve original case)
  const columnMapping = {};
  Object.keys(firstRow).forEach(col => {
    const normalized = col.toLowerCase().trim();
    if (normalized === 'faculty id') columnMapping.facultyId = col;
    if (normalized === 'paper id') columnMapping.paperId = col;
    if (normalized === 'course code') columnMapping.courseCode = col;
    if (normalized === 'dummy number') columnMapping.dummyNumber = col;
  });
  
  // Process each row
  jsonData.forEach((row, index) => {
    const rowNumber = index + 2; // Excel row number (1-indexed + header)
    const rowErrors = [];
    
    // Extract values
    const facultyId = row[columnMapping.facultyId]?.toString().trim() || '';
    const paperId = row[columnMapping.paperId]?.toString().trim() || '';
    const courseCode = row[columnMapping.courseCode]?.toString().trim() || '';
    const dummyNumber = row[columnMapping.dummyNumber]?.toString().trim() || '';
    
    // Validate each field
    if (!facultyId) {
      rowErrors.push(`Row ${rowNumber}: Faculty ID is required`);
    }
    
    if (!paperId) {
      rowErrors.push(`Row ${rowNumber}: Paper ID is required`);
    }
    
    if (!courseCode) {
      rowErrors.push(`Row ${rowNumber}: Course Code is required`);
    }
    
    if (!dummyNumber) {
      rowErrors.push(`Row ${rowNumber}: Dummy Number is required`);
    }
    
    // If all fields are present, add to data
    if (rowErrors.length === 0) {
      data.push({
        facultyId,
        paperId,
        courseCode,
        dummyNumber,
        rowNumber
      });
    } else {
      errors.push(...rowErrors);
    }
  });
  
  // Return result
  if (errors.length > 0) {
    return {
      success: false,
      data: [],
      errors
    };
  }
  
  return {
    success: true,
    data,
    errors: []
  };
}

/**
 * Validate file type
 * @param {String} mimetype - File mimetype
 * @param {String} filename - File name
 * @returns {Boolean}
 */
function isValidExcelFile(mimetype, filename) {
  const validMimetypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/octet-stream' // Sometimes Excel files are detected as this
  ];
  
  const validExtensions = ['.xlsx', '.xls'];
  const hasValidExtension = validExtensions.some(ext => 
    filename.toLowerCase().endsWith(ext)
  );
  
  return validMimetypes.includes(mimetype) || hasValidExtension;
}

module.exports = {
  parseAssignmentExcel,
  isValidExcelFile
};
