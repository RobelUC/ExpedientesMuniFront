export interface Procedure {
  code: string;
  name: string;
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
  validation: {
    estado?: string;
    advertencia?: string;
    requisitos?: { id: string; estado: RequirementCheck['estado']; nota: string; paginas_revisadas: number[]; paginas_candidatas: number[] }[];
  };
}
