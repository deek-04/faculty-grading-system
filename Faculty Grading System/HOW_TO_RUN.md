# How to Run the Faculty Grading System

## ⚠️ Current Situation

**Node.js/npm is not installed** on your system. The application requires Node.js to run.

## 🎯 Quick Preview (Without Node.js)

I've created a **PREVIEW.html** file that you can open right now:

1. **Double-click** on `PREVIEW.html` in your file explorer
2. The preview will open in your default browser
3. You can see the login interface with Faculty/Admin toggle buttons

This preview shows you the UI design, but doesn't have full functionality.

## 🚀 To Run the Full Application

### Step 1: Install Node.js

1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer
4. Follow the installation wizard
5. **Restart your computer** after installation

### Step 2: Verify Installation

Open PowerShell or Command Prompt and run:

```bash
node --version
npm --version
```

You should see version numbers (e.g., v20.x.x and 10.x.x)

### Step 3: Run the Application

Navigate to your project folder in terminal:

```bash
cd "C:\Users\varsh\Downloads\Faculty Grading System"
```

Then run:

```bash
npm install
npm run dev
```

### Step 4: Open in Browser

The terminal will show something like:
```
VITE v6.3.5  ready in 2.3s

➜  Local:   http://localhost:3000/
```

Open that URL in your browser!

## 📋 What You'll See

### Login Page
- **Faculty/Admin toggle buttons** at the top
- **Faculty side**: Login and Register tabs
- **Admin side**: Admin login form with shield icon

### Admin Dashboard (After Login)
- **Statistics Cards**: Total Faculty, Courses, Papers, Progress
- **Four Tabs**:
  1. **Papers & Assignments**: Upload and manage papers
  2. **Faculty Management**: Add/view faculty members
  3. **Course Management**: Add/view courses
  4. **Correction Reports**: View grading progress

### Faculty Dashboard (After Login)
- Your existing faculty dashboard
- Section-based paper management
- Grading interface

## 🔧 Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Solution: Install Node.js and restart terminal

### "Port 3000 is already in use"
- Another app is using port 3000
- Solution: The server will automatically use another port (3001, 3002, etc.)

### "Module not found" errors
- Dependencies not installed
- Solution: Run `npm install` again

### Preview.html doesn't open
- Check if you have a default browser set
- Or right-click → Open with → Your preferred browser

## 📝 Summary of Changes

✅ Added Admin portal with login
✅ Added role selection (Faculty/Admin)
✅ Upload question papers and answer keys
✅ Assign papers to faculty
✅ Add/manage faculty members
✅ Add/manage courses
✅ View correction reports
✅ Take actions on submissions

## 🎨 Preview File

The `PREVIEW.html` file shows:
- Clean, modern design
- Faculty/Admin toggle
- Admin login form
- Feature list
- Responsive layout

**Open it now to see the UI!**

## 📚 Files Created

1. `PREVIEW.html` - Interactive preview (open this!)
2. `IMPLEMENTATION_SUMMARY.md` - Complete documentation
3. `src/components/admin-login.tsx` - Admin login component
4. `src/components/admin-dashboard.tsx` - Admin dashboard
5. `HOW_TO_RUN.md` - This file

## 🆘 Need Help?

If you encounter any issues:
1. Make sure Node.js is installed
2. Restart your terminal after installing
3. Run `npm install` before `npm run dev`
4. Check the error messages for clues

## ✨ Features Overview

- **Separate login** for Faculty and Admin
- **Paper management** with uploads and assignments
- **Faculty management** with add/edit capabilities
- **Course management** system
- **Correction reports** with progress tracking
- **Real-time statistics** dashboard
- **Modern UI** with professional design




