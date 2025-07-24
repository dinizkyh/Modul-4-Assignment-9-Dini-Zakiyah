// SQLUserRepository implementation
import { IUserRepository, User } from '../interfaces/IUserRepository';

export class SQLUserRepository implements IUserRepository {
  async findById(id: string) {
    return null;
  }
  async findByEmail(email: string) {
    return null;
  }
  async create(user: User): Promise<User> {
    throw new Error('Not implemented');
  }
  async update(id: string, user: Partial<User>): Promise<User | null> {
    throw new Error('Not implemented');
  }
  async delete(id: string): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
