// SQLTaskRepository implementation
import { ITaskRepository, Task } from '../interfaces/ITaskRepository';

export class SQLTaskRepository implements ITaskRepository {
  async findById(id: string) {
    return null;
  }
  async findByListId(listId: string): Promise<Task[]> {
    return [];
  }
  async create(task: Task): Promise<Task> {
    throw new Error('Not implemented');
  }
  async update(id: string, task: Partial<Task>): Promise<Task | null> {
    throw new Error('Not implemented');
  }
  async delete(id: string): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
