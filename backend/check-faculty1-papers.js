const axios = require('axios');

async function checkFaculty1Papers() {
  console.log('🔍 Checking Papers for Faculty 1 (FAC001 - Dr. Rajesh Kumar)\n');
  console.log('='.repeat(70));
  
  try {
    // Get faculty profile
    const profileResponse = await axios.get('http://localhost:5000/api/faculty/FAC001/profile');
    const profile = profileResponse.data.data;
    
    console.log('\n👤 Faculty Profile:');
    console.log(`   Name: ${profile.name}`);
    console.log(`   Employee ID: ${profile.employeeId}`);
    console.log(`   Department: ${profile.department}`);
    console.log(`   Status: ${profile.status}`);
    console.log(`   Email: ${profile.email}`);
    
    console.log('\n📊 Assignment Statistics:');
    console.log(`   Total Assigned: ${profile.assignedPapers} papers`);
    console.log(`   Completed: ${profile.correctedPapers} papers`);
    console.log(`   Pending: ${profile.pendingPapers} papers`);
    
    // Get faculty assignments
    const assignmentsResponse = await axios.get('http://localhost:5000/api/faculty/FAC001/assignments');
    const data = assignmentsResponse.data;
    
    console.log('\n' + '='.repeat(70));
    console.log('\n📄 ASSIGNED PAPERS:\n');
    
    if (data.assignments.length === 0) {
      console.log('   ❌ No papers assigned yet.');
      console.log('   💡 Run: node upload-assignments.js to assign papers');
    } else {
      data.assignments.forEach((assignment, index) => {
        console.log(`${index + 1}. Paper: ${assignment.paperFilename}`);
        console.log(`   Course: ${assignment.courseCode} - ${assignment.paperMetadata.courseName || 'N/A'}`);
        console.log(`   Dummy Number: ${assignment.dummyNumber}`);
        console.log(`   Status: ${assignment.status.toUpperCase()}`);
        console.log(`   Assigned: ${new Date(assignment.assignedAt).toLocaleString()}`);
        console.log('');
      });
      
      console.log('='.repeat(70));
      console.log('\n✅ Faculty 1 can see all their assigned papers!');
      console.log(`\n📋 Summary: ${data.stats.total} papers across ${data.stats.courses} course(s)`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Backend server is running (npm start)');
    console.log('   2. Database is seeded (node seed-data.js)');
    console.log('   3. Assignments are uploaded (node upload-assignments.js)');
  }
}

checkFaculty1Papers();
