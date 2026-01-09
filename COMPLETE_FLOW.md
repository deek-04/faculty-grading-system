# Complete Flow: 4-Paper Limit & Automatic Report Generation

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN UPLOADS ASSIGNMENTS                    │
│                                                                   │
│  1. Admin uploads Excel with faculty-paper assignments          │
│  2. System validates: Each faculty gets exactly 4 papers        │
│  3. Assignments stored in MongoDB                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FACULTY LOGS IN                             │
│                                                                   │
│  1. Faculty enters credentials (e.g., FAC001)                   │
│  2. System fetches their 4 assigned papers from database        │
│  3. Dashboard displays: 4 papers assigned, 0 completed          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   FACULTY STARTS GRADING                         │
│                                                                   │
│  1. Faculty clicks "Start Grading"                              │
│  2. Grading interface loads ONLY the 4 assigned papers          │
│  3. No access to any other papers                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GRADING PAPER 1                               │
│                                                                   │
│  1. Faculty views answer sheet                                   │
│  2. Allocates marks for each question                           │
│  3. Clicks "Save & Next Paper"                                  │
│  4. System updates assignment status to 'completed'             │
│  5. Moves to Paper 2                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GRADING PAPERS 2 & 3                          │
│                                                                   │
│  Same process as Paper 1                                         │
│  Progress: 3/4 papers completed                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GRADING PAPER 4 (FINAL)                       │
│                                                                   │
│  1. Faculty grades the 4th paper                                │
│  2. Clicks "Save & Next Paper"                                  │
│  3. System detects: All 4 papers completed!                     │
│  4. Automatic report generation triggered                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  AUTOMATIC REPORT GENERATION                     │
│                                                                   │
│  1. System calls: POST /api/faculty/:id/check-completion        │
│  2. Report Generator creates 2 Excel files:                     │
│     a) Detailed Report (question-wise marks)                    │
│     b) Summary Report (total marks only)                        │
│  3. Files saved to: backend/reports/                            │
│  4. Report metadata saved to MongoDB                            │
│  5. Toast: "Reports generated successfully!"                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   ADMIN VIEWS REPORTS                            │
│                                                                   │
│  1. Admin logs into admin portal                                │
│  2. Navigates to "Correction Reports" tab                       │
│  3. Sees list of all generated reports                          │
│  4. Downloads detailed or summary report                        │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Step-by-Step Flow

### Phase 1: Assignment Setup (Admin)

**Step 1.1: Admin Uploads Excel**
```
Admin Portal → Papers & Assignments → Upload Assignment Excel
```

**Step 1.2: System Validates**
- Checks each faculty ID exists
- Checks each paper ID exists
- Ensures no duplicates
- Validates exactly 4 papers per faculty

**Step 1.3: Assignments Created**
```javascript
{
  facultyId: ObjectId("..."),
  paperId: ObjectId("..."),
  courseCode: "CS101",
  dummyNumber: "CS101-2024-0001",
  status: "pending"
}
```

### Phase 2: Faculty Grading

**Step 2.1: Faculty Login**
```
Faculty Login → Enter FAC001 → Dashboard Loads
```

**Step 2.2: Load Assigned Papers**
```javascript
GET /api/faculty/FAC001/assignments
Response: [
  { paperId: "...", dummyNumber: "CS101-2024-0001", status: "pending" },
  { paperId: "...", dummyNumber: "CS101-2024-0002", status: "pending" },
  { paperId: "...", dummyNumber: "CS101-2024-0003", status: "pending" },
  { paperId: "...", dummyNumber: "CS101-2024-0004", status: "pending" }
]
```

**Step 2.3: Start Grading**
```
Dashboard → Start Grading → Grading Interface Opens
```

**Step 2.4: Grade Each Paper**
```javascript
// For each paper:
1. View answer sheet
2. Allocate marks
3. Save paper

PUT /api/faculty/assignments/:id/status
Body: {
  status: "completed",
  marks: [
    { questionNumber: 1, maxMarks: 2, marksObtained: 2 },
    { questionNumber: 2, maxMarks: 2, marksObtained: 1.5 },
    // ... all questions
  ],
  correctionTime: 15 // minutes
}
```

**Step 2.5: Complete 4th Paper**
```javascript
// After saving 4th paper:
System checks: All 4 papers completed?
If yes → Trigger report generation

POST /api/faculty/FAC001/check-completion
Response: {
  success: true,
  allCompleted: true,
  message: "All papers completed! Reports generated successfully.",
  reports: {
    detailed: "detailed_report_FAC001_1234567890.xlsx",
    summary: "summary_report_FAC001_1234567890.xlsx"
  }
}
```

### Phase 3: Report Generation

**Step 3.1: Generate Detailed Report**
```
Columns:
- Dummy Number
- Course Code
- Question 1, Q1 Max, Question 2, Q2 Max, ... (all questions)
- Total Marks
- Max Marks
- Correction Time (min)
- Faculty Name
- Faculty ID
- Corrected Date
```

**Step 3.2: Generate Summary Report**
```
Columns:
- Dummy Number
- Course Code
- Total Marks
```

**Step 3.3: Save Reports**
```
Files saved to: backend/reports/
- detailed_report_FAC001_1234567890.xlsx
- summary_report_FAC001_1234567890.xlsx

Metadata saved to MongoDB:
{
  facultyId: ObjectId("..."),
  facultyName: "Dr. Rajesh Kumar",
  employeeId: "FAC001",
  detailedReportFile: "detailed_report_FAC001_1234567890.xlsx",
  summaryReportFile: "summary_report_FAC001_1234567890.xlsx",
  totalPapers: 4,
  generatedAt: ISODate("2024-11-15T10:30:00Z")
}
```

### Phase 4: Admin Access

**Step 4.1: Admin Views Reports**
```
Admin Portal → Correction Reports → See all reports
```

**Step 4.2: Download Report**
```
Click "Download Detailed" or "Download Summary"

GET /api/admin/reports/FAC001/download/detailed
→ Downloads: detailed_report_FAC001_1234567890.xlsx

GET /api/admin/reports/FAC001/download/summary
→ Downloads: summary_report_FAC001_1234567890.xlsx
```

## Key Constraints Enforced

### 1. 4-Paper Limit
```javascript
// In grading interface:
loadAssignedPapers() {
  // Fetches ONLY assigned papers from database
  // No way to access other papers
  // Maximum 4 papers per faculty
}
```

### 2. No Extra Papers
```javascript
// In Excel upload validation:
if (facultyPaperCount > 4) {
  throw new Error("Faculty cannot be assigned more than 4 papers");
}
```

### 3. Automatic Report Trigger
```javascript
// In savePaperGrading():
const allCompleted = papers.every(p => p.isGraded);
if (allCompleted) {
  // Automatically call report generation
  await fetch(`/api/faculty/${employeeId}/check-completion`, {
    method: 'POST'
  });
}
```

## Database State Changes

### Before Grading
```javascript
assignments: [
  { facultyId: "FAC001", paperId: "P1", status: "pending" },
  { facultyId: "FAC001", paperId: "P2", status: "pending" },
  { facultyId: "FAC001", paperId: "P3", status: "pending" },
  { facultyId: "FAC001", paperId: "P4", status: "pending" }
]

reports: []
```

### After Grading 2 Papers
```javascript
assignments: [
  { facultyId: "FAC001", paperId: "P1", status: "completed", marks: [...] },
  { facultyId: "FAC001", paperId: "P2", status: "completed", marks: [...] },
  { facultyId: "FAC001", paperId: "P3", status: "pending" },
  { facultyId: "FAC001", paperId: "P4", status: "pending" }
]

reports: []
```

### After Grading All 4 Papers
```javascript
assignments: [
  { facultyId: "FAC001", paperId: "P1", status: "completed", marks: [...] },
  { facultyId: "FAC001", paperId: "P2", status: "completed", marks: [...] },
  { facultyId: "FAC001", paperId: "P3", status: "completed", marks: [...] },
  { facultyId: "FAC001", paperId: "P4", status: "completed", marks: [...] }
]

reports: [
  {
    facultyId: "FAC001",
    detailedReportFile: "detailed_report_FAC001_1234567890.xlsx",
    summaryReportFile: "summary_report_FAC001_1234567890.xlsx",
    totalPapers: 4,
    generatedAt: ISODate("2024-11-15T10:30:00Z")
  }
]
```

## Error Handling

### Scenario 1: Faculty tries to access more papers
```
Result: Not possible - system only loads assigned papers
```

### Scenario 2: Admin uploads more than 4 papers per faculty
```
Result: Validation error - upload rejected
```

### Scenario 3: Report generation fails
```
Result: Error logged, toast notification shown, admin notified
```

### Scenario 4: Faculty completes papers out of order
```
Result: Works fine - system checks total completion, not order
```

## Success Indicators

✅ Faculty dashboard shows exactly 4 papers
✅ Grading interface loads exactly 4 papers
✅ No way to access additional papers
✅ Reports generated automatically on 4th paper completion
✅ Both report types created successfully
✅ Reports available in admin portal
✅ Download functionality works
✅ Progress tracking accurate

## Testing Checklist

- [ ] Login as faculty FAC001
- [ ] Verify dashboard shows 4 papers
- [ ] Start grading
- [ ] Verify grading interface shows 4 papers
- [ ] Grade paper 1 and save
- [ ] Verify status updated to completed
- [ ] Grade papers 2 and 3
- [ ] Grade paper 4 (final)
- [ ] Verify toast: "Reports generated successfully!"
- [ ] Login as admin
- [ ] Navigate to Correction Reports
- [ ] Verify report appears in list
- [ ] Download detailed report
- [ ] Download summary report
- [ ] Verify Excel files contain correct data
