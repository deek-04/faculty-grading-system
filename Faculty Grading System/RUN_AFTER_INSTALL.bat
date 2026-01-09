@echo off
echo ========================================
echo Faculty Grading System - Quick Start
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo Then RESTART your computer
    echo.
    pause
    exit /b 1
)

echo Node.js is installed!
node --version
npm --version
echo.

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting development server...
echo.
echo The application will open in your browser automatically
echo Press Ctrl+C to stop the server
echo.
call npm run dev

pause




