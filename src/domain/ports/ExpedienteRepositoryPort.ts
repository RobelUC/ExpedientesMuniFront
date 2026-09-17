import type { Expediente } from '../entities/Expediente';

export interface ExpedienteRepositoryPort {
  getExpedienteById(id: string): Promise<Expediente | null>;
  saveExpediente(expediente: Expediente): Promise<void>;
  uploadExpediente(file: File): Promise<Expediente>;
  getPagePreview(tramiteId: string, pageNumber: number): Promise<any>;
  confirmData(tramiteId: string, data: any): Promise<void>;
}
