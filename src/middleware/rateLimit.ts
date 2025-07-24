import rateLimit from 'express-rate-limit';
import { config } from '@/config';

/**
 * General rate limiting middleware for all endpoints
 */
export const generalRateLimit = rateLimit({
  windowMs: config.rateLimitWindowMs, // Time window in milliseconds
  max: config.rateLimitMaxRequests, // Maximum number of requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests
  skipFailedRequests: false, // Count failed requests
});

/**
 * Strict rate limiting for authentication endpoints
 * (login, register) to prevent brute force attacks
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 attempts per window
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again in 15 minutes',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: false, // Count failed attempts
});

/**
 * Moderate rate limiting for create operations
 * to prevent spam
 */
export const createRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Maximum 20 create operations per window
  message: {
    success: false,
    error: {
      code: 'CREATE_RATE_LIMIT_EXCEEDED',
      message: 'Too many create operations, please slow down',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

/**
 * Custom rate limit factory for specific use cases
 */
export function createCustomRateLimit(
  windowMs: number,
  max: number,
  message: string,
  skipSuccessful: boolean = false
) {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: skipSuccessful,
    skipFailedRequests: false,
  });
}
