import type { Expediente } from '@domain/entities/Expediente';
import type { ExpedienteRepositoryPort } from '@domain/ports/ExpedienteRepositoryPort';

export class GetExpedienteUseCase {
  constructor(private readonly expedienteRepo: ExpedienteRepositoryPort) {}

  async execute(id: string): Promise<Expediente | null> {
    return this.expedienteRepo.getExpedienteById(id);
  }
}
