/**
 * JWT Utility Functions
 * JWT token generation and verification
 */

import jwt from 'jsonwebtoken';
import config from '../config/env.js';

// Generate Access Token
export const generateAccessToken = (payload, expiresIn = config.jwtExpire) => {
  try {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn,
      issuer: 'farmer-query-system',
      audience: 'farmer-query-api',
    });
  } catch (error) {
    throw new Error(`Access token generation failed: ${error.message}`);
  }
};

// Generate Refresh Token
export const generateRefreshToken = (payload, expiresIn = config.jwtRefreshExpire) => {
  try {
    return jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn,
      issuer: 'farmer-query-system',
      audience: 'farmer-query-api',
    });
  } catch (error) {
    throw new Error(`Refresh token generation failed: ${error.message}`);
  }
};

// Generate both tokens
export const generateTokens = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};

// Verify Access Token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret, {
      issuer: 'farmer-query-system',
      audience: 'farmer-query-api',
    });
  } catch (error) {
    throw new Error(`Access token verification failed: ${error.message}`);
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret, {
      issuer: 'farmer-query-system',
      audience: 'farmer-query-api',
    });
  } catch (error) {
    throw new Error(`Refresh token verification failed: ${error.message}`);
  }
};

// Decode Token (without verification)
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error(`Token decoding failed: ${error.message}`);
  }
};

// Check if token is expired
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
};
