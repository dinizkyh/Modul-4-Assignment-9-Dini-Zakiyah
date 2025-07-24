export interface IListRepository {
  findById(id: string): Promise<List | null>;
  findByUserId(userId: string): Promise<List[]>;
  create(list: List): Promise<List>;
  update(id: string, list: Partial<List>): Promise<List | null>;
  delete(id: string): Promise<boolean>;
}

export interface List {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
