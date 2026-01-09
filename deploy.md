# Complete Deployment Guide

## 🚀 Full Functional Website Deployment

### STEP 1: Deploy Backend (API Server)

1. **Go to [vercel.com/new](https://vercel.com/new)**
2. **Import Git Repository**: Select `deek-04/faculty-grading-system`
3. **Configure Backend**:
   - Project Name: `faculty-grading-backend`
   - Framework: Other
   - Root Directory: `backend`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

4. **Environment Variables** (Click "Add" for each):
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://deek04:yourpassword@cluster0.mongodb.net/faculty-grading
   PORT=5000
   ```

5. **Click Deploy**

### STEP 2: Set Up Database (MongoDB Atlas)

1. **Go to [mongodb.com/atlas](https://mongodb.com/atlas)**
2. **Create Free Account**
3. **Create New Cluster** (Free tier)
4. **Create Database User**:
   - Username: `deek04`
   - Password: `create-strong-password`
5. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### STEP 3: Update Backend Environment

1. **Go to your backend project in Vercel**
2. **Settings → Environment Variables**
3. **Update MONGODB_URI** with your actual connection string

### STEP 4: Deploy Frontend (React App)

1. **Create New Project in Vercel**
2. **Import Same Repository**: `deek-04/faculty-grading-system`
3. **Configure Frontend**:
   - Project Name: `faculty-grading-system-frontend`
   - Framework: Vite
   - Root Directory: `Faculty Grading System`
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://faculty-grading-backend.vercel.app
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### STEP 5: Set Up Supabase (Authentication)

1. **Go to [supabase.com](https://supabase.com)**
2. **Create New Project**
3. **Get Project URL and Anon Key**:
   - Go to Settings → API
   - Copy Project URL and anon/public key
4. **Update Frontend Environment Variables** in Vercel

### STEP 6: Test Complete System

Your website will be available at:
- **Frontend**: `https://faculty-grading-system-frontend.vercel.app`
- **Backend API**: `https://faculty-grading-backend.vercel.app`

## 🔧 Quick Setup Commands

If you want to redeploy:
```bash
# Update and redeploy
git add .
git commit -m "Update deployment config"
git push origin main
```

## 📋 What You'll Have:

✅ **Full Faculty Grading System**
✅ **User Authentication** (Supabase)
✅ **Database Storage** (MongoDB)
✅ **PDF Viewing & Grading**
✅ **Enhanced Navigation**
✅ **Admin Dashboard**
✅ **Real-time Updates**
✅ **Secure HTTPS**
✅ **Global CDN**