import dotenv from 'dotenv';
import { AppConfig, DatabaseConfig, RepositoryType } from '@/types';

// Load environment variables
dotenv.config();

/**
 * Application configuration loaded from environment variables
 */
export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  repositoryType: (process.env.REPOSITORY_TYPE as RepositoryType) || 'memory',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'task_management_db',
  },
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

/**
 * Validate required configuration
 */
export function validateConfig(): void {
  const requiredEnvVars = ['JWT_SECRET'];
  
  if (config.repositoryType === 'sql') {
    requiredEnvVars.push('DB_HOST', 'DB_USER', 'DB_NAME');
  }

  const missingVars = requiredEnvVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.trim() === '';
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }

  if (config.nodeEnv === 'production' && config.jwtSecret === 'fallback-secret-key-change-in-production') {
    throw new Error('JWT_SECRET must be set to a secure value in production');
  }
}

/**
 * Get database configuration
 */
export function getDatabaseConfig(): DatabaseConfig {
  return config.database;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return config.nodeEnv === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return config.nodeEnv === 'production';
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return config.nodeEnv === 'test';
}
