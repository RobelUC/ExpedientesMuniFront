import type { Expediente } from '@domain/entities/Expediente';
import type { Section } from '@domain/entities/Section';
import type { ExtractedField } from '@domain/valueObjects/ExtractedField';
import type { ExpedienteRepositoryPort } from '@domain/ports/ExpedienteRepositoryPort';

// @ts-ignore - Evita errores de tipado con import.meta.env en algunos setups de tsconfig
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api';

export class ApiExpedienteAdapter implements ExpedienteRepositoryPort {
  
  async getExpedienteById(id: string): Promise<Expediente | null> {
    const response = await fetch(`${API_BASE_URL}/expedientes/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Error al cargar el expediente desde el backend de Python.');
    }
    const data = await response.json();
    return this.mapPythonResponseToDomain(data);
  }

  async saveExpediente(expediente: Expediente): Promise<void> {
    await this.confirmData(expediente.id, expediente);
  }

  async uploadExpediente(file: File): Promise<Expediente> {
    const formData = new FormData();
    formData.append('archivo', file);

    const response = await fetch(`${API_BASE_URL}/expedientes`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.detail?.mensaje || 'Error al subir el archivo al backend.';
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return this.mapPythonResponseToDomain(data);
  }

  async getPagePreview(tramiteId: string, numPagina: number): Promise<any> {
    return { imageUrl: '' };
  }

  async confirmData(tramiteId: string, datosEstructurados: any): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[Mock] Datos confirmados para el trámite ${tramiteId}`);
        resolve();
      }, 500);
    });
  }

  private mapPythonResponseToDomain(apiData: any): Expediente {
    let totalPages = 0;

    const mappedSections: Section[] = (apiData.documentos || []).map((doc: any, index: number) => {
      
      const fields: ExtractedField[] = Object.entries(doc.campos || {}).map(([key, value]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
        value: String(value),
        isCode: key === 'dni' || key === 'ruc',
        isVerified: doc.confianza_ocr > 0.9,
      }));

      const startPage = doc.paginas && doc.paginas.length > 0 ? doc.paginas[0] : 1;
      const endPage = doc.paginas && doc.paginas.length > 0 ? doc.paginas[doc.paginas.length - 1] : 1;
      
      if (endPage > totalPages) {
        totalPages = endPage;
      }

      let icon = 'description';
      if (doc.tipo === 'FUT') icon = 'article';
      if (doc.tipo === 'DNI') icon = 'badge';
      if (doc.tipo === 'PLANO') icon = 'map';

      return {
        id: `sec-${index}-${Date.now()}`,
        title: doc.tipo,
        subtitle: `Extraído vía ${doc.metodo_extraccion || 'OCR'}`,
        pageRange: [startPage, endPage],
        icon: icon,
        fields: fields,
      };
    });

    return {
      id: apiData.id,
      status: apiData.estado === 'PROCESANDO' ? 'procesado' : 'procesado',
      fileName: apiData.nombre_archivo || 'Documento PDF',
      fileSize: 'N/A',
      totalPages: totalPages,
      processingTime: apiData.creado_en ? new Date(apiData.creado_en).toLocaleTimeString('es-PE') : 'Automático',
      sections: mappedSections,
    };
  }
}
