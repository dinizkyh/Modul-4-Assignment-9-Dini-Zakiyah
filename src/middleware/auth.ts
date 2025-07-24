import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '@/utils';
import { AuthenticationError, TokenPayload } from '@/types';

/**
 * Extended Request interface to include user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Authentication middleware that verifies Bearer token
 * and attaches user information to the request
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractBearerToken(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Bearer token required',
        },
      });
      return;
    }

    const payload: TokenPayload = await JWTUtils.verifyToken(token);
    
    // Attach user information to request
    (req as AuthenticatedRequest).user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: error.message,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Authentication processing failed',
        },
      });
    }
  }
}

/**
 * Optional authentication middleware that attaches user information
 * if a valid token is provided, but doesn't require authentication
 */
export async function optionalAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractBearerToken(authHeader);

    if (token) {
      try {
        const payload: TokenPayload = await JWTUtils.verifyToken(token);
        (req as AuthenticatedRequest).user = {
          userId: payload.userId,
          email: payload.email,
        };
      } catch {
        // Invalid token, but we don't reject the request
        // User information will not be available
      }
    }

    next();
  } catch (error) {
    // Even if something goes wrong, we don't reject the request
    // since authentication is optional
    next();
  }
}
