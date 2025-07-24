import { RepositoryFactory } from '@/repositories';
import { 
  List, 
  Task,
  CreateListDto, 
  UpdateListDto, 
  ListWithTasks,
  NotFoundError, 
  ConflictError,
  ValidationError,
  AuthorizationError
} from '@/types';

/**
 * List service handling list management business logic
 */
export class ListService {
  private listRepository = RepositoryFactory.getListRepository();
  private taskRepository = RepositoryFactory.getTaskRepository();

  /**
   * Create a new list for a user
   * @param userId User ID
   * @param listData List creation data
   * @returns Promise<List> Created list
   */
  async createList(userId: string, listData: CreateListDto): Promise<List> {
    // Validate list name is not empty after trimming
    const trimmedName = listData.name.trim();
    if (!trimmedName) {
      throw new ValidationError('List name cannot be empty');
    }

    // Check if list name is unique for the user
    const isNameUnique = await this.listRepository.isNameUniqueForUser(
      trimmedName,
      userId
    );

    if (!isNameUnique) {
      throw new ConflictError('A list with this name already exists');
    }

    // Create the list
    const list = await this.listRepository.create({
      name: trimmedName,
      description: listData.description?.trim() || undefined,
      userId,
    });

    return list;
  }

  /**
   * Get all lists for a user with their tasks
   * @param userId User ID
   * @returns Promise<ListWithTasks[]> Array of lists with tasks
   */
  async getUserLists(userId: string): Promise<ListWithTasks[]> {
    const lists = await this.listRepository.findByUserId(userId);
    
    // Get tasks for each list
    const listsWithTasks: ListWithTasks[] = [];
    
    for (const list of lists) {
      const tasks = await this.taskRepository.findByListId(list.id, userId);
      listsWithTasks.push({
        ...list,
        tasks,
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
  async getListById(listId: string, userId: string): Promise<ListWithTasks> {
    const list = await this.listRepository.findByIdAndUserId(listId, userId);
    
    if (!list) {
      throw new NotFoundError('List');
    }

    const tasks = await this.taskRepository.findByListId(listId, userId);

    return {
      ...list,
      tasks,
    };
  }

  /**
   * Update a list
   * @param listId List ID
   * @param userId User ID for authorization
   * @param updates List update data
   * @returns Promise<List> Updated list
   */
  async updateList(
    listId: string, 
    userId: string, 
    updates: UpdateListDto
  ): Promise<List> {
    // Check if list exists and belongs to user
    const existingList = await this.listRepository.findByIdAndUserId(listId, userId);
    if (!existingList) {
      throw new NotFoundError('List');
    }

    // Prepare updates
    const updateData: Partial<List> = {};

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      if (!trimmedName) {
        throw new ValidationError('List name cannot be empty');
      }

      // Check if new name is unique for the user (excluding current list)
      if (trimmedName !== existingList.name) {
        const isNameUnique = await this.listRepository.isNameUniqueForUser(
          trimmedName,
          userId,
          listId
        );

        if (!isNameUnique) {
          throw new ConflictError('A list with this name already exists');
        }
      }

      updateData.name = trimmedName;
    }

    if (updates.description !== undefined) {
      updateData.description = updates.description.trim() || undefined;
    }

    // Update the list
    const updatedList = await this.listRepository.update(listId, updateData);
    
    if (!updatedList) {
      throw new Error('Failed to update list');
    }

    return updatedList;
  }

  /**
   * Delete a list and all its tasks
   * @param listId List ID
   * @param userId User ID for authorization
   * @returns Promise<boolean> True if deleted successfully
   */
  async deleteList(listId: string, userId: string): Promise<boolean> {
    // Check if list exists and belongs to user
    const existingList = await this.listRepository.findByIdAndUserId(listId, userId);
    if (!existingList) {
      throw new NotFoundError('List');
    }

    // Delete all tasks in the list first
    await this.taskRepository.deleteByListId(listId);

    // Delete the list
    const deleted = await this.listRepository.delete(listId);
    
    if (!deleted) {
      throw new Error('Failed to delete list');
    }

    return true;
  }

  /**
   * Get lists count for a user
   * @param userId User ID
   * @returns Promise<number> Number of lists
   */
  async getUserListsCount(userId: string): Promise<number> {
    const lists = await this.listRepository.findByUserId(userId);
    return lists.length;
  }

  /**
   * Get list with task count for dashboard/summary purposes
   * @param userId User ID
   * @returns Promise<Array<List & { taskCount: number, completedTaskCount: number }>>
   */
  async getListsSummary(userId: string): Promise<Array<List & { 
    taskCount: number; 
    completedTaskCount: number;
    pendingTaskCount: number;
  }>> {
    const lists = await this.listRepository.findByUserId(userId);
    const summary = [];

    for (const list of lists) {
      const tasks = await this.taskRepository.findByListId(list.id, userId);
      const completedTasks = tasks.filter(task => task.isCompleted);
      
      summary.push({
        ...list,
        taskCount: tasks.length,
        completedTaskCount: completedTasks.length,
        pendingTaskCount: tasks.length - completedTasks.length,
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
  async hasUserAccess(listId: string, userId: string): Promise<boolean> {
    const list = await this.listRepository.findByIdAndUserId(listId, userId);
    return list !== null;
  }
}
