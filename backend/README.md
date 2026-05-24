# AAU IAPAMS Backend API

Backend API for Addis Ababa University Internal Academic Position Appointment Management System.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Admin, Staff, and Evaluator roles
- **Position Management**: Create, update, and manage academic positions
- **Application System**: Apply for positions with document uploads
- **Evaluation System**: Multi-evaluator scoring system
- **File Uploads**: Cloudinary integration for CV, cover letters, and certificates
- **Email Notifications**: Password reset and welcome emails
- **Statistics & Analytics**: Dashboard data for admins and users

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # MongoDB connection
│   │   └── cloudinary.js # Cloudinary setup
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── Position.js
│   │   └── Application.js
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   ├── positionController.js
│   │   ├── applicationController.js
│   │   └── userController.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── positionRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # Authentication & authorization
│   │   ├── upload.js     # File upload handling
│   │   └── errorHandler.js
│   └── utils/            # Utility functions
│       ├── token.js      # JWT utilities
│       ├── email.js      # Email sending
│       ├── upload.js     # Cloudinary upload
│       └── seed.js       # Database seeding
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json
└── server.js             # Entry point
```

## 🔧 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Email service (Gmail recommended)

### Setup Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update the following in `.env`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_ACCESS_SECRET`: Strong secret for access tokens
   - `JWT_REFRESH_SECRET`: Strong secret for refresh tokens
   - `JWT_RESET_SECRET`: Strong secret for reset tokens
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASSWORD`: Your email app password
   - `FRONTEND_URL`: Your frontend URL (default: http://localhost:5173)

4. **Seed the database** (optional but recommended)
   ```bash
   npm run seed
   ```

5. **Start the server**
   
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@aau.edu.et",
  "password": "Password@123",
  "fullName": "John Doe",
  "role": "staff",
  "department": "Computer Science",
  "phone": "+251911234567"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "Password@123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <access_token>
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@aau.edu.et"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "resetToken": "<token_from_email>",
  "newPassword": "NewPassword@123"
}
```

#### Change Password
```http
PATCH /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

#### Get All Users (Admin)
```http
GET /auth/users?page=1&limit=10&status=active&role=staff&search=john
Authorization: Bearer <access_token>
```

#### Update User
```http
PATCH /auth/users/:id
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "fullName": "John Doe Updated",
  "department": "Software Engineering",
  "profilePhoto": <file>
}
```

#### Delete Users (Admin)
```http
DELETE /auth/users
Authorization: Bearer <access_token>
X-Delete-Password: <admin_password>
Content-Type: application/json

{
  "ids": ["userId1", "userId2"]
}
```

### Position Endpoints

#### Get All Positions
```http
GET /positions?page=1&limit=10&status=open&department=Computer Science&search=professor
```

#### Get Single Position
```http
GET /positions/:id
```

#### Create Position (Admin)
```http
POST /positions/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Assistant Professor - Computer Science",
  "description": "Position description...",
  "department": "Computer Science",
  "positionType": "Full-Time",
  "requirements": ["PhD required", "3+ years experience"],
  "deadline": "2024-12-31",
  "numberOfPositions": 2,
  "evaluators": ["evaluatorId1", "evaluatorId2"]
}
```

#### Update Position (Admin)
```http
PATCH /positions/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "closed"
}
```

#### Close Position (Admin)
```http
PATCH /positions/:id/close
Authorization: Bearer <access_token>
```

#### Delete Position (Admin)
```http
DELETE /positions/:id
Authorization: Bearer <access_token>
```

### Application Endpoints

#### Get All Applications
```http
GET /applications?page=1&limit=10&status=pending&position=positionId
Authorization: Bearer <access_token>
```

#### Get Single Application
```http
GET /applications/:id
Authorization: Bearer <access_token>
```

#### Create Application
```http
POST /applications
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "positionId": "positionId",
  "cv": <file>,
  "coverLetter": <file>,
  "certificates": [<file1>, <file2>]
}
```

#### Evaluate Application (Admin/Evaluator)
```http
POST /applications/:id/evaluate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "scores": {
    "experience": 8,
    "education": 9,
    "skills": 7
  },
  "comments": "Strong candidate with excellent qualifications."
}
```

#### Update Application Status (Admin)
```http
PATCH /applications/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "shortlisted",
  "notes": "Candidate selected for interview"
}
```

#### Delete Application
```http
DELETE /applications/:id
Authorization: Bearer <access_token>
```

### User Statistics Endpoints

#### Get System Statistics (Admin)
```http
GET /users/stats
Authorization: Bearer <access_token>
```

#### Get User Dashboard
```http
GET /users/dashboard
Authorization: Bearer <access_token>
```

## 🔐 User Roles

### Admin
- Full system access
- Manage users, positions, and applications
- View all statistics
- Assign evaluators to positions

### Evaluator
- Evaluate applications for assigned positions
- View applications for their positions
- Submit scores and comments

### Staff
- Apply for open positions
- View their own applications
- Update their profile

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/aau-iapams` |
| `JWT_ACCESS_SECRET` | JWT access token secret | `your-secret-key` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | `your-refresh-secret` |
| `JWT_RESET_SECRET` | JWT reset token secret | `your-reset-secret` |
| `JWT_ACCESS_EXPIRY` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | `7d` |
| `JWT_RESET_EXPIRY` | Reset token expiry | `1h` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email address | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Email app password | `your-app-password` |
| `EMAIL_FROM` | From email address | `AAU IAPAMS <noreply@aau.edu.et>` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:5173` |

## 🧪 Testing

### Default Seeded Accounts

After running `npm run seed`, you can use these accounts:

**Admin:**
- Username: `admin`
- Password: `Admin@123`

**Evaluators:**
- Username: `evaluator1` | Password: `Evaluator@123`
- Username: `evaluator2` | Password: `Evaluator@123`

**Staff:**
- Username: `staff1` | Password: `Staff@123`
- Username: `staff2` | Password: `Staff@123`
- Username: `staff3` | Password: `Staff@123`

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent brute force attacks
- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Express validator
- **File Upload Limits**: 5MB max file size

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "multer": "^1.4.5-lts.1",
  "cloudinary": "^1.41.0",
  "nodemailer": "^6.9.7",
  "express-validator": "^7.0.1",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5",
  "morgan": "^1.10.0"
}
```

## 🐛 Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## 📄 License

MIT

## 👥 Contributors

Developed for Addis Ababa University as a final year BSc Software Engineering project.

## 📞 Support

For issues or questions, please contact the development team.
