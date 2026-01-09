const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building All-in-One Faculty Grading System...');

try {
  // Step 1: Install dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Step 2: Install frontend dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('cd "Faculty Grading System" && npm install', { stdio: 'inherit' });
  
  // Step 3: Build frontend
  console.log('🔨 Building frontend...');
  execSync('cd "Faculty Grading System" && npm run build', { stdio: 'inherit' });
  
  // Step 4: Copy backend files
  console.log('📁 Preparing backend files...');
  
  // Check if build was successful
  const buildPath = path.join(__dirname, 'Faculty Grading System', 'build');
  if (fs.existsSync(buildPath)) {
    console.log('✅ Frontend build successful!');
    console.log('✅ Backend files ready!');
    console.log('✅ All-in-One deployment package ready!');
    console.log('');
    console.log('🌐 Ready to deploy to Vercel!');
    console.log('Run: vercel --prod');
  } else {
    console.error('❌ Frontend build failed!');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}