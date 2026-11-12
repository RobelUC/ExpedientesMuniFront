import type { TupaRepositoryPort } from '@domain/ports/TupaRepositoryPort';
import type { RequirementCheck } from '@domain/entities/Tupa';

export class TupaUseCases {
  constructor(private readonly repository: TupaRepositoryPort) {}
  getCatalog() { return this.repository.getCatalog(); }
  getCapabilities() { return this.repository.getCapabilities(); }
  getWorkflow(id: string) { return this.repository.getWorkflow(id); }
  async getAcademicIndicators(id: string) { return (await this.repository.getIndicators?.(id))?.academico; }
  validate(id: string, code: string, revision: number, checks: Record<string, RequirementCheck>) {
    if (!code) throw new Error('Seleccione un procedimiento TUPA.');
    for (const check of Object.values(checks)) {
      if (!check.nota.trim()) throw new Error('Cada verificación debe incluir una nota de revisión.');
      if (check.paginas.some(p => !Number.isInteger(p) || p < 1)) throw new Error('Las páginas deben ser números enteros positivos.');
    }
    return this.repository.validate(id, code, revision, checks);
  }
  saveDraft(id: string, content: string, revision: number) {
    if (!content.trim()) throw new Error('El borrador no puede estar vacío.');
    if (content.length > 100000) throw new Error('El borrador supera el límite de 100000 caracteres.');
    return this.repository.saveDraft(id, content, revision);
  }
  route(id: string, revision: number) { return this.repository.route(id, revision); }
  generateDraft(id: string, revision: number) { return this.repository.generateDraft(id, revision); }
  auditWithAI(id: string, revision: number) { return this.repository.auditWithAI(id, revision); }
  assign(id: string, department: string, revision: number) {
    if (!department.trim()) throw new Error('Seleccione una gerencia de destino.');
    return this.repository.assign(id, department, revision);
  }
  approveAndSign(id: string, revision: number) { return this.repository.approveAndSign(id, revision); }
}
