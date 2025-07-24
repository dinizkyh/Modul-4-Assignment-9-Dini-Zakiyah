import { config } from '@/config';
import { IUserRepository, IListRepository, ITaskRepository } from './interfaces';
import { MemoryUserRepository, MemoryListRepository, MemoryTaskRepository } from './memory';
import { SQLUserRepository, SQLListRepository, SQLTaskRepository } from './sql';

/**
 * Repository factory that creates the appropriate repository implementation
 * based on the configuration
 */
export class RepositoryFactory {
  private static userRepository: IUserRepository | null = null;
  private static listRepository: IListRepository | null = null;
  private static taskRepository: ITaskRepository | null = null;

  /**
   * Get User repository instance
   */
  static getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      if (config.repositoryType === 'sql') {
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
  static getListRepository(): IListRepository {
    if (!this.listRepository) {
      if (config.repositoryType === 'sql') {
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
  static getTaskRepository(): ITaskRepository {
    if (!this.taskRepository) {
      if (config.repositoryType === 'sql') {
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
  static reset(): void {
    this.userRepository = null;
    this.listRepository = null;
    this.taskRepository = null;
  }

  /**
   * Clear all data (only works with memory repositories, useful for testing)
   */
  static clearAllData(): void {
    if (config.repositoryType === 'memory') {
      const userRepo = this.getUserRepository() as MemoryUserRepository;
      const listRepo = this.getListRepository() as MemoryListRepository;
      const taskRepo = this.getTaskRepository() as MemoryTaskRepository;

      userRepo.clear();
      listRepo.clear();
      taskRepo.clear();
    }
  }
}
