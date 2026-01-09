# 4-Paper Limit and Automatic Report Generation Implementation

## Overview
This implementation ensures that faculty members can only correct their assigned 4 papers, and reports are automatically generated when all 4 papers are completed.

## Changes Made

### 1. Grading Interface (`Faculty Grading System/src/components/grading-interface.tsx`)

#### Key Changes:
- **Removed dummy data generation**: Replaced `initializePapers()` with `loadAssignedPapers()`
- **Real assignment loading**: Now fetches only the 4 assigned papers from the database via API
- **Database integration**: Updates assignment status in MongoDB when papers are graded
- **Automatic report trigger**: Calls the check-completion endpoint when all 4 papers are done

#### New Functions:
```typescript
loadAssignedPapers() - Fetches assigned papers from backend
savePaperGrading() - Updates assignment status and triggers report generation
```

#### Flow:
1. Faculty logs in → System loads their 4 assigned papers
2. Faculty grades a paper → Status updated to 'completed' in database
3. When 4th paper is completed → Automatic report generation triggered
4. Reports saved to admin portal for download

### 2. Backend API (`backend/src/routes/faculty.js`)

#### Existing Endpoints Used:
- `GET /api/faculty/:employeeId/assignments` - Returns only assigned papers (max 4)
- `PUT /api/faculty/assignments/:id/status` - Updates assignment completion status
- `POST /api/faculty/:employeeId/check-completion` - Checks if all papers done and generates reports

### 3. Admin Dashboard (`Faculty Grading System/src/components/admin-dashboard.tsx`)

#### Reports Tab Features:
- Lists all generated reports
- Shows faculty name, employee ID, papers corrected, and generation date
- Download buttons for both detailed and summary reports
- Faculty progress overview showing completion status

#### Report Download:
- Detailed Report: Contains question-wise marks, correction time, faculty details
- Summary Report: Contains only dummy number, course code, and total marks

### 4. Report Generator (`backend/src/utils/reportGenerator.js`)

#### Existing Functionality:
- `generateDetailedReport()` - Creates Excel with full grading details
- `generateSummaryReport()` - Creates Excel with summary data
- `generateReportsForFaculty()` - Generates both reports and saves metadata to database

## How It Works

### Faculty Workflow:
1. Faculty logs in with credentials
2. Dashboard shows exactly 4 assigned papers
3. Faculty clicks "Start Grading"
4. Grading interface loads only the 4 assigned papers
5. Faculty grades each paper and saves
6. When 4th paper is saved:
   - System detects all papers completed
   - Automatically generates 2 Excel reports
   - Reports saved to `backend/reports/` directory
   - Report metadata saved to MongoDB
   - Toast notification confirms report generation

### Admin Workflow:
1. Admin logs into admin portal
2. Navigates to "Correction Reports" tab
3. Sees list of all generated reports
4. Can download:
   - Detailed Report (with question-wise marks)
   - Summary Report (with total marks only)
5. Can view faculty progress overview

## Database Collections

### assignments
```javascript
{
  _id: ObjectId,
  facultyId: ObjectId,
  paperId: ObjectId,
  courseCode: String,
  dummyNumber: String,
  status: 'pending' | 'in_progress' | 'completed',
  marks: Array,
  correctionTime: Number,
  completedAt: Date
}
```

### reports
```javascript
{
  _id: ObjectId,
  facultyId: ObjectId,
  facultyName: String,
  employeeId: String,
  detailedReportFile: String,
  summaryReportFile: String,
  totalPapers: Number,
  generatedAt: Date
}
```

## Testing

Run the test script to verify:
```bash
node backend/test-4-paper-limit.js
```

This will check:
- Each faculty has exactly 4 papers assigned
- Completed papers are marked correctly
- Reports are generated when all 4 papers are done

## Key Features

✅ **4-Paper Limit**: Faculty can only see and grade their assigned 4 papers
✅ **No Extra Papers**: System prevents loading more than assigned papers
✅ **Automatic Reports**: Reports generated immediately when 4th paper is completed
✅ **Admin Access**: Admin can download both detailed and summary reports
✅ **Real-time Updates**: Assignment status updated in real-time
✅ **Progress Tracking**: Admin can see completion status for all faculty

## File Locations

- Grading Interface: `Faculty Grading System/src/components/grading-interface.tsx`
- Admin Dashboard: `Faculty Grading System/src/components/admin-dashboard.tsx`
- Faculty Routes: `backend/src/routes/faculty.js`
- Admin Routes: `backend/src/routes/admin.js`
- Report Generator: `backend/src/utils/reportGenerator.js`
- Generated Reports: `backend/reports/`

## Notes

- Reports are stored in `backend/reports/` directory
- Report filenames include employee ID and timestamp
- Both detailed and summary reports are generated automatically
- Admin can download reports multiple times
- System prevents duplicate assignments via Excel upload validation
