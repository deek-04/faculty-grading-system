# Admin Dashboard Implementation Tasks

## Overview
Implementation plan for the Admin Dashboard with MongoDB integration, faculty management, paper assignment, and automated report generation.

---

## Tasks

- [x] 1. Backend Setup and MongoDB Integration



  - Set up Node.js/Express backend server
  - Configure MongoDB connection to localhost:27017/online_valuation_system
  - Create database service with connection pooling
  - Implement error handling and logging middleware
  - Set up CORS and security middleware
  - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6_

- [x] 2. Database Models and Schemas



  - [x] 2.1 Create MongoDB schema definitions


    - Define Faculty schema with status field
    - Define Evaluations schema with grading data
    - Define Assignments schema for paper-faculty mapping
    - Define Reports schema for generated Excel files
    - Define VerificationLogs schema for audit trail
    - _Requirements: 6.3, 6.4_
  
  - [x] 2.2 Create database indexes

    - Index facultyId, paperId, status fields
    - Create compound index on (facultyId, status)
    - Create text index on faculty name for search
    - _Requirements: 6.8_

- [x] 3. Faculty Management API





  - [x] 3.1 Implement GET /api/admin/faculties endpoint


    - Query all faculties from MongoDB
    - Calculate assigned, corrected, and pending papers for each faculty
    - Join with evaluations collection for progress data
    - Return faculty list with progress metrics
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 3.2 Implement GET /api/admin/faculties/search endpoint

    - Accept search query parameter
    - Perform case-insensitive search on faculty name
    - Use MongoDB text search or regex
    - Return filtered faculty list
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 3.3 Implement PUT /api/admin/faculties/:id/verify endpoint

    - Accept status (verified/blocked) and optional reason
    - Update faculty status in MongoDB
    - Create verification log entry
    - Return success response
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 4. Paper Assignment System





  - [x] 4.1 Create Excel parser utility


    - Use XLSX library to parse uploaded Excel files
    - Extract faculty IDs, paper IDs, course codes, dummy numbers
    - Validate Excel structure and required columns
    - Return parsed data array
    - _Requirements: 3.2, 8.1_
  
  - [x] 4.2 Implement POST /api/admin/assignments/upload endpoint


    - Accept multipart/form-data with Excel file
    - Parse Excel file using parser utility
    - Validate all faculty IDs exist in database
    - Validate all paper IDs exist in database
    - Check for duplicate assignments
    - Create assignment records in MongoDB
    - Return success count and error details
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 8.2, 8.3_
  
  - [x] 4.3 Implement GET /api/admin/assignments endpoint


    - Query all assignments from MongoDB
    - Join with faculty and paper data
    - Return assignment list with details
    - _Requirements: 3.8_

- [ ] 5. Report Generation System
  - [ ] 5.1 Create report generator utility
    - Implement function to generate detailed report (Report 1)
    - Implement function to generate summary report (Report 2)
    - Use XLSX library to create Excel files
    - Format columns and apply styling
    - Save files to reports directory
    - _Requirements: 5.2, 5.3_
  
  - [ ] 5.2 Implement automatic report trigger
    - Create background job or event listener
    - Detect when faculty completes all assigned papers
    - Trigger report generation automatically
    - Save report metadata to MongoDB
    - _Requirements: 5.1, 5.4, 5.8_
  
  - [ ] 5.3 Implement GET /api/admin/reports endpoint
    - Query all reports from MongoDB
    - Return report list with metadata
    - _Requirements: 5.6_
  
  - [ ] 5.4 Implement GET /api/admin/reports/:id/download endpoint
    - Retrieve report file path from MongoDB
    - Stream Excel file to client
    - Increment download count
    - _Requirements: 5.6, 5.7_

- [ ] 6. Admin Dashboard Frontend
  - [ ] 6.1 Create AdminDashboard component
    - Set up main layout with header and navigation
    - Implement authentication check
    - Add logout functionality
    - Create routing for different sections
    - _Requirements: 1.1_
  
  - [ ] 6.2 Create FacultyList component
    - Fetch faculty data from API
    - Display faculty table with name, ID, progress
    - Show assigned, corrected, pending paper counts
    - Display verification status badges
    - Add refresh button
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 6.3 Create SearchBar component
    - Add search input field
    - Implement debounced search (300ms delay)
    - Call search API on input change
    - Display search results
    - Add clear search button
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 6.4 Create PaperAssignment component
    - Add Excel file upload input
    - Implement file validation (type, size)
    - Show upload progress indicator
    - Display assignment results (success count, errors)
    - Add error message display
    - _Requirements: 3.1, 3.2, 3.6, 3.7_
  
  - [ ] 6.5 Create VerificationManagement component
    - Display faculty verification status
    - Add "Allow" button for blocked faculty
    - Implement status update API call
    - Show confirmation dialog
    - Display success/error messages
    - _Requirements: 4.1, 4.3, 4.4, 4.6_
  
  - [ ] 6.6 Create ReportViewer component
    - Fetch reports list from API
    - Display reports table with metadata
    - Add download button for each report
    - Show report generation timestamp
    - Filter reports by faculty or date
    - _Requirements: 5.6_
  
  - [ ] 6.7 Create ProgressTracker component
    - Display progress bar for each faculty
    - Calculate and show completion percentage
    - Highlight completed faculty
    - Show last update timestamp
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 7. Real-time Updates
  - [ ] 7.1 Implement polling mechanism
    - Set up interval to fetch faculty data every 30 seconds
    - Update UI with new data
    - Show loading indicator during refresh
    - _Requirements: 7.6_
  
  - [ ] 7.2 Add manual refresh functionality
    - Create refresh button
    - Trigger immediate data fetch
    - Show refresh animation
    - _Requirements: 7.5_

- [ ] 8. Error Handling and Validation
  - [ ] 8.1 Implement frontend validation
    - Validate Excel file format before upload
    - Check file size limits
    - Validate required fields
    - Display user-friendly error messages
    - _Requirements: 8.1, 8.5_
  
  - [ ] 8.2 Implement backend validation
    - Validate all API inputs
    - Check for duplicate assignments
    - Verify faculty and paper existence
    - Prevent blocked faculty assignments
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [ ] 8.3 Create error logging system
    - Log all errors to MongoDB error_logs collection
    - Include timestamp, user, action, error details
    - Implement error monitoring dashboard
    - _Requirements: 8.6_

- [ ] 9. Integration with Existing Faculty Grading System
  - [ ] 9.1 Update Faculty Grading Interface
    - Fetch assigned papers from MongoDB
    - Save grading data to evaluations collection
    - Update assignment status on completion
    - Trigger report generation when all papers done
    - _Requirements: 5.1, 5.8_
  
  - [ ] 9.2 Connect Excel export to MongoDB
    - Save grading data to evaluations collection
    - Include dummy number and course code
    - Store correction time and faculty details
    - _Requirements: 5.2, 5.3_

- [ ] 10. Testing and Deployment
  - [ ]* 10.1 Write unit tests
    - Test Excel parser functions
    - Test report generator functions
    - Test validation functions
    - Test database query functions
  
  - [ ]* 10.2 Write integration tests
    - Test API endpoints
    - Test MongoDB operations
    - Test file upload workflow
    - Test report generation
  
  - [ ] 10.3 Setup deployment configuration
    - Configure MongoDB connection
    - Set up file storage directories
    - Configure environment variables
    - Create startup scripts
  
  - [ ] 10.4 Create documentation
    - API documentation
    - Database schema documentation
    - Admin user guide
    - Deployment guide

---

## Notes

- Start with backend setup and database integration (Tasks 1-2)
- Implement API endpoints before frontend components (Tasks 3-5 before Task 6)
- Test each API endpoint before moving to the next
- Use Postman or similar tool for API testing
- Ensure MongoDB is running before starting development
- Keep existing Faculty Grading System functionality intact
- Test report generation with sample data before production use
