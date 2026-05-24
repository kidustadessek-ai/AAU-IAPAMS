# API Reference

Complete API reference for AAU IAPAMS Backend.

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Most endpoints require authentication using JWT Bearer tokens.

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Access:** Public (or Admin only based on configuration)

**Request Body:**
```json
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

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@aau.edu.et",
      "fullName": "John Doe",
      "role": "staff"
    }
  }
}
```

---

### Login

Authenticate user and receive access tokens.

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "email": "admin@aau.edu.et",
      "fullName": "System Administrator",
      "role": "admin",
      "department": "IT Department",
      "profilePhoto": ""
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Access:** Private

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@aau.edu.et",
    "fullName": "System Administrator",
    "role": "admin",
    "department": "IT Department",
    "phone": "+251911234567",
    "profilePhoto": "",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Forgot Password

Request password reset email.

**Endpoint:** `POST /auth/forgot-password`

**Access:** Public

**Request Body:**
```json
{
  "email": "admin@aau.edu.et"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### Reset Password

Reset password using token from email.

**Endpoint:** `POST /auth/reset-password`

**Access:** Public

**Request Body:**
```json
{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewPassword@123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### Change Password

Change password for authenticated user.

**Endpoint:** `PATCH /auth/change-password`

**Access:** Private

**Request Body:**
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Get All Users

Get paginated list of users (Admin only).

**Endpoint:** `GET /auth/users`

**Access:** Private/Admin

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (active, inactive, suspended)
- `role` (string): Filter by role (admin, staff, evaluator)
- `search` (string): Search by username, email, or full name

**Example:** `GET /auth/users?page=1&limit=10&role=staff&search=john`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@aau.edu.et",
      "fullName": "John Doe",
      "role": "staff",
      "department": "Computer Science",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

### Update User

Update user information.

**Endpoint:** `PATCH /auth/users/:id`

**Access:** Private

**Content-Type:** `multipart/form-data`

**Form Data:**
- `fullName` (string): Full name
- `department` (string): Department
- `phone` (string): Phone number
- `bio` (string): Biography
- `profilePhoto` (file): Profile photo image

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "fullName": "John Doe Updated",
    "profilePhoto": "https://res.cloudinary.com/..."
  }
}
```

---

### Delete Users

Delete multiple users (Admin only).

**Endpoint:** `DELETE /auth/users`

**Access:** Private/Admin

**Headers:**
```http
Authorization: Bearer <access_token>
X-Delete-Password: <admin_password>
```

**Request Body:**
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "2 user(s) deleted successfully"
}
```

---

## Position Endpoints

### Get All Positions

Get paginated list of positions.

**Endpoint:** `GET /positions`

**Access:** Public

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status (open, closed, filled)
- `department` (string): Filter by department
- `search` (string): Search in title and description
- `sortBy` (string): Sort field (default: createdAt)
- `order` (string): Sort order (asc, desc)

**Example:** `GET /positions?status=open&department=Computer Science`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Assistant Professor - Computer Science",
      "description": "We are seeking...",
      "department": "Computer Science",
      "positionType": "Full-Time",
      "requirements": ["PhD required", "3+ years experience"],
      "deadline": "2024-12-31T00:00:00.000Z",
      "status": "open",
      "numberOfPositions": 2,
      "createdBy": {
        "_id": "...",
        "fullName": "System Administrator",
        "email": "admin@aau.edu.et"
      },
      "evaluators": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### Get Single Position

Get detailed information about a position.

**Endpoint:** `GET /positions/:id`

**Access:** Public

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Assistant Professor - Computer Science",
    "description": "We are seeking...",
    "department": "Computer Science",
    "positionType": "Full-Time",
    "requirements": ["PhD required", "3+ years experience"],
    "deadline": "2024-12-31T00:00:00.000Z",
    "status": "open",
    "numberOfPositions": 2,
    "applicationCount": 5,
    "createdBy": {
      "_id": "...",
      "fullName": "System Administrator",
      "email": "admin@aau.edu.et",
      "department": "IT Department"
    },
    "evaluators": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Create Position

Create a new position (Admin only).

**Endpoint:** `POST /positions/create`

**Access:** Private/Admin

**Request Body:**
```json
{
  "title": "Assistant Professor - Computer Science",
  "description": "We are seeking a qualified Assistant Professor...",
  "department": "Computer Science",
  "positionType": "Full-Time",
  "requirements": [
    "PhD in Computer Science",
    "3+ years teaching experience",
    "Published research papers"
  ],
  "deadline": "2024-12-31",
  "numberOfPositions": 2,
  "evaluators": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Position created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Assistant Professor - Computer Science",
    "status": "open",
    "createdBy": { ... },
    "evaluators": [ ... ]
  }
}
```

---

### Update Position

Update position details (Admin only).

**Endpoint:** `PATCH /positions/:id`

**Access:** Private/Admin

**Request Body:**
```json
{
  "title": "Updated Title",
  "deadline": "2024-12-31",
  "status": "closed"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Position updated successfully",
  "data": { ... }
}
```

---

### Close Position

Close position for applications (Admin only).

**Endpoint:** `PATCH /positions/:id/close`

**Access:** Private/Admin

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Position closed successfully",
  "data": { ... }
}
```

---

## Application Endpoints

### Get All Applications

Get paginated list of applications.

**Endpoint:** `GET /applications`

**Access:** Private

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status
- `position` (string): Filter by position ID
- `applicant` (string): Filter by applicant ID (Admin only)
- `sortBy` (string): Sort field
- `order` (string): Sort order

**Role-based filtering:**
- **Staff**: Only see their own applications
- **Evaluator**: See applications for assigned positions
- **Admin**: See all applications

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "position": {
        "_id": "...",
        "title": "Assistant Professor",
        "department": "Computer Science",
        "deadline": "2024-12-31T00:00:00.000Z",
        "status": "open"
      },
      "applicant": {
        "_id": "...",
        "fullName": "John Doe",
        "email": "john@aau.edu.et",
        "department": "Computer Science",
        "phone": "+251911234567"
      },
      "documents": {
        "cv": "https://res.cloudinary.com/.../cv.pdf",
        "coverLetter": "https://res.cloudinary.com/.../cover.pdf",
        "certificates": []
      },
      "status": "pending",
      "averageScore": 0,
      "appliedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

---

### Create Application

Submit application for a position.

**Endpoint:** `POST /applications`

**Access:** Private

**Content-Type:** `multipart/form-data`

**Form Data:**
- `positionId` (string): Position ID
- `cv` (file): CV document (required)
- `coverLetter` (file): Cover letter (optional)
- `certificates` (files): Certificates (optional, max 5)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "position": { ... },
    "applicant": { ... },
    "documents": {
      "cv": "https://res.cloudinary.com/.../cv.pdf",
      "coverLetter": "",
      "certificates": []
    },
    "status": "pending"
  }
}
```

---

### Evaluate Application

Submit evaluation scores (Admin/Evaluator only).

**Endpoint:** `POST /applications/:id/evaluate`

**Access:** Private/Admin/Evaluator

**Request Body:**
```json
{
  "scores": {
    "experience": 8,
    "education": 9,
    "skills": 7
  },
  "comments": "Strong candidate with excellent qualifications."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Evaluation submitted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "under_review",
    "evaluations": [
      {
        "evaluator": {
          "_id": "...",
          "fullName": "Dr. Abebe Kebede",
          "email": "evaluator1@aau.edu.et"
        },
        "scores": {
          "experience": 8,
          "education": 9,
          "skills": 7
        },
        "comments": "Strong candidate...",
        "submittedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "averageScore": 8.0
  }
}
```

---

## User Statistics Endpoints

### Get System Statistics

Get comprehensive system statistics (Admin only).

**Endpoint:** `GET /users/stats`

**Access:** Private/Admin

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 100,
      "byRole": {
        "admin": 2,
        "staff": 80,
        "evaluator": 18
      },
      "byStatus": {
        "active": 95,
        "inactive": 3,
        "suspended": 2
      },
      "recentRegistrations": 15
    },
    "positions": {
      "total": 25,
      "open": 10,
      "closed": 12,
      "filled": 3
    },
    "applications": {
      "total": 150,
      "pending": 30,
      "underReview": 50,
      "shortlisted": 20,
      "rejected": 40,
      "accepted": 10,
      "byDepartment": [
        {
          "_id": "Computer Science",
          "count": 50
        }
      ],
      "overTime": [
        {
          "_id": { "year": 2024, "month": 1 },
          "count": 25
        }
      ]
    }
  }
}
```

---

### Get User Dashboard

Get personalized dashboard data.

**Endpoint:** `GET /users/dashboard`

**Access:** Private

**Response (Staff):** `200 OK`
```json
{
  "success": true,
  "data": {
    "applications": {
      "total": 5,
      "pending": 2,
      "underReview": 2,
      "shortlisted": 1
    },
    "recentApplications": [
      {
        "_id": "...",
        "position": {
          "title": "Assistant Professor",
          "department": "Computer Science",
          "deadline": "2024-12-31T00:00:00.000Z",
          "status": "open"
        },
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Response (Evaluator):** `200 OK`
```json
{
  "success": true,
  "data": {
    "positions": 3,
    "applicationsToReview": 15,
    "evaluationsCompleted": 10,
    "pendingEvaluations": [
      {
        "_id": "...",
        "position": {
          "title": "Assistant Professor",
          "department": "Computer Science"
        },
        "applicant": {
          "fullName": "John Doe",
          "email": "john@aau.edu.et"
        },
        "status": "pending"
      }
    ]
  }
}
```

---

## Error Codes

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    "Email is required",
    "Password must be at least 6 characters"
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Position not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Rate Limiting

API requests are limited to **100 requests per 15 minutes** per IP address.

When limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

---

## File Upload Specifications

### Allowed File Types
- **Documents**: PDF, DOC, DOCX
- **Images**: JPG, JPEG, PNG

### File Size Limits
- Maximum file size: **5MB**
- Maximum certificates: **5 files**

### Upload Response
Files are uploaded to Cloudinary and return secure URLs:
```
https://res.cloudinary.com/your-cloud/image/upload/v1234567890/aau-iapams/cv/file.pdf
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Meta:**
```json
{
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

## Filtering and Sorting

### Filtering
Use query parameters to filter results:
```
GET /positions?status=open&department=Computer Science
```

### Sorting
```
GET /positions?sortBy=createdAt&order=desc
```

### Search
```
GET /auth/users?search=john
```

---

## Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (httpOnly cookies or secure storage)
3. **Refresh tokens before expiry**
4. **Handle errors gracefully**
5. **Implement retry logic for failed requests**
6. **Validate input on client side**
7. **Use appropriate HTTP methods**
8. **Include proper headers**
9. **Handle file uploads with progress indicators**
10. **Implement request timeouts**

---

## Support

For API issues or questions:
- Check server logs
- Review error messages
- Consult documentation
- Contact development team
