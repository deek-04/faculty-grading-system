# Online Valuation System - Backend API

Backend server for the Online Valuation System with MongoDB integration.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB running on localhost:27017
- npm or yarn

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
- Copy `.env` file and update if needed
- Default MongoDB URI: `mongodb://localhost:27017/online_valuation_system`

3. Ensure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Admin Routes (Coming in next tasks)
- `GET /api/admin/faculties` - Get all faculties
- `GET /api/admin/faculties/search` - Search faculties
- `PUT /api/admin/faculties/:id/verify` - Verify/block faculty
- `POST /api/admin/assignments/upload` - Upload paper assignments
- `GET /api/admin/reports` - Get all reports
- `GET /api/admin/reports/:id/download` - Download report

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   ├── errorHandler.js      # Error handling
│   │   └── logger.js            # Request logging
│   ├── routes/                  # API routes (to be added)
│   ├── services/                # Business logic (to be added)
│   ├── utils/                   # Utility functions (to be added)
│   └── server.js                # Express server
├── uploads/                     # Uploaded Excel files
├── reports/                     # Generated reports
├── .env                         # Environment variables
├── package.json
└── README.md
```

## MongoDB Collections

- `admins` - Admin users
- `faculties` - Faculty members
- `students` - Student information
- `evaluations` - Grading data
- `assignments` - Paper assignments
- `reports` - Generated reports
- `verification_logs` - Audit logs
- `answerSheets.files` - GridFS files
- `answerSheets.chunks` - GridFS chunks
- `templates` - Templates

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/online_valuation_system |
| DB_NAME | Database name | online_valuation_system |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |
| UPLOAD_DIR | Upload directory | ./uploads |
| REPORTS_DIR | Reports directory | ./reports |

## Testing

Test the server:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongosh`
- Check connection string in `.env`
- Verify database name matches

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 5000

### CORS Issues
- Update FRONTEND_URL in `.env`
- Ensure frontend is running on the specified URL
