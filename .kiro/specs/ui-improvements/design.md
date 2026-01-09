# Design Document

## Overview

This design document outlines the technical approach for implementing UI improvements to the Faculty Grading System. The enhancements include restructuring the admin dashboard navigation, implementing file sharing between admin and faculty interfaces, adding PDF viewing with page navigation, and adding drag-and-drop functionality to the security monitor component.

## Architecture

### Component Structure Changes

The improvements will modify existing React components while maintaining the current application architecture:

- **AdminDashboard Component**: Restructure layout from horizontal tabs to vertical sidebar navigation
- **FacultyDashboard Component**: Enhance to display uploaded materials from admin with PDF viewing capability
- **GradingInterface Component**: Add PDF viewer components for question papers, answer sheets, and answer keys
- **MonitoringSystem Component**: Add drag-and-drop functionality with position persistence
- **File Management**: Extend existing demo store to handle file sharing between admin and faculty
- **PDF Viewer Components**: New components for rendering and navigating PDF documents

### State Management

The application will continue using React's built-in state management with the following additions:
- Position state for the draggable security monitor
- Enhanced file sharing state in the demo store
- Navigation layout state for responsive behavior
- PDF viewing state (current page, total pages, zoom level)

### PDF Integration

**PDF.js Integration:**
- Use PDF.js library for client-side PDF rendering
- Implement page-by-page navigation with smooth transitions
- Support for different PDF file sizes and formats

## Components and Interfaces

### 1. Admin Dashboard Navigation Redesign

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│ Header (unchanged)                      │
├─────────┬───────────────────────────────┤
│ Left    │ Main Content Area             │
│ Sidebar │                               │
│ Nav     │                               │
│         │                               │
│         │                               │
└─────────┴───────────────────────────────┘
```

**Navigation Component:**
- Convert horizontal `TabsList` to vertical sidebar navigation
- Implement icon-based navigation with text labels
- Maintain current tab functionality with new visual presentation
- Add hover states and active indicators for better UX

**Responsive Behavior:**
- Collapsible sidebar for smaller screens
- Mobile-first approach with hamburger menu fallback
- Maintain accessibility standards

### 2. PDF Viewer System

**PDF Viewer Layout:**
```
┌─────────────────────────────────────────┐
│ Question Paper    │ Answer Key          │
│ ┌─────────────┐   │ ┌─────────────┐     │
│ │             │   │ │             │     │
│ │   PDF Page  │   │ │   PDF Page  │     │
│ │             │   │ │             │     │
│ └─────────────┘   │ └─────────────┘     │
│ [< Prev] [Next >] │ [< Prev] [Next >]   │
├─────────────────────────────────────────┤
│ Answer Sheet                            │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │         PDF Page                    │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ [< Prev] Page 1 of 5 [Next >]          │
└─────────────────────────────────────────┘
```

**PDF Viewer Components:**
- `PDFViewer`: Main component for rendering PDF pages
- `PageNavigation`: Controls for page navigation (prev/next/page counter)
- `PDFContainer`: Wrapper component for organizing multiple PDF viewers

### 3. File Upload and Sharing System

**Data Flow:**
```
Admin Upload → Demo Store → Faculty Interface → PDF Viewer
```

**File Management Enhancement:**
- Extend `demoStore` utility to include file metadata and PDF references
- Implement file categorization by course and faculty assignment
- Add file status tracking (uploaded, assigned, viewed)
- Store PDF file references for the existing files (question paper.pdf, Answer sheet.pdf, key.pdf)

**Faculty Interface Integration:**
- Create dedicated PDF viewing components for each file type
- Implement tabbed interface for different file types
- Add page navigation and zoom functionality

### 4. Draggable Security Monitor

**Drag Implementation:**
- Use React's built-in drag events with custom drag logic
- Implement position constraints to keep monitor within viewport
- Add smooth drag animations and visual feedback

**Position Persistence:**
- Store position in component state during session
- Implement boundary detection and snap-to-edge functionality
- Maintain monitor functionality during drag operations

## Data Models

### Enhanced Demo Store Structure

```typescript
interface FileUpload {
  id: string;
  courseId: string;
  courseName: string;
  type: 'question_paper' | 'answer_sheet' | 'answer_key';
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  assignedFacultyId?: string;
  status: 'uploaded' | 'assigned' | 'viewed';
  totalPages?: number;
}

interface PDFViewerState {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error?: string;
}

interface MonitorPosition {
  x: number;
  y: number;
  isMinimized: boolean;
}
```

### Navigation Configuration

```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  value: string;
  badge?: number;
}
```

## Error Handling

### PDF Rendering Errors
- Handle PDF loading failures with fallback messages
- Implement retry mechanisms for PDF rendering issues
- Provide alternative viewing options if PDF.js fails

### File Upload Errors
- Implement file size and type validation
- Provide clear error messages for upload failures
- Add retry mechanisms for network issues

### Drag Operation Errors
- Handle edge cases for drag boundaries
- Provide fallback positioning if drag fails
- Maintain monitor visibility at all times

### Navigation Errors
- Ensure graceful fallback to horizontal tabs on layout failures
- Maintain accessibility for keyboard navigation
- Handle responsive breakpoint transitions smoothly

## Testing Strategy

### Unit Testing
- Test PDF viewer page navigation and rendering
- Test navigation component rendering and interaction
- Verify file upload and sharing functionality
- Test drag-and-drop position calculations and constraints

### Integration Testing
- Test admin-to-faculty file sharing workflow with PDF viewing
- Verify navigation state persistence across page transitions
- Test responsive behavior across different screen sizes
- Test PDF viewing with actual PDF files

### User Experience Testing
- Validate PDF page navigation usability and performance
- Validate drag-and-drop usability and feedback
- Test navigation efficiency and discoverability
- Ensure file access workflow is intuitive for faculty

### Accessibility Testing
- Verify keyboard navigation for new sidebar layout and PDF viewers
- Test screen reader compatibility with draggable elements and PDF content
- Ensure color contrast and focus indicators meet standards

## Implementation Considerations

### Performance
- Optimize PDF rendering with lazy loading and page caching
- Implement efficient drag event handling to prevent performance issues
- Use CSS transforms for smooth drag animations
- Optimize PDF.js worker for better rendering performance

### Browser Compatibility
- Ensure PDF.js works across modern browsers
- Ensure drag-and-drop works across modern browsers
- Implement fallbacks for older browser versions
- Test touch device compatibility for drag operations

### Security
- Maintain existing security monitoring during UI changes
- Ensure file sharing respects faculty assignment restrictions
- Validate file types and sizes on upload
- Secure PDF file access and prevent unauthorized downloads

### Responsive Design
- Implement mobile-friendly navigation patterns
- Ensure PDF viewers work on different screen sizes
- Ensure draggable monitor works on touch devices
- Maintain usability across different screen orientations

### PDF Integration Details
- Use PDF.js for client-side rendering without server dependencies
- Implement page preloading for smooth navigation
- Add zoom and fit-to-width functionality for better readability
- Handle different PDF orientations and sizes gracefully