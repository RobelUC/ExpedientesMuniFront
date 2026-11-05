import type { ExtractedField } from '../valueObjects/ExtractedField';

export interface Section {
  /** Identificador único de la sección */
  id: string;
  /** Título corto para tabs (ej. "FUT", "DNI", "Planos") */
  title: string;
  /** Subtítulo descriptivo (ej. "Formulario Único") */
  subtitle: string;
  /** Rango de páginas [inicio, fin] (1-indexed) */
  pageRange: [number, number];
  /** Nombre del ícono Material Symbols */
  icon: string;
  /** Campos de datos extraídos por IA */
  fields: ExtractedField[];
  maskedFields?: ExtractedField[];
  documentIndex?: number;
}
