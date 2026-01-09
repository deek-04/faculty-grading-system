
  # Faculty Grading System

  This is a code bundle for Faculty Grading System. The original project is available at https://www.figma.com/design/yhjL5ezWSgjCn9aiUpctAH/Faculty-Grading-System.

  ## Features

  ### Faculty Portal
  - Secure login with email and password
  - Face recognition and ID card verification (optional)
  - Dashboard with grading statistics
  - Section-based paper management
  - Real-time grading interface
  - Continuous monitoring during grading sessions

  ### Admin Portal
  - Separate admin login system
  - **Paper Management**: Upload question papers, answer papers, and answer keys
  - **Assignment System**: Assign papers to faculty members
  - **Faculty Management**: Add, view, and manage faculty members
  - **Course Management**: Add, view, and manage courses
  - **Correction Reports**: View faculty grading progress and take actions
  - Real-time statistics dashboard

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  The application will be available at http://localhost:3000 (or another port if 3000 is busy).

  ## User Interface

  On the login page, you can switch between:
  - **Faculty**: For faculty members to log in and grade papers
  - **Admin**: For administrators to manage the system

  ## Technology Stack

  - React + TypeScript
  - Vite
  - Radix UI components
  - Tailwind CSS
  - Supabase (for authentication and storage)
  