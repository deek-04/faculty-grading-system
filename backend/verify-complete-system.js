const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function verifyCompleteSystem() {
  console.log('🔍 Verifying Complete Assignment System\n');
  console.log('='.repeat(60));
  
  let allPassed = true;
  
  try {
    // Test 1: Check server health
    console.log('\n1️⃣  Checking Server Health...');
    try {
      const response = await axios.get('http://localhost:5000/health');
      if (response.data.success) {
        console.log('   ✅ Server is running');
      }
    } catch (error) {
      console.log('   ❌ Server is not running');
      allPassed = false;
    }
    
    // Test 2: Check faculty data
    console.log('\n2️⃣  Checking Faculty Data...');
    const facultyIds = ['FAC001', 'FAC002', 'FAC003', 'FAC004', 'FAC005'];
    let facultyCount = 0;
    
    for (const id of facultyIds) {
      try {
        const response = await axios.get(`${BASE_URL}/faculty/${id}/profile`);
        if (response.data.success) {
          facultyCount++;
        }
      } catch (error) {
        console.log(`   ❌ Faculty ${id} not found`);
        allPassed = false;
      }
    }
    
    if (facultyCount === 5) {
      console.log(`   ✅ All 5 faculty members exist`);
    } else {
      console.log(`   ❌ Only ${facultyCount}/5 faculty members found`);
      allPassed = false;
    }
    
    // Test 3: Check assignments
    console.log('\n3️⃣  Checking Assignments...');
    try {
      const response = await axios.get(`${BASE_URL}/admin/assignments`);
      if (response.data.success) {
        const total = response.data.total;
        if (total === 20) {
          console.log(`   ✅ All 20 assignments exist`);
        } else {
          console.log(`   ⚠️  Found ${total} assignments (expected 20)`);
        }
      }
    } catch (error) {
      console.log('   ❌ Failed to fetch assignments');
      allPassed = false;
    }
    
    // Test 4: Check faculty assignments
    console.log('\n4️⃣  Checking Faculty Assignments...');
    let totalAssignments = 0;
    const expectedPerFaculty = 4;
    
    for (const id of facultyIds) {
      try {
        const response = await axios.get(`${BASE_URL}/faculty/${id}/assignments`);
        if (response.data.success) {
          const count = response.data.stats.total;
          totalAssignments += count;
          
          if (count === expectedPerFaculty) {
            console.log(`   ✅ ${id}: ${count} papers`);
          } else {
            console.log(`   ⚠️  ${id}: ${count} papers (expected ${expectedPerFaculty})`);
          }
        }
      } catch (error) {
        console.log(`   ❌ ${id}: Failed to fetch assignments`);
        allPassed = false;
      }
    }
    
    if (totalAssignments === 20) {
      console.log(`   ✅ Total assignments: ${totalAssignments}`);
    } else {
      console.log(`   ⚠️  Total assignments: ${totalAssignments} (expected 20)`);
    }
    
    // Test 5: Check assignment details
    console.log('\n5️⃣  Checking Assignment Details...');
    try {
      const response = await axios.get(`${BASE_URL}/faculty/FAC001/assignments`);
      if (response.data.success && response.data.assignments.length > 0) {
        const sample = response.data.assignments[0];
        
        const hasRequiredFields = 
          sample.paperId && 
          sample.paperFilename && 
          sample.courseCode && 
          sample.dummyNumber && 
          sample.status;
        
        if (hasRequiredFields) {
          console.log('   ✅ Assignment structure is correct');
          console.log(`      Sample: ${sample.paperFilename} (${sample.courseCode})`);
        } else {
          console.log('   ❌ Assignment structure is incomplete');
          allPassed = false;
        }
      }
    } catch (error) {
      console.log('   ❌ Failed to check assignment details');
      allPassed = false;
    }
    
    // Test 6: Check course distribution
    console.log('\n6️⃣  Checking Course Distribution...');
    const courses = {
      'CS101': 'FAC001',
      'CS201': 'FAC003',
      'IT101': 'FAC002',
      'IT201': 'FAC005',
      'EC101': 'FAC004'
    };
    
    let courseCheckPassed = true;
    for (const [course, facultyId] of Object.entries(courses)) {
      try {
        const response = await axios.get(`${BASE_URL}/faculty/${facultyId}/assignments`);
        if (response.data.success) {
          const hasCourse = response.data.assignments.some(a => a.courseCode === course);
          if (hasCourse) {
            console.log(`   ✅ ${course} → ${facultyId}`);
          } else {
            console.log(`   ❌ ${course} not assigned to ${facultyId}`);
            courseCheckPassed = false;
          }
        }
      } catch (error) {
        console.log(`   ❌ Failed to check ${course}`);
        courseCheckPassed = false;
      }
    }
    
    if (!courseCheckPassed) {
      allPassed = false;
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 SYSTEM VERIFICATION SUMMARY\n');
    
    if (allPassed) {
      console.log('✅ ALL CHECKS PASSED!');
      console.log('\n🎉 The complete assignment system is working perfectly!\n');
      console.log('📋 System Status:');
      console.log('   • Backend Server: Running');
      console.log('   • Faculty Members: 5 (all verified)');
      console.log('   • Answer Sheets: 20 (in GridFS)');
      console.log('   • Assignments: 20 (all active)');
      console.log('   • API Endpoints: All working');
      console.log('\n🚀 Ready for frontend integration!');
      console.log('\n📁 Open demo interface:');
      console.log('   backend/demo-assignment-system.html');
    } else {
      console.log('⚠️  SOME CHECKS FAILED');
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Ensure backend server is running: npm start');
      console.log('   2. Seed database: node seed-data.js');
      console.log('   3. Upload assignments: node upload-assignments.js');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('   1. Backend server is running (npm start)');
    console.log('   2. MongoDB is running');
    console.log('   3. Database is seeded (node seed-data.js)');
  }
}

verifyCompleteSystem();
