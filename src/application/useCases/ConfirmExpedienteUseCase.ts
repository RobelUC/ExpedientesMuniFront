import type { ExpedienteRepositoryPort } from '@domain/ports/ExpedienteRepositoryPort';
import type { Expediente } from '@domain/entities/Expediente';

export class ConfirmExpedienteUseCase {
  constructor(private readonly expedienteRepo: ExpedienteRepositoryPort) {}

  async execute(tramiteId: string, data: Expediente): Promise<void> {
    return this.expedienteRepo.confirmData(tramiteId, data);
  }
}
