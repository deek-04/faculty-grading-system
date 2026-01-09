# Paper Assignment System - Complete Guide

## 🎯 Overview

This guide explains the complete paper assignment system that allows admins to upload Excel sheets with faculty-paper assignments, which are then visible to faculty members when they log in.

## 📊 System Components

### 1. Database Setup
- **5 Faculty Members** created with verified status
- **20 Answer Sheets** (4 per course) stored in GridFS
- **5 Courses**: CS101, CS201, IT101, IT201, EC101

### 2. Faculty Members

| Employee ID | Name | Department | Papers Assigned |
|-------------|------|------------|-----------------|
| FAC001 | Dr. Rajesh Kumar | Computer Science | 4 (CS101) |
| FAC002 | Prof. Priya Sharma | Information Technology | 4 (IT101) |
| FAC003 | Dr. Amit Patel | Computer Science | 4 (CS201) |
| FAC004 | Dr. Sneha Reddy | Electronics | 4 (EC101) |
| FAC005 | Prof. Vikram Singh | Information Technology | 4 (IT201) |

### 3. Assignment Distribution

**Total: 20 assignments across 5 courses**

- **CS101 (Data Structures)**: 4 papers → Dr. Rajesh Kumar (FAC001)
- **CS201 (Algorithms)**: 4 papers → Dr. Amit Patel (FAC003)
- **IT101 (Database Systems)**: 4 papers → Prof. Priya Sharma (FAC002)
- **IT201 (Web Technologies)**: 4 papers → Prof. Vikram Singh (FAC005)
- **EC101 (Digital Electronics)**: 4 papers → Dr. Sneha Reddy (FAC004)

## 🚀 Quick Start

### Step 1: Seed the Database
```bash
cd backend
node seed-data.js
```

This creates:
- 5 faculty members
- 20 answer sheet files in GridFS
- All with verified status

### Step 2: Create Assignment Excel Sheet
```bash
node create-assignment-excel.js
```

This generates `paper-assignments.xlsx` with all assignments.

### Step 3: Upload Assignments (Simulating Admin Action)
```bash
node upload-assignments.js
```

This uploads the Excel file through the API, creating all assignments.

### Step 4: Verify Faculty Can See Assignments
```bash
node test-faculty-api.js
```

This tests that faculty members can retrieve their assignments.

## 📁 Excel File Format

The assignment Excel file (`paper-assignments.xlsx`) has the following structure:

| Faculty ID | Paper ID | Course Code | Dummy Number |
|------------|----------|-------------|--------------|
| FAC001 | PAP001 | CS101 | CS101-2024-0001 |
| FAC001 | PAP002 | CS101 | CS101-2024-0002 |
| FAC002 | PAP009 | IT101 | IT101-2024-0001 |
| ... | ... | ... | ... |

**Column Requirements:**
- All columns are required
- Column names are case-insensitive
- Faculty ID must exist in the database
- Paper ID must exist in GridFS (answerSheets.files)

## 🔌 API Endpoints

### Admin Endpoints

#### 1. Upload Assignment Excel
```http
POST /api/admin/assignments/upload
Content-Type: multipart/form-data

Body: file (Excel file)
```

**Response:**
```json
{
  "success": true,
  "assigned": 20,
  "errors": [],
  "details": [
    {
      "row": 2,
      "facultyId": "FAC001",
      "paperId": "PAP001",
      "status": "success",
      "message": "Assignment created successfully"
    }
  ]
}
```

#### 2. Get All Assignments
```http
GET /api/admin/assignments
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "facultyId": "...",
      "facultyName": "Dr. Rajesh Kumar",
      "facultyEmployeeId": "FAC001",
      "paperId": "...",
      "paperFilename": "PAP001",
      "courseCode": "CS101",
      "dummyNumber": "CS101-2024-0001",
      "status": "pending",
      "assignedAt": "2024-11-15T..."
    }
  ],
  "total": 20
}
```

### Faculty Endpoints

#### 1. Get Faculty Profile
```http
GET /api/faculty/:employeeId/profile
```

**Example:** `GET /api/faculty/FAC001/profile`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Dr. Rajesh Kumar",
    "email": "rajesh.kumar@university.edu",
    "employeeId": "FAC001",
    "department": "Computer Science",
    "status": "verified",
    "assignedPapers": 4,
    "correctedPapers": 0,
    "pendingPapers": 4
  }
}
```

#### 2. Get Faculty Assignments
```http
GET /api/faculty/:employeeId/assignments
```

**Example:** `GET /api/faculty/FAC001/assignments`

**Response:**
```json
{
  "success": true,
  "faculty": {
    "_id": "...",
    "name": "Dr. Rajesh Kumar",
    "employeeId": "FAC001",
    "department": "Computer Science"
  },
  "stats": {
    "total": 4,
    "pending": 4,
    "inProgress": 0,
    "completed": 0,
    "courses": 1
  },
  "assignments": [
    {
      "_id": "...",
      "paperId": "...",
      "paperFilename": "PAP001",
      "paperMetadata": {
        "courseCode": "CS101",
        "courseName": "Data Structures",
        "dummyNumber": "CS101-2024-0001"
      },
      "courseCode": "CS101",
      "dummyNumber": "CS101-2024-0001",
      "assignedAt": "2024-11-15T...",
      "status": "pending",
      "completedAt": null
    }
  ],
  "groupedByCourse": {
    "CS101": [...]
  }
}
```

## 🎨 Frontend Integration

### Admin Dashboard - Upload Excel

The admin dashboard should have a file upload component:

```jsx
// Example component structure
<div>
  <h2>Upload Paper Assignments</h2>
  <input 
    type="file" 
    accept=".xlsx,.xls"
    onChange={handleFileUpload}
  />
  <button onClick={uploadAssignments}>Upload</button>
</div>
```

**API Call:**
```javascript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('http://localhost:5000/api/admin/assignments/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(`Assigned ${result.assigned} papers`);
```

### Faculty Dashboard - View Assignments

The faculty dashboard should fetch and display assignments:

```jsx
// Example component structure
useEffect(() => {
  const fetchAssignments = async () => {
    const response = await fetch(
      `http://localhost:5000/api/faculty/${employeeId}/assignments`
    );
    const data = await response.json();
    setAssignments(data.assignments);
    setStats(data.stats);
  };
  
  fetchAssignments();
}, [employeeId]);
```

**Display Structure:**
```jsx
<div>
  <h2>My Assignments</h2>
  <div>
    <p>Total: {stats.total}</p>
    <p>Pending: {stats.pending}</p>
    <p>Completed: {stats.completed}</p>
  </div>
  
  {Object.keys(groupedByCourse).map(course => (
    <div key={course}>
      <h3>{course}</h3>
      {groupedByCourse[course].map(assignment => (
        <div key={assignment._id}>
          <p>Paper: {assignment.paperFilename}</p>
          <p>Dummy: {assignment.dummyNumber}</p>
          <p>Status: {assignment.status}</p>
          <button>Start Grading</button>
        </div>
      ))}
    </div>
  ))}
</div>
```

## 🔐 Faculty Login Credentials

Faculty members can login using their Employee ID:

| Employee ID | Name | Password (if needed) |
|-------------|------|---------------------|
| FAC001 | Dr. Rajesh Kumar | (set as needed) |
| FAC002 | Prof. Priya Sharma | (set as needed) |
| FAC003 | Dr. Amit Patel | (set as needed) |
| FAC004 | Dr. Sneha Reddy | (set as needed) |
| FAC005 | Prof. Vikram Singh | (set as needed) |

## ✅ Validation Rules

### Excel Upload Validation
1. ✅ File must be .xlsx or .xls format
2. ✅ File size must be under 5MB
3. ✅ Required columns: Faculty ID, Paper ID, Course Code, Dummy Number
4. ✅ All fields must be filled
5. ✅ Faculty ID must exist in database
6. ✅ Paper ID must exist in GridFS
7. ✅ Faculty must not be blocked
8. ✅ No duplicate assignments (same faculty + paper)

### Faculty Access Validation
1. ✅ Faculty must exist in database
2. ✅ Faculty status must be 'verified'
3. ✅ Only assigned papers are visible to faculty

## 📝 Testing

### Test Scripts Available

1. **test-assignment-api.js** - Tests admin assignment endpoints
2. **test-faculty-api.js** - Tests faculty endpoints
3. **upload-assignments.js** - Uploads the Excel file
4. **seed-data.js** - Seeds the database with test data
5. **create-assignment-excel.js** - Creates the Excel file

### Run All Tests
```bash
# 1. Seed database
node seed-data.js

# 2. Create Excel
node create-assignment-excel.js

# 3. Upload assignments
node upload-assignments.js

# 4. Test faculty endpoints
node test-faculty-api.js

# 5. Test admin endpoints
node test-assignment-api.js
```

## 🎯 Next Steps

### For Admin Dashboard
1. Add file upload component
2. Display upload results (success/errors)
3. Show list of all assignments
4. Add filters by faculty/course/status

### For Faculty Dashboard
1. Fetch assignments on login
2. Display assignments grouped by course
3. Show statistics (total, pending, completed)
4. Add "Start Grading" button for each paper
5. Update assignment status when grading starts/completes

### Additional Features
1. Add assignment deletion endpoint
2. Add assignment update endpoint
3. Add bulk assignment status update
4. Add assignment history/audit log
5. Add email notifications when papers are assigned

## 🐛 Troubleshooting

### Issue: Faculty has 0 assignments
**Solution:** Run `node upload-assignments.js` to upload the Excel file

### Issue: Upload fails with "Invalid faculty IDs"
**Solution:** Run `node seed-data.js` to create faculty members first

### Issue: Upload fails with "Invalid paper IDs"
**Solution:** Ensure `seed-data.js` was run to create answer sheets in GridFS

### Issue: Faculty endpoint returns 404
**Solution:** Restart the backend server to load the new routes

## 📦 Files Created

### Backend Files
- `backend/seed-data.js` - Database seeding script
- `backend/create-assignment-excel.js` - Excel generation script
- `backend/upload-assignments.js` - Assignment upload script
- `backend/test-faculty-api.js` - Faculty endpoint tests
- `backend/src/routes/faculty.js` - Faculty API routes
- `backend/src/utils/excelParser.js` - Excel parsing utility
- `backend/paper-assignments.xlsx` - Generated Excel file

### Documentation
- `backend/ASSIGNMENT_SYSTEM_GUIDE.md` - This file
- `backend/ASSIGNMENT_API_IMPLEMENTATION.md` - API implementation details

## 🎉 Success Criteria

✅ Database seeded with 5 faculty members and 20 answer sheets  
✅ Excel file created with 20 assignments  
✅ Excel file uploaded successfully through API  
✅ All 20 assignments created in database  
✅ Faculty can retrieve their profile with assignment counts  
✅ Faculty can retrieve their assigned papers  
✅ Assignments grouped by course code  
✅ Statistics calculated correctly  
✅ All validations working (duplicate check, blocked faculty, etc.)  

## 🚀 System is Ready!

The paper assignment system is fully functional and ready for frontend integration. Faculty members can now login and see their assigned papers, and admins can upload Excel files to create new assignments.
