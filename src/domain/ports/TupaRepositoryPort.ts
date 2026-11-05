import type { Catalog, RequirementCheck, Workflow, WorkflowCapabilities } from '../entities/Tupa';

export interface TupaRepositoryPort {
  getCatalog(): Promise<Catalog>;
  getCapabilities(): Promise<WorkflowCapabilities>;
  getWorkflow(id: string): Promise<Workflow>;
  validate(id: string, code: string, revision: number, checks: Record<string, RequirementCheck>): Promise<Workflow>;
  saveDraft(id: string, content: string, revision: number): Promise<Workflow>;
  generateDraft(id: string, revision: number): Promise<Workflow>;
  auditWithAI(id: string, revision: number): Promise<Workflow>;
  route(id: string, revision: number): Promise<Workflow>;
  assign(id: string, department: string, revision: number): Promise<Workflow>;
  approveAndSign(id: string, revision: number): Promise<Workflow>;
}
