import type { Catalog, RequirementCheck, Workflow } from '../entities/Tupa';

export interface TupaRepositoryPort {
  getCatalog(): Promise<Catalog>;
  getWorkflow(id: string): Promise<Workflow>;
  validate(id: string, code: string, revision: number, checks: Record<string, RequirementCheck>): Promise<Workflow>;
}
