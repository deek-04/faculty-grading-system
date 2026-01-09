/**
 * Test script to verify 4-paper limit and automatic report generation
 */

const database = require('./src/config/database');

async function testFourPaperLimit() {
  try {
    await database.connect();
    const db = database.getDb();
    
    console.log('=== Testing 4-Paper Limit and Report Generation ===\n');
    
    // Get all faculties
    const faculties = await db.collection('faculties').find({}).toArray();
    console.log(`Total faculties: ${faculties.length}\n`);
    
    // Check assignments for each faculty
    for (const faculty of faculties) {
      const assignments = await db.collection('assignments')
        .find({ facultyId: faculty._id })
        .toArray();
      
      const completed = assignments.filter(a => a.status === 'completed').length;
      const pending = assignments.filter(a => a.status === 'pending').length;
      
      console.log(`Faculty: ${faculty.name} (${faculty.employeeId})`);
      console.log(`  Total Assigned: ${assignments.length}`);
      console.log(`  Completed: ${completed}`);
      console.log(`  Pending: ${pending}`);
      
      if (assignments.length > 4) {
        console.log(`  ⚠️  WARNING: More than 4 papers assigned!`);
      } else if (assignments.length === 4) {
        console.log(`  ✅ Correct: Exactly 4 papers assigned`);
      }
      
      // Check if reports exist for completed faculty
      if (completed === 4) {
        const report = await db.collection('reports').findOne({ 
          employeeId: faculty.employeeId 
        });
        
        if (report) {
          console.log(`  ✅ Report generated: ${report.detailedReportFile}`);
        } else {
          console.log(`  ⚠️  WARNING: All 4 papers completed but no report found!`);
        }
      }
      
      console.log('');
    }
    
    // Check total reports
    const totalReports = await db.collection('reports').countDocuments({});
    console.log(`\nTotal reports generated: ${totalReports}`);
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    process.exit(0);
  }
}

testFourPaperLimit();
