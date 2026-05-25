// Server Configuration
export const DEFAULT_PORT = 5000;

// Rate Limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS_DEV = 1000;
export const RATE_LIMIT_MAX_REQUESTS_PROD = 200;

// Password Requirements
export const MIN_PASSWORD_LENGTH = 6;
export const RECOMMENDED_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const BCRYPT_SALT_ROUNDS = 10;

// Token Expiry
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';
export const RESET_TOKEN_EXPIRY = '1h';

// Pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  EVALUATOR: 'evaluator'
};

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted'
};

// Position Status
export const POSITION_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  FILLED: 'filled'
};

// Position Types
export const POSITION_TYPES = {
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
  CONTRACT: 'Contract',
  TEMPORARY: 'Temporary'
};

// Evaluation Scores
export const MIN_SCORE = 0;
export const MAX_SCORE = 10;
export const SHORTLIST_THRESHOLD = 7;
export const REVIEW_THRESHOLD = 4;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  USERNAME_ALREADY_EXISTS: 'Username already taken',
  ACCOUNT_INACTIVE: 'Account is inactive or suspended',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED_ACCESS: 'Access denied. Insufficient permissions.',
  VALIDATION_ERROR: 'Validation Error',
  INTERNAL_ERROR: 'Internal Server Error'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User(s) deleted successfully'
};
