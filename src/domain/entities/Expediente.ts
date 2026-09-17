import type { Section } from './Section';

export type ExpedienteStatus = 'procesado' | 'pendiente' | 'error';

export interface Expediente {
  /** Identificador único del trámite (ej. "TRAM-2025-08491") */
  id: string;
  /** Nombre del archivo PDF original */
  fileName: string;
  /** Tamaño del archivo legible (ej. "18.4 MB") */
  fileSize: string;
  /** Total de páginas/fojas del documento */
  totalPages: number;
  /** Secciones detectadas por el motor de clasificación */
  sections: Section[];
  /** Estado del procesamiento */
  status: ExpedienteStatus;
  /** Tiempo de procesamiento legible (ej. "2.4s") */
  processingTime: string;
}
