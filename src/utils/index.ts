import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '@/config';
import { TokenPayload, AuthenticationError } from '@/types';

/**
 * JWT utility functions for token generation and validation
 */
export class JWTUtils {
  /**
   * Generate JWT token for user
   * @param payload Token payload containing user information
   * @returns Promise<string> Generated JWT token
   */
  static async generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
    return new Promise((resolve, reject) => {
      let expiresIn: jwt.SignOptions['expiresIn'] = '1h';
      if (typeof config.jwtExpiresIn === 'string') {
        const validDuration = /^\d+[smhdwy]$/i;
        if (validDuration.test(config.jwtExpiresIn)) {
          expiresIn = config.jwtExpiresIn as jwt.SignOptions['expiresIn'];
        } else {
          const num = Number(config.jwtExpiresIn);
          if (!isNaN(num)) {
            expiresIn = num as jwt.SignOptions['expiresIn'];
          }
        }
      } else if (typeof config.jwtExpiresIn === 'number') {
        expiresIn = config.jwtExpiresIn as jwt.SignOptions['expiresIn'];
      }
      jwt.sign(
        payload,
        config.jwtSecret as Secret,
        { expiresIn },
        (error, token) => {
          if (error || !token) {
            reject(new AuthenticationError('Failed to generate token'));
          } else {
            resolve(token);
          }
        }
      );
    });
  }

  /**
   * Verify and decode JWT token
   * @param token JWT token to verify
   * @returns Promise<TokenPayload> Decoded token payload
   */
  static async verifyToken(token: string): Promise<TokenPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.jwtSecret, (error, decoded) => {
        if (error) {
          reject(new AuthenticationError('Invalid or expired token'));
        } else {
          resolve(decoded as TokenPayload);
        }
      });
    });
  }

  /**
   * Extract token from Authorization header
   * @param authHeader Authorization header value
   * @returns string | null Extracted token or null if invalid format
   */
  static extractBearerToken(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}

/**
 * Password utility functions for hashing and verification
 */
export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash password using bcrypt
   * @param password Plain text password
   * @returns Promise<string> Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   * @param password Plain text password
   * @param hash Hashed password
   * @returns Promise<boolean> True if password matches, false otherwise
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   * @param password Password to validate
   * @returns boolean True if password meets requirements, false otherwise
   */
  static validatePasswordStrength(password: string): boolean {
    // Password must be at least 8 characters long and contain at least one letter and one number
    const minLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return minLength && hasLetter && hasNumber;
  }
}

/**
 * Date utility functions for task deadline management
 */
export class DateUtils {
  /**
   * Get start and end of current week
   * @returns { start: Date, end: Date } Start and end dates of current week
   */
  static getCurrentWeekRange(): { start: Date, end: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate start of week (Monday)
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    start.setHours(0, 0, 0, 0);
    
    // Calculate end of week (Sunday)
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }

  /**
   * Get start and end of next 7 days from now
   * @returns { start: Date, end: Date } Start and end dates of next 7 days
   */
  static getNext7DaysRange(): { start: Date, end: Date } {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }

  /**
   * Validate if date string is valid ISO date
   * @param dateString Date string to validate
   * @returns boolean True if valid, false otherwise
   */
  static isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString === date.toISOString();
  }

  /**
   * Parse date string to Date object
   * @param dateString Date string to parse
   * @returns Date | null Parsed date or null if invalid
   */
  static parseDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch {
      return null;
    }
  }
}

/**
 * Email validation utility
 */
export class EmailUtils {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Validate email format
   * @param email Email to validate
   * @returns boolean True if valid email format, false otherwise
   */
  static isValidEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  /**
   * Normalize email (convert to lowercase, trim whitespace)
   * @param email Email to normalize
   * @returns string Normalized email
   */
  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
