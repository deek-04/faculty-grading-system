const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/admin';

async function uploadAssignments() {
  console.log('📤 Uploading Assignment Excel Sheet...\n');

  try {
    const excelFilePath = path.join(__dirname, 'paper-assignments.xlsx');
    
    if (!fs.existsSync(excelFilePath)) {
      console.log('❌ Excel file not found:', excelFilePath);
      console.log('   Run: node create-assignment-excel.js first');
      return;
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(excelFilePath));

    console.log('Uploading file:', excelFilePath);
    const response = await axios.post(`${BASE_URL}/assignments/upload`, formData, {
      headers: formData.getHeaders()
    });

    console.log('\n✅ Upload successful!\n');
    console.log('📊 Results:');
    console.log(`   Assigned: ${response.data.assigned}`);
    console.log(`   Errors: ${response.data.errors.length}`);
    
    if (response.data.errors.length > 0) {
      console.log('\n❌ Errors:');
      response.data.errors.forEach(err => console.log(`   - ${err}`));
    }
    
    // Group by faculty
    const byFaculty = {};
    response.data.details.forEach(detail => {
      if (detail.status === 'success') {
        if (!byFaculty[detail.facultyId]) {
          byFaculty[detail.facultyId] = 0;
        }
        byFaculty[detail.facultyId]++;
      }
    });
    
    console.log('\n📋 Assignments by Faculty:');
    Object.keys(byFaculty).forEach(facultyId => {
      console.log(`   ${facultyId}: ${byFaculty[facultyId]} papers`);
    });
    
    console.log('\n✨ Assignments uploaded successfully!');
    console.log('   Faculty members can now login and see their assigned papers');

  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
  }
}

uploadAssignments();
