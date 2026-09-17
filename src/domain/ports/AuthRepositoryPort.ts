import type { User } from '../entities/User';

export interface AuthRepositoryPort {
  login(username: string, password: string): Promise<User>;
  logout(): Promise<void>;
}
