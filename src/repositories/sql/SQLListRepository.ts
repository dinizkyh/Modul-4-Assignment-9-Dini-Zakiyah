// SQLListRepository implementation
import { IListRepository, List } from '../interfaces/IListRepository';

export class SQLListRepository implements IListRepository {
  async findById(id: string) {
    return null;
  }
  async findByUserId(userId: string): Promise<List[]> {
    return [];
  }
  async create(list: List): Promise<List> {
    throw new Error('Not implemented');
  }
  async update(id: string, list: Partial<List>): Promise<List | null> {
    throw new Error('Not implemented');
  }
  async delete(id: string): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
