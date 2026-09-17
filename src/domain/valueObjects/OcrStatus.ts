export interface OcrStatus {
  /** Versión del motor OCR (ej. "v4.2") */
  version: string;
  /** Porcentaje de precisión (ej. 99.4) */
  precision: number;
  /** SLA de ingesta por foja (ej. "1.2s/foja") */
  slaPerPage: string;
  /** Si el motor está activo y operacional */
  isActive: boolean;
}
