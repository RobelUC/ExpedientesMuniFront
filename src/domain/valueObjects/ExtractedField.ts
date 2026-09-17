export interface ExtractedField {
  /** Etiqueta descriptiva del campo (ej. "Solicitante", "DNI") */
  label: string;
  /** Valor extraído */
  value: string;
  /** Si true, se renderiza con fuente monoespaciada */
  isCode?: boolean;
  /** Si true, el campo ha sido verificado externamente */
  isVerified?: boolean;
  /** Fuente de verificación (ej. "RENIEC") */
  verifiedBy?: string;
}
