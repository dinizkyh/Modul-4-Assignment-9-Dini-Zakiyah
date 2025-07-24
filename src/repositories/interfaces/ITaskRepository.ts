export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findByListId(listId: string): Promise<Task[]>;
  create(task: Task): Promise<Task>;
  update(id: string, task: Partial<Task>): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: Date;
  isCompleted: boolean;
  listId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
