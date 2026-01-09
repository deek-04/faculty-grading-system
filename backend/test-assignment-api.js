const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const BASE_URL = 'http://localhost:5000/api/admin';

// Create a sample Excel file for testing
function createSampleExcelFile() {
  const data = [
    {
      'Faculty ID': 'FAC001',
      'Paper ID': 'PAP001',
      'Course Code': 'CS101',
      'Dummy Number': 'CS01-2024-0001'
    },
    {
      'Faculty ID': 'FAC002',
      'Paper ID': 'PAP002',
      'Course Code': 'IT201',
      'Dummy Number': 'IT02-2024-0001'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Assignments');

  const filePath = path.join(__dirname, 'test-assignments.xlsx');
  XLSX.writeFile(workbook, filePath);
  
  return filePath;
}

async function testAssignmentEndpoints() {
  console.log('🧪 Testing Assignment API Endpoints\n');

  try {
    // Test 1: GET /api/admin/assignments
    console.log('1️⃣  Testing GET /api/admin/assignments');
    try {
      const response = await axios.get(`${BASE_URL}/assignments`);
      console.log('✅ GET /assignments successful');
      console.log(`   Found ${response.data.total} assignments`);
      if (response.data.data.length > 0) {
        console.log('   Sample assignment:', JSON.stringify(response.data.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ GET /assignments failed:', error.response?.data || error.message);
    }

    console.log('\n');

    // Test 2: POST /api/admin/assignments/upload (without file)
    console.log('2️⃣  Testing POST /api/admin/assignments/upload (no file)');
    try {
      const response = await axios.post(`${BASE_URL}/assignments/upload`);
      console.log('❌ Should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected request without file');
        console.log('   Error:', error.response.data.error.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n');

    // Test 3: POST /api/admin/assignments/upload (with Excel file)
    console.log('3️⃣  Testing POST /api/admin/assignments/upload (with Excel file)');
    console.log('   Creating sample Excel file...');
    const excelFilePath = createSampleExcelFile();
    console.log('   Excel file created:', excelFilePath);

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(excelFilePath));

      const response = await axios.post(`${BASE_URL}/assignments/upload`, formData, {
        headers: formData.getHeaders()
      });

      console.log('✅ POST /assignments/upload successful');
      console.log(`   Assigned: ${response.data.assigned}`);
      console.log(`   Errors: ${response.data.errors.length}`);
      if (response.data.errors.length > 0) {
        console.log('   Error details:', response.data.errors);
      }
      console.log('   Details:', JSON.stringify(response.data.details, null, 2));
    } catch (error) {
      console.log('❌ POST /assignments/upload failed');
      console.log('   Error:', error.response?.data || error.message);
    }

    // Clean up test file
    if (fs.existsSync(excelFilePath)) {
      fs.unlinkSync(excelFilePath);
      console.log('   Cleaned up test Excel file');
    }

    console.log('\n');

    // Test 4: GET /api/admin/assignments (after upload)
    console.log('4️⃣  Testing GET /api/admin/assignments (after upload)');
    try {
      const response = await axios.get(`${BASE_URL}/assignments`);
      console.log('✅ GET /assignments successful');
      console.log(`   Total assignments: ${response.data.total}`);
    } catch (error) {
      console.log('❌ GET /assignments failed:', error.response?.data || error.message);
    }

    console.log('\n✨ Testing complete!\n');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run tests
testAssignmentEndpoints();
