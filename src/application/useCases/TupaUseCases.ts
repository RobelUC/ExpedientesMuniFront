import type { TupaRepositoryPort } from '@domain/ports/TupaRepositoryPort';
import type { RequirementCheck } from '@domain/entities/Tupa';

export class TupaUseCases {
  constructor(private readonly repository: TupaRepositoryPort) {}
  getCatalog() { return this.repository.getCatalog(); }
  getWorkflow(id: string) { return this.repository.getWorkflow(id); }
  validate(id: string, code: string, revision: number, checks: Record<string, RequirementCheck>) {
    if (!code) throw new Error('Seleccione un procedimiento TUPA.');
    for (const check of Object.values(checks)) {
      if (!check.nota.trim()) throw new Error('Cada verificación debe incluir una nota de revisión.');
      if (check.paginas.some(p => !Number.isInteger(p) || p < 1)) throw new Error('Las páginas deben ser números enteros positivos.');
    }
    return this.repository.validate(id, code, revision, checks);
  }
}
