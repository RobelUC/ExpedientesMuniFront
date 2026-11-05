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
  sha256?: string;
  backendStatus?: string;
  error?: string | null;
  privacy?: DataPrivacy;
  consistency?: CrossValidation;
}

export interface DataPrivacy {
  tecnica?: string;
  anonimizacion_garantizada?: boolean;
  transmision_externa_habilitada?: boolean;
  advertencia?: string;
  reemplazos_por_tipo?: Record<string, number>;
  documentos?: { documento: number; tipo: string; paginas: number[]; texto: string; campos: Record<string, string> }[];
}

export interface CrossValidation {
  estado: string;
  requiere_revision_humana: boolean;
  campos_comparados: string[];
  fraude_determinado: boolean;
  advertencia: string;
  alertas: { codigo: string; campo: string; mensaje: string;
    fuentes: { documento: number; tipo: string; paginas: number[]; valor_protegido?: string }[] }[];
}
