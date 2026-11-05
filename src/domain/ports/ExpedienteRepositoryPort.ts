import type { Expediente } from '../entities/Expediente';

export interface ExpedienteRepositoryPort {
  getExpedienteById(id: string): Promise<Expediente | null>;
  saveExpediente(expediente: Expediente): Promise<void>;
  uploadExpediente(file: File): Promise<Expediente>;
  getPagePreview(tramiteId: string, pageNumber: number): Promise<unknown>;
  confirmData(tramiteId: string, data: Expediente): Promise<void>;
  getDocumentPdf(tramiteId: string, index: number): Promise<Blob>;
}
