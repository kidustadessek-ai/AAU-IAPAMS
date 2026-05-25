// API Configuration
export const API_TIMEOUT = 10000;
export const API_RETRY_ATTEMPTS = 3;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 30;
export const DEFAULT_PAGE = 1;

// Rate Limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS_DEV = 1000;
export const RATE_LIMIT_MAX_REQUESTS_PROD = 200;

// Password Requirements
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

// Token Expiry
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';
export const RESET_TOKEN_EXPIRY = '1h';

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// UI Constants
export const TOAST_DURATION = 3000;
export const DEBOUNCE_DELAY = 300;
export const ANIMATION_DURATION = 200;

// Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted'
};

export const POSITION_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  FILLED: 'filled'
};

// Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  EVALUATOR: 'evaluator'
};

// Evaluation Scores
export const MIN_SCORE = 0;
export const MAX_SCORE = 10;
export const SHORTLIST_THRESHOLD = 7;
export const REVIEW_THRESHOLD = 4;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid username or password.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  UPDATE_SUCCESS: 'Updated successfully',
  CREATE_SUCCESS: 'Created successfully',
  DELETE_SUCCESS: 'Deleted successfully'
};
