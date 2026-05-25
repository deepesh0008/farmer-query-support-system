/**
 * Validation Utility Functions
 * Form validation and schema validation helpers
 */

// Validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const validatePhone = (phone) => {
  const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Validate password
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
    return {
      valid: false,
      error:
        'Password must contain uppercase, lowercase, numbers and special characters',
    };
  }

  return { valid: true };
};

// Validate name
export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (name.length > 50) {
    return { valid: false, error: 'Name must not exceed 50 characters' };
  }

  return { valid: true };
};

// Validate OTP
export const validateOTP = (otp) => {
  if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
    return { valid: false, error: 'OTP must be 6 digits' };
  }
  return { valid: true };
};

// Validate land size
export const validateLandSize = (size) => {
  const numSize = parseFloat(size);
  if (isNaN(numSize) || numSize <= 0) {
    return { valid: false, error: 'Land size must be a positive number' };
  }
  if (numSize > 1000) {
    return { valid: false, error: 'Land size seems too large' };
  }
  return { valid: true };
};

// Validate rating
export const validateRating = (rating) => {
  const numRating = parseInt(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return { valid: false, error: 'Rating must be between 1 and 5' };
  }
  return { valid: true };
};

// Validate URL
export const validateUrl = (url) => {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

// Validate registration form
export const validateRegistrationForm = (data) => {
  const errors = {};

  // Validate email
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Validate password
  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error;
    }
  }

  // Validate confirm password
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Validate first name
  if (!data.firstName) {
    errors.firstName = 'First name is required';
  } else {
    const nameValidation = validateName(data.firstName);
    if (!nameValidation.valid) {
      errors.firstName = nameValidation.error;
    }
  }

  // Validate last name
  if (!data.lastName) {
    errors.lastName = 'Last name is required';
  } else {
    const nameValidation = validateName(data.lastName);
    if (!nameValidation.valid) {
      errors.lastName = nameValidation.error;
    }
  }

  // Validate phone
  if (data.phoneNumber && !validatePhone(data.phoneNumber)) {
    errors.phoneNumber = 'Invalid phone number';
  }

  // Validate state
  if (!data.state) {
    errors.state = 'State is required';
  }

  // Validate role
  if (!data.role || !['farmer', 'officer', 'admin'].includes(data.role)) {
    errors.role = 'Invalid role';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate login form
export const validateLoginForm = (data) => {
  const errors = {};

  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate farmer profile
export const validateFarmerProfile = (data) => {
  const errors = {};

  if (!data.state) errors.state = 'State is required';
  if (!data.farm?.soilType) errors.soilType = 'Soil type is required';
  if (!data.agricultural?.farmingType)
    errors.farmingType = 'Farming type is required';

  if (data.farm?.totalLandSize) {
    const landValidation = validateLandSize(data.farm.totalLandSize.value);
    if (!landValidation.valid) {
      errors.landSize = landValidation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate query form
export const validateQueryForm = (data) => {
  const errors = {};

  if (!data.originalQuery || data.originalQuery.trim().length < 5) {
    errors.query = 'Query must be at least 5 characters';
  }

  if (!data.context?.cropType) {
    errors.cropType = 'Crop type is required';
  }

  if (data.queryType === 'image' && !data.media?.imageUrl) {
    errors.image = 'Image is required for image query';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate feedback form
export const validateFeedbackForm = (data) => {
  const errors = {};

  if (!data.rating) {
    errors.rating = 'Rating is required';
  } else {
    const ratingValidation = validateRating(data.rating);
    if (!ratingValidation.valid) {
      errors.rating = ratingValidation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateName,
  validateOTP,
  validateLandSize,
  validateRating,
  validateUrl,
  validateRegistrationForm,
  validateLoginForm,
  validateFarmerProfile,
  validateQueryForm,
  validateFeedbackForm,
};
