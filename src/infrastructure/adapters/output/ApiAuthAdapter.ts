import type { User } from '@domain/entities/User';
import type { AuthRepositoryPort } from '@domain/ports/AuthRepositoryPort';
import { apiClient, ApiError, type ApiClient } from './ApiClient';

/** La identidad auditada la fija REVIEWER_ID en el servidor; el alias es solo visual. */
export class ApiAuthAdapter implements AuthRepositoryPort {
  constructor(private readonly client: ApiClient = apiClient) {}
  async login(username: string, token: string): Promise<User> {
    this.client.setToken('');
    let capabilities: { seguridad?: { expedientes_protegidos: boolean } };
    try { capabilities = await this.client.request('/capacidades'); }
    catch (error) {
      if (error instanceof ApiError && error.status === 404) throw new Error('El servidor no ofrece el contrato compatible. Solicite al administrador revisar la aplicación desplegada.');
      throw error;
    }
    if (capabilities.seguridad?.expedientes_protegidos !== true) {
      throw new Error('El servidor debe activar PROTECT_DOSSIER_ROUTES y configurar el evaluador antes de permitir el acceso.');
    }
    this.client.setToken(token.trim());
    try {
      await this.client.request('/tupa/procedimientos');
      return { name: username.trim(), role: 'Evaluador · acceso de prototipo' };
    } catch (error) { this.client.setToken(''); throw error; }
  }
  async logout(): Promise<void> { this.client.setToken(''); }
}
