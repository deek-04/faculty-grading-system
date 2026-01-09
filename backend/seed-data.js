const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/online_valuation_system';
const dbName = process.env.DB_NAME || 'online_valuation_system';

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await db.collection('faculties').deleteMany({});
    await db.collection('assignments').deleteMany({});
    await db.collection('answerSheets.files').deleteMany({});
    await db.collection('answerSheets.chunks').deleteMany({});
    console.log('✓ Cleared existing data');
    
    // Create faculties
    console.log('\n👥 Creating faculty members...');
    const faculties = [
      {
        _id: new ObjectId(),
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@university.edu',
        employeeId: 'FAC001',
        department: 'Computer Science',
        status: 'verified',
        profileFaceUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
        verificationReason: ''
      },
      {
        _id: new ObjectId(),
        name: 'Prof. Priya Sharma',
        email: 'priya.sharma@university.edu',
        employeeId: 'FAC002',
        department: 'Information Technology',
        status: 'verified',
        profileFaceUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
        verificationReason: ''
      },
      {
        _id: new ObjectId(),
        name: 'Dr. Amit Patel',
        email: 'amit.patel@university.edu',
        employeeId: 'FAC003',
        department: 'Computer Science',
        status: 'verified',
        profileFaceUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
        verificationReason: ''
      },
      {
        _id: new ObjectId(),
        name: 'Dr. Sneha Reddy',
        email: 'sneha.reddy@university.edu',
        employeeId: 'FAC004',
        department: 'Electronics',
        status: 'verified',
        profileFaceUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
        verificationReason: ''
      },
      {
        _id: new ObjectId(),
        name: 'Prof. Vikram Singh',
        email: 'vikram.singh@university.edu',
        employeeId: 'FAC005',
        department: 'Information Technology',
        status: 'verified',
        profileFaceUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
        verificationReason: ''
      }
    ];
    
    await db.collection('faculties').insertMany(faculties);
    console.log(`✓ Created ${faculties.length} faculty members`);
    
    // Create dummy answer sheet files in GridFS
    console.log('\n📄 Creating dummy answer sheet files...');
    const bucket = new GridFSBucket(db, { bucketName: 'answerSheets' });
    
    const answerSheets = [];
    const courses = [
      { code: 'CS101', name: 'Data Structures' },
      { code: 'CS201', name: 'Algorithms' },
      { code: 'IT101', name: 'Database Systems' },
      { code: 'IT201', name: 'Web Technologies' },
      { code: 'EC101', name: 'Digital Electronics' }
    ];
    
    // Create dummy PDF content
    const dummyPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Dummy Answer Sheet) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000214 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n307\n%%EOF');
    
    let paperCount = 1;
    for (const course of courses) {
      // Create 4 answer sheets per course
      for (let i = 1; i <= 4; i++) {
        const paperId = `PAP${String(paperCount).padStart(3, '0')}`;
        const dummyNumber = `${course.code}-2024-${String(i).padStart(4, '0')}`;
        
        const uploadStream = bucket.openUploadStream(paperId, {
          metadata: {
            courseCode: course.code,
            courseName: course.name,
            dummyNumber: dummyNumber,
            uploadedAt: new Date(),
            uploadedBy: 'admin'
          }
        });
        
        uploadStream.write(dummyPdfContent);
        uploadStream.end();
        
        await new Promise((resolve, reject) => {
          uploadStream.on('finish', resolve);
          uploadStream.on('error', reject);
        });
        
        answerSheets.push({
          paperId: paperId,
          courseCode: course.code,
          dummyNumber: dummyNumber,
          fileId: uploadStream.id
        });
        
        paperCount++;
      }
    }
    
    console.log(`✓ Created ${answerSheets.length} answer sheet files`);
    
    // Display summary
    console.log('\n📊 Database Seeded Successfully!\n');
    console.log('Faculty Members:');
    faculties.forEach(f => {
      console.log(`  - ${f.employeeId}: ${f.name} (${f.department})`);
    });
    
    console.log('\nAnswer Sheets by Course:');
    courses.forEach(course => {
      const count = answerSheets.filter(a => a.courseCode === course.code).length;
      console.log(`  - ${course.code} (${course.name}): ${count} papers`);
    });
    
    console.log('\n✅ Ready to create assignment Excel sheet!');
    console.log('   Run: node create-assignment-excel.js');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();
