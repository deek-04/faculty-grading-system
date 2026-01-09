# 🔐 Login Credentials

## 👨‍🏫 Faculty Login Credentials

### Demo Account (Works in Frontend)
```
Email: faculty@example.com
Password: password123
```

### Faculty Members (For API Testing)

The system has 5 faculty members created in the database:

| Employee ID | Name | Email | Department | Papers |
|-------------|------|-------|------------|--------|
| **FAC001** | Dr. Rajesh Kumar | rajesh.kumar@university.edu | Computer Science | 4 CS101 papers |
| **FAC002** | Prof. Priya Sharma | priya.sharma@university.edu | Information Technology | 4 IT101 papers |
| **FAC003** | Dr. Amit Patel | amit.patel@university.edu | Computer Science | 4 CS201 papers |
| **FAC004** | Dr. Sneha Reddy | sneha.reddy@university.edu | Electronics | 4 EC101 papers |
| **FAC005** | Prof. Vikram Singh | vikram.singh@university.edu | Information Technology | 4 IT201 papers |

**Note:** These faculty members are in the database but don't have passwords set yet. They can be accessed via API using their Employee ID.

---

## 👨‍💼 Admin Login Credentials

### Demo Account (Works in Frontend)
```
Email: admin@example.com
Password: admin12345
```

---

## 🎯 How to Login

### Option 1: Frontend Login (React App)

**Faculty Login:**
1. Open the React app (Faculty Grading System)
2. Use the demo credentials:
   - Email: `faculty@example.com`
   - Password: `password123`

**Admin Login:**
1. Open the React app
2. Switch to Admin tab
3. Use the demo credentials:
   - Email: `admin@example.com`
   - Password: `admin12345`

### Option 2: API Access (Direct Backend)

**Faculty Assignments:**
```bash
# Get assignments for Dr. Rajesh Kumar (FAC001)
curl http://localhost:5000/api/faculty/FAC001/assignments

# Get profile for any faculty
curl http://localhost:5000/api/faculty/FAC001/profile
curl http://localhost:5000/api/faculty/FAC002/profile
curl http://localhost:5000/api/faculty/FAC003/profile
curl http://localhost:5000/api/faculty/FAC004/profile
curl http://localhost:5000/api/faculty/FAC005/profile
```

**Admin Operations:**
```bash
# Get all assignments
curl http://localhost:5000/api/admin/assignments

# Upload Excel file
curl -X POST http://localhost:5000/api/admin/assignments/upload \
  -F "file=@backend/paper-assignments.xlsx"
```

### Option 3: Demo Interface

Open `backend/demo-assignment-system.html` in your browser:
- No login required
- Click on any faculty member to see their papers
- Upload Excel files as admin

---

## 🔍 Verify Faculty Can See Papers

### Quick Test Script
```bash
cd backend
node check-faculty1-papers.js
```

This will show all papers assigned to Faculty 1 (Dr. Rajesh Kumar).

### Test All Faculty
```bash
node test-faculty-api.js
```

This will test all 5 faculty members and show their assignment counts.

---

## 📊 Current Assignment Status

All faculty members have papers assigned:

- ✅ **FAC001** (Dr. Rajesh Kumar): 4 papers - CS101 (Data Structures)
- ✅ **FAC002** (Prof. Priya Sharma): 4 papers - IT101 (Database Systems)
- ✅ **FAC003** (Dr. Amit Patel): 4 papers - CS201 (Algorithms)
- ✅ **FAC004** (Dr. Sneha Reddy): 4 papers - EC101 (Digital Electronics)
- ✅ **FAC005** (Prof. Vikram Singh): 4 papers - IT201 (Web Technologies)

**Total: 20 assignments active**

---

## 🚀 Quick Access

### Frontend (React App)
```bash
cd "Faculty Grading System"
npm run dev
```
Then use demo credentials above.

### Backend API
```
Already running on: http://localhost:5000
```

### Demo Interface
```
Open: backend/demo-assignment-system.html
```

---

## 💡 Important Notes

1. **Frontend Login**: Uses Supabase authentication with demo fallback
   - Demo credentials work when Supabase is unavailable
   - Verification is temporarily disabled

2. **Backend API**: Direct database access
   - No authentication required for testing
   - Faculty identified by Employee ID
   - All 5 faculty members can access their papers

3. **Demo Interface**: No login required
   - Simulates both admin and faculty views
   - Shows real data from backend API

---

## 🔧 Troubleshooting

### "No papers assigned"
Run: `node backend/upload-assignments.js`

### "Faculty not found"
Run: `node backend/seed-data.js`

### "Server not running"
Run: `cd backend && npm start`

### Verify Everything Works
Run: `node backend/verify-complete-system.js`

---

## ✅ System Status

- ✅ Backend Server: Running on port 5000
- ✅ Database: Seeded with 5 faculty and 20 papers
- ✅ Assignments: 20 active assignments
- ✅ API Endpoints: All working
- ✅ Demo Credentials: Working
- ✅ Faculty Can See Papers: YES!

**Everything is ready to use!** 🎉
