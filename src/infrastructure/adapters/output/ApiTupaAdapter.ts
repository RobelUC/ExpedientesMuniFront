import type { Catalog, RequirementCheck, Workflow, WorkflowCapabilities } from '@domain/entities/Tupa';
import type { TupaRepositoryPort } from '@domain/ports/TupaRepositoryPort';
import { apiClient, type ApiClient } from './ApiClient';

export class ApiTupaAdapter implements TupaRepositoryPort {
  constructor(private readonly client: ApiClient = apiClient) {}
  getCatalog() { return this.client.request<Catalog>('/tupa/procedimientos'); }
  getCapabilities() { return this.client.request<WorkflowCapabilities>('/capacidades'); }
  getWorkflow(id: string) { return this.client.request<Workflow>(`/expedientes/${encodeURIComponent(id)}/flujo`); }
  validate(id: string, code: string, revision: number, checks: Record<string, RequirementCheck>) {
    return this.client.request<Workflow>(`/expedientes/${encodeURIComponent(id)}/validacion`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_tupa: code, revision, verificaciones: checks }),
    });
  }
  private post(id: string, action: string, payload: object) {
    return this.client.request<Workflow>(`/expedientes/${encodeURIComponent(id)}/${action}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
  }
  saveDraft(id: string, content: string, revision: number) { return this.post(id, 'borradores', { contenido: content, revision }); }
  route(id: string, revision: number) { return this.post(id, 'enrutamiento', { revision }); }
  generateDraft(id: string, revision: number) { return this.post(id, 'borradores/ia', { revision }); }
  auditWithAI(id: string, revision: number) { return this.post(id, 'auditoria/ia', { revision }); }
  assign(id: string, department: string, revision: number) { return this.post(id, 'asignacion', { destino: department, revision }); }
  approveAndSign(id: string, revision: number) { return this.post(id, 'aprobar-firmar', { revision }); }
}
