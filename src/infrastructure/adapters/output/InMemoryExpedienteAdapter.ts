import type { Expediente } from '@domain/entities/Expediente';
import type { ExpedienteRepositoryPort } from '@domain/ports/ExpedienteRepositoryPort';
import { mockExpediente } from '@application/services/MockExpedienteData';

export class InMemoryExpedienteAdapter implements ExpedienteRepositoryPort {
  private cache: Map<string, Expediente> = new Map([
    [mockExpediente.id, mockExpediente],
  ]);

  async getExpedienteById(id: string): Promise<Expediente | null> {
    return this.cache.get(id) || mockExpediente;
  }

  async saveExpediente(expediente: Expediente): Promise<void> {
    this.cache.set(expediente.id, expediente);
  }

  async uploadExpediente(file: File): Promise<Expediente> {
    return mockExpediente;
  }

  async getPagePreview(tramiteId: string, pageNumber: number): Promise<any> {
    return {};
  }

  async confirmData(tramiteId: string, data: any): Promise<void> {
    // mock behavior
  }
  async getDocumentPdf(): Promise<Blob> {
    throw new Error('El adaptador de demostración en memoria no conserva PDFs originales.');
  }
}
