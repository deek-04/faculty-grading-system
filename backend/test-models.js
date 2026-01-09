/**
 * Test script for database models
 * Run with: node test-models.js
 */

const { Faculty, Evaluation, Assignment, Report, VerificationLog } = require('./src/models');

console.log('🧪 Testing Database Models...\n');

// Test Faculty Model
console.log('Test 1: Faculty Model');
const faculty = new Faculty({
  name: 'Dr. John Smith',
  email: 'john.smith@university.edu',
  employeeId: 'FAC001',
  department: 'Computer Science',
  status: 'verified'
});

const facultyValidation = faculty.validate();
console.log('✓ Faculty validation:', facultyValidation.isValid ? 'PASS' : 'FAIL');
if (!facultyValidation.isValid) {
  console.log('  Errors:', facultyValidation.errors);
}
console.log('✓ Faculty document:', JSON.stringify(faculty.toDocument(), null, 2));
console.log('');

// Test Evaluation Model
console.log('Test 2: Evaluation Model');
const evaluation = new Evaluation({
  facultyId: faculty._id,
  paperId: '507f1f77bcf86cd799439011',
  dummyNumber: 'CS01-2024-0001',
  courseCode: 'CS101',
  questionMarks: { q1: 2, q2: 15, q3: 10 },
  totalMarks: 100,
  obtainedMarks: 85
});

evaluation.calculatePercentage();
const evalValidation = evaluation.validate();
console.log('✓ Evaluation validation:', evalValidation.isValid ? 'PASS' : 'FAIL');
if (!evalValidation.isValid) {
  console.log('  Errors:', evalValidation.errors);
}
console.log('✓ Calculated percentage:', evaluation.percentage.toFixed(2) + '%');
console.log('');

// Test Assignment Model
console.log('Test 3: Assignment Model');
const assignment = new Assignment({
  facultyId: faculty._id,
  paperId: '507f1f77bcf86cd799439011',
  courseCode: 'CS101',
  dummyNumber: 'CS01-2024-0001'
});

const assignmentValidation = assignment.validate();
console.log('✓ Assignment validation:', assignmentValidation.isValid ? 'PASS' : 'FAIL');
if (!assignmentValidation.isValid) {
  console.log('  Errors:', assignmentValidation.errors);
}
console.log('✓ Assignment status:', assignment.status);
console.log('');

// Test Report Model
console.log('Test 4: Report Model');
const report = new Report({
  facultyId: faculty._id,
  facultyName: faculty.name,
  reportType: 'detailed',
  paperCount: 50,
  filePath: '/reports/report_2024.xlsx',
  fileName: 'report_2024.xlsx'
});

const reportValidation = report.validate();
console.log('✓ Report validation:', reportValidation.isValid ? 'PASS' : 'FAIL');
if (!reportValidation.isValid) {
  console.log('  Errors:', reportValidation.errors);
}
console.log('✓ Report type:', report.reportType);
console.log('');

// Test VerificationLog Model
console.log('Test 5: VerificationLog Model');
const verificationLog = new VerificationLog({
  facultyId: faculty._id,
  action: 'verified',
  reason: 'Face verification successful'
});

const logValidation = verificationLog.validate();
console.log('✓ VerificationLog validation:', logValidation.isValid ? 'PASS' : 'FAIL');
if (!logValidation.isValid) {
  console.log('  Errors:', logValidation.errors);
}
console.log('✓ Log action:', verificationLog.action);
console.log('');

// Test invalid data
console.log('Test 6: Invalid Data Handling');
const invalidFaculty = new Faculty({
  name: '',
  email: 'invalid-email',
  employeeId: '',
  status: 'invalid-status'
});

const invalidValidation = invalidFaculty.validate();
console.log('✓ Invalid faculty validation:', !invalidValidation.isValid ? 'PASS' : 'FAIL');
console.log('✓ Validation errors:', invalidValidation.errors);
console.log('');

console.log('✅ All model tests completed!');
console.log('\nModels are ready for use in the application.');
