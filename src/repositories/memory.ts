import { v4 as uuidv4 } from 'uuid';
import { User, List, Task } from '@/types';
import { IUserRepository, IListRepository, ITaskRepository } from './interfaces';

/**
 * In-memory implementation of User repository for development and testing
 */
export class MemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const user: User = {
      id: uuidv4(),
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);
    this.emailIndex.set(user.email.toLowerCase(), user.id);
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email.toLowerCase());
    if (!userId) return null;
    
    return this.users.get(userId) || null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    // If email is being updated, update the email index
    if (updates.email && updates.email !== user.email) {
      this.emailIndex.delete(user.email.toLowerCase());
      this.emailIndex.set(updates.email.toLowerCase(), user.id);
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    this.users.delete(id);
    this.emailIndex.delete(user.email.toLowerCase());
    return true;
  }

  // Utility method for testing
  clear(): void {
    this.users.clear();
    this.emailIndex.clear();
  }
}

/**
 * In-memory implementation of List repository for development and testing
 */
export class MemoryListRepository implements IListRepository {
  private lists: Map<string, List> = new Map();
  private userListIndex: Map<string, Set<string>> = new Map(); // userId -> Set of listIds

  async create(listData: Omit<List, 'id' | 'createdAt' | 'updatedAt'>): Promise<List> {
    const now = new Date();
    const list: List = {
      id: uuidv4(),
      ...listData,
      createdAt: now,
      updatedAt: now,
    };

    this.lists.set(list.id, list);
    
    // Update user index
    if (!this.userListIndex.has(list.userId)) {
      this.userListIndex.set(list.userId, new Set());
    }
    this.userListIndex.get(list.userId)!.add(list.id);

    return list;
  }

  async findByUserId(userId: string): Promise<List[]> {
    const listIds = this.userListIndex.get(userId);
    if (!listIds) return [];

    const lists: List[] = [];
    for (const listId of listIds) {
      const list = this.lists.get(listId);
      if (list) {
        lists.push(list);
      }
    }

    return lists.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findByIdAndUserId(id: string, userId: string): Promise<List | null> {
    const list = this.lists.get(id);
    if (!list || list.userId !== userId) return null;
    
    return list;
  }

  async update(id: string, updates: Partial<Omit<List, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>): Promise<List | null> {
    const list = this.lists.get(id);
    if (!list) return null;

    const updatedList: List = {
      ...list,
      ...updates,
      updatedAt: new Date(),
    };

    this.lists.set(id, updatedList);
    return updatedList;
  }

  async delete(id: string): Promise<boolean> {
    const list = this.lists.get(id);
    if (!list) return false;

    this.lists.delete(id);
    
    // Update user index
    const userLists = this.userListIndex.get(list.userId);
    if (userLists) {
      userLists.delete(id);
      if (userLists.size === 0) {
        this.userListIndex.delete(list.userId);
      }
    }

    return true;
  }

  async isNameUniqueForUser(name: string, userId: string, excludeId?: string): Promise<boolean> {
    const userLists = await this.findByUserId(userId);
    
    return !userLists.some(list => 
      list.name.toLowerCase() === name.toLowerCase() && 
      list.id !== excludeId
    );
  }

  // Utility method for testing
  clear(): void {
    this.lists.clear();
    this.userListIndex.clear();
  }
}

/**
 * In-memory implementation of Task repository for development and testing
 */
export class MemoryTaskRepository implements ITaskRepository {
  private tasks: Map<string, Task> = new Map();
  private userTaskIndex: Map<string, Set<string>> = new Map(); // userId -> Set of taskIds
  private listTaskIndex: Map<string, Set<string>> = new Map(); // listId -> Set of taskIds

  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const now = new Date();
    const task: Task = {
      id: uuidv4(),
      ...taskData,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(task.id, task);
    
    // Update user index
    if (!this.userTaskIndex.has(task.userId)) {
      this.userTaskIndex.set(task.userId, new Set());
    }
    this.userTaskIndex.get(task.userId)!.add(task.id);

    // Update list index
    if (!this.listTaskIndex.has(task.listId)) {
      this.listTaskIndex.set(task.listId, new Set());
    }
    this.listTaskIndex.get(task.listId)!.add(task.id);

    return task;
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const taskIds = this.userTaskIndex.get(userId);
    if (!taskIds) return [];

    const tasks: Task[] = [];
    for (const taskId of taskIds) {
      const task = this.tasks.get(taskId);
      if (task) {
        tasks.push(task);
      }
    }

    return tasks.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findByListId(listId: string, userId: string): Promise<Task[]> {
    const taskIds = this.listTaskIndex.get(listId);
    if (!taskIds) return [];

    const tasks: Task[] = [];
    for (const taskId of taskIds) {
      const task = this.tasks.get(taskId);
      if (task && task.userId === userId) {
        tasks.push(task);
      }
    }

    return tasks.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Task | null> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) return null;
    
    return task;
  }

  async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>): Promise<Task | null> {
    const task = this.tasks.get(id);
    if (!task) return null;

    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async delete(id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task) return false;

    this.tasks.delete(id);
    
    // Update user index
    const userTasks = this.userTaskIndex.get(task.userId);
    if (userTasks) {
      userTasks.delete(id);
      if (userTasks.size === 0) {
        this.userTaskIndex.delete(task.userId);
      }
    }

    // Update list index
    const listTasks = this.listTaskIndex.get(task.listId);
    if (listTasks) {
      listTasks.delete(id);
      if (listTasks.size === 0) {
        this.listTaskIndex.delete(task.listId);
      }
    }

    return true;
  }

  async deleteByListId(listId: string): Promise<number> {
    const taskIds = this.listTaskIndex.get(listId);
    if (!taskIds) return 0;

    let deletedCount = 0;
    for (const taskId of Array.from(taskIds)) {
      const deleted = await this.delete(taskId);
      if (deleted) deletedCount++;
    }

    return deletedCount;
  }

  async findDueInRange(userId: string, startDate: Date, endDate: Date): Promise<Task[]> {
    const userTasks = await this.findByUserId(userId);
    
    return userTasks.filter(task => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      return deadline >= startDate && deadline <= endDate;
    });
  }

  async findSortedByDeadline(userId: string, ascending: boolean = true): Promise<Task[]> {
    const userTasks = await this.findByUserId(userId);
    
    return userTasks
      .filter(task => task.deadline !== undefined)
      .sort((a, b) => {
        const dateA = new Date(a.deadline!).getTime();
        const dateB = new Date(b.deadline!).getTime();
        return ascending ? dateA - dateB : dateB - dateA;
      });
  }

  // Utility method for testing
  clear(): void {
    this.tasks.clear();
    this.userTaskIndex.clear();
    this.listTaskIndex.clear();
  }
}
