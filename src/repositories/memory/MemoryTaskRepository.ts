import { ITaskRepository, Task } from "../interfaces/ITaskRepository";

export class MemoryTaskRepository implements ITaskRepository {
  private tasks: Task[] = [];

  async findById(id: string): Promise<Task | null> {
    return this.tasks.find(t => t.id === id) || null;
  }

  async findByListId(listId: string): Promise<Task[]> {
    return this.tasks.filter(t => t.listId === listId);
  }

  async create(task: Task): Promise<Task> {
    this.tasks.push(task);
    return task;
  }

  async update(id: string, task: Partial<Task>): Promise<Task | null> {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.tasks[idx] = { ...this.tasks[idx], ...task };
    return this.tasks[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.tasks.splice(idx, 1);
    return true;
  }
}
