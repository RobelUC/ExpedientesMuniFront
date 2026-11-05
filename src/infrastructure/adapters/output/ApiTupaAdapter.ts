import type { Catalog, RequirementCheck, Workflow } from '@domain/entities/Tupa';
import type { TupaRepositoryPort } from '@domain/ports/TupaRepositoryPort';
import { apiClient, type ApiClient } from './ApiClient';

export class ApiTupaAdapter implements TupaRepositoryPort {
  constructor(private readonly client: ApiClient = apiClient) {}
  getCatalog() { return this.client.request<Catalog>('/tupa/procedimientos'); }
  getWorkflow(id: string) { return this.client.request<Workflow>(`/expedientes/${encodeURIComponent(id)}/flujo`); }
  validate(id: string, code: string, revision: number, checks: Record<string, RequirementCheck>) {
    return this.client.request<Workflow>(`/expedientes/${encodeURIComponent(id)}/validacion`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_tupa: code, revision, verificaciones: checks }),
    });
  }
}
