const XLSX = require('xlsx');
const path = require('path');

/**
 * Create an Excel sheet with paper assignments for each faculty
 * Each faculty gets 4 papers assigned
 */

// Faculty data
const faculties = [
  { employeeId: 'FAC001', name: 'Dr. Rajesh Kumar' },
  { employeeId: 'FAC002', name: 'Prof. Priya Sharma' },
  { employeeId: 'FAC003', name: 'Dr. Amit Patel' },
  { employeeId: 'FAC004', name: 'Dr. Sneha Reddy' },
  { employeeId: 'FAC005', name: 'Prof. Vikram Singh' }
];

// Course codes
const courseCodes = ['CS101', 'CS102', 'IT201', 'EC301', 'ME401'];

// Generate assignments
const assignments = [];
let paperCounter = 1;

faculties.forEach((faculty, facultyIndex) => {
  // Assign 4 papers to each faculty
  for (let i = 0; i < 4; i++) {
    const courseCode = courseCodes[facultyIndex % courseCodes.length];
    const year = new Date().getFullYear();
    const dummyNumber = `${courseCode}-${year}-${paperCounter.toString().padStart(4, '0')}`;
    const paperId = `answer-sheet-${paperCounter}.pdf`;
    
    assignments.push({
      'Faculty ID': faculty.employeeId,
      'Faculty Name': faculty.name,
      'Paper ID': paperId,
      'Course Code': courseCode,
      'Dummy Number': dummyNumber,
      'Assigned Date': new Date().toISOString().split('T')[0],
      'Status': 'Pending'
    });
    
    paperCounter++;
  }
});

// Create worksheet
const worksheet = XLSX.utils.json_to_sheet(assignments);

// Set column widths
worksheet['!cols'] = [
  { wch: 12 },  // Faculty ID
  { wch: 20 },  // Faculty Name
  { wch: 25 },  // Paper ID
  { wch: 12 },  // Course Code
  { wch: 20 },  // Dummy Number
  { wch: 15 },  // Assigned Date
  { wch: 10 }   // Status
];

// Create workbook
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Paper Assignments');

// Save file
const fileName = 'paper-assignments.xlsx';
const filePath = path.join(__dirname, fileName);

XLSX.writeFile(workbook, filePath);

console.log('✅ Assignment Excel sheet created successfully!');
console.log(`� File: $n{fileName}`);
console.log(`📍 Location: ${filePath}`);
console.log(`\n📊 Summary:`);
console.log(`   - Total Faculties: ${faculties.length}`);
console.log(`   - Papers per Faculty: 4`);
console.log(`   - Total Assignments: ${assignments.length}`);
console.log(`\n💡 You can now upload this file in the Admin Portal:`);
console.log(`   Admin Dashboard → Papers & Assignments → Upload Assignment Excel`);
