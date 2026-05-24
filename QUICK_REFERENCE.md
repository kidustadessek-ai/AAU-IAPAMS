# AAU-IAPAMS Quick Reference Card

## 🚀 Quick Start

### Start the Application
```bash
# Terminal 1 - Backend (Port 5000)
cd backend
npm start

# Terminal 2 - Frontend (Port 5173)
npm run dev
```

### Access URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1

## 👥 Test Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@123` |
| Evaluator | `evaluator1` | `Evaluator@123` |
| Evaluator | `evaluator2` | `Evaluator@123` |
| Staff | `staff1` | `Staff@123` |
| Staff | `staff2` | `Staff@123` |
| Staff | `staff3` | `Staff@123` |

## 🏛️ AAU Structure (14 Colleges)

### Quick List
1. College of Business and Economics
2. College of Education and Language Studies
3. College of Health Sciences
4. College of Humanities, Language Studies, Journalism & Communication
5. College of Natural and Computational Sciences
6. College of Performing and Visual Arts
7. College of Social Sciences, Art and Humanities
8. College of Technology and Built Environment
9. College of Veterinary Medicine and Agriculture
10. Institute for Peace and Security Studies
11. Institute of Educational Research
12. School of Built Environment
13. School of Geography and Development Studies
14. School of Law

## 📝 Common Tasks

### Create a Position (Admin)
1. Login as admin
2. Dashboard → Position Management
3. Click "Post New Job"
4. Select **College** first
5. Select **Department** (appears after college)
6. Fill details and publish

### Apply for Position (Staff)
1. Login as staff
2. Dashboard → Available Positions
3. Filter by college (optional)
4. Click position card
5. Upload CV (required)
6. Upload cover letter (optional)
7. Submit application

### Review Applications (Admin)
1. Login as admin
2. Dashboard → Application Management
3. Filter by college/status
4. View applicant details
5. Shortlist or reject

### Evaluate Applications (Evaluator)
1. Login as evaluator
2. Dashboard → Evaluation Management
3. View assigned applications
4. Score candidates
5. Add comments
6. Submit evaluation

## 🗄️ Database Commands

### Reseed Database
```bash
cd backend
npm run seed
```

### Clear and Reseed
The seed script automatically clears existing data before seeding.

## 📁 Key Files

### Frontend
- `src/data/aauStructure.js` - College-department mapping
- `src/components/dashboard/admin/PositionManagement.jsx` - Create positions
- `src/pages/staff/AvailablePosition.jsx` - View/apply positions
- `src/pages/admin/application-management/ApplicationManagement.jsx` - Manage applications

### Backend
- `backend/src/models/Position.js` - Position model (with college field)
- `backend/src/controllers/positionController.js` - Position logic
- `backend/src/controllers/applicationController.js` - Application logic
- `backend/src/utils/seed.js` - Database seeding

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aau-iapams
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## 🎯 Key Features

### Hierarchical Structure
- ✅ College → Department selection
- ✅ Dynamic department dropdown
- ✅ Validation for both fields

### Position Management
- ✅ Create with college-department
- ✅ Filter by college
- ✅ View full hierarchy

### Application System
- ✅ File uploads (CV, cover letter, certificates)
- ✅ Status tracking
- ✅ Evaluation workflow

### User Roles
- ✅ Admin (full access)
- ✅ Evaluator (evaluate applications)
- ✅ Staff (apply for positions)

## 📊 Sample Data

After seeding, you'll have:
- **6 users** (1 admin, 2 evaluators, 3 staff)
- **3 positions** across different colleges
- **3 applications** with various statuses

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
# Check .env file exists
# Check port 5000 is available
```

### Frontend won't start
```bash
# Check .env file exists
# Check port 5173 is available
# Run: npm install
```

### Can't login
```bash
# Reseed database
cd backend
npm run seed
```

### Department dropdown empty
- Make sure you selected a college first
- Department dropdown is disabled until college is selected

## 📚 Documentation

- `COMPLETION_SUMMARY.md` - Full implementation summary
- `AAU_STRUCTURE_UPDATE.md` - Structure implementation details
- `HIERARCHICAL_STRUCTURE_GUIDE.md` - Visual guide
- `backend/README.md` - Backend documentation
- `backend/API_REFERENCE.md` - API endpoints

## ✅ Status

- Backend: ✅ Complete
- Frontend: ✅ Complete
- Database: ✅ Seeded
- Structure: ✅ Hierarchical
- Testing: ✅ Verified
- Documentation: ✅ Complete

---

**Last Updated**: May 24, 2026
**Version**: 1.0.0
**Status**: Production Ready
