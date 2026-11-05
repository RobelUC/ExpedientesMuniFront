export interface Procedure {
  code: string;
  name: string;
  department: string;
  pdf_pages?: number[];
  requirements: { id: string; description: string; conditional: boolean }[];
}
export interface Catalog {
  catalogo_completo: boolean;
  vigencia_normativa_2026_certificada: boolean;
  procedimientos: Procedure[];
}
export interface RequirementCheck {
  estado: 'CUMPLE' | 'FALTA' | 'NO_APLICA' | 'PENDIENTE';
  nota: string;
  paginas: number[];
}
export interface Workflow {
  dossier_id: string;
  revision: number;
  procedure_code: string | null;
  demo?: boolean;
  drafts?: Draft[];
  audit?: AuditEntry[];
  routing?: RoutingDecision;
  validation: {
    preauditoria_local?: { requisitos: { id: string; descripcion: string; hallazgo_local: string; documentos_candidatos: number[] }[] };
    auditoria_ia?: EvidenceAudit;
    estado?: string;
    advertencia?: string;
    habilitado_enrutamiento?: boolean;
    alertas?: { codigo: string; requisito: string; mensaje: string; nota: string }[];
    requisitos?: { id: string; estado: RequirementCheck['estado']; nota: string; paginas_revisadas: number[]; paginas_candidatas: number[] }[];
  };
}

export interface EvidenceAudit {
  proveedor: string;
  modelo: string;
  respuesta_id: string;
  fuente: string;
  paginas_fuente: number[];
  hallazgos: { requisito: string; hallazgo: string; documentos: number[]; paginas: number[]; explicacion: string }[];
  cruce_local: { requiere_revision: boolean; campos_comparados: string[] };
}

export interface Draft {
  ia?: { proveedor: string; modelo: string; respuesta_id: string; version_prompt: string };
  version: number;
  contenido: string;
  autor: string;
  origen: string;
  tipo: string;
  vigente: boolean;
  estado: string;
  firma: { tipo?: string; firmante?: string; sha256_borrador?: string; validez_legal?: boolean } | null;
  sisgedoc: { tipo?: string; registro?: string; estado?: string; transmision_externa?: boolean } | null;
  notificacion: { tipo?: string; estado?: string; destinatario?: string; envio_real?: boolean } | null;
  validez_legal?: boolean;
}
export interface AuditEntry {
  actor: string;
  action: string;
  at: string;
  detail: { version?: number; version_anterior?: number; tipo?: string };
}
export interface RoutingDecision {
  simulado?: boolean;
  estado?: string;
  destino?: string | null;
  sugerencia?: string;
  confianza?: number | null;
  modelo?: string | null;
  alerta?: boolean;
  motivo?: string;
  alcance?: string;
}
export interface WorkflowCapabilities {
  ia_generativa?: { configurada: boolean; proveedor: string | null; modelo: string | null; auditoria_tupa?: boolean };
  demo?: boolean;
  simulaciones?: { habilitadas: boolean; firma_sisgedoc_notificacion: boolean; modelo_datos_sinteticos: boolean };
  integraciones?: {
    firma_electronica: boolean;
    sisgedoc: boolean;
    notificaciones: boolean;
    enrutamiento_predictivo: boolean;
  };
}
