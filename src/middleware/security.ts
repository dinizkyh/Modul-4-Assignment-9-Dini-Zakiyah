// Security middleware
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

export const securityHeaders = helmet();
export const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
export const corsConfig = cors();

import { Request, Response, NextFunction } from 'express';
export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
  // TODO: implement request sanitization
  next();
}

export function errorSanitizer(err: any, req: Request, res: Response, next: NextFunction) {
  // TODO: implement error message sanitization
  next(err);
}
