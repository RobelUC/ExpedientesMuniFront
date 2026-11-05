import type { User } from '@domain/entities/User';
import type { AuthRepositoryPort } from '@domain/ports/AuthRepositoryPort';

export class LoginUseCase {
  constructor(private readonly authRepo: AuthRepositoryPort) {}

  async execute(username: string, password: string): Promise<User> {
    if (!username.trim() || !password.trim()) {
      throw new Error('Debes ingresar un nombre y el token del evaluador.');
    }
    return this.authRepo.login(username, password);
  }
}
