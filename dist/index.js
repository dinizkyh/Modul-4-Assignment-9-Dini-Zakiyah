"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const uuid = require("uuid");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const Joi = require("joi");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");
dotenv.config();
const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-key-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  repositoryType: process.env.REPOSITORY_TYPE || "memory",
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "task_management_db"
  },
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  corsOrigin: process.env.CORS_ORIGIN || "*"
};
function getDatabaseConfig() {
  return config.database;
}
class MemoryUserRepository {
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.emailIndex = /* @__PURE__ */ new Map();
  }
  // email -> userId
  async create(userData) {
    const now = /* @__PURE__ */ new Date();
    const user = {
      id: uuid.v4(),
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(user.id, user);
    this.emailIndex.set(user.email.toLowerCase(), user.id);
    return user;
  }
  async findByEmail(email) {
    const userId = this.emailIndex.get(email.toLowerCase());
    if (!userId) return null;
    return this.users.get(userId) || null;
  }
  async findById(id) {
    return this.users.get(id) || null;
  }
  async update(id, updates) {
    const user = this.users.get(id);
    if (!user) return null;
    if (updates.email && updates.email !== user.email) {
      this.emailIndex.delete(user.email.toLowerCase());
      this.emailIndex.set(updates.email.toLowerCase(), user.id);
    }
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async delete(id) {
    const user = this.users.get(id);
    if (!user) return false;
    this.users.delete(id);
    this.emailIndex.delete(user.email.toLowerCase());
    return true;
  }
  // Utility method for testing
  clear() {
    this.users.clear();
    this.emailIndex.clear();
  }
}
class MemoryListRepository {
  constructor() {
    this.lists = /* @__PURE__ */ new Map();
    this.userListIndex = /* @__PURE__ */ new Map();
  }
  // userId -> Set of listIds
  async create(listData) {
    const now = /* @__PURE__ */ new Date();
    const list = {
      id: uuid.v4(),
      ...listData,
      createdAt: now,
      updatedAt: now
    };
    this.lists.set(list.id, list);
    if (!this.userListIndex.has(list.userId)) {
      this.userListIndex.set(list.userId, /* @__PURE__ */ new Set());
    }
    this.userListIndex.get(list.userId).add(list.id);
    return list;
  }
  async findByUserId(userId) {
    const listIds = this.userListIndex.get(userId);
    if (!listIds) return [];
    const lists = [];
    for (const listId of listIds) {
      const list = this.lists.get(listId);
      if (list) {
        lists.push(list);
      }
    }
    return lists.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  async findByIdAndUserId(id, userId) {
    const list = this.lists.get(id);
    if (!list || list.userId !== userId) return null;
    return list;
  }
  async update(id, updates) {
    const list = this.lists.get(id);
    if (!list) return null;
    const updatedList = {
      ...list,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.lists.set(id, updatedList);
    return updatedList;
  }
  async delete(id) {
    const list = this.lists.get(id);
    if (!list) return false;
    this.lists.delete(id);
    const userLists = this.userListIndex.get(list.userId);
    if (userLists) {
      userLists.delete(id);
      if (userLists.size === 0) {
        this.userListIndex.delete(list.userId);
      }
    }
    return true;
  }
  async isNameUniqueForUser(name, userId, excludeId) {
    const userLists = await this.findByUserId(userId);
    return !userLists.some(
      (list) => list.name.toLowerCase() === name.toLowerCase() && list.id !== excludeId
    );
  }
  // Utility method for testing
  clear() {
    this.lists.clear();
    this.userListIndex.clear();
  }
}
class MemoryTaskRepository {
  constructor() {
    this.tasks = /* @__PURE__ */ new Map();
    this.userTaskIndex = /* @__PURE__ */ new Map();
    this.listTaskIndex = /* @__PURE__ */ new Map();
  }
  // listId -> Set of taskIds
  async create(taskData) {
    const now = /* @__PURE__ */ new Date();
    const task = {
      id: uuid.v4(),
      ...taskData,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(task.id, task);
    if (!this.userTaskIndex.has(task.userId)) {
      this.userTaskIndex.set(task.userId, /* @__PURE__ */ new Set());
    }
    this.userTaskIndex.get(task.userId).add(task.id);
    if (!this.listTaskIndex.has(task.listId)) {
      this.listTaskIndex.set(task.listId, /* @__PURE__ */ new Set());
    }
    this.listTaskIndex.get(task.listId).add(task.id);
    return task;
  }
  async findByUserId(userId) {
    const taskIds = this.userTaskIndex.get(userId);
    if (!taskIds) return [];
    const tasks2 = [];
    for (const taskId of taskIds) {
      const task = this.tasks.get(taskId);
      if (task) {
        tasks2.push(task);
      }
    }
    return tasks2.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  async findByListId(listId, userId) {
    const taskIds = this.listTaskIndex.get(listId);
    if (!taskIds) return [];
    const tasks2 = [];
    for (const taskId of taskIds) {
      const task = this.tasks.get(taskId);
      if (task && task.userId === userId) {
        tasks2.push(task);
      }
    }
    return tasks2.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  async findByIdAndUserId(id, userId) {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) return null;
    return task;
  }
  async update(id, updates) {
    const task = this.tasks.get(id);
    if (!task) return null;
    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  async delete(id) {
    const task = this.tasks.get(id);
    if (!task) return false;
    this.tasks.delete(id);
    const userTasks = this.userTaskIndex.get(task.userId);
    if (userTasks) {
      userTasks.delete(id);
      if (userTasks.size === 0) {
        this.userTaskIndex.delete(task.userId);
      }
    }
    const listTasks = this.listTaskIndex.get(task.listId);
    if (listTasks) {
      listTasks.delete(id);
      if (listTasks.size === 0) {
        this.listTaskIndex.delete(task.listId);
      }
    }
    return true;
  }
  async deleteByListId(listId) {
    const taskIds = this.listTaskIndex.get(listId);
    if (!taskIds) return 0;
    let deletedCount = 0;
    for (const taskId of Array.from(taskIds)) {
      const deleted = await this.delete(taskId);
      if (deleted) deletedCount++;
    }
    return deletedCount;
  }
  async findDueInRange(userId, startDate, endDate) {
    const userTasks = await this.findByUserId(userId);
    return userTasks.filter((task) => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      return deadline >= startDate && deadline <= endDate;
    });
  }
  async findSortedByDeadline(userId, ascending = true) {
    const userTasks = await this.findByUserId(userId);
    return userTasks.filter((task) => task.deadline !== void 0).sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }
  // Utility method for testing
  clear() {
    this.tasks.clear();
    this.userTaskIndex.clear();
    this.listTaskIndex.clear();
  }
}
let pool = null;
function createDatabasePool() {
  if (!pool) {
    const config2 = getDatabaseConfig();
    pool = mysql.createPool({
      host: config2.host,
      port: config2.port,
      user: config2.user,
      password: config2.password,
      database: config2.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}
class SQLUserRepository {
  constructor() {
    this.pool = createDatabasePool();
  }
  async create(userData) {
    const id = uuid.v4();
    const now = /* @__PURE__ */ new Date();
    const [result] = await this.pool.execute(
      "INSERT INTO users (id, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      [id, userData.email, userData.password, now, now]
    );
    return {
      id,
      ...userData,
      createdAt: now,
      updatedAt: now
    };
  }
  async findByEmail(email) {
    const [rows] = await this.pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
  async findById(id) {
    const [rows] = await this.pool.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
  async update(id, updates) {
    const setClause = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    const values = [...Object.values(updates), /* @__PURE__ */ new Date(), id];
    const [result] = await this.pool.execute(
      `UPDATE users SET ${setClause}, updated_at = ? WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) return null;
    return this.findById(id);
  }
  async delete(id) {
    const [result] = await this.pool.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}
class SQLListRepository {
  constructor() {
    this.pool = createDatabasePool();
  }
  async create(listData) {
    const id = uuid.v4();
    const now = /* @__PURE__ */ new Date();
    await this.pool.execute(
      "INSERT INTO lists (id, name, description, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      [id, listData.name, listData.description || null, listData.userId, now, now]
    );
    return {
      id,
      ...listData,
      createdAt: now,
      updatedAt: now
    };
  }
  async findByUserId(userId) {
    const [rows] = await this.pool.execute(
      "SELECT * FROM lists WHERE user_id = ? ORDER BY created_at ASC",
      [userId]
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }
  async findByIdAndUserId(id, userId) {
    const [rows] = await this.pool.execute(
      "SELECT * FROM lists WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
  async update(id, updates) {
    const setClause = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    const values = [...Object.values(updates), /* @__PURE__ */ new Date(), id];
    const [result] = await this.pool.execute(
      `UPDATE lists SET ${setClause}, updated_at = ? WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) return null;
    const [rows] = await this.pool.execute(
      "SELECT * FROM lists WHERE id = ?",
      [id]
    );
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
  async delete(id) {
    const [result] = await this.pool.execute(
      "DELETE FROM lists WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
  async isNameUniqueForUser(name, userId, excludeId) {
    let query = "SELECT COUNT(*) as count FROM lists WHERE name = ? AND user_id = ?";
    const params = [name, userId];
    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }
    const [rows] = await this.pool.execute(query, params);
    return rows[0].count === 0;
  }
}
class SQLTaskRepository {
  constructor() {
    this.pool = createDatabasePool();
  }
  async create(taskData) {
    const id = uuid.v4();
    const now = /* @__PURE__ */ new Date();
    await this.pool.execute(
      "INSERT INTO tasks (id, title, description, deadline, is_completed, list_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        taskData.title,
        taskData.description || null,
        taskData.deadline || null,
        taskData.isCompleted,
        taskData.listId,
        taskData.userId,
        now,
        now
      ]
    );
    return {
      id,
      ...taskData,
      createdAt: now,
      updatedAt: now
    };
  }
  async findByUserId(userId) {
    const [rows] = await this.pool.execute(
      "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at ASC",
      [userId]
    );
    return this.mapRowsToTasks(rows);
  }
  async findByListId(listId, userId) {
    const [rows] = await this.pool.execute(
      "SELECT * FROM tasks WHERE list_id = ? AND user_id = ? ORDER BY created_at ASC",
      [listId, userId]
    );
    return this.mapRowsToTasks(rows);
  }
  async findByIdAndUserId(id, userId) {
    const [rows] = await this.pool.execute(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (rows.length === 0) return null;
    return this.mapRowToTask(rows[0]);
  }
  async update(id, updates) {
    const setClause = Object.keys(updates).map((key) => {
      if (key === "isCompleted") return "is_completed = ?";
      if (key === "listId") return "list_id = ?";
      return `${key} = ?`;
    }).join(", ");
    const values = [...Object.values(updates), /* @__PURE__ */ new Date(), id];
    const [result] = await this.pool.execute(
      `UPDATE tasks SET ${setClause}, updated_at = ? WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) return null;
    const [rows] = await this.pool.execute(
      "SELECT * FROM tasks WHERE id = ?",
      [id]
    );
    return this.mapRowToTask(rows[0]);
  }
  async delete(id) {
    const [result] = await this.pool.execute(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
  async deleteByListId(listId) {
    const [result] = await this.pool.execute(
      "DELETE FROM tasks WHERE list_id = ?",
      [listId]
    );
    return result.affectedRows;
  }
  async findDueInRange(userId, startDate, endDate) {
    const [rows] = await this.pool.execute(
      "SELECT * FROM tasks WHERE user_id = ? AND deadline >= ? AND deadline <= ? ORDER BY deadline ASC",
      [userId, startDate, endDate]
    );
    return this.mapRowsToTasks(rows);
  }
  async findSortedByDeadline(userId, ascending = true) {
    const order = ascending ? "ASC" : "DESC";
    const [rows] = await this.pool.execute(
      `SELECT * FROM tasks WHERE user_id = ? AND deadline IS NOT NULL ORDER BY deadline ${order}`,
      [userId]
    );
    return this.mapRowsToTasks(rows);
  }
  mapRowToTask(row) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      deadline: row.deadline ? new Date(row.deadline) : void 0,
      isCompleted: Boolean(row.is_completed),
      listId: row.list_id,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
  mapRowsToTasks(rows) {
    return rows.map((row) => this.mapRowToTask(row));
  }
}
class RepositoryFactory {
  static {
    this.userRepository = null;
  }
  static {
    this.listRepository = null;
  }
  static {
    this.taskRepository = null;
  }
  /**
   * Get User repository instance
   */
  static getUserRepository() {
    if (!this.userRepository) {
      if (config.repositoryType === "sql") {
        this.userRepository = new SQLUserRepository();
      } else {
        this.userRepository = new MemoryUserRepository();
      }
    }
    return this.userRepository;
  }
  /**
   * Get List repository instance
   */
  static getListRepository() {
    if (!this.listRepository) {
      if (config.repositoryType === "sql") {
        this.listRepository = new SQLListRepository();
      } else {
        this.listRepository = new MemoryListRepository();
      }
    }
    return this.listRepository;
  }
  /**
   * Get Task repository instance
   */
  static getTaskRepository() {
    if (!this.taskRepository) {
      if (config.repositoryType === "sql") {
        this.taskRepository = new SQLTaskRepository();
      } else {
        this.taskRepository = new MemoryTaskRepository();
      }
    }
    return this.taskRepository;
  }
  /**
   * Reset all repository instances (useful for testing)
   */
  static reset() {
    this.userRepository = null;
    this.listRepository = null;
    this.taskRepository = null;
  }
  /**
   * Clear all data (only works with memory repositories, useful for testing)
   */
  static clearAllData() {
    if (config.repositoryType === "memory") {
      const userRepo = this.getUserRepository();
      const listRepo = this.getListRepository();
      const taskRepo = this.getTaskRepository();
      userRepo.clear();
      listRepo.clear();
      taskRepo.clear();
    }
  }
}
class AppError extends Error {
  constructor(message, statusCode, code, details) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "AppError";
  }
}
class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}
class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}
class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, "NOT_FOUND_ERROR");
    this.name = "NotFoundError";
  }
}
class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, "CONFLICT_ERROR");
    this.name = "ConflictError";
  }
}
class JWTUtils {
  /**
   * Generate JWT token for user
   * @param payload Token payload containing user information
   * @returns Promise<string> Generated JWT token
   */
  static async generateToken(payload) {
    return new Promise((resolve, reject) => {
      let expiresIn = "1h";
      if (typeof config.jwtExpiresIn === "string") {
        const validDuration = /^\d+[smhdwy]$/i;
        if (validDuration.test(config.jwtExpiresIn)) {
          expiresIn = config.jwtExpiresIn;
        } else {
          const num = Number(config.jwtExpiresIn);
          if (!isNaN(num)) {
            expiresIn = num;
          }
        }
      } else if (typeof config.jwtExpiresIn === "number") {
        expiresIn = config.jwtExpiresIn;
      }
      jwt.sign(
        payload,
        config.jwtSecret,
        { expiresIn },
        (error, token) => {
          if (error || !token) {
            reject(new AuthenticationError("Failed to generate token"));
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
  static async verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.jwtSecret, (error, decoded) => {
        if (error) {
          reject(new AuthenticationError("Invalid or expired token"));
        } else {
          resolve(decoded);
        }
      });
    });
  }
  /**
   * Extract token from Authorization header
   * @param authHeader Authorization header value
   * @returns string | null Extracted token or null if invalid format
   */
  static extractBearerToken(authHeader) {
    if (!authHeader) return null;
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }
    return parts[1];
  }
}
class PasswordUtils {
  static {
    this.SALT_ROUNDS = 12;
  }
  /**
   * Hash password using bcrypt
   * @param password Plain text password
   * @returns Promise<string> Hashed password
   */
  static async hashPassword(password) {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }
  /**
   * Verify password against hash
   * @param password Plain text password
   * @param hash Hashed password
   * @returns Promise<boolean> True if password matches, false otherwise
   */
  static async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
  /**
   * Validate password strength
   * @param password Password to validate
   * @returns boolean True if password meets requirements, false otherwise
   */
  static validatePasswordStrength(password) {
    const minLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return minLength && hasLetter && hasNumber;
  }
}
class EmailUtils {
  static {
    this.EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  }
  /**
   * Validate email format
   * @param email Email to validate
   * @returns boolean True if valid email format, false otherwise
   */
  static isValidEmail(email) {
    return this.EMAIL_REGEX.test(email);
  }
  /**
   * Normalize email (convert to lowercase, trim whitespace)
   * @param email Email to normalize
   * @returns string Normalized email
   */
  static normalizeEmail(email) {
    return email.trim().toLowerCase();
  }
}
class UserService {
  constructor() {
    this.userRepository = RepositoryFactory.getUserRepository();
  }
  /**
   * Register a new user
   * @param userData User registration data
   * @returns Promise<{ user: User, token: string }> Created user and JWT token
   */
  async register(userData) {
    if (!EmailUtils.isValidEmail(userData.email)) {
      throw new ValidationError("Invalid email format");
    }
    if (!PasswordUtils.validatePasswordStrength(userData.password)) {
      throw new ValidationError(
        "Password must be at least 8 characters long and contain at least one letter and one number"
      );
    }
    const normalizedEmail = EmailUtils.normalizeEmail(userData.email);
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }
    const hashedPassword = await PasswordUtils.hashPassword(userData.password);
    const user = await this.userRepository.create({
      email: normalizedEmail,
      password: hashedPassword
    });
    const token = await JWTUtils.generateToken({
      userId: user.id,
      email: user.email
    });
    const userWithoutPassword = this.sanitizeUser(user);
    return {
      user: userWithoutPassword,
      token
    };
  }
  /**
   * Authenticate user login
   * @param credentials User login credentials
   * @returns Promise<{ user: User, token: string }> Authenticated user and JWT token
   */
  async login(credentials) {
    if (!EmailUtils.isValidEmail(credentials.email)) {
      throw new ValidationError("Invalid email format");
    }
    const normalizedEmail = EmailUtils.normalizeEmail(credentials.email);
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }
    const isPasswordValid = await PasswordUtils.verifyPassword(
      credentials.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }
    const token = await JWTUtils.generateToken({
      userId: user.id,
      email: user.email
    });
    const userWithoutPassword = this.sanitizeUser(user);
    return {
      user: userWithoutPassword,
      token
    };
  }
  /**
   * Get user by ID
   * @param userId User ID
   * @returns Promise<User | null> User without password or null if not found
   */
  async getUserById(userId) {
    const user = await this.userRepository.findById(userId);
    return user ? this.sanitizeUser(user) : null;
  }
  /**
   * Get user by email
   * @param email User email
   * @returns Promise<User | null> User without password or null if not found
   */
  async getUserByEmail(email) {
    const normalizedEmail = EmailUtils.normalizeEmail(email);
    const user = await this.userRepository.findByEmail(normalizedEmail);
    return user ? this.sanitizeUser(user) : null;
  }
  /**
   * Update user password
   * @param userId User ID
   * @param currentPassword Current password for verification
   * @param newPassword New password
   * @returns Promise<User> Updated user without password
   */
  async updatePassword(userId, currentPassword, newPassword) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthenticationError("User not found");
    }
    const isCurrentPasswordValid = await PasswordUtils.verifyPassword(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError("Current password is incorrect");
    }
    if (!PasswordUtils.validatePasswordStrength(newPassword)) {
      throw new ValidationError(
        "New password must be at least 8 characters long and contain at least one letter and one number"
      );
    }
    const hashedNewPassword = await PasswordUtils.hashPassword(newPassword);
    const updatedUser = await this.userRepository.update(userId, {
      password: hashedNewPassword
    });
    if (!updatedUser) {
      throw new Error("Failed to update password");
    }
    return this.sanitizeUser(updatedUser);
  }
  /**
   * Delete user account
   * @param userId User ID
   * @param password Password for verification
   * @returns Promise<boolean> True if deleted successfully
   */
  async deleteUser(userId, password) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthenticationError("User not found");
    }
    const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Password is incorrect");
    }
    return await this.userRepository.delete(userId);
  }
  /**
   * Remove password from user object for safe API responses
   * @param user User object with password
   * @returns User User object without password
   */
  sanitizeUser(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
class ListService {
  constructor() {
    this.listRepository = RepositoryFactory.getListRepository();
    this.taskRepository = RepositoryFactory.getTaskRepository();
  }
  /**
   * Create a new list for a user
   * @param userId User ID
   * @param listData List creation data
   * @returns Promise<List> Created list
   */
  async createList(userId, listData) {
    const trimmedName = listData.name.trim();
    if (!trimmedName) {
      throw new ValidationError("List name cannot be empty");
    }
    const isNameUnique = await this.listRepository.isNameUniqueForUser(
      trimmedName,
      userId
    );
    if (!isNameUnique) {
      throw new ConflictError("A list with this name already exists");
    }
    const list = await this.listRepository.create({
      name: trimmedName,
      description: listData.description?.trim() || void 0,
      userId
    });
    return list;
  }
  /**
   * Get all lists for a user with their tasks
   * @param userId User ID
   * @returns Promise<ListWithTasks[]> Array of lists with tasks
   */
  async getUserLists(userId) {
    const lists = await this.listRepository.findByUserId(userId);
    const listsWithTasks = [];
    for (const list of lists) {
      const tasks2 = await this.taskRepository.findByListId(list.id, userId);
      listsWithTasks.push({
        ...list,
        tasks: tasks2
      });
    }
    return listsWithTasks;
  }
  /**
   * Get a specific list by ID with tasks
   * @param listId List ID
   * @param userId User ID for authorization
   * @returns Promise<ListWithTasks> List with tasks
   */
  async getListById(listId, userId) {
    const list = await this.listRepository.findByIdAndUserId(listId, userId);
    if (!list) {
      throw new NotFoundError("List");
    }
    const tasks2 = await this.taskRepository.findByListId(listId, userId);
    return {
      ...list,
      tasks: tasks2
    };
  }
  /**
   * Update a list
   * @param listId List ID
   * @param userId User ID for authorization
   * @param updates List update data
   * @returns Promise<List> Updated list
   */
  async updateList(listId, userId, updates) {
    const existingList = await this.listRepository.findByIdAndUserId(listId, userId);
    if (!existingList) {
      throw new NotFoundError("List");
    }
    const updateData = {};
    if (updates.name !== void 0) {
      const trimmedName = updates.name.trim();
      if (!trimmedName) {
        throw new ValidationError("List name cannot be empty");
      }
      if (trimmedName !== existingList.name) {
        const isNameUnique = await this.listRepository.isNameUniqueForUser(
          trimmedName,
          userId,
          listId
        );
        if (!isNameUnique) {
          throw new ConflictError("A list with this name already exists");
        }
      }
      updateData.name = trimmedName;
    }
    if (updates.description !== void 0) {
      updateData.description = updates.description.trim() || void 0;
    }
    const updatedList = await this.listRepository.update(listId, updateData);
    if (!updatedList) {
      throw new Error("Failed to update list");
    }
    return updatedList;
  }
  /**
   * Delete a list and all its tasks
   * @param listId List ID
   * @param userId User ID for authorization
   * @returns Promise<boolean> True if deleted successfully
   */
  async deleteList(listId, userId) {
    const existingList = await this.listRepository.findByIdAndUserId(listId, userId);
    if (!existingList) {
      throw new NotFoundError("List");
    }
    await this.taskRepository.deleteByListId(listId);
    const deleted = await this.listRepository.delete(listId);
    if (!deleted) {
      throw new Error("Failed to delete list");
    }
    return true;
  }
  /**
   * Get lists count for a user
   * @param userId User ID
   * @returns Promise<number> Number of lists
   */
  async getUserListsCount(userId) {
    const lists = await this.listRepository.findByUserId(userId);
    return lists.length;
  }
  /**
   * Get list with task count for dashboard/summary purposes
   * @param userId User ID
   * @returns Promise<Array<List & { taskCount: number, completedTaskCount: number }>>
   */
  async getListsSummary(userId) {
    const lists = await this.listRepository.findByUserId(userId);
    const summary = [];
    for (const list of lists) {
      const tasks2 = await this.taskRepository.findByListId(list.id, userId);
      const completedTasks = tasks2.filter((task) => task.isCompleted);
      summary.push({
        ...list,
        taskCount: tasks2.length,
        completedTaskCount: completedTasks.length,
        pendingTaskCount: tasks2.length - completedTasks.length
      });
    }
    return summary;
  }
  /**
   * Check if user has access to a specific list
   * @param listId List ID
   * @param userId User ID
   * @returns Promise<boolean> True if user has access
   */
  async hasUserAccess(listId, userId) {
    const list = await this.listRepository.findByIdAndUserId(listId, userId);
    return list !== null;
  }
}
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractBearerToken(authHeader);
    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_ERROR",
          message: "Bearer token required"
        }
      });
      return;
    }
    const payload = await JWTUtils.verifyToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email
    };
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_ERROR",
          message: error.message
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Authentication processing failed"
        }
      });
    }
  }
}
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
rateLimit({
  windowMs: config.rateLimitWindowMs,
  // Time window in milliseconds
  max: config.rateLimitMaxRequests,
  // Maximum number of requests per window
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later"
    }
  },
  standardHeaders: true,
  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  // Count successful requests
  skipFailedRequests: false
  // Count failed requests
});
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // Maximum 5 attempts per window
  message: {
    success: false,
    error: {
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts, please try again in 15 minutes"
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  // Don't count successful logins
  skipFailedRequests: false
  // Count failed attempts
});
const createRateLimit = rateLimit({
  windowMs: 5 * 60 * 1e3,
  // 5 minutes
  max: 20,
  // Maximum 20 create operations per window
  message: {
    success: false,
    error: {
      code: "CREATE_RATE_LIMIT_EXCEEDED",
      message: "Too many create operations, please slow down"
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});
const registerUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required"
  }),
  password: Joi.string().min(8).pattern(new RegExp("^(?=.*[a-zA-Z])(?=.*\\d)")).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "string.pattern.base": "Password must contain at least one letter and one number",
    "any.required": "Password is required"
  })
});
const loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required"
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required"
  })
});
const createListSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "List name cannot be empty",
    "string.min": "List name cannot be empty",
    "string.max": "List name cannot exceed 100 characters",
    "any.required": "List name is required"
  }),
  description: Joi.string().trim().max(500).allow("").optional().messages({
    "string.max": "Description cannot exceed 500 characters"
  })
});
const updateListSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional().messages({
    "string.empty": "List name cannot be empty",
    "string.min": "List name cannot be empty",
    "string.max": "List name cannot exceed 100 characters"
  }),
  description: Joi.string().trim().max(500).allow("").optional().messages({
    "string.max": "Description cannot exceed 500 characters"
  })
}).min(1).messages({
  "object.min": "At least one field must be provided for update"
});
Joi.object({
  title: Joi.string().trim().min(1).max(255).required().messages({
    "string.empty": "Task title cannot be empty",
    "string.min": "Task title cannot be empty",
    "string.max": "Task title cannot exceed 255 characters",
    "any.required": "Task title is required"
  }),
  description: Joi.string().trim().max(1e3).allow("").optional().messages({
    "string.max": "Description cannot exceed 1000 characters"
  }),
  deadline: Joi.string().isoDate().optional().messages({
    "string.isoDate": "Deadline must be a valid ISO date string"
  })
});
Joi.object({
  title: Joi.string().trim().min(1).max(255).optional().messages({
    "string.empty": "Task title cannot be empty",
    "string.min": "Task title cannot be empty",
    "string.max": "Task title cannot exceed 255 characters"
  }),
  description: Joi.string().trim().max(1e3).allow("").optional().messages({
    "string.max": "Description cannot exceed 1000 characters"
  }),
  deadline: Joi.string().isoDate().allow(null).optional().messages({
    "string.isoDate": "Deadline must be a valid ISO date string"
  }),
  isCompleted: Joi.boolean().optional().messages({
    "boolean.base": "isCompleted must be a boolean value"
  })
}).min(1).messages({
  "object.min": "At least one field must be provided for update"
});
Joi.object({
  sort: Joi.string().valid("deadline", "-deadline").optional().messages({
    "any.only": 'Sort parameter must be either "deadline" or "-deadline"'
  }),
  completed: Joi.boolean().optional().messages({
    "boolean.base": "Completed parameter must be a boolean value"
  }),
  listId: Joi.string().uuid().optional().messages({
    "string.uuid": "List ID must be a valid UUID"
  })
});
const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.uuid": "ID must be a valid UUID",
    "any.required": "ID is required"
  })
});
Joi.object({
  listId: Joi.string().uuid().required().messages({
    "string.uuid": "List ID must be a valid UUID",
    "any.required": "List ID is required"
  })
});
function createValidationMiddleware(schema, source = "body") {
  return (req, res, next) => {
    const dataToValidate = source === "body" ? req.body : source === "params" ? req.params : req.query;
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });
    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message
      }));
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details
        }
      });
    }
    if (source === "body") {
      req.body = value;
    } else if (source === "params") {
      req.params = value;
    } else {
      req.query = value;
    }
    next();
  };
}
const router$2 = express.Router();
const listService = new ListService();
router$2.use(authenticateToken);
router$2.get(
  "/",
  asyncHandler(async (req, res) => {
    const lists = await listService.getUserLists(req.user.userId);
    const response = {
      success: true,
      data: { lists },
      message: "Lists retrieved successfully"
    };
    res.status(200).json(response);
  })
);
router$2.post(
  "/",
  createRateLimit,
  createValidationMiddleware(createListSchema, "body"),
  asyncHandler(async (req, res) => {
    const list = await listService.createList(req.user.userId, req.body);
    const response = {
      success: true,
      data: { list },
      message: "List created successfully"
    };
    res.status(201).json(response);
  })
);
router$2.get(
  "/:id",
  createValidationMiddleware(uuidParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const list = await listService.getListById(req.params.id, req.user.userId);
    const response = {
      success: true,
      data: { list },
      message: "List retrieved successfully"
    };
    res.status(200).json(response);
  })
);
router$2.put(
  "/:id",
  createValidationMiddleware(uuidParamSchema, "params"),
  createValidationMiddleware(updateListSchema, "body"),
  asyncHandler(async (req, res) => {
    const list = await listService.updateList(req.params.id, req.user.userId, req.body);
    const response = {
      success: true,
      data: { list },
      message: "List updated successfully"
    };
    res.status(200).json(response);
  })
);
router$2.delete(
  "/:id",
  createValidationMiddleware(uuidParamSchema, "params"),
  asyncHandler(async (req, res) => {
    await listService.deleteList(req.params.id, req.user.userId);
    const response = {
      success: true,
      message: "List deleted successfully"
    };
    res.status(200).json(response);
  })
);
const tasks = [];
const router$1 = express.Router();
router$1.get("/:id", (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  return res.json(task);
});
router$1.post("/", (req, res) => {
  const newTask = {
    id: Math.random().toString(36).substring(2, 12),
    listId: req.body.listId || "",
    title: req.body.title || "",
    description: req.body.description || "",
    dueDate: req.body.dueDate || null,
    completed: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});
router$1.post("/:listId/tasks", (req, res) => {
  const newTask = {
    id: Math.random().toString(36).substring(2, 12),
    listId: req.params.listId,
    title: req.body.title || "",
    description: req.body.description || "",
    dueDate: req.body.dueDate || null,
    completed: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});
router$1.put("/:id", (req, res) => {
  const idx = tasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: "Task not found" });
  }
  const updatedTask = {
    ...tasks[idx],
    listId: req.body.listId || tasks[idx].listId,
    title: req.body.title || tasks[idx].title,
    description: req.body.description || tasks[idx].description,
    dueDate: req.body.dueDate || tasks[idx].dueDate,
    completed: req.body.completed ?? tasks[idx].completed,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  tasks[idx] = updatedTask;
  return res.json(updatedTask);
});
router$1.delete("/:id", (req, res) => {
  const idx = tasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: "Task not found" });
  }
  tasks.splice(idx, 1);
  return res.status(204).send();
});
router$1.patch("/:id/complete", (req, res) => {
  const idx = tasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: "Task not found" });
  }
  tasks[idx].completed = !tasks[idx].completed;
  tasks[idx].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  return res.json(tasks[idx]);
});
router$1.get("/:listId/tasks", (req, res) => {
  const listTasks = tasks.filter((t) => t.listId === req.params.listId);
  return res.status(200).json(listTasks);
});
router$1.get("/due-this-week", (req, res) => {
  const now = /* @__PURE__ */ new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const result = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due >= startOfWeek && due <= endOfWeek;
  });
  return res.status(200).json(result);
});
router$1.get("/", (req, res) => {
  let result = [...tasks];
  if (req.query.sort === "deadline") {
    result.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }
  return res.status(200).json(result);
});
const router = express.Router();
const userService = new UserService();
router.post(
  "/register",
  authRateLimit,
  createValidationMiddleware(registerUserSchema, "body"),
  asyncHandler(async (req, res) => {
    const result = await userService.register(req.body);
    const response = {
      success: true,
      data: result,
      message: "User registered successfully"
    };
    res.status(201).json(response);
  })
);
router.post(
  "/login",
  authRateLimit,
  createValidationMiddleware(loginUserSchema, "body"),
  asyncHandler(async (req, res) => {
    const result = await userService.login(req.body);
    const response = {
      success: true,
      data: result,
      message: "Login successful"
    };
    res.status(200).json(response);
  })
);
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
const openApiSpec = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "docs/openapi.json"), "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use("/api/lists", router$2);
app.use("/api/tasks", router$1);
app.use("/api/auth", router);
app.get("/", (req, res) => {
  res.json({ message: "Task Management API is running." });
});
const PORT = process.env.PORT || 3e3;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
exports.app = app;
