import { User, List, Task } from '@/types';

/**
 * Interface for User repository operations
 */
export interface IUserRepository {
  /**
   * Create a new user
   * @param user User data without id, createdAt, updatedAt
   * @returns Promise<User> Created user with generated id and timestamps
   */
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;

  /**
   * Find user by email
   * @param email User email
   * @returns Promise<User | null> User if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by ID
   * @param id User ID
   * @returns Promise<User | null> User if found, null otherwise
   */
  findById(id: string): Promise<User | null>;

  /**
   * Update user by ID
   * @param id User ID
   * @param updates Partial user data to update
   * @returns Promise<User | null> Updated user if found, null otherwise
   */
  update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null>;

  /**
   * Delete user by ID
   * @param id User ID
   * @returns Promise<boolean> True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
}

/**
 * Interface for List repository operations
 */
export interface IListRepository {
  /**
   * Create a new list
   * @param list List data without id, createdAt, updatedAt
   * @returns Promise<List> Created list with generated id and timestamps
   */
  create(list: Omit<List, 'id' | 'createdAt' | 'updatedAt'>): Promise<List>;

  /**
   * Find all lists for a user
   * @param userId User ID
   * @returns Promise<List[]> Array of lists belonging to the user
   */
  findByUserId(userId: string): Promise<List[]>;

  /**
   * Find list by ID and user ID (for authorization)
   * @param id List ID
   * @param userId User ID
   * @returns Promise<List | null> List if found and belongs to user, null otherwise
   */
  findByIdAndUserId(id: string, userId: string): Promise<List | null>;

  /**
   * Update list by ID
   * @param id List ID
   * @param updates Partial list data to update
   * @returns Promise<List | null> Updated list if found, null otherwise
   */
  update(id: string, updates: Partial<Omit<List, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>): Promise<List | null>;

  /**
   * Delete list by ID
   * @param id List ID
   * @returns Promise<boolean> True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if list name is unique for user
   * @param name List name
   * @param userId User ID
   * @param excludeId Optional list ID to exclude from check (for updates)
   * @returns Promise<boolean> True if name is unique, false otherwise
   */
  isNameUniqueForUser(name: string, userId: string, excludeId?: string): Promise<boolean>;
}

/**
 * Interface for Task repository operations
 */
export interface ITaskRepository {
  /**
   * Create a new task
   * @param task Task data without id, createdAt, updatedAt
   * @returns Promise<Task> Created task with generated id and timestamps
   */
  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;

  /**
   * Find all tasks for a user
   * @param userId User ID
   * @returns Promise<Task[]> Array of tasks belonging to the user
   */
  findByUserId(userId: string): Promise<Task[]>;

  /**
   * Find all tasks in a list
   * @param listId List ID
   * @param userId User ID (for authorization)
   * @returns Promise<Task[]> Array of tasks in the list
   */
  findByListId(listId: string, userId: string): Promise<Task[]>;

  /**
   * Find task by ID and user ID (for authorization)
   * @param id Task ID
   * @param userId User ID
   * @returns Promise<Task | null> Task if found and belongs to user, null otherwise
   */
  findByIdAndUserId(id: string, userId: string): Promise<Task | null>;

  /**
   * Update task by ID
   * @param id Task ID
   * @param updates Partial task data to update
   * @returns Promise<Task | null> Updated task if found, null otherwise
   */
  update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>): Promise<Task | null>;

  /**
   * Delete task by ID
   * @param id Task ID
   * @returns Promise<boolean> True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Delete all tasks in a list
   * @param listId List ID
   * @returns Promise<number> Number of tasks deleted
   */
  deleteByListId(listId: string): Promise<number>;

  /**
   * Find tasks due within a date range
   * @param userId User ID
   * @param startDate Start of date range
   * @param endDate End of date range
   * @returns Promise<Task[]> Array of tasks due within the range
   */
  findDueInRange(userId: string, startDate: Date, endDate: Date): Promise<Task[]>;

  /**
   * Find tasks sorted by deadline
   * @param userId User ID
   * @param ascending Sort order (true for ascending, false for descending)
   * @returns Promise<Task[]> Array of tasks sorted by deadline
   */
  findSortedByDeadline(userId: string, ascending: boolean): Promise<Task[]>;
}
