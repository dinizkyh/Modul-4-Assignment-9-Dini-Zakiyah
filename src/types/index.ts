/**
 * Common types used throughout the application
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User entity representing a registered user
 */
export interface User extends BaseEntity {
  email: string;
  password: string; // hashed password
}

/**
 * List entity for grouping tasks
 */
export interface List extends BaseEntity {
  name: string;
  description?: string;
  userId: string;
}

/**
 * Task entity representing a todo item
 */
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  deadline?: Date;
  isCompleted: boolean;
  listId: string;
  userId: string;
}

/**
 * DTO for user registration
 */
export interface RegisterUserDto {
  email: string;
  password: string;
}

/**
 * DTO for user login
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * DTO for creating a new list
 */
export interface CreateListDto {
  name: string;
  description?: string;
}

/**
 * DTO for updating a list
 */
export interface UpdateListDto {
  name?: string;
  description?: string;
}

/**
 * DTO for creating a new task
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  deadline?: string; // ISO date string
}

/**
 * DTO for updating a task
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  deadline?: string; // ISO date string
  isCompleted?: boolean;
}

/**
 * Authentication token payload
 */
export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * List with associated tasks
 */
export interface ListWithTasks extends List {
  tasks: Task[];
}

/**
 * Task with list name for filtering responses
 */
export interface TaskWithListName extends Task {
  listName: string;
}

/**
 * Query parameters for task filtering
 */
export interface TaskQuery {
  sort?: 'deadline' | '-deadline';
  completed?: boolean;
  listId?: string;
}

/**
 * Repository factory type
 */
export type RepositoryType = 'memory' | 'sql';

/**
 * Database configuration
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

/**
 * Application configuration
 */
export interface AppConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  repositoryType: RepositoryType;
  database: DatabaseConfig;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  corsOrigin: string;
}

/**
 * Custom error types
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}
