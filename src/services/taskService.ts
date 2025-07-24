import { RepositoryFactory } from '@/repositories';
import { DateUtils } from '@/utils';
import { 
  Task, 
  CreateTaskDto, 
  UpdateTaskDto, 
  TaskWithListName,
  NotFoundError, 
  ValidationError,
  AuthorizationError
} from '@/types';

/**
 * Task service handling task management business logic
 */
export class TaskService {
  private taskRepository = RepositoryFactory.getTaskRepository();
  private listRepository = RepositoryFactory.getListRepository();

  /**
   * Create a new task in a list
   * @param userId User ID
   * @param listId List ID where task will be created
   * @param taskData Task creation data
   * @returns Promise<Task> Created task
   */
  async createTask(
    userId: string, 
    listId: string, 
    taskData: CreateTaskDto
  ): Promise<Task> {
    // Verify that the list exists and belongs to the user
    const list = await this.listRepository.findByIdAndUserId(listId, userId);
    if (!list) {
      throw new NotFoundError('List');
    }

    // Validate task title is not empty after trimming
    const trimmedTitle = taskData.title.trim();
    if (!trimmedTitle) {
      throw new ValidationError('Task title cannot be empty');
    }

    // Parse and validate deadline if provided
    let deadline: Date | undefined;
    if (taskData.deadline) {
      deadline = DateUtils.parseDate(taskData.deadline) ?? undefined;
      if (!deadline) {
        throw new ValidationError('Invalid deadline format. Please use ISO date format.');
      }
    }

    // Create the task
    const task = await this.taskRepository.create({
      title: trimmedTitle,
      description: taskData.description?.trim() || undefined,
      deadline,
      isCompleted: false,
      listId,
      userId,
    });

    return task;
  }

  /**
   * Get all tasks for a user
   * @param userId User ID
   * @returns Promise<Task[]> Array of user's tasks
   */
  async getUserTasks(userId: string): Promise<Task[]> {
    return await this.taskRepository.findByUserId(userId);
  }

  /**
   * Get tasks in a specific list
   * @param listId List ID
   * @param userId User ID for authorization
   * @returns Promise<Task[]> Array of tasks in the list
   */
  async getTasksByListId(listId: string, userId: string): Promise<Task[]> {
    // Verify that the list exists and belongs to the user
    const list = await this.listRepository.findByIdAndUserId(listId, userId);
    if (!list) {
      throw new NotFoundError('List');
    }

    return await this.taskRepository.findByListId(listId, userId);
  }

  /**
   * Get a specific task by ID
   * @param taskId Task ID
   * @param userId User ID for authorization
   * @returns Promise<Task> Task
   */
  async getTaskById(taskId: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findByIdAndUserId(taskId, userId);
    
    if (!task) {
      throw new NotFoundError('Task');
    }

    return task;
  }

  /**
   * Update a task
   * @param taskId Task ID
   * @param userId User ID for authorization
   * @param updates Task update data
   * @returns Promise<Task> Updated task
   */
  async updateTask(
    taskId: string, 
    userId: string, 
    updates: UpdateTaskDto
  ): Promise<Task> {
    // Check if task exists and belongs to user
    const existingTask = await this.taskRepository.findByIdAndUserId(taskId, userId);
    if (!existingTask) {
      throw new NotFoundError('Task');
    }

    // Prepare updates
    const updateData: Partial<Task> = {};

    if (updates.title !== undefined) {
      const trimmedTitle = updates.title.trim();
      if (!trimmedTitle) {
        throw new ValidationError('Task title cannot be empty');
      }
      updateData.title = trimmedTitle;
    }

    if (updates.description !== undefined) {
      updateData.description = updates.description.trim() || undefined;
    }

    if (updates.deadline !== undefined) {
      if (updates.deadline === null) {
        updateData.deadline = undefined;
      } else {
        const deadline = DateUtils.parseDate(updates.deadline);
        if (!deadline) {
          throw new ValidationError('Invalid deadline format. Please use ISO date format.');
        }
        updateData.deadline = deadline;
      }
    }

    if (updates.isCompleted !== undefined) {
      updateData.isCompleted = updates.isCompleted;
    }

    // Update the task
    const updatedTask = await this.taskRepository.update(taskId, updateData);
    
    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    return updatedTask;
  }

  /**
   * Toggle task completion status
   * @param taskId Task ID
   * @param userId User ID for authorization
   * @returns Promise<Task> Updated task
   */
  async toggleTaskCompletion(taskId: string, userId: string): Promise<Task> {
    const existingTask = await this.taskRepository.findByIdAndUserId(taskId, userId);
    if (!existingTask) {
      throw new NotFoundError('Task');
    }

    const updatedTask = await this.taskRepository.update(taskId, {
      isCompleted: !existingTask.isCompleted,
    });

    if (!updatedTask) {
      throw new Error('Failed to toggle task completion');
    }

    return updatedTask;
  }

  /**
   * Delete a task
   * @param taskId Task ID
   * @param userId User ID for authorization
   * @returns Promise<boolean> True if deleted successfully
   */
  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    // Check if task exists and belongs to user
    const existingTask = await this.taskRepository.findByIdAndUserId(taskId, userId);
    if (!existingTask) {
      throw new NotFoundError('Task');
    }

    const deleted = await this.taskRepository.delete(taskId);
    
    if (!deleted) {
      throw new Error('Failed to delete task');
    }

    return true;
  }

  /**
   * Get tasks due this week
   * @param userId User ID
   * @returns Promise<TaskWithListName[]> Array of tasks due this week with list names
   */
  async getTasksDueThisWeek(userId: string): Promise<TaskWithListName[]> {
    const { start, end } = DateUtils.getNext7DaysRange();
    const tasks = await this.taskRepository.findDueInRange(userId, start, end);
    
    // Get list names for each task
    const tasksWithListNames: TaskWithListName[] = [];
    
    for (const task of tasks) {
      const list = await this.listRepository.findByIdAndUserId(task.listId, userId);
      tasksWithListNames.push({
        ...task,
        listName: list?.name || 'Unknown List',
      });
    }

    return tasksWithListNames;
  }

  /**
   * Get tasks sorted by deadline
   * @param userId User ID
   * @param ascending Sort order (true for earliest first, false for latest first)
   * @returns Promise<Task[]> Array of tasks sorted by deadline
   */
  async getTasksSortedByDeadline(userId: string, ascending: boolean = true): Promise<Task[]> {
    return await this.taskRepository.findSortedByDeadline(userId, ascending);
  }

  /**
   * Get task statistics for a user
   * @param userId User ID
   * @returns Promise<object> Task statistics
   */
  async getTaskStatistics(userId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    tasksDueThisWeek: number;
  }> {
    const allTasks = await this.taskRepository.findByUserId(userId);
    const now = new Date();
    const { start: weekStart, end: weekEnd } = DateUtils.getNext7DaysRange();

    const completedTasks = allTasks.filter(task => task.isCompleted).length;
    const pendingTasks = allTasks.filter(task => !task.isCompleted).length;
    
    const overdueTasks = allTasks.filter(task => 
      !task.isCompleted && 
      task.deadline && 
      new Date(task.deadline) < now
    ).length;

    const tasksDueThisWeek = allTasks.filter(task =>
      task.deadline &&
      new Date(task.deadline) >= weekStart &&
      new Date(task.deadline) <= weekEnd
    ).length;

    return {
      totalTasks: allTasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      tasksDueThisWeek,
    };
  }

  /**
   * Get tasks filtered by completion status
   * @param userId User ID
   * @param completed Filter by completion status
   * @returns Promise<Task[]> Filtered tasks
   */
  async getTasksByCompletionStatus(userId: string, completed: boolean): Promise<Task[]> {
    const allTasks = await this.taskRepository.findByUserId(userId);
    return allTasks.filter(task => task.isCompleted === completed);
  }

  /**
   * Get overdue tasks
   * @param userId User ID
   * @returns Promise<TaskWithListName[]> Array of overdue tasks with list names
   */
  async getOverdueTasks(userId: string): Promise<TaskWithListName[]> {
    const allTasks = await this.taskRepository.findByUserId(userId);
    const now = new Date();
    
    const overdueTasks = allTasks.filter(task =>
      !task.isCompleted &&
      task.deadline &&
      new Date(task.deadline) < now
    );

    // Get list names for each task
    const tasksWithListNames: TaskWithListName[] = [];
    
    for (const task of overdueTasks) {
      const list = await this.listRepository.findByIdAndUserId(task.listId, userId);
      tasksWithListNames.push({
        ...task,
        listName: list?.name || 'Unknown List',
      });
    }

    return tasksWithListNames;
  }
}
