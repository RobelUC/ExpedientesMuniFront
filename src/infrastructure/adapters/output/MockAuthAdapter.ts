import type { User } from '@domain/entities/User';
import type { AuthRepositoryPort } from '@domain/ports/AuthRepositoryPort';
import { mockUser } from '@application/services/MockExpedienteData';

export class MockAuthAdapter implements AuthRepositoryPort {
  async login(username: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin') {
          resolve(mockUser);
        } else {
          reject(new Error('Credenciales incorrectas. (Pista: usa admin/admin)'));
        }
      }, 1000); // Simulamos 1 segundo de latencia de red
    });
  }

  async logout(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
}
