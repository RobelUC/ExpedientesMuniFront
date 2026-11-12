export type AcademicRole = 'administrador' | 'evaluador' | 'responsable';
export type AcademicAction = 'consultar' | 'cargar' | 'evaluar' | 'enrutar' | 'asignar' | 'aprobar';

export interface AcademicIdentity {
  id: string;
  role: AcademicRole;
  department: string | null;
  actions: AcademicAction[];
  assignableAreas: string[];
}

export interface User {
  demo?: boolean;
  academic?: AcademicIdentity;
  /** Nombre completo del usuario */
  name: string;
  /** Rol o cargo (ej. "Agente Verificador") */
  role: string;
}
