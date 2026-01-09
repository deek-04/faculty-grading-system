const { MongoClient } = require('mongodb');

// Test local MongoDB connection
async function testConnection() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to local MongoDB');
    
    const db = client.db('faculty-grading');
    
    // Test creating sample data
    const facultyData = [
      {
        employeeId: 'FAC001',
        registerNumber: 'FAC001',
        name: 'Dr. John Smith',
        email: 'john.smith@university.edu',
        department: 'Computer Science',
        sections: ['CS101-A', 'CS101-B']
      }
    ];
    
    const assignments = [
      {
        _id: 'assignment1',
        paperId: 'PAPER001',
        facultyId: 'FAC001',
        dummyNumber: 'D001',
        studentName: 'Student A',
        courseCode: 'CS101',
        section: 'A',
        status: 'pending',
        paperFilename: 'answer-sheet-1.pdf',
        totalMarks: 100,
        obtainedMarks: 0,
        assignedDate: new Date()
      },
      {
        _id: 'assignment2',
        paperId: 'PAPER002',
        facultyId: 'FAC001',
        dummyNumber: 'D002',
        studentName: 'Student B',
        courseCode: 'CS101',
        section: 'A',
        status: 'pending',
        paperFilename: 'answer-sheet-2.pdf',
        totalMarks: 100,
        obtainedMarks: 0,
        assignedDate: new Date()
      }
    ];
    
    const reports = [
      {
        _id: 'report1',
        facultyId: 'FAC001',
        facultyName: 'Dr. John Smith',
        courseCode: 'CS101',
        section: 'A',
        totalPapers: 25,
        completedPapers: 15,
        pendingPapers: 10,
        averageMarks: 78.5,
        completionPercentage: 60,
        lastUpdated: new Date()
      }
    ];
    
    // Clear existing data
    await db.collection('faculty').deleteMany({});
    await db.collection('assignments').deleteMany({});
    await db.collection('reports').deleteMany({});
    
    // Insert sample data
    await db.collection('faculty').insertMany(facultyData);
    await db.collection('assignments').insertMany(assignments);
    await db.collection('reports').insertMany(reports);
    
    console.log('✅ Sample data created successfully');
    console.log('📊 You can now view this data in MongoDB Compass');
    console.log('🌐 Database: faculty-grading');
    console.log('📁 Collections: faculty, assignments, reports');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('💡 Make sure MongoDB is running locally');
    console.log('💡 Or use MongoDB Atlas for cloud database');
  } finally {
    await client.close();
  }
}

testConnection();