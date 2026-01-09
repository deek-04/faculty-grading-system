# Paper Assignment Excel Sheet

## File Created
✅ **paper-assignments.xlsx**

## Location
`backend/paper-assignments.xlsx`

## Contents

### Assignment Structure
Each row contains:
- **Faculty ID**: Employee ID (FAC001, FAC002, etc.)
- **Faculty Name**: Full name of the faculty member
- **Paper ID**: Unique paper identifier (answer-sheet-1.pdf, etc.)
- **Course Code**: Course code (CS101, CS102, IT201, EC301, ME401)
- **Dummy Number**: Anonymized student identifier (CS101-2025-0001, etc.)
- **Assigned Date**: Date of assignment
- **Status**: Current status (Pending)

### Summary
- **Total Faculties**: 5
- **Papers per Faculty**: 4
- **Total Assignments**: 20

### Faculty Assignments

| Faculty ID | Faculty Name | Papers Assigned |
|------------|--------------|-----------------|
| FAC001 | Dr. Rajesh Kumar | 4 |
| FAC002 | Prof. Priya Sharma | 4 |
| FAC003 | Dr. Amit Patel | 4 |
| FAC004 | Dr. Sneha Reddy | 4 |
| FAC005 | Prof. Vikram Singh | 4 |

## How to Use

### Option 1: Upload via Admin Portal
1. Login to Admin Dashboard
2. Navigate to **Papers & Assignments** tab
3. Click **Upload Assignment Excel** button
4. Select `paper-assignments.xlsx`
5. Click **Upload Assignments**

### Option 2: Regenerate with Different Data
Run the script again to create a new file:
```bash
node backend/create-assignment-excel.js
```

## Excel Format Required

The Excel file must have these columns:
1. Faculty ID
2. Faculty Name (optional, for reference)
3. Paper ID
4. Course Code
5. Dummy Number
6. Assigned Date (optional)
7. Status (optional)

## Notes

- Each faculty is assigned exactly 4 papers
- Dummy numbers follow the format: `{CourseCode}-{Year}-{Number}`
- Paper IDs follow the format: `answer-sheet-{number}.pdf`
- All assignments start with "Pending" status
- The system validates faculty IDs and paper IDs during upload

## Validation Rules

When uploading, the system checks:
- ✅ Faculty ID exists in the database
- ✅ Paper ID exists in the database
- ✅ No duplicate assignments
- ✅ Faculty is not blocked
- ✅ Maximum 4 papers per faculty

## Troubleshooting

### Upload Fails
- Ensure all faculty IDs exist in the database
- Ensure all paper IDs (PDFs) are uploaded to the system
- Check for duplicate assignments
- Verify Excel file format matches the required structure

### Need More Assignments
Edit `create-assignment-excel.js` and modify:
- `faculties` array to add more faculty members
- Loop count (currently 4) to assign more/fewer papers per faculty
- `courseCodes` array to add more courses
