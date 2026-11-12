import type { AcademicAction, AcademicRole, User } from '@domain/entities/User';
import type { AuthRepositoryPort } from '@domain/ports/AuthRepositoryPort';
import { apiClient, ApiError, type ApiClient } from './ApiClient';

interface AcademicSession {
  id: string;
  rol: AcademicRole | null;
  area: string | null;
  acciones: AcademicAction[];
  areas_asignables: string[];
}

const roleNames: Record<AcademicRole, string> = {
  administrador: 'Administrador de demostración',
  evaluador: 'Evaluador de expedientes',
  responsable: 'Responsable de área',
};

export class ApiAuthAdapter implements AuthRepositoryPort {
  constructor(private readonly client: ApiClient = apiClient) {}
  async login(username: string, token: string): Promise<User> {
    this.client.setToken('');
    let capabilities: { demo?: boolean; seguridad?: { expedientes_protegidos: boolean; roles_academicos?: boolean } };
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
      if (capabilities.demo && capabilities.seguridad.roles_academicos) {
        const session = await this.client.request<AcademicSession>('/academico/sesion');
        if (session.rol) {
          return { name: session.id, demo: true, role: roleNames[session.rol],
            academic: { id: session.id, role: session.rol, department: session.area,
              actions: session.acciones, assignableAreas: session.areas_asignables } };
        }
      } else {
        await this.client.request('/tupa/procedimientos');
      }
      return { name: username.trim(), demo: capabilities.demo === true,
        role: capabilities.demo ? 'Evaluador · demostración universitaria' : 'Evaluador · acceso de prototipo' };
    } catch (error) { this.client.setToken(''); throw error; }
  }
  async logout(): Promise<void> { this.client.setToken(''); }
}
