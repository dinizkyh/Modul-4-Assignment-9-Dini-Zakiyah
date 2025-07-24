import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { User, List, Task } from '@/types';
import { IUserRepository, IListRepository, ITaskRepository } from './interfaces';
import { getDatabaseConfig } from '@/config';

/**
 * Database connection pool for MySQL
 */
let pool: mysql.Pool | null = null;

export function createDatabasePool(): mysql.Pool {
  if (!pool) {
    const config = getDatabaseConfig();
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

/**
 * SQL implementation of User repository using MySQL
 */
export class SQLUserRepository implements IUserRepository {
  private pool: mysql.Pool;

  constructor() {
    this.pool = createDatabasePool();
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = uuidv4();
    const now = new Date();
    
    const [result] = await this.pool.execute(
      'INSERT INTO users (id, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [id, userData.email, userData.password, now, now]
    );

    return {
      id,
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findById(id: string): Promise<User | null> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), new Date(), id];
    
    const [result] = await this.pool.execute(
      `UPDATE users SET ${setClause}, updated_at = ? WHERE id = ?`,
      values
    ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];

    if (result.affectedRows === 0) return null;

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await this.pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];

    return result.affectedRows > 0;
  }
}

/**
 * SQL implementation of List repository using MySQL
 */
export class SQLListRepository implements IListRepository {
  private pool: mysql.Pool;

  constructor() {
    this.pool = createDatabasePool();
  }

  async create(listData: Omit<List, 'id' | 'createdAt' | 'updatedAt'>): Promise<List> {
    const id = uuidv4();
    const now = new Date();
    
    await this.pool.execute(
      'INSERT INTO lists (id, name, description, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, listData.name, listData.description || null, listData.userId, now, now]
    );

    return {
      id,
      ...listData,
      createdAt: now,
      updatedAt: now,
    };
  }

  async findByUserId(userId: string): Promise<List[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM lists WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async findByIdAndUserId(id: string, userId: string): Promise<List | null> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [id, userId]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async update(id: string, updates: Partial<Omit<List, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>): Promise<List | null> {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), new Date(), id];
    
    const [result] = await this.pool.execute(
      `UPDATE lists SET ${setClause}, updated_at = ? WHERE id = ?`,
      values
    ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];

    if (result.affectedRows === 0) return null;

    const [rows] = await this.pool.execute(
      'SELECT * FROM lists WHERE id = ?',
      [id]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await this.pool.execute(
      'DELETE FROM lists WHERE id = ?',
      [id]
    ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];

    return result.affectedRows > 0;
  }

  async isNameUniqueForUser(name: string, userId: string, excludeId?: string): Promise<boolean> {
    let query = 'SELECT COUNT(*) as count FROM lists WHERE name = ? AND user_id = ?';
    const params: any[] = [name, userId];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await this.pool.execute(query, params) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
    
    return rows[0].count === 0;
  }
}

/**
 * SQL implementation of Task repository using MySQL
 */
export class SQLTaskRepository implements ITaskRepository {
  private pool: mysql.Pool;

  constructor() {
    this.pool = createDatabasePool();
  }

  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const id = uuidv4();
    const now = new Date();
    
    await this.pool.execute(
      'INSERT INTO tasks (id, title, description, deadline, is_completed, list_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
      updatedAt: now,
    };
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    return this.mapRowsToTasks(rows);
  }

  async findByListId(listId: string, userId: string): Promise<Task[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM tasks WHERE list_id = ? AND user_id = ? ORDER BY created_at ASC',
      [listId, userId]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    return this.mapRowsToTasks(rows);
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Task | null> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    if (rows.length === 0) return null;

    return this.mapRowToTask(rows[0]);
  }

  async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>): Promise<Task | null> {
    const setClause = Object.keys(updates).map(key => {
      if (key === 'isCompleted') return 'is_completed = ?';
      if (key === 'listId') return 'list_id = ?';
      return `${key} = ?`;
    }).join(', ');
    
    const values = [...Object.values(updates), new Date(), id];
    
    const [result] = await this.pool.execute(
      `UPDATE tasks SET ${setClause}, updated_at = ? WHERE id = ?`,
      values
    ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];

    if (result.affectedRows === 0) return null;

    const [rows] = await this.pool.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    return this.mapRowToTask(rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await this.pool.execute(
      'DELETE FROM tasks WHERE id = ?',
      [id]
    ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];

    return result.affectedRows > 0;
  }

  async deleteByListId(listId: string): Promise<number> {
    const [result] = await this.pool.execute(
      'DELETE FROM tasks WHERE list_id = ?',
      [listId]
    ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];

    return result.affectedRows;
  }

  async findDueInRange(userId: string, startDate: Date, endDate: Date): Promise<Task[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM tasks WHERE user_id = ? AND deadline >= ? AND deadline <= ? ORDER BY deadline ASC',
      [userId, startDate, endDate]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    return this.mapRowsToTasks(rows);
  }

  async findSortedByDeadline(userId: string, ascending: boolean = true): Promise<Task[]> {
    const order = ascending ? 'ASC' : 'DESC';
    const [rows] = await this.pool.execute(
      `SELECT * FROM tasks WHERE user_id = ? AND deadline IS NOT NULL ORDER BY deadline ${order}`,
      [userId]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    return this.mapRowsToTasks(rows);
  }

  private mapRowToTask(row: mysql.RowDataPacket): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      deadline: row.deadline ? new Date(row.deadline) : undefined,
      isCompleted: Boolean(row.is_completed),
      listId: row.list_id,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowsToTasks(rows: mysql.RowDataPacket[]): Task[] {
    return rows.map(row => this.mapRowToTask(row));
  }
}
