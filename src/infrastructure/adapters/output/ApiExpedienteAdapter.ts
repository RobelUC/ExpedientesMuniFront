import type { Expediente, ExpedienteStatus } from '@domain/entities/Expediente';
import type { ExpedienteRepositoryPort } from '@domain/ports/ExpedienteRepositoryPort';
import type { DossierResponse } from './ApiContracts';
import { apiClient, ApiError, type ApiClient } from './ApiClient';

export function mapDossier(data: DossierResponse): Expediente {
  if (!data || typeof data.id !== 'string' || typeof data.sha256 !== 'string' || !Array.isArray(data.documentos)) {
    throw new Error('Respuesta de expediente incompatible con el contrato esperado.');
  }
  const statuses: Record<string, ExpedienteStatus> = {
    PROCESANDO: 'pendiente', PROCESADO: 'procesado', ILEGIBLE: 'error', INVALIDO: 'error', ERROR: 'error',
  };
  const status = statuses[data.estado];
  if (!status) throw new Error(`Estado de expediente no reconocido: ${data.estado}`);
  return {
    id: data.id, sha256: data.sha256, fileName: data.nombre_archivo, fileSize: 'No informado',
    status, backendStatus: data.estado, error: data.error, processingTime: '',
    privacy: data.privacidad, consistency: data.consistencia,
    totalPages: Math.max(0, ...data.documentos.flatMap(doc => doc.paginas)),
    sections: data.documentos.map((doc, index) => ({
      id: `${data.id}-sec-${index}`, title: doc.tipo,
      documentIndex: index,
      subtitle: `${doc.metodo_extraccion} · confianza OCR ${(doc.confianza_ocr * 100).toFixed(1)}%${doc.requiere_revision ? ' · requiere revisión' : ''}`,
      pageRange: [Math.min(...doc.paginas), Math.max(...doc.paginas)],
      icon: ({ FUT: 'article', DNI: 'badge', PLANO: 'map' } as Record<string, string>)[doc.tipo] || 'description',
      fields: Object.entries(doc.campos).map(([key, value]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1).replaceAll('_', ' '), value,
        isCode: key === 'dni' || key === 'ruc', isVerified: false,
      })),
      maskedFields: data.privacidad?.documentos?.find(item => item.documento === index) ? Object.entries(
        data.privacidad.documentos.find(item => item.documento === index)!.campos).map(([key, value]) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1).replaceAll('_', ' '), value,
          isCode: key === 'dni' || key === 'ruc', isVerified: false,
        })) : undefined,
    })),
  };
}

export class ApiExpedienteAdapter implements ExpedienteRepositoryPort {
  constructor(private readonly client: ApiClient = apiClient) {}
  async getExpedienteById(id: string): Promise<Expediente | null> {
    try { return mapDossier(await this.client.request<DossierResponse>(`/expedientes/${encodeURIComponent(id)}`)); }
    catch (error) { if (error instanceof ApiError && error.status === 404) return null; throw error; }
  }
  async uploadExpediente(file: File): Promise<Expediente> {
    if (!file.name.toLowerCase().endsWith('.pdf') || file.size === 0) throw new Error('Seleccione un PDF no vacío.');
    const formData = new FormData();
    formData.append('archivo', file);
    const start = performance.now();
    const dossier = mapDossier(await this.client.request<DossierResponse>('/expedientes', { method: 'POST', body: formData }));
    return { ...dossier, fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`, processingTime: `${((performance.now() - start) / 1000).toFixed(1)} s` };
  }
  async saveExpediente(expediente: Expediente): Promise<void> { await this.confirmData(expediente.id, expediente); }
  async confirmData(id: string, data: Expediente): Promise<void> {
    // POST ya escribió en BD. No existe endpoint de edición/confirmación de campos.
    const saved = await this.getExpedienteById(id);
    if (!saved) throw new Error('El expediente no se encontró en la base de datos.');
    if (saved.id !== data.id || saved.sha256 !== data.sha256 || saved.status !== 'procesado' ||
        JSON.stringify(saved.sections) !== JSON.stringify(data.sections)) {
      throw new Error('La copia persistida no coincide o no está procesada. La API no admite guardar ediciones de campos.');
    }
  }
  async getPagePreview(): Promise<never> {
    throw new Error('La vista previa completa utiliza el archivo cargado. Los segmentos originales se descargan mediante getDocumentPdf.');
  }
  async getDocumentPdf(id: string, index: number): Promise<Blob> {
    return this.client.requestBlob(`/expedientes/${encodeURIComponent(id)}/documentos/${index}/pdf`);
  }
}
