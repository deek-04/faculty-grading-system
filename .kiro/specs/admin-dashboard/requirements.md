# Admin Dashboard Requirements

## Introduction

This document outlines the requirements for implementing a comprehensive Admin Dashboard for the Online Valuation System. The system will manage faculty members, paper assignments, verification processes, and automated Excel report generation, all integrated with a local MongoDB database.

## Glossary

- **System**: The Online Valuation System web application
- **Admin**: Administrator user with full system access
- **Faculty**: Teaching staff who grade student papers
- **Paper**: Student answer sheet to be evaluated
- **Dummy Number**: Anonymous identifier used instead of student register number
- **Evaluation**: The grading process and results for a paper
- **MongoDB**: Local database running at localhost:27017
- **Excel Upload**: Process of uploading faculty-paper assignments via Excel file

## Requirements

### Requirement 1: Admin Dashboard Overview

**User Story:** As an admin, I want to view a comprehensive dashboard showing all faculty members and their grading progress, so that I can monitor the evaluation process effectively.

#### Acceptance Criteria

1. WHEN the admin accesses the dashboard, THE System SHALL display a list of all faculty members from the MongoDB faculties collection
2. FOR each faculty member, THE System SHALL display the faculty name, ID, total papers assigned, papers corrected, and papers pending
3. THE System SHALL calculate papers pending as (total assigned - papers corrected)
4. THE System SHALL update the dashboard data in real-time when faculty complete paper evaluations
5. THE System SHALL display faculty verification status (verified, blocked, pending)

### Requirement 2: Faculty Search Functionality

**User Story:** As an admin, I want to search for faculty members by name, so that I can quickly find specific faculty information.

#### Acceptance Criteria

1. THE System SHALL provide a search bar at the top of the faculty list
2. WHEN the admin types in the search bar, THE System SHALL filter the faculty list in real-time
3. THE System SHALL search faculty by name (case-insensitive partial match)
4. WHEN the search query is empty, THE System SHALL display all faculty members
5. THE System SHALL display "No results found" when no faculty match the search criteria

### Requirement 3: Paper Assignment via Excel Upload

**User Story:** As an admin, I want to assign papers to faculty members by uploading an Excel file, so that I can efficiently distribute evaluation workload.

#### Acceptance Criteria

1. THE System SHALL provide an Excel upload interface on the admin dashboard
2. THE System SHALL accept Excel files (.xlsx, .xls) containing faculty IDs and paper IDs
3. WHEN an Excel file is uploaded, THE System SHALL validate that all faculty IDs exist in the MongoDB faculties collection
4. WHEN an Excel file is uploaded, THE System SHALL validate that all paper IDs exist in the MongoDB answerSheets collection
5. THE System SHALL create evaluation records in the MongoDB evaluations collection mapping faculty to papers
6. WHEN assignment is successful, THE System SHALL display a success message with count of papers assigned
7. IF validation fails, THE System SHALL display specific error messages indicating which IDs are invalid
8. THE System SHALL update faculty dashboards immediately after assignment

### Requirement 4: Faculty Verification Management

**User Story:** As an admin, I want to view and manage faculty verification status, so that I can control access to the grading system.

#### Acceptance Criteria

1. THE System SHALL display verification status for each faculty (verified, blocked, pending)
2. WHEN a faculty fails verification, THE System SHALL automatically set their status to "blocked" in MongoDB
3. THE System SHALL provide an "Allow" button for blocked faculty members
4. WHEN admin clicks "Allow", THE System SHALL update the faculty status to "verified" in MongoDB
5. THE System SHALL prevent blocked faculty from accessing their grading dashboard
6. THE System SHALL display the reason for blocking (if available)
7. THE System SHALL log all verification status changes with timestamp and admin ID

### Requirement 5: Automatic Excel Report Generation

**User Story:** As an admin, I want to automatically receive Excel reports when faculty complete all assigned papers, so that I can process final grades efficiently.

#### Acceptance Criteria

1. WHEN a faculty completes grading all assigned papers, THE System SHALL automatically generate two Excel reports
2. THE System SHALL create Report 1 containing: student dummy number, course code, question-wise marks, total marks, correction time, faculty name, faculty ID
3. THE System SHALL create Report 2 containing: dummy number, course code, total marks (3 columns only)
4. THE System SHALL save both reports to the MongoDB database in a reports collection
5. THE System SHALL send both reports to the admin email (if configured)
6. THE System SHALL make reports downloadable from the admin dashboard
7. THE System SHALL include timestamp and faculty ID in report filenames
8. THE System SHALL store report metadata (generation time, faculty ID, paper count) in MongoDB

### Requirement 6: MongoDB Database Integration

**User Story:** As a system, I want to connect to the local MongoDB database and manage all data operations, so that all information is persisted and retrievable.

#### Acceptance Criteria

1. THE System SHALL connect to MongoDB at mongodb://localhost:27017/online_valuation_system
2. THE System SHALL use the database name "online_valuation_system"
3. THE System SHALL access existing collections: admins, faculties, students, evaluations, answerSheets.files, answerSheets.chunks, templates
4. THE System SHALL create new collections as needed: reports, assignments, verification_logs
5. THE System SHALL handle connection errors gracefully with user-friendly error messages
6. THE System SHALL implement proper error handling for all database operations
7. THE System SHALL use MongoDB transactions for multi-document operations (assignments, report generation)
8. THE System SHALL index frequently queried fields (faculty_id, paper_id, status) for performance

### Requirement 7: Real-time Progress Tracking

**User Story:** As an admin, I want to see real-time updates of faculty grading progress, so that I can monitor the evaluation process without manual refresh.

#### Acceptance Criteria

1. THE System SHALL update faculty progress counts automatically when papers are graded
2. THE System SHALL display a progress bar for each faculty showing completion percentage
3. THE System SHALL highlight faculty who have completed all assignments
4. THE System SHALL display the last update timestamp for each faculty
5. THE System SHALL provide a manual refresh button for the dashboard
6. THE System SHALL use polling or WebSocket for real-time updates (every 30 seconds)

### Requirement 8: Data Validation and Error Handling

**User Story:** As a system, I want to validate all data operations and handle errors gracefully, so that the admin has a reliable experience.

#### Acceptance Criteria

1. THE System SHALL validate all Excel uploads before processing
2. THE System SHALL check for duplicate paper assignments before creating new ones
3. THE System SHALL prevent assigning papers to blocked faculty
4. THE System SHALL validate that papers exist before assignment
5. THE System SHALL display specific error messages for each validation failure
6. THE System SHALL log all errors to MongoDB error_logs collection
7. THE System SHALL provide rollback capability for failed batch operations
8. THE System SHALL display loading states during database operations
