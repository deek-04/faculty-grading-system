# Admin Dashboard Design Document

## Overview

The Admin Dashboard is a comprehensive management interface for the Online Valuation System. It provides administrators with tools to manage faculty members, assign papers, monitor grading progress, handle verification, and receive automated reports. The system integrates with a local MongoDB database and extends the existing Faculty Grading System.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard (React)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Faculty    │  │   Paper      │  │  Verification│     │
│  │   List       │  │  Assignment  │  │  Management  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Search     │  │   Reports    │  │   Progress   │     │
│  │   Bar        │  │   Viewer     │  │   Tracking   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js/Express)             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Faculty    │  │  Assignment  │  │  Verification│     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Report     │  │   Excel      │  │   Database   │     │
│  │   Generator  │  │   Parser     │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              MongoDB (localhost:27017)                       │
├─────────────────────────────────────────────────────────────┤
│  Collections:                                                │
│  • admins          • faculties        • students            │
│  • evaluations     • answerSheets     • templates           │
│  • reports         • assignments      • verification_logs   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Tailwind CSS for styling
- Shadcn/ui components
- XLSX library for Excel handling
- React Query for data fetching
- Zustand for state management

**Backend:**
- Node.js with Express
- MongoDB Node.js Driver
- Multer for file uploads
- XLSX for Excel parsing
- Nodemailer for email notifications

## Components and Interfaces

### Frontend Components

#### 1. AdminDashboard Component
```typescript
interface AdminDashboardProps {
  adminData: Admin;
  onLogout: () => void;
}

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}
```

**Responsibilities:**
- Main container for admin interface
- Route management
- Authentication state

#### 2. FacultyList Component
```typescript
interface FacultyListProps {
  faculties: Faculty[];
  onRefresh: () => void;
  onAllowFaculty: (facultyId: string) => void;
}

interface Faculty {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  status: 'verified' | 'blocked' | 'pending';
  assignedPapers: number;
  correctedPapers: number;
  pendingPapers: number;
  lastActive: Date;
}
```

**Responsibilities:**
- Display faculty list with progress
- Show verification status
- Handle allow/block actions

#### 3. SearchBar Component
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}
```

**Responsibilities:**
- Real-time search input
- Debounced search queries
- Clear search functionality

#### 4. PaperAssignment Component
```typescript
interface PaperAssignmentProps {
  onAssignmentComplete: () => void;
}

interface AssignmentData {
  facultyId: string;
  paperId: string;
  courseCode: string;
  dummyNumber: string;
}
```

**Responsibilities:**
- Excel file upload
- Assignment validation
- Progress display
- Error handling

#### 5. ReportViewer Component
```typescript
interface ReportViewerProps {
  reports: Report[];
  onDownload: (reportId: string) => void;
}

interface Report {
  _id: string;
  facultyId: string;
  facultyName: string;
  generatedAt: Date;
  paperCount: number;
  reportType: 'detailed' | 'summary';
  fileUrl: string;
}
```

**Responsibilities:**
- Display generated reports
- Download functionality
- Filter by faculty/date

#### 6. ProgressTracker Component
```typescript
interface ProgressTrackerProps {
  faculty: Faculty;
}
```

**Responsibilities:**
- Visual progress bar
- Completion percentage
- Time estimates

### Backend API Endpoints

#### Faculty Management

```typescript
// GET /api/admin/faculties
// Get all faculties with progress
Response: {
  success: boolean;
  data: Faculty[];
  total: number;
}

// GET /api/admin/faculties/search?q=name
// Search faculties by name
Response: {
  success: boolean;
  data: Faculty[];
  count: number;
}

// PUT /api/admin/faculties/:id/verify
// Allow/verify a faculty
Request: {
  status: 'verified' | 'blocked';
  reason?: string;
}
Response: {
  success: boolean;
  message: string;
}
```

#### Paper Assignment

```typescript
// POST /api/admin/assignments/upload
// Upload Excel file for paper assignment
Request: FormData {
  file: File; // Excel file
}
Response: {
  success: boolean;
  assigned: number;
  errors: string[];
  details: AssignmentResult[];
}

// GET /api/admin/assignments
// Get all assignments
Response: {
  success: boolean;
  data: Assignment[];
}

interface Assignment {
  _id: string;
  facultyId: string;
  paperId: string;
  assignedAt: Date;
  status: 'pending' | 'completed';
  completedAt?: Date;
}
```

#### Reports

```typescript
// GET /api/admin/reports
// Get all generated reports
Response: {
  success: boolean;
  data: Report[];
}

// GET /api/admin/reports/:id/download
// Download a specific report
Response: File (Excel)

// POST /api/admin/reports/generate/:facultyId
// Manually trigger report generation
Response: {
  success: boolean;
  reports: {
    detailed: string; // file path
    summary: string; // file path
  }
}
```

## Data Models

### MongoDB Schemas

#### Faculty Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  employeeId: String,
  department: String,
  status: String, // 'verified', 'blocked', 'pending'
  profileFaceUrl: String,
  createdAt: Date,
  updatedAt: Date,
  lastActive: Date,
  verificationReason: String
}
```

#### Evaluations Collection
```javascript
{
  _id: ObjectId,
  facultyId: ObjectId,
  paperId: ObjectId,
  studentId: ObjectId,
  dummyNumber: String,
  courseCode: String,
  questionMarks: {
    q1: Number,
    q2: Number,
    // ... more questions
  },
  totalMarks: Number,
  obtainedMarks: Number,
  percentage: Number,
  correctionTime: Number, // seconds
  status: String, // 'pending', 'completed'
  startedAt: Date,
  completedAt: Date,
  createdAt: Date
}
```

#### Assignments Collection
```javascript
{
  _id: ObjectId,
  facultyId: ObjectId,
  paperId: ObjectId,
  courseCode: String,
  dummyNumber: String,
  assignedBy: ObjectId, // admin ID
  assignedAt: Date,
  status: String, // 'pending', 'in_progress', 'completed'
  completedAt: Date
}
```

#### Reports Collection
```javascript
{
  _id: ObjectId,
  facultyId: ObjectId,
  facultyName: String,
  reportType: String, // 'detailed', 'summary'
  paperCount: Number,
  filePath: String,
  fileName: String,
  generatedAt: Date,
  sentToAdmin: Boolean,
  downloadCount: Number
}
```

#### Verification Logs Collection
```javascript
{
  _id: ObjectId,
  facultyId: ObjectId,
  adminId: ObjectId,
  action: String, // 'blocked', 'verified'
  reason: String,
  timestamp: Date
}
```

## Excel File Formats

### Assignment Upload Format
```
| Faculty ID | Paper ID | Course Code | Dummy Number |
|------------|----------|-------------|--------------|
| FAC001     | PAP001   | CS101       | CS01-2024-0001 |
| FAC001     | PAP002   | CS101       | CS01-2024-0002 |
| FAC002     | PAP003   | IT201       | IT02-2024-0001 |
```

### Report 1 - Detailed Report Format
```
| Dummy Number | Course Code | Q1 | Q2 | ... | Total | Obtained | % | Time (min) | Faculty Name | Faculty ID |
|--------------|-------------|----|----|-----|-------|----------|---|------------|--------------|------------|
| CS01-2024-0001 | CS101     | 2  | 15 | ... | 100   | 85       | 85| 12         | Dr. Smith    | FAC001     |
```

### Report 2 - Summary Report Format
```
| Dummy Number | Course Code | Total Marks |
|--------------|-------------|-------------|
| CS01-2024-0001 | CS101     | 85          |
| CS01-2024-0002 | CS101     | 92          |
```

## Error Handling

### Error Types and Responses

```typescript
enum ErrorCode {
  INVALID_FACULTY_ID = 'INVALID_FACULTY_ID',
  INVALID_PAPER_ID = 'INVALID_PAPER_ID',
  DUPLICATE_ASSIGNMENT = 'DUPLICATE_ASSIGNMENT',
  FACULTY_BLOCKED = 'FACULTY_BLOCKED',
  EXCEL_PARSE_ERROR = 'EXCEL_PARSE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  }
}
```

### Error Handling Strategy

1. **Validation Errors**: Return 400 with specific error details
2. **Database Errors**: Return 500 with generic message, log details
3. **Authentication Errors**: Return 401 with redirect to login
4. **File Upload Errors**: Return 400 with file-specific errors
5. **Transaction Failures**: Rollback and return 500 with retry option

## Testing Strategy

### Unit Tests
- Excel parser functions
- Data validation functions
- Report generation logic
- Database query functions

### Integration Tests
- API endpoint testing
- MongoDB operations
- File upload and processing
- Report generation workflow

### End-to-End Tests
- Complete assignment workflow
- Faculty verification process
- Report generation and download
- Search and filter functionality

## Performance Considerations

1. **Database Indexing**:
   - Index on facultyId, paperId, status
   - Compound index on (facultyId, status)
   - Text index on faculty name for search

2. **Caching**:
   - Cache faculty list for 30 seconds
   - Cache report metadata
   - Use React Query for client-side caching

3. **Pagination**:
   - Paginate faculty list (50 per page)
   - Paginate reports list (20 per page)
   - Lazy load assignment history

4. **File Handling**:
   - Stream large Excel files
   - Process assignments in batches (100 at a time)
   - Use background jobs for report generation

## Security Considerations

1. **Authentication**: Admin-only access with JWT tokens
2. **Authorization**: Verify admin role for all endpoints
3. **File Upload**: Validate file type, size, and content
4. **SQL Injection**: Use parameterized queries (MongoDB)
5. **XSS Protection**: Sanitize all user inputs
6. **Rate Limiting**: Limit API calls per admin (100/min)
7. **Audit Logging**: Log all admin actions to database

## Deployment Notes

1. **MongoDB Setup**: Ensure MongoDB is running on localhost:27017
2. **Environment Variables**: Configure admin credentials
3. **File Storage**: Set up directory for Excel uploads and reports
4. **Email Configuration**: Configure SMTP for report notifications
5. **Backup Strategy**: Daily MongoDB backups
6. **Monitoring**: Set up logging and error tracking
