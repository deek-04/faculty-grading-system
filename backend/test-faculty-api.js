const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/faculty';

async function testFacultyEndpoints() {
  console.log('🧪 Testing Faculty API Endpoints\n');

  try {
    // Test 1: Get faculty profile
    console.log('1️⃣  Testing GET /api/faculty/FAC001/profile');
    try {
      const response = await axios.get(`${BASE_URL}/FAC001/profile`);
      console.log('✅ GET /profile successful');
      console.log('   Faculty:', response.data.data.name);
      console.log('   Department:', response.data.data.department);
      console.log('   Assigned Papers:', response.data.data.assignedPapers);
      console.log('   Corrected Papers:', response.data.data.correctedPapers);
      console.log('   Pending Papers:', response.data.data.pendingPapers);
    } catch (error) {
      console.log('❌ GET /profile failed:', error.response?.data || error.message);
    }

    console.log('\n');

    // Test 2: Get faculty assignments (before upload)
    console.log('2️⃣  Testing GET /api/faculty/FAC001/assignments (before upload)');
    try {
      const response = await axios.get(`${BASE_URL}/FAC001/assignments`);
      console.log('✅ GET /assignments successful');
      console.log('   Total Assignments:', response.data.stats.total);
      console.log('   Pending:', response.data.stats.pending);
      console.log('   Completed:', response.data.stats.completed);
      console.log('   Courses:', response.data.stats.courses);
      
      if (response.data.assignments.length > 0) {
        console.log('\n   Sample Assignment:');
        const sample = response.data.assignments[0];
        console.log('   - Paper ID:', sample.paperFilename);
        console.log('   - Course:', sample.courseCode);
        console.log('   - Dummy Number:', sample.dummyNumber);
        console.log('   - Status:', sample.status);
      }
    } catch (error) {
      console.log('❌ GET /assignments failed:', error.response?.data || error.message);
    }

    console.log('\n');

    // Test 3: Test all faculty members
    console.log('3️⃣  Testing all faculty members');
    const facultyIds = ['FAC001', 'FAC002', 'FAC003', 'FAC004', 'FAC005'];
    
    for (const facultyId of facultyIds) {
      try {
        const response = await axios.get(`${BASE_URL}/${facultyId}/profile`);
        console.log(`   ✅ ${facultyId}: ${response.data.data.name} - ${response.data.data.assignedPapers} papers`);
      } catch (error) {
        console.log(`   ❌ ${facultyId}: Failed`);
      }
    }

    console.log('\n✨ Testing complete!\n');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

testFacultyEndpoints();
