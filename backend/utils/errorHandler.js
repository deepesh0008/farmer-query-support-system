/**
 * HTTP Status and Error Messages
 * Standardized HTTP status codes and error messages
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Your account is temporarily locked. Please try again later',
  TOO_MANY_LOGIN_ATTEMPTS: 'Too many login attempts. Please try again later',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
  UNAUTHORIZED: 'Unauthorized access',

  // Validation
  VALIDATION_FAILED: 'Validation failed',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number format',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  WEAK_PASSWORD: 'Password must contain uppercase, lowercase, numbers and special characters',
  INVALID_OTP: 'Invalid OTP',
  OTP_EXPIRED: 'OTP has expired',
  INVALID_LANGUAGE: 'Invalid language code',

  // User
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  EMAIL_ALREADY_REGISTERED: 'Email is already registered',
  PHONE_ALREADY_REGISTERED: 'Phone number is already registered',
  USER_SUSPENDED: 'Your account has been suspended',
  USER_DELETED: 'User account has been deleted',

  // Query
  QUERY_NOT_FOUND: 'Query not found',
  INVALID_QUERY_TYPE: 'Invalid query type',
  NO_QUERIES_FOUND: 'No queries found',

  // Escalation
  ESCALATION_NOT_FOUND: 'Escalation not found',
  ALREADY_ESCALATED: 'Query is already escalated',
  ESCALATION_ALREADY_RESOLVED: 'Escalation is already resolved',

  // Scheme
  SCHEME_NOT_FOUND: 'Scheme not found',
  NO_MATCHING_SCHEMES: 'No schemes match your criteria',

  // File Upload
  FILE_REQUIRED: 'File is required',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File is too large',
  FILE_UPLOAD_FAILED: 'File upload failed',

  // Permission
  FORBIDDEN: 'You do not have permission to perform this action',
  ROLE_REQUIRED: 'This action requires specific role permissions',
  OFFICER_REQUIRED: 'This action requires officer role',
  ADMIN_REQUIRED: 'This action requires admin role',

  // Server
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
  DATABASE_ERROR: 'Database operation failed',
  EXTERNAL_API_ERROR: 'External API request failed',

  // Other
  BAD_REQUEST: 'Bad request',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
  DUPLICATE_ENTRY: 'Duplicate entry',
  OPERATION_NOT_ALLOWED: 'Operation not allowed',
  INVALID_REQUEST: 'Invalid request',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  PHONE_VERIFIED: 'Phone verified successfully',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  QUERY_CREATED: 'Query created successfully',
  RESPONSE_RETRIEVED: 'Response retrieved successfully',
  FEEDBACK_SUBMITTED: 'Feedback submitted successfully',
  ESCALATION_CREATED: 'Escalation created successfully',
  OPERATION_SUCCESS: 'Operation completed successfully',
  USER_CREATED: 'User created successfully',
  USER_DELETED: 'User deleted successfully',
  USER_UPDATED: 'User updated successfully',
};

export default {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
